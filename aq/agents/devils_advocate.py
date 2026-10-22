"""Agent 2 — Devil's Advocate. Mandatory adversarial review of every proposed trade.

Two layers, combined conservatively (most severe verdict wins):
1. Deterministic checks (always run): concrete, evidence-backed objections computed from features.
2. LLM challenge (when configured): must cite real feature keys; a VETO without at least one concrete,
   evidence-backed reason is rejected and downgraded to MONITOR. Uncertainty alone cannot veto.

Rule verdict: any 'blocking' finding -> VETO; >= 2 'major' -> VETO; 1 'major' -> MONITOR; else APPROVE.
"""
from __future__ import annotations

import logging

from aq.agents.llm import LLMClient, LLMUnavailable, as_data_block
from aq.agents.schemas import DAFinding, DALLMOutput, DAReport, ScoutReport
from aq.features import FEATURE_DOCS
from aq.logging_setup import log
from aq.risk import TradePlan

logger = logging.getLogger("aq.devils_advocate")
RULE_ENGINE = "rules:v1"
SEVERITY_RANK = {"APPROVE": 0, "MONITOR": 1, "VETO": 2}

DA_SYSTEM = """You are the Devil's Advocate of Adaptive Quant, a paper-trading research system.
You receive the Scout's complete research package and a deterministic trade plan. Your job is to try to
DISPROVE the proposed trade using specific evidence. Generic statements like "markets are risky" are worthless.

Address: (1) what is wrong with the thesis, (2) alternative explanations, (3) whether the move already happened,
(4) whether the market regime is inappropriate, (5) volume/liquidity sufficiency, (6) whether reward justifies risk,
(7) conditions under which this strategy is historically unreliable, (8) evidence that would invalidate the trade,
(9) any specific reason NOT to trade.

Return APPROVE, VETO or MONITOR. Rules:
- A VETO must contain at least one finding with severity 'blocking' or 'major' that cites real feature keys.
- You cannot VETO merely because uncertainty exists or data (e.g. news) is unavailable.
- MONITOR means: the idea may be valid but not now; state what would change your verdict.
- Use only provided data; never invent prices, news or events. Cite evidence by exact feature key.
The deterministic checks already run are included; you may agree, disagree, or add to them.
"""


def rule_checks(f: dict, scout: ScoutReport, plan: TradePlan, regime: dict, s) -> list[DAFinding]:
    out: list[DAFinding] = []
    sign = 1 if scout.proposed_action == "LONG" else -1
    add = lambda *a: out.append(DAFinding(check=a[0], category=a[1], severity=a[2], claim=a[3], evidence_keys=a[4]))  # noqa
    rsi, z24 = f["rsi_14"], f["z_24h"]

    if (sign > 0 and rsi >= 80) or (sign < 0 and rsi <= 20):
        add("exhaustion", "already_moved", "blocking",
            f"RSI(14,1h) is {rsi:.1f}: the move is extreme; entering now buys/sells into exhaustion.", ["rsi_14"])
    elif (sign > 0 and rsi >= 72) or (sign < 0 and rsi <= 28) or abs(z24) >= 3:
        add("late_entry", "already_moved", "major",
            f"Move may have already happened: RSI {rsi:.1f}, z_24h {z24:.2f}.", ["rsi_14", "z_24h"])
    if abs(f["dist_sma20_atr"]) >= 3 and f["dist_sma20_atr"] * sign > 0:
        add("overextended", "already_moved", "major",
            f"Price is {f['dist_sma20_atr']:.2f} ATR from SMA20 in the trade direction — mean-reversion risk.",
            ["dist_sma20_atr"])
    vr = f.get("volume_ratio_24h")
    if vr is None:
        add("volume_unknown", "data_quality", "major", "Volume baseline unavailable; cannot confirm participation.",
            ["volume_ratio_24h"])
    elif vr < 1.0:
        add("weak_volume", "liquidity_volume", "major",
            f"24h volume is {vr:.2f}x baseline (below normal) — move lacks participation.", ["volume_ratio_24h"])
    if (sign > 0 and f["pct_vs_sma200"] < 0) or (sign < 0 and f["pct_vs_sma200"] > 0):
        add("counter_trend", "regime", "major",
            f"Trade is against the 200h trend (price {f['pct_vs_sma200']:.2f}% vs SMA200).", ["pct_vs_sma200"])
    label = regime.get("label", "")
    if (sign > 0 and label == "risk-off trend") or (sign < 0 and label == "risk-on trend"):
        add("regime_mismatch", "regime", "major",
            f"Market regime is '{label}' (BTC trend {regime.get('btc_trend')}, breadth "
            f"{regime.get('breadth_up_24h_pct')}% up) — opposes trade direction.", [])
    if label == "high-volatility" or (f.get("vol_regime_ratio") or 0) >= 2.5:
        add("volatility_spike", "historical_unreliability", "major",
            f"Volatility regime ratio {f.get('vol_regime_ratio')}: ATR-based stops are unreliable when volatility "
            "is spiking.", ["vol_regime_ratio"])
    rel = f.get("rel_perf_vs_btc_24h_pct")
    if rel is not None and abs(rel) < 0.5 and scout.proposed_action != "NO_TRADE":
        add("beta_only", "alternative_explanation", "minor",
            f"Asset moved in line with BTC (relative {rel:.2f} pp): this is BTC beta, not an asset-specific edge.",
            ["rel_perf_vs_btc_24h_pct"])
    if plan.net_reward_risk < s.min_reward_risk:
        add("reward_risk", "reward_risk", "blocking",
            f"Net reward/risk after estimated costs is {plan.net_reward_risk:.2f} < {s.min_reward_risk}.", [])
    if plan.stop_atr_multiple < 1.0:
        add("stop_in_noise", "invalidation", "major",
            f"Stop at {plan.stop_atr_multiple} ATR is inside normal hourly noise.", ["atr_14"])
    if (f.get("atr_pct") or 0) < 2 * plan.round_trip_cost_pct:
        add("costs_vs_range", "reward_risk", "minor",
            f"ATR is {f['atr_pct']:.2f}% vs round-trip cost {plan.round_trip_cost_pct:.2f}% — costs are a large "
            "share of expected movement.", ["atr_pct"])
    if any(e.category == "macro_news_catalyst" for e in scout.possible_explanations):
        add("no_news", "data_quality", "info",
            "Catalyst cannot be verified (news unavailable). Recorded as a limitation, not a veto reason.", [])
    return out


def rule_verdict(findings: list[DAFinding]) -> str:
    blocking = sum(f.severity == "blocking" for f in findings)
    major = sum(f.severity == "major" for f in findings)
    if blocking or major >= 2:
        return "VETO"
    return "MONITOR" if major == 1 else "APPROVE"


def validate_llm(out: DALLMOutput) -> tuple[str, list[DAFinding], list[str]]:
    notes = []
    keys = set(FEATURE_DOCS)
    findings = []
    for fd in out.findings:
        bad = [k for k in fd.evidence_keys if k not in keys]
        if bad:
            notes.append(f"Removed unknown evidence keys {bad} from LLM finding '{fd.check}'")
            fd.evidence_keys = [k for k in fd.evidence_keys if k in keys]
        findings.append(fd)
    verdict = out.verdict
    concrete = [fd for fd in findings if fd.severity in ("blocking", "major") and fd.evidence_keys]
    if verdict == "VETO" and not concrete:
        notes.append("LLM VETO rejected: no concrete evidence-backed reason. Downgraded to MONITOR.")
        verdict = "MONITOR"
    return verdict, findings, notes


class DevilsAdvocate:
    def __init__(self, llm: LLMClient, settings):
        self.llm = llm
        self.s = settings

    def challenge(self, asset: str, f: dict, scout: ScoutReport, plan: TradePlan | None, regime: dict) -> tuple[DAReport, dict]:
        meta = {"llm_usage": None, "llm_error": None}
        if scout.proposed_action == "NO_TRADE" or plan is None:
            return DAReport(engine="n/a", verdict="NOT_REQUIRED",
                            summary="Scout proposed NO TRADE; there is no trade to challenge (no LLM call made)."), meta

        findings = rule_checks(f, scout, plan, regime, self.s)
        rv = rule_verdict(findings)
        report = DAReport(engine=RULE_ENGINE, verdict=rv, findings=findings, rule_verdict=rv,
                          what_would_change_verdict="Resolution of the major/blocking findings listed.",
                          summary=self._summary(rv, findings))
        if self.llm.available:
            user = "\n\n".join([
                f"Challenge this proposed {scout.proposed_action} paper trade on {asset}.",
                as_data_block("scout_report", scout.model_dump()),
                as_data_block("trade_plan", plan.to_dict()),
                as_data_block("features", f),
                as_data_block("market_regime", regime),
                as_data_block("deterministic_checks", [x.model_dump() for x in findings]),
            ])
            try:
                out, usage = self.llm.structured(DA_SYSTEM, user, DALLMOutput)
                meta["llm_usage"] = usage
                lv, lfind, notes = validate_llm(out)
                final = max(rv, lv, key=SEVERITY_RANK.get)
                report = DAReport(engine=f"{RULE_ENGINE}+{self.llm.engine_name}", verdict=final,
                                  findings=findings + [x for x in lfind if x.check not in {y.check for y in findings}],
                                  alternative_explanations=out.alternative_explanations,
                                  what_would_change_verdict=out.what_would_change_verdict,
                                  summary=out.summary, validation_notes=notes, rule_verdict=rv, llm_verdict=lv)
            except LLMUnavailable as e:
                meta["llm_error"] = str(e)
                report.validation_notes.append(f"LLM challenge unavailable ({e}); deterministic checks only.")
                log(logger, logging.WARNING, "da_llm_fallback", asset=asset, error=str(e))
        return report, meta

    @staticmethod
    def _summary(verdict: str, findings: list[DAFinding]) -> str:
        serious = [x for x in findings if x.severity in ("blocking", "major")]
        if verdict == "APPROVE":
            return "No blocking or major objections found by deterministic checks." + (
                f" Minor notes: {'; '.join(x.claim for x in findings if x.severity == 'minor')}" if findings else "")
        return f"{verdict}: " + " | ".join(x.claim for x in serious)

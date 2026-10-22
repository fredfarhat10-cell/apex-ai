"""Agent 1 — Market Intelligence Scout.

Investigates whether there is an interesting market situation. It does NOT compute data: it receives
deterministic features and interprets them. Two engines:
- LLM engine (when ANTHROPIC_API_KEY is configured): Claude interprets features under a strict schema.
- Rule engine 'rules:v1' (always available): transparent, deterministic interpretation. Labelled as such.
LLM output is validated: evidence must cite real feature keys; numeric parameters are clamped to bounds.
"""
from __future__ import annotations

import logging

from aq.agents.llm import LLMClient, LLMUnavailable, as_data_block
from aq.agents.schemas import (RESEARCH_CONFIDENCE_NOTE, RESEARCH_CONFIDENCE_SCALE, Condition, EvidenceItem,
                               Explanation, ScoutLLMOutput, ScoutReport)
from aq.features import FEATURE_DOCS
from aq.logging_setup import log

logger = logging.getLogger("aq.scout")
RULE_ENGINE = "rules:v1"
ALLOWED_HORIZONS = (6, 12, 24, 48, 72)
CORE_EVIDENCE = ["last_close", "ret_4h_pct", "ret_24h_pct", "z_24h", "volume_ratio_24h", "trend", "rsi_14",
                 "atr_pct", "vol_regime_ratio", "rel_perf_vs_btc_24h_pct", "range_breakout"]

SCOUT_SYSTEM = """You are the Market Intelligence Scout of Adaptive Quant, a paper-trading research system.
Your job is to investigate whether a market situation is interesting — NOT to predict prices with certainty.

Rules:
- Use ONLY the provided deterministic features and market context. Never invent numbers, news or events.
- Cite evidence by feature key (exact keys from the features object). Values are attached by the system.
- News/catalyst data may be unavailable; if so, say a catalyst cannot be assessed rather than guessing one.
- Answer: what is happening, why it might be happening (several candidate explanations), what observable
  conditions would confirm and invalidate the thesis, and whether to propose LONG, SHORT or NO_TRADE.
- NO_TRADE is a perfectly good answer. Only propose a trade when the evidence supports a specific, testable thesis.
- Stops/targets are expressed as multiples of ATR(14, 1h); the system computes prices deterministically.
- horizon_hours must be one of 6, 12, 24, 48, 72.
- experience_memory lists past paper trades from similar situations (outcomes known before now). Treat it as
  weak evidence when the sample is small; never treat one or two past results as proof.
- Conditions must use a feature key or 'price' as the metric with a numeric threshold.
- research_confidence is an ordinal 1-5 rating of evidence agreement, NOT a probability:
{scale}
"""


def _fmt(v, nd=2):
    return f"{v:.{nd}f}" if isinstance(v, (int, float)) else str(v)


def rule_based_scout(asset: str, f: dict, regime: dict, news_available: bool) -> ScoutLLMOutput:
    expl, rejected, limits = [], [], []
    r24, z24, vr = f["ret_24h_pct"], f["z_24h"], f.get("volume_ratio_24h") or 0.0
    rsi, trend, rel = f["rsi_14"], f["trend"], f.get("rel_perf_vs_btc_24h_pct")
    vol_reg = f.get("vol_regime_ratio") or 1.0

    happening = (f"{asset} has moved {_fmt(r24)}% over the last 24 closed hours ({_fmt(f['ret_4h_pct'])}% over 4h, "
                 f"z_24h={_fmt(z24)}), with 24h volume at {_fmt(vr)}x its prior-7-day daily average. "
                 f"Trend structure: {trend}; RSI(14,1h)={_fmt(rsi, 1)}; volatility regime ratio={_fmt(vol_reg)}.")
    if rel is not None:
        happening += f" Relative to BTC over 24h: {_fmt(rel)} pp."

    # Candidate explanations — each tied to evidence keys.
    btc_r24 = regime.get("btc_ret_24h_pct")
    breadth = regime.get("breadth_up_24h_pct")
    if abs(z24) >= 1.0:
        expl.append(Explanation(category="momentum", plausibility="medium" if vr >= 1.2 else "low",
                                explanation=f"Directional move of {_fmt(z24)} standard units over 24h"
                                            + (" with above-baseline volume." if vr >= 1.2 else " but without volume confirmation."),
                                evidence_keys=["z_24h", "volume_ratio_24h"]))
    if asset != "BTC" and btc_r24 is not None and rel is not None and abs(rel) < 1.0 and abs(btc_r24) >= 1.0:
        expl.append(Explanation(category="market_wide_move", plausibility="high",
                                explanation=f"Move is close to BTC's ({_fmt(btc_r24)}%); breadth {breadth}% of the "
                                            "universe up — likely market beta rather than asset-specific.",
                                evidence_keys=["rel_perf_vs_btc_24h_pct"]))
    if rel is not None and abs(rel) >= 3.0:
        expl.append(Explanation(category="sector_rotation", plausibility="medium",
                                explanation=f"Asset diverges from BTC by {_fmt(rel)} pp — possible rotation or "
                                            "asset-specific flow.", evidence_keys=["rel_perf_vs_btc_24h_pct"]))
    if f["range_breakout"] != "none" and vol_reg >= 1.3:
        expl.append(Explanation(category="volatility_breakout", plausibility="medium",
                                explanation=f"72h range breakout ({f['range_breakout']}) while volatility expands.",
                                evidence_keys=["range_breakout", "vol_regime_ratio"]))
    if rsi >= 75 or rsi <= 25 or abs(f["dist_sma20_atr"]) >= 3:
        expl.append(Explanation(category="mean_reversion", plausibility="medium",
                                explanation=f"Stretched: RSI {_fmt(rsi, 1)}, {_fmt(f['dist_sma20_atr'])} ATR from SMA20 — "
                                            "reversion risk is elevated.", evidence_keys=["rsi_14", "dist_sma20_atr"]))
    if not news_available:
        expl.append(Explanation(category="macro_news_catalyst", plausibility="low",
                                explanation="Catalyst cannot be assessed: no news provider is configured.",
                                evidence_keys=[]))
        limits.append("News/catalyst data unavailable — a news-driven move cannot be distinguished from flow.")
    if not expl:
        expl.append(Explanation(category="unclear", plausibility="low",
                                explanation="No statistically notable move, volume or volatility change.",
                                evidence_keys=["z_24h", "volume_ratio_24h", "vol_regime_ratio"]))

    # Hypothesis: momentum continuation with volume confirmation (the only tradeable rule-engine setup).
    long_ok = (trend == "uptrend" or f["pct_vs_sma50"] > 0) and z24 >= 1.0 and vr >= 1.2 and 50 <= rsi <= 75
    short_ok = (trend == "downtrend" or f["pct_vs_sma50"] < 0) and z24 <= -1.0 and vr >= 1.2 and 25 <= rsi <= 50
    action = "LONG" if long_ok else "SHORT" if short_ok else "NO_TRADE"
    sign = 1 if action == "LONG" else -1

    if action == "NO_TRADE":
        if abs(z24) < 1.0:
            rejected.append(f"Momentum: 24h move not significant (z_24h={_fmt(z24)} within ±1).")
        if vr < 1.2:
            rejected.append(f"Momentum: no volume confirmation (volume_ratio_24h={_fmt(vr)} < 1.2).")
        if rsi > 75 or rsi < 25:
            rejected.append(f"Momentum entry would chase a stretched move (RSI={_fmt(rsi, 1)}).")
        if z24 >= 1.0 and trend == "downtrend":
            rejected.append("Long: bounce inside a downtrend — counter-trend, not a rule-engine setup.")
        if z24 <= -1.0 and trend == "uptrend":
            rejected.append("Short: dip inside an uptrend — counter-trend, not a rule-engine setup.")
        rejected.append("Mean-reversion trades are not part of rules:v1 (no validated evidence yet).")
        thesis = "No qualifying opportunity detected: evidence does not meet the momentum-with-volume criteria."
    else:
        rejected.append(f"{'SHORT' if action == 'LONG' else 'LONG'}: opposes the observed momentum and trend.")
        rejected.append("NO_TRADE: rejected because momentum, volume and trend criteria are all met.")
        thesis = (f"{asset} momentum continuation ({action}): a {_fmt(z24)}-sigma 24h move with volume "
                  f"{_fmt(vr)}x baseline in a {trend} structure is expected to extend over the next 24h.")

    support = sum([
        trend == ("uptrend" if sign > 0 else "downtrend"),
        vr >= 1.5,
        rel is not None and rel * sign > 0.5,
        f["range_breakout"] == ("up" if sign > 0 else "down"),
        regime.get("label") == ("risk-on trend" if sign > 0 else "risk-off trend"),
    ]) if action != "NO_TRADE" else 0
    confidence = max(1, min(5, support)) if action != "NO_TRADE" else 1

    c = f["last_close"]
    atr = f["atr_14"]
    if action == "NO_TRADE":
        confirm = [Condition(description="24h move becomes significant with volume (z_24h >= 1)", metric="z_24h",
                             operator=">=", threshold=1.0),
                   Condition(description="Volume confirms (volume_ratio_24h >= 1.2)", metric="volume_ratio_24h",
                             operator=">=", threshold=1.2)]
        invalid = []  # no position proposed, nothing to invalidate
    else:
        confirm = [Condition(description="Price extends beyond prior 72h extreme",
                             metric="price", operator=">" if sign > 0 else "<",
                             threshold=round(f["high_72h_prior"] if sign > 0 else f["low_72h_prior"], 8)),
                   Condition(description="Volume stays above baseline", metric="volume_ratio_24h", operator=">=",
                             threshold=1.2)]
        invalid = [Condition(description="Price closes beyond SMA20 against the position",
                             metric="price", operator="<" if sign > 0 else ">", threshold=round(f["sma_20"], 8)),
                   Condition(description="Stop level breached (2 ATR from entry)", metric="price",
                             operator="<" if sign > 0 else ">", threshold=round(c - sign * 2.0 * atr, 8))]

    return ScoutLLMOutput(
        what_is_happening=happening, possible_explanations=expl, confirmation_conditions=confirm,
        invalidation_conditions=invalid, proposed_action=action, horizon_hours=24, stop_atr_multiple=2.0,
        target_atr_multiple=5.0, research_confidence=confidence, thesis=thesis,
        rationale=("Rule engine v1: proposes a trade only for momentum continuation where |z_24h| >= 1, "
                   "volume_ratio_24h >= 1.2, RSI not stretched and trend structure agrees. "
                   f"Confidence = count of 5 supporting factors ({support})."),
        rejected_alternatives=rejected, data_limitations=limits)


def finalize(raw: ScoutLLMOutput, engine: str, f: dict) -> ScoutReport:
    """Deterministic validation of any Scout output (LLM or rules)."""
    notes = []
    keys = set(FEATURE_DOCS)
    for e in raw.possible_explanations:
        bad = [k for k in e.evidence_keys if k not in keys]
        if bad:
            notes.append(f"Removed non-existent evidence keys cited by scout: {bad}")
            e.evidence_keys = [k for k in e.evidence_keys if k in keys]
    for name in ("confirmation_conditions", "invalidation_conditions"):
        conds = getattr(raw, name)
        good = [c for c in conds if c.metric == "price" or c.metric in keys]
        if len(good) != len(conds):
            notes.append(f"Dropped {len(conds) - len(good)} {name} referencing unknown metrics")
        setattr(raw, name, good)
    if raw.horizon_hours not in ALLOWED_HORIZONS:
        h = min(ALLOWED_HORIZONS, key=lambda x: abs(x - raw.horizon_hours))
        notes.append(f"horizon_hours {raw.horizon_hours} snapped to {h}")
        raw.horizon_hours = h
    for attr, lo, hi in (("stop_atr_multiple", 0.75, 3.0), ("target_atr_multiple", 1.0, 8.0),
                         ("research_confidence", 1, 5)):
        v = getattr(raw, attr)
        cv = min(hi, max(lo, v))
        if cv != v:
            notes.append(f"{attr} {v} clamped to {cv}")
            setattr(raw, attr, cv)
    if raw.proposed_action == "NO_TRADE":
        raw.research_confidence = min(raw.research_confidence, 5)

    cited = list(dict.fromkeys(CORE_EVIDENCE + [k for e in raw.possible_explanations for k in e.evidence_keys]))
    evidence = [EvidenceItem(key=k, value=f.get(k), description=FEATURE_DOCS[k]) for k in cited if k in f]
    tags = sorted({e.category for e in raw.possible_explanations})
    return ScoutReport(**raw.model_dump(), engine=engine, situation_tags=tags, evidence=evidence,
                       validation_notes=notes)


class Scout:
    def __init__(self, llm: LLMClient):
        self.llm = llm

    def investigate(self, asset: str, features: dict, regime: dict, news: dict,
                    memory: dict | None = None) -> tuple[ScoutReport, dict]:
        meta = {"llm_usage": None, "llm_error": None}
        memory = memory or {}
        if self.llm.available:
            user = "\n\n".join([
                f"Investigate {asset} (USD-quoted). Decision time is the close of the last closed 1h candle.",
                as_data_block("features", features),
                as_data_block("feature_definitions", FEATURE_DOCS),
                as_data_block("market_regime", regime),
                as_data_block("news_status", news),
                as_data_block("experience_memory", {d: m.get("summary") for d, m in memory.items()}),
            ])
            try:
                system = SCOUT_SYSTEM.format(scale="\n".join(f"  {k}: {v}" for k, v in RESEARCH_CONFIDENCE_SCALE.items()))
                out, usage = self.llm.structured(system, user, ScoutLLMOutput)
                meta["llm_usage"] = usage
                return finalize(out, self.llm.engine_name, features), meta
            except LLMUnavailable as e:
                meta["llm_error"] = str(e)
                log(logger, logging.WARNING, "scout_llm_fallback", asset=asset, error=str(e))
        raw = rule_based_scout(asset, features, regime, news_available=news.get("available", False))
        report = finalize(raw, RULE_ENGINE, features)
        mem = memory.get(report.proposed_action)
        if mem:
            report.rationale += f" Experience memory ({report.proposed_action}): {mem['summary']['note']}"
        if meta["llm_error"]:
            report.validation_notes.append(f"LLM engine failed ({meta['llm_error']}); rule engine used instead.")
        return report, meta


__all__ = ["Scout", "rule_based_scout", "finalize", "RESEARCH_CONFIDENCE_NOTE"]

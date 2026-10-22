from datetime import timedelta

from aq.agents.devils_advocate import DevilsAdvocate, rule_checks, rule_verdict, validate_llm
from aq.agents.llm import LLMClient
from aq.agents.schemas import Condition, DAFinding, DALLMOutput, Explanation, ScoutLLMOutput
from aq.agents.scout import Scout, finalize, rule_based_scout
from aq.data.base import closed_only
from aq.features import compute_features, market_regime
from aq.risk import build_trade_plan
from conftest import make_paths
from synthetic import ANCHOR

NEWS = {"available": False, "reason": "none"}


def _features(asset):
    paths = make_paths(0.0)
    btc = closed_only(paths["BTC"].candles("1h", ANCHOR - timedelta(hours=300), ANCHOR), ANCHOR)
    c = closed_only(paths[asset].candles("1h", ANCHOR - timedelta(hours=300), ANCHOR), ANCHOR)
    return compute_features(c, btc), btc


def test_rule_scout_proposes_long_on_momentum_and_explains(settings):
    f, _ = _features("ETH")
    rep, meta = Scout(LLMClient(settings)).investigate("ETH", f, market_regime({"ETH": f}), NEWS)
    assert rep.engine == "rules:v1" and meta["llm_usage"] is None
    assert rep.proposed_action == "LONG"
    assert 1 <= rep.research_confidence <= 5
    assert rep.invalidation_conditions and rep.confirmation_conditions
    assert any(e.category == "macro_news_catalyst" and "cannot be assessed" in e.explanation
               for e in rep.possible_explanations)
    assert {e.key for e in rep.evidence} >= {"z_24h", "volume_ratio_24h"}


def test_rule_scout_no_trade_on_flat(settings):
    f, _ = _features("SOL")
    rep = finalize(rule_based_scout("SOL", f, {}, False), "rules:v1", f)
    assert rep.proposed_action == "NO_TRADE"
    assert rep.rejected_alternatives


def test_finalize_rejects_invented_evidence_and_clamps(settings):
    f, _ = _features("ETH")
    raw = ScoutLLMOutput(
        what_is_happening="x", proposed_action="LONG", horizon_hours=30, stop_atr_multiple=0.1,
        target_atr_multiple=50, research_confidence=9, thesis="t", rationale="r", rejected_alternatives=[],
        data_limitations=[],
        possible_explanations=[Explanation(category="momentum", explanation="e", plausibility="high",
                                           evidence_keys=["z_24h", "twitter_hype_score"])],
        confirmation_conditions=[Condition(description="d", metric="made_up", operator=">", threshold=1)],
        invalidation_conditions=[Condition(description="d", metric="price", operator="<", threshold=1)])
    rep = finalize(raw, "llm:test", f)
    assert rep.possible_explanations[0].evidence_keys == ["z_24h"]
    assert rep.confirmation_conditions == []
    assert rep.horizon_hours == 24 and rep.stop_atr_multiple == 0.75 and rep.target_atr_multiple == 8.0
    assert rep.research_confidence == 5
    assert len(rep.validation_notes) >= 4
    # Evidence values come from deterministic features, not from the model.
    assert next(e for e in rep.evidence if e.key == "z_24h").value == f["z_24h"]


def test_da_rule_verdicts(settings):
    f, _ = _features("ETH")
    scout = finalize(rule_based_scout("ETH", f, {}, False), "rules:v1", f)
    plan = build_trade_plan("LONG", f["last_close"], f["atr_14"], 2.0, 5.0, settings)
    da = DevilsAdvocate(LLMClient(settings), settings)
    rep, _ = da.challenge("ETH", f, scout, plan, {"label": "risk-on trend"})
    assert rep.verdict == "APPROVE"
    rep2, _ = da.challenge("ETH", f, scout, plan, {"label": "risk-off trend", "btc_trend": "downtrend"})
    assert rep2.verdict in ("MONITOR", "VETO")
    assert any(x.check == "regime_mismatch" for x in rep2.findings)
    # Bad reward/risk is blocking.
    bad = build_trade_plan("LONG", f["last_close"], f["atr_14"], 2.0, 2.2, settings)
    rep3, _ = da.challenge("ETH", f, scout, bad, {})
    assert rep3.verdict == "VETO"
    # Overbought features => exhaustion veto with concrete evidence.
    hot = dict(f, rsi_14=85.0)
    assert any(x.check == "exhaustion" and x.evidence_keys == ["rsi_14"]
               for x in rule_checks(hot, scout, plan, {}, settings))
    assert rule_verdict(rule_checks(hot, scout, plan, {}, settings)) == "VETO"


def test_da_news_unavailable_never_vetoes(settings):
    findings = [DAFinding(check="no_news", category="data_quality", severity="info", claim="x", evidence_keys=[])]
    assert rule_verdict(findings) == "APPROVE"


def test_llm_veto_without_concrete_reason_is_downgraded():
    out = DALLMOutput(verdict="VETO", alternative_explanations=[], what_would_change_verdict="", summary="risky",
                      findings=[DAFinding(check="vibes", category="thesis_flaw", severity="major",
                                          claim="Markets are risky", evidence_keys=["not_a_feature"])])
    verdict, findings, notes = validate_llm(out)
    assert verdict == "MONITOR"
    assert findings[0].evidence_keys == []
    assert any("Downgraded" in n for n in notes)
    ok = DALLMOutput(verdict="VETO", alternative_explanations=[], what_would_change_verdict="", summary="",
                     findings=[DAFinding(check="late", category="already_moved", severity="major",
                                         claim="RSI 81", evidence_keys=["rsi_14"])])
    assert validate_llm(ok)[0] == "VETO"


def test_no_trade_needs_no_challenge(settings):
    f, _ = _features("SOL")
    scout = finalize(rule_based_scout("SOL", f, {}, False), "rules:v1", f)
    rep, meta = DevilsAdvocate(LLMClient(settings), settings).challenge("SOL", f, scout, None, {})
    assert rep.verdict == "NOT_REQUIRED" and meta["llm_usage"] is None

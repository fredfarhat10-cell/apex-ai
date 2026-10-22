"""Post-trade review and lesson storage.

LOSS -> DIAGNOSE -> GENERATE HYPOTHESIS -> STORE LESSON -> COLLECT MORE EVIDENCE -> (human) CONSIDER CHANGE.
Nothing in this module changes strategy parameters. Lessons accumulate evidence by (hypothesis_tag,
failure_category); only after `lesson_min_evidence` similar observations is a lesson flagged
CANDIDATE_FOR_HUMAN_REVIEW. A single trade always yields an UNVALIDATED, low-confidence lesson.
"""
from __future__ import annotations

import logging

from aq.agents.llm import LLMClient, LLMUnavailable, as_data_block
from aq.agents.schemas import PostTradeLLMNarrative
from aq.clock import iso, parse_iso

logger = logging.getLogger("aq.learning")

FAILURE_CATEGORIES = ["incorrect_direction", "incorrect_timing", "incorrect_market_regime", "insufficient_liquidity",
                      "unexpected_event", "normal_variance", "bad_risk_reward", "execution_assumption", "other"]

# Which Devil's Advocate objections, had they materialised, correspond to which outcome categories.
DA_CHECK_TO_CATEGORIES = {
    "exhaustion": {"incorrect_direction", "incorrect_timing"},
    "late_entry": {"incorrect_direction", "incorrect_timing"},
    "overextended": {"incorrect_direction", "incorrect_timing"},
    "weak_volume": {"incorrect_direction", "insufficient_liquidity"},
    "volume_unknown": {"insufficient_liquidity"},
    "counter_trend": {"incorrect_market_regime", "incorrect_direction"},
    "regime_mismatch": {"incorrect_market_regime"},
    "volatility_spike": {"unexpected_event", "normal_variance"},
    "beta_only": {"incorrect_market_regime", "won_for_wrong_reason"},
    "reward_risk": {"bad_risk_reward"},
    "stop_in_noise": {"normal_variance", "incorrect_timing"},
    "costs_vs_range": {"execution_assumption"},
}

NARRATIVE_SYSTEM = """You are the post-trade reviewer of Adaptive Quant (paper trading research).
Given a closed paper trade's full record (what was known at entry, the challenge, and the outcome) plus a
deterministic diagnosis, write a short, honest narrative. Do not claim the strategy is right because it won, or
wrong because it lost once. A single trade is one observation. Propose hypotheses, not conclusions.
Use only the supplied data."""


def hypothesis_tag(investigation: dict, direction: str) -> str:
    tags = (investigation.get("scout_output_json") or {}).get("situation_tags") or ["unclear"]
    primary = "momentum" if "momentum" in tags else tags[0]
    return f"{primary}|{direction}"


def diagnose(trade: dict, outcome: dict, challenge: dict | None, ctx: dict) -> dict:
    """Pure deterministic diagnosis. ctx: asset_ret_hold_pct, btc_ret_hold_pct (None if unavailable),
    max_bar_move_atr, atr_usd."""
    sign = 1 if trade["direction"] == "LONG" else -1
    entry, exit_ = trade["entry_price_usd"], outcome["exit_price_usd"]
    net, gross = outcome["net_pnl_gbp"], outcome["gross_pnl_gbp"]
    reason = outcome["exit_reason"]
    prediction_correct = (exit_ - entry) * sign > 0
    target_dist_pct = abs(trade["target_price_usd"] / entry - 1) * 100
    stop_dist_pct = abs(trade["stop_price_usd"] / entry - 1) * 100
    mfe, mae = outcome.get("mfe_pct") or 0.0, outcome.get("mae_pct") or 0.0
    held_h = (parse_iso(outcome["exit_time"]) - parse_iso(trade["entry_time"])).total_seconds() / 3600

    if reason == "TARGET":
        thesis = "YES"
    elif reason == "STOP":
        thesis = "NO"
    elif reason == "MANUAL":
        thesis = "UNDETERMINED"
    else:
        thesis = "PARTIAL" if gross > 0 else "NO"

    asset_r, btc_r = ctx.get("asset_ret_hold_pct"), ctx.get("btc_ret_hold_pct")
    beta_explained = (trade["asset"] != "BTC" and asset_r is not None and btc_r is not None
                      and asset_r * btc_r > 0 and abs(asset_r - btc_r) < 0.5 * abs(asset_r))
    fragile = stop_dist_pct > 0 and -mae >= 0.8 * stop_dist_pct

    if net > 0:
        if beta_explained:
            matched = (f"NO — the asset's move ({asset_r:.2f}%) was largely matched by BTC ({btc_r:.2f}%); "
                       "the win is better explained by market beta than by the asset-specific thesis.")
        elif fragile:
            matched = (f"UNCERTAIN — adverse excursion reached {-mae:.2f}% vs a {stop_dist_pct:.2f}% stop distance; "
                       "the trade was nearly stopped out, so the win is fragile evidence.")
        elif btc_r is None and trade["asset"] != "BTC":
            matched = "UNCERTAIN — BTC comparison data unavailable; cannot separate thesis from market beta."
        else:
            matched = "YES — price moved in the thesis direction beyond market beta without nearly hitting the stop."
    else:
        matched = "N/A — loss; see failure category."

    category = None
    if net <= 0:
        if gross >= 0:
            category = "execution_assumption"
        elif (ctx.get("max_bar_move_atr") or 0) >= 4:
            category = "unexpected_event"
        elif btc_r is not None and trade["asset"] != "BTC" and btc_r * sign <= -1.5:
            category = "incorrect_market_regime"
        elif reason == "TIME" and abs(outcome.get("r_multiple") or 0) < 0.5:
            category = "normal_variance"
        elif not prediction_correct:
            category = "incorrect_direction"
        else:
            category = "other"

    if reason == "TARGET":
        timing = f"Correct — target reached after {held_h:.1f}h of a {trade['horizon_hours']}h horizon."
    elif reason == "STOP":
        timing = "PENDING — stopped before horizon end; direction will be re-checked at horizon end."
    elif reason == "TIME":
        reach = mfe / target_dist_pct * 100 if target_dist_pct else 0
        timing = f"Horizon elapsed; best excursion reached {reach:.0f}% of the target distance."
    else:
        timing = f"Closed manually after {held_h:.1f}h; timing not assessable."

    planned = trade["risk_gbp"]
    if net < 0:
        over = -net / planned - 1 if planned else 0
        risk = ("Loss within planned risk." if over <= 0.1 else
                f"Loss exceeded planned risk by {over * 100:.0f}% (gap/fill assumptions) — risk model under-estimated.")
    else:
        risk = f"Win of {outcome.get('r_multiple') or 0:.2f}R on £{planned:.2f} planned risk."

    findings = (challenge or {}).get("devils_advocate_output_json", {}) or {}
    flagged = [fd for fd in findings.get("findings", []) if fd.get("severity") != "info"]
    anticipated = []
    for fd in flagged:
        cats = DA_CHECK_TO_CATEGORIES.get(fd.get("check"), set())
        if (category and category in cats) or (net > 0 and beta_explained and "won_for_wrong_reason" in cats):
            anticipated.append(fd)

    return {"prediction_correct": prediction_correct, "thesis_correct": thesis, "reason_matched_thesis": matched,
            "failure_category": category, "timing_assessment": timing, "risk_assessment": risk,
            "devils_advocate_anticipated": bool(anticipated), "anticipated_findings": anticipated,
            "da_flags_not_materialised": [fd for fd in flagged if fd not in anticipated],
            "held_hours": held_h, "beta_explained": beta_explained, "fragile": fragile,
            "asset_ret_hold_pct": asset_r, "btc_ret_hold_pct": btc_r}


def compose_lesson(trade: dict, d: dict) -> tuple[str, str, str]:
    a, dirn = trade["asset"], trade["direction"]
    if d["failure_category"]:
        observed = f"{dirn} {a} lost: {d['failure_category'].replace('_', ' ')} (thesis: {d['thesis_correct']})."
        cause = {
            "execution_assumption": "Price moved in favour but not enough to cover fees/slippage.",
            "unexpected_event": "A bar moved >= 4 ATR — an event-like shock outside normal variance.",
            "incorrect_market_regime": f"BTC moved {d['btc_ret_hold_pct']:.2f}% against the position during the hold.",
            "normal_variance": "Small loss at horizon end; consistent with noise around a flat outcome.",
            "incorrect_direction": "Price moved against the thesis direction.",
        }.get(d["failure_category"], "No single dominant cause identified.")
        lesson = (f"Hypothesis (unvalidated, n=1): for '{dirn} momentum' setups like this, "
                  f"{d['failure_category'].replace('_', ' ')} may recur. Collect more cases before changing anything.")
    else:
        observed = f"{dirn} {a} won ({d['thesis_correct']}). Reason matched thesis: {d['reason_matched_thesis']}"
        cause = "Win attributed to " + ("market beta" if d["beta_explained"] else
                                        "fragile path" if d["fragile"] else "the stated thesis (tentatively)")
        lesson = ("A win is one observation. " + ("Because BTC explains the move, this does NOT support the "
                                                   "asset-specific thesis." if d["beta_explained"] else
                                                   "Record as weak supporting evidence only."))
    if d["devils_advocate_anticipated"]:
        lesson += " The Devil's Advocate flagged this risk in advance: " + "; ".join(
            f["check"] for f in d["anticipated_findings"]) + "."
    return observed, cause, lesson


class LearningLoop:
    def __init__(self, db, settings, clock, llm: LLMClient | None = None):
        self.db, self.s, self.clock, self.llm = db, settings, clock, llm

    def validation_status(self, tag: str, category: str | None) -> tuple[str, int]:
        n = self.db.one("SELECT COUNT(*) AS n FROM lessons WHERE hypothesis_tag = ? AND "
                        "COALESCE(failure_category, 'win') = ?", (tag, category or "win"))["n"] + 1
        if n >= self.s.lesson_min_evidence:
            return "CANDIDATE_FOR_HUMAN_REVIEW", n
        return ("UNVALIDATED" if n == 1 else "COLLECTING_EVIDENCE"), n

    def review(self, trade: dict, outcome: dict, ctx: dict) -> dict:
        inv = self.db.one("SELECT * FROM investigations WHERE id = ?", (trade["investigation_id"],)) or {}
        ch = self.db.one("SELECT * FROM challenges WHERE investigation_id = ? ORDER BY id DESC LIMIT 1",
                         (trade["investigation_id"],))
        d = diagnose(trade, outcome, ch, ctx)
        observed, cause, lesson = compose_lesson(trade, d)
        tag = hypothesis_tag(inv, trade["direction"])
        status, n = self.validation_status(tag, d["failure_category"])
        engine = "rules:v1"
        review = {"diagnosis": d, "similar_observations": n, "needed_for_review": self.s.lesson_min_evidence,
                  "llm_narrative": None}
        if self.llm and self.llm.available:
            try:
                out, _ = self.llm.structured(NARRATIVE_SYSTEM, "\n\n".join([
                    as_data_block("trade", trade), as_data_block("outcome", {k: v for k, v in outcome.items()
                                                                               if k != "price_path_json"}),
                    as_data_block("investigation", inv.get("scout_output_json")),
                    as_data_block("challenge", ch.get("devils_advocate_output_json") if ch else None),
                    as_data_block("deterministic_diagnosis", d)]), PostTradeLLMNarrative, max_tokens=8000)
                review["llm_narrative"] = out.model_dump()
                engine = f"rules:v1+{self.llm.engine_name}"
            except LLMUnavailable as e:
                review["llm_error"] = str(e)
        self.db.update("trade_outcomes", "trade_id", trade["id"], {
            "thesis_correct": d["thesis_correct"], "reason_matched_thesis": d["reason_matched_thesis"],
            "evaluation_json": d})
        lid = self.db.insert("lessons", {
            "trade_id": trade["id"], "created_at": iso(self.clock.now()), "engine": engine,
            "prediction_correct": d["prediction_correct"], "thesis_correct": d["thesis_correct"],
            "timing_assessment": d["timing_assessment"], "risk_assessment": d["risk_assessment"],
            "devils_advocate_anticipated": d["devils_advocate_anticipated"],
            "failure_category": d["failure_category"], "hypothesis_tag": tag, "observed_error": observed,
            "possible_cause": cause, "lesson": lesson, "confidence": "low", "validation_status": status,
            "followup_due_at": trade["expires_at"] if outcome["exit_reason"] == "STOP" else None,
            "review_json": review})
        return self.db.one("SELECT * FROM lessons WHERE id = ?", (lid,))

    def complete_followup(self, lesson: dict, trade: dict, price_at_horizon: float | None) -> dict:
        """After horizon end (stopped trades): was direction right but timing wrong? Uses post-exit data,
        which is legitimate for learning (never fed back into the original decision record)."""
        if price_at_horizon is None:
            return lesson  # data unavailable: leave pending, retried on the next monitor run
        sign = 1 if trade["direction"] == "LONG" else -1
        move = (price_at_horizon / trade["entry_price_usd"] - 1) * 100 * sign
        fields = {"followup_json": {"status": "done", "price_at_horizon_usd": price_at_horizon,
                                    "move_in_thesis_direction_pct": move, "checked_at": iso(self.clock.now())}}
        if move > 0:
            fields["timing_assessment"] = (f"Incorrect timing — stopped out, but at horizon end price was "
                                           f"{move:.2f}% in the thesis direction.")
            if lesson["failure_category"] == "incorrect_direction":
                fields["failure_category"] = "incorrect_timing"
        else:
            fields["timing_assessment"] = f"Direction wrong at horizon end too ({move:.2f}% in thesis direction)."
        self.db.update("lessons", "id", lesson["id"], fields)
        return self.db.one("SELECT * FROM lessons WHERE id = ?", (lesson["id"],))

    def summary(self) -> list[dict]:
        rows = self.db.all("SELECT hypothesis_tag, COALESCE(failure_category, 'win') AS outcome_category, "
                           "COUNT(*) AS n, SUM(devils_advocate_anticipated) AS da_anticipated "
                           "FROM lessons GROUP BY hypothesis_tag, outcome_category ORDER BY n DESC")
        for r in rows:
            r["status"] = ("CANDIDATE_FOR_HUMAN_REVIEW" if r["n"] >= self.s.lesson_min_evidence
                           else "COLLECTING_EVIDENCE")
            r["needed"] = self.s.lesson_min_evidence
        return rows

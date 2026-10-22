"""Experience Memory: retrieve past paper trades from situations similar to the current one.

Anti-lookahead: only trades whose outcome was known (exit_time <= decision time) are eligible.
Anti-overfitting: memory is *information* for the agents. It can only carry challenge weight in the
Devil's Advocate once at least `memory_min_similar` similar trades exist; it never changes rules or parameters.

Similarity: same direction; scaled Euclidean distance over the features below, plus a penalty when the market
regime label differs.
"""
from __future__ import annotations

import math
import statistics
from collections import Counter

from aq.clock import iso

# feature -> scale (one "unit" of difference)
SIMILARITY_FEATURES = {"z_24h": 1.0, "volume_ratio_24h": 0.5, "rsi_14": 10.0, "vol_regime_ratio": 0.5,
                       "dist_sma20_atr": 1.0, "rel_perf_vs_btc_24h_pct": 3.0}
REGIME_PENALTY = 0.75
MAX_DISTANCE = 3.0


def distance(a: dict, b: dict) -> float:
    d = 0.0
    for k, scale in SIMILARITY_FEATURES.items():
        x, y = a.get(k), b.get(k)
        x = 0.0 if x is None else x
        y = 0.0 if y is None else y
        d += ((x - y) / scale) ** 2
    return math.sqrt(d)


def recall(db, direction: str, features: dict, regime_label: str | None, now, s) -> dict:
    rows = db.all(
        "SELECT t.id AS trade_id, t.asset, t.direction, t.entry_time, o.exit_time, o.net_pnl_gbp, o.r_multiple, "
        "o.thesis_correct, o.exit_reason, m.features_json, i.scout_output_json, "
        "l.failure_category, l.lesson, l.devils_advocate_anticipated "
        "FROM paper_trades t JOIN trade_outcomes o ON o.trade_id = t.id "
        "JOIN investigations i ON i.id = t.investigation_id "
        "JOIN market_observations m ON m.id = i.observation_id "
        "LEFT JOIN lessons l ON l.trade_id = t.id "
        "WHERE t.direction = ? AND o.exit_time <= ?", (direction, iso(now)))
    matches = []
    for r in rows:
        past_regime = ((r.get("scout_output_json") or {}).get("market_regime") or {}).get("label")
        d = distance(features, r["features_json"] or {})
        if regime_label and past_regime and past_regime != regime_label:
            d += REGIME_PENALTY
        if d <= MAX_DISTANCE:
            matches.append({"trade_id": r["trade_id"], "asset": r["asset"], "direction": r["direction"],
                            "entry_time": r["entry_time"], "similarity_distance": round(d, 3),
                            "net_pnl_gbp": r["net_pnl_gbp"], "r_multiple": r["r_multiple"],
                            "thesis_correct": r["thesis_correct"], "exit_reason": r["exit_reason"],
                            "failure_category": r["failure_category"], "lesson": r["lesson"],
                            "devils_advocate_anticipated": bool(r["devils_advocate_anticipated"]),
                            "regime": past_regime})
    matches.sort(key=lambda m: m["similarity_distance"])
    top = matches[: s.memory_k]
    n = len(matches)
    rs = [m["r_multiple"] for m in matches if m["r_multiple"] is not None]
    fails = Counter(m["failure_category"] for m in matches if m["failure_category"])
    summary = {
        "direction": direction, "similar_trades": n,
        "wins": sum(1 for m in matches if (m["net_pnl_gbp"] or 0) > 0),
        "losses": sum(1 for m in matches if (m["net_pnl_gbp"] or 0) <= 0),
        "expectancy_r": statistics.mean(rs) if rs else None,
        "most_common_failure": fails.most_common(1)[0][0] if fails else None,
        "devils_advocate_anticipated_losses": sum(1 for m in matches if m["failure_category"]
                                                  and m["devils_advocate_anticipated"]),
        "sufficient": n >= s.memory_min_similar, "min_required": s.memory_min_similar,
    }
    if n == 0:
        summary["note"] = "No similar closed trades in the ledger yet."
    elif not summary["sufficient"]:
        summary["note"] = (f"Only {n} similar trade(s) (< {s.memory_min_similar}); informational only — "
                           "too few to weigh.")
    else:
        summary["note"] = (f"{n} similar trades: expectancy {summary['expectancy_r']:+.2f}R"
                           + (f"; most common failure: {summary['most_common_failure']}" if fails else ""))
    return {"summary": summary, "matches": top, "method": {
        "features": SIMILARITY_FEATURES, "regime_penalty": REGIME_PENALTY, "max_distance": MAX_DISTANCE,
        "eligibility": "same direction, outcome known before decision time"}}

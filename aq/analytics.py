"""Performance analytics and benchmarks — with explicit sample-size gates.

Metrics computed from small samples are labelled as such instead of being presented as meaningful.
"""
from __future__ import annotations

import math
import statistics
from datetime import datetime, timedelta

from aq.clock import parse_iso
from aq.data.base import Candle

DISCLAIMER = "Experimental paper performance — not live trading results."


def evidence_quality(n: int, s) -> dict:
    if n == 0:
        label, level = "No closed trades yet", "none"
    elif n < s.min_trades_for_metrics:
        label, level = f"Insufficient sample size (n={n}; need ≥ {s.min_trades_for_metrics})", "insufficient"
    elif n < 50:
        label, level = f"Preliminary (n={n}); wide uncertainty", "preliminary"
    else:
        label, level = f"Moderate sample (n={n})", "moderate"
    return {"closed_trades": n, "level": level, "label": label, "min_required": s.min_trades_for_metrics}


def trade_metrics(closed: list[dict], s) -> dict:
    n = len(closed)
    nets = [t["net_pnl_gbp"] for t in closed]
    wins = [x for x in nets if x > 0]
    losses = [x for x in nets if x <= 0]
    complete = sum(1 for t in closed if t.get("evaluation_json") and t.get("price_path_json"))
    holds = [(parse_iso(t["exit_time"]) - parse_iso(t["entry_time"])).total_seconds() / 3600 for t in closed]
    m = {
        "number_of_trades": n,
        "trades_with_complete_evidence": complete,
        "win_rate_pct": len(wins) / n * 100 if n else None,
        "average_winner_gbp": statistics.mean(wins) if wins else None,
        "average_loser_gbp": statistics.mean(losses) if losses else None,
        "expectancy_gbp": statistics.mean(nets) if nets else None,
        "expectancy_r": statistics.mean([t["r_multiple"] for t in closed if t.get("r_multiple") is not None])
        if n else None,
        "profit_factor": (sum(wins) / abs(sum(losses))) if losses and sum(losses) != 0 else None,
        "average_planned_reward_risk": statistics.mean([t["reward_risk"] for t in closed]) if n else None,
        "average_holding_hours": statistics.mean(holds) if holds else None,
        "total_fees_gbp": sum(t["fees_gbp"] for t in closed),
        "total_slippage_gbp": sum(t["estimated_slippage_gbp"] for t in closed),
        "realized_net_gbp": sum(nets),
    }
    if n and not losses:
        m["profit_factor_note"] = "undefined (no losing trades yet)"
    m["evidence_quality"] = evidence_quality(complete, s)
    return m


def equity_metrics(snapshots: list[dict], start_capital: float, current_equity: float, fund_created: datetime,
                   now: datetime, s) -> dict:
    series = [(parse_iso(x["taken_at"]), x["equity_gbp"]) for x in snapshots] + [(now, current_equity)]
    peak, mdd = start_capital, 0.0
    for _, e in series:
        peak = max(peak, e)
        mdd = max(mdd, (peak - e) / peak * 100 if peak else 0)
    current_dd = (peak - current_equity) / peak * 100 if peak else 0

    def ret_since(delta: timedelta):
        t0 = now - delta
        if fund_created > t0:
            return None
        before = [e for t, e in series if t <= t0]
        base = before[-1] if before else start_capital
        return (current_equity / base - 1) * 100

    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_base = [e for t, e in series if t <= day_start]
    age_days = (now - fund_created).total_seconds() / 86400

    # Daily returns from the last snapshot of each day.
    by_day: dict = {}
    for t, e in series:
        by_day[t.date()] = e
    days = sorted(by_day)
    daily = [(by_day[b] / by_day[a] - 1) for a, b in zip(days[:-1], days[1:]) if by_day[a]]
    sharpe = sortino = None
    sharpe_note = f"Insufficient sample (n={len(daily)} daily returns; need ≥ {s.min_days_for_sharpe})"
    if len(daily) >= s.min_days_for_sharpe:
        sd = statistics.pstdev(daily)
        sharpe = statistics.mean(daily) / sd * math.sqrt(365) if sd > 0 else None
        downside = [min(r, 0) for r in daily]
        dd = math.sqrt(sum(r * r for r in downside) / len(downside))
        sortino = statistics.mean(daily) / dd * math.sqrt(365) if dd > 0 else None
        sharpe_note = "Annualised with √365 (crypto trades every day); risk-free rate assumed 0"
    total = (current_equity / start_capital - 1) * 100
    exposures = [x["exposure_gbp"] / x["equity_gbp"] * 100 for x in snapshots if x["equity_gbp"]]
    return {
        "total_return_pct": total,
        "today_return_pct": (current_equity / (today_base[-1] if today_base else start_capital) - 1) * 100
        if fund_created <= day_start else total,
        "return_7d_pct": ret_since(timedelta(days=7)),
        "return_30d_pct": ret_since(timedelta(days=30)),
        "annualised_return_pct": ((1 + total / 100) ** (365 / age_days) - 1) * 100 if age_days >= 90 else None,
        "annualised_note": None if age_days >= 90 else f"Not shown: {age_days:.1f} days of history (< 90) is not "
                                                      "statistically meaningful",
        "max_drawdown_pct": mdd, "current_drawdown_pct": current_dd,
        "sharpe": sharpe, "sortino": sortino, "sharpe_note": sharpe_note,
        "average_exposure_pct": statistics.mean(exposures) if exposures else None,
        "history_days": age_days, "snapshots": len(snapshots),
    }


def drawdown_warnings(current_dd: float, mdd: float, s) -> list[str]:
    hit = [lvl for lvl in s.drawdown_warning_levels if current_dd >= lvl]
    if not hit:
        return []
    return [f"Drawdown warning: current drawdown {current_dd:.2f}% ≥ {max(hit)}%. "
            "Strategy is NOT changed automatically; review lessons before acting."]


def btc_buy_and_hold(fund: dict, btc_now: float | None, fx_now: float | None) -> dict:
    if not fund.get("benchmark_start_at"):
        return {"available": False, "reason": "Benchmark start not yet recorded (no BTC price observed yet)"}
    if btc_now is None or fx_now is None:
        return {"available": False, "reason": "Data unavailable (current BTC price or FX)"}
    p0, fx0 = fund["benchmark_btc_price_usd"], fund["benchmark_fx_usd_per_gbp"]
    ret_gbp = ((btc_now / fx_now) / (p0 / fx0) - 1) * 100
    return {"available": True, "start_at": fund["benchmark_start_at"], "start_price_usd": p0, "current_price_usd": btc_now,
            "return_pct_gbp": ret_gbp, "return_pct_usd": (btc_now / p0 - 1) * 100,
            "value_gbp": fund["starting_capital"] * (1 + ret_gbp / 100)}


def sma_baseline(btc_1h: list[Candle], start: datetime, s, period: int = 50) -> dict:
    """Long BTC when the last closed hourly close > SMA(period), else cash. Position for hour t+1 is decided
    from data available at the close of hour t (no lookahead). Costs charged on each switch."""
    closes = [c.close for c in btc_1h]
    times = [c.open_time for c in btc_1h]
    idx0 = next((i for i, t in enumerate(times) if t >= start), None)
    if idx0 is None or idx0 < period or idx0 >= len(closes) - 1:
        return {"available": False, "reason": "Insufficient BTC history since benchmark start"}
    cost = (s.fee_bps_per_side + s.slippage_bps_per_side) / 10_000
    value, pos, switches, in_market = 1.0, 0, 0, 0
    curve = [(times[idx0].isoformat(), 0.0)]
    for i in range(idx0, len(closes) - 1):
        sma = sum(closes[i - period + 1:i + 1]) / period
        target = 1 if closes[i] > sma else 0
        if target != pos:
            value *= 1 - cost
            switches += 1
            pos = target
        if pos:
            value *= closes[i + 1] / closes[i]
            in_market += 1
        curve.append((times[i + 1].isoformat(), (value - 1) * 100))
    hours = len(closes) - 1 - idx0
    return {"available": True, "return_pct_usd": (value - 1) * 100, "switches": switches, "hours": hours,
            "curve": curve,
            "time_in_market_pct": in_market / hours * 100 if hours else None,
            "rule": f"Long BTC when hourly close > SMA{period}, else cash; {cost * 1e4:.0f} bps per switch",
            "note": "USD price return (GBP/USD FX not applied to this baseline)."}

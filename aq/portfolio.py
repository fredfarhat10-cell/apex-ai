"""Paper portfolio: trade lifecycle, exit evaluation against real candles, P/L accounting.

Exit evaluation conventions (conservative, documented in docs/METHODOLOGY.md):
- Only candles that OPEN at or after entry time and have CLOSED are used (no pre-entry prices, no partial bars).
- If a bar touches both stop and target, the STOP is assumed to have filled first.
- If a bar opens beyond the stop (gap), the fill is the bar's open (worse than the stop).
- Target fills at the target price (no favourable gap credit).
- Time exit: first bar opening at/after expiry, filled at that bar's open.
- Intrabar exits are timestamped at the bar's close (when the system could know it).
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

from aq.clock import iso, parse_iso
from aq.data.base import Candle


@dataclass
class PathResult:
    exit_reason: str | None = None  # STOP | TARGET | TIME | None (still open)
    exit_price: float | None = None
    exit_time: datetime | None = None
    mfe_price: float | None = None
    mae_price: float | None = None
    candles_used: list[Candle] = field(default_factory=list)


def evaluate_path(direction: str, entry_price: float, entry_time: datetime, stop: float, target: float,
                  expires_at: datetime, candles: list[Candle], now: datetime,
                  prior_mfe: float | None = None, prior_mae: float | None = None) -> PathResult:
    sign = 1 if direction == "LONG" else -1
    res = PathResult(mfe_price=prior_mfe if prior_mfe is not None else entry_price,
                     mae_price=prior_mae if prior_mae is not None else entry_price)
    better = (lambda a, b: max(a, b)) if sign > 0 else (lambda a, b: min(a, b))
    worse = (lambda a, b: min(a, b)) if sign > 0 else (lambda a, b: max(a, b))
    for c in sorted(candles, key=lambda c: c.open_time):
        if c.open_time < entry_time or not c.is_closed(now):
            continue
        if c.open_time >= expires_at:
            res.exit_reason, res.exit_price, res.exit_time = "TIME", c.open, c.open_time
            break
        res.candles_used.append(c)
        fav, adv = (c.high, c.low) if sign > 0 else (c.low, c.high)
        stop_gapped = (c.open - stop) * sign <= 0
        stop_hit = (adv - stop) * sign <= 0
        target_hit = (fav - target) * sign >= 0
        if stop_gapped:
            res.mae_price = worse(res.mae_price, c.open)
            res.exit_reason, res.exit_price, res.exit_time = "STOP", c.open, c.close_time
            break
        if stop_hit:  # stop assumed first even if target also touched
            res.mfe_price = better(res.mfe_price, c.open)
            res.mae_price = worse(res.mae_price, stop)
            res.exit_reason, res.exit_price, res.exit_time = "STOP", stop, c.close_time
            break
        res.mfe_price = better(res.mfe_price, fav)
        res.mae_price = worse(res.mae_price, adv)
        if target_hit:
            res.exit_reason, res.exit_price, res.exit_time = "TARGET", target, c.close_time
            break
    return res


def _trade_costs(trade: dict, s) -> tuple[float, float, float]:
    """(fee bps/side, slippage bps/side, funding bps/day) as estimated at entry; settings as fallback."""
    c = trade.get("costs_json") or {}
    return (c.get("fee_bps_per_side", s.fee_bps_per_side), c.get("slippage_bps_per_side", s.slippage_bps_per_side),
            c.get("funding_bps_per_day", 0.0) if trade["direction"] == "SHORT" else 0.0)


def compute_pnl(trade: dict, exit_price: float, fx_exit: float, s, held_hours: float = 0.0) -> dict:
    sign = 1 if trade["direction"] == "LONG" else -1
    fee_bps, slip_bps, fund_bps_day = _trade_costs(trade, s)
    units = trade["units"]
    entry_notional = units * trade["entry_price_usd"] / trade["fx_entry_usd_per_gbp"]
    exit_notional = units * exit_price / fx_exit
    gross = units * (exit_price - trade["entry_price_usd"]) * sign / fx_exit
    fees = (entry_notional + exit_notional) * fee_bps / 10_000
    slip = (entry_notional + exit_notional) * slip_bps / 10_000
    funding = entry_notional * fund_bps_day / 10_000 * held_hours / 24
    net = gross - fees - slip - funding
    return {"gross_pnl_gbp": gross, "fees_gbp": fees, "estimated_slippage_gbp": slip, "funding_gbp": funding,
            "net_pnl_gbp": net, "r_multiple": net / trade["risk_gbp"] if trade["risk_gbp"] else None}


def excursions_pct(trade: dict, mfe_price: float, mae_price: float) -> tuple[float, float]:
    sign = 1 if trade["direction"] == "LONG" else -1
    e = trade["entry_price_usd"]
    return (mfe_price / e - 1) * 100 * sign, (mae_price / e - 1) * 100 * sign


def unrealized_gbp(trade: dict, price: float, fx: float, s) -> float:
    sign = 1 if trade["direction"] == "LONG" else -1
    fee_bps, slip_bps, _ = _trade_costs(trade, s)
    entry_notional = trade["units"] * trade["entry_price_usd"] / trade["fx_entry_usd_per_gbp"]
    entry_costs = entry_notional * (fee_bps + slip_bps) / 10_000
    return trade["units"] * (price - trade["entry_price_usd"]) * sign / fx - entry_costs


class Portfolio:
    def __init__(self, db, settings, clock):
        self.db, self.s, self.clock = db, settings, clock

    # -- fund -------------------------------------------------------------------
    def ensure_fund(self) -> dict:
        f = self.db.one("SELECT * FROM fund WHERE id = 1")
        if not f:
            self.db.insert("fund", {"id": 1, "name": self.s.fund_name, "base_currency": self.s.base_currency,
                                    "starting_capital": self.s.starting_capital, "created_at": iso(self.clock.now())})
            f = self.db.one("SELECT * FROM fund WHERE id = 1")
        return f

    def set_benchmark_start(self, btc_price: float, fx: float, source: str) -> None:
        f = self.ensure_fund()
        if f["benchmark_start_at"] is None:
            self.db.update("fund", "id", 1, {"benchmark_start_at": iso(self.clock.now()),
                                             "benchmark_btc_price_usd": btc_price,
                                             "benchmark_fx_usd_per_gbp": fx, "benchmark_source": source})

    # -- queries ----------------------------------------------------------------
    def open_trades(self) -> list[dict]:
        return self.db.all("SELECT * FROM paper_trades WHERE status = 'OPEN' ORDER BY entry_time")

    def closed_trades(self) -> list[dict]:
        return self.db.all("SELECT t.*, o.* FROM paper_trades t JOIN trade_outcomes o ON o.trade_id = t.id "
                           "WHERE t.status = 'CLOSED' ORDER BY o.exit_time")

    def realized_total(self) -> float:
        r = self.db.one("SELECT COALESCE(SUM(net_pnl_gbp), 0) AS s FROM trade_outcomes")
        return r["s"]

    def state(self, prices: dict[str, float], fx: float | None) -> dict:
        """Mark-to-market. Open positions without a current price are valued at entry (flagged)."""
        start = self.ensure_fund()["starting_capital"]
        realized = self.realized_total()
        unreal, exposure, stale = 0.0, 0.0, []
        for t in self.open_trades():
            p = prices.get(t["asset"])
            if p is None or fx is None:
                stale.append(t["asset"])
                exposure += t["notional_gbp"]
                continue
            unreal += unrealized_gbp(t, p, fx, self.s)
            exposure += t["units"] * p / fx
        equity = start + realized + unreal
        day_start = self.clock.now().astimezone(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        r_today = self.db.one("SELECT COALESCE(SUM(net_pnl_gbp), 0) AS s FROM trade_outcomes WHERE exit_time >= ?",
                              (iso(day_start),))["s"]
        daily = r_today + unreal  # conservative: all open unrealized counted against today
        opens = self.open_trades()
        return {"starting_capital": start, "equity_gbp": equity, "realized_gbp": realized, "unrealized_gbp": unreal,
                "exposure_gbp": exposure, "open_positions": len(opens), "open_assets": [t["asset"] for t in opens],
                "daily_pnl_gbp": daily, "day_start_equity_gbp": equity - daily, "unpriced_positions": stale}

    # -- lifecycle --------------------------------------------------------------
    def open_trade(self, *, investigation_id: str, asset: str, position: dict, scout, da, entry_time: datetime,
                   data_source: str) -> dict:
        tid = str(uuid.uuid4())
        expires = entry_time + timedelta(hours=scout.horizon_hours)
        row = {
            "id": tid, "investigation_id": investigation_id, "asset": asset, "direction": position["direction"],
            "status": "OPEN", "entry_time": iso(entry_time), "entry_price_usd": position["entry_price_usd"],
            "fx_entry_usd_per_gbp": position["fx_usd_per_gbp"], "units": position["units"],
            "notional_gbp": position["notional_gbp"], "stop_price_usd": position["stop_price_usd"],
            "target_price_usd": position["target_price_usd"], "risk_gbp": position["risk_gbp"],
            "planned_reward_gbp": position["planned_reward_gbp"], "reward_risk": position["net_reward_risk"],
            "horizon_hours": scout.horizon_hours, "expires_at": iso(expires), "thesis": scout.thesis,
            "research_confidence": scout.research_confidence,
            "agents_json": [{"agent": "Market Intelligence Scout", "engine": scout.engine},
                            {"agent": "Devil's Advocate", "engine": da.engine},
                            {"agent": "Risk Engine", "engine": "deterministic"}],
            "evidence_json": [e.model_dump() for e in scout.evidence],
            "devils_advocate_verdict": da.verdict, "devils_advocate_summary": da.summary,
            "entry_reason": scout.rationale, "rejected_alternatives_json": scout.rejected_alternatives,
            "data_source": data_source, "last_checked_at": iso(entry_time),
            "max_favourable_price_usd": position["entry_price_usd"],
            "max_adverse_price_usd": position["entry_price_usd"],
            "costs_json": position.get("costs") or {},
        }
        self.db.insert("paper_trades", row)
        return self.db.one("SELECT * FROM paper_trades WHERE id = ?", (tid,))

    def record_progress(self, trade: dict, res: PathResult) -> None:
        self.db.update("paper_trades", "id", trade["id"], {
            "last_checked_at": iso(self.clock.now()), "max_favourable_price_usd": res.mfe_price,
            "max_adverse_price_usd": res.mae_price})

    def close_trade(self, trade: dict, *, exit_reason: str, exit_price: float, exit_time: datetime, fx_exit: float,
                    mfe_price: float, mae_price: float, path: list[Candle], data_source: str) -> dict:
        held = (exit_time - parse_iso(trade["entry_time"])).total_seconds() / 3600
        pnl = compute_pnl(trade, exit_price, fx_exit, self.s, held_hours=max(held, 0.0))
        mfe_pct, mae_pct = excursions_pct(trade, mfe_price, mae_price)
        with self.db.transaction() as db:
            db.insert("trade_outcomes", {
                "trade_id": trade["id"], "exit_price_usd": exit_price, "exit_time": iso(exit_time),
                "exit_reason": exit_reason, "fx_exit_usd_per_gbp": fx_exit, **pnl, "mfe_pct": mfe_pct,
                "mae_pct": mae_pct, "price_path_json": [c.to_dict() for c in path], "data_source": data_source})
            db.update("paper_trades", "id", trade["id"], {
                "status": "CLOSED", "max_favourable_price_usd": mfe_price, "max_adverse_price_usd": mae_price,
                "last_checked_at": iso(self.clock.now())})
        return self.db.one("SELECT * FROM trade_outcomes WHERE trade_id = ?", (trade["id"],))

    def snapshot(self, st: dict, fx: float | None) -> None:
        self.db.insert("equity_snapshots", {
            "taken_at": iso(self.clock.now()), "equity_gbp": st["equity_gbp"], "realized_gbp": st["realized_gbp"],
            "unrealized_gbp": st["unrealized_gbp"], "exposure_gbp": st["exposure_gbp"],
            "open_positions": st["open_positions"], "fx_usd_per_gbp": fx})


def parse_trade_times(trade: dict) -> tuple[datetime, datetime]:
    return parse_iso(trade["entry_time"]), parse_iso(trade["expires_at"])

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import TYPE_CHECKING

from ..models import Order, Portfolio, Side

if TYPE_CHECKING:
    import pandas as pd


@dataclass
class RiskConfig:
    # Conservative objective: 5-15%/mo target, max DD ≤ 12-15%, risk/trade 0.5-2%.
    max_position_pct: float = 0.10          # cap per-position notional as % of equity
    risk_per_trade_pct: float = 0.01        # $ risked per trade as % of equity (for stop-sizing)
    max_risk_per_trade_pct: float = 0.02    # hard ceiling — rejected above this
    stop_loss_pct: float = 0.03             # default stop distance if none provided
    max_daily_drawdown_pct: float = 0.03    # halt trading for the day if breached
    max_total_drawdown_pct: float = 0.12    # kill-switch: halt all trading
    max_gross_exposure_pct: float = 1.00    # sum of |position notional| / equity
    min_risk_reward: float = 2.0            # reject trades with R:R below this


@dataclass
class RiskDecision:
    accepted: bool
    order: Order | None
    reason: str


class RiskManager:
    def __init__(self, config: RiskConfig | None = None, starting_equity: float = 0.0) -> None:
        self.config = config or RiskConfig()
        self._day: date | None = None
        self._day_start_equity: float = starting_equity
        self._peak_equity: float = starting_equity
        self._halted: bool = False

    def on_bar(self, ts: datetime, equity: float) -> None:
        d = ts.date()
        if self._day != d:
            self._day = d
            self._day_start_equity = equity
        if equity > self._peak_equity:
            self._peak_equity = equity
        if self._peak_equity > 0:
            total_dd = 1.0 - equity / self._peak_equity
            if total_dd >= self.config.max_total_drawdown_pct:
                self._halted = True

    def halted(self) -> bool:
        return self._halted

    def _daily_drawdown_breached(self, equity: float) -> bool:
        if self._day_start_equity <= 0:
            return False
        dd = 1.0 - equity / self._day_start_equity
        return dd >= self.config.max_daily_drawdown_pct

    def size_long(self, equity: float, price: float, stop_price: float | None) -> float:
        """Return quantity to buy based on risk-per-trade and position cap."""
        if price <= 0 or equity <= 0:
            return 0.0
        stop = stop_price if stop_price is not None else price * (1.0 - self.config.stop_loss_pct)
        per_unit_risk = max(price - stop, price * 0.001)
        risk_budget = equity * self.config.risk_per_trade_pct
        qty_by_risk = risk_budget / per_unit_risk
        qty_by_cap = (equity * self.config.max_position_pct) / price
        return max(0.0, min(qty_by_risk, qty_by_cap))

    def size_dynamic(
        self,
        equity: float,
        bars: "pd.DataFrame",
        atr_multiplier_stop: float = 2.0,
        atr_multiplier_tp: float = 4.0,
        atr_period: int = 14,
    ) -> tuple[float, float, float]:
        """Return (quantity, stop_price, take_profit) sized from ATR-based stops.

        Stop = entry - atr_multiplier_stop × ATR
        TP   = entry + atr_multiplier_tp × ATR
        Quantity is then sized so the stop distance = risk_per_trade_pct of equity.
        """
        from ..indicators.core import atr as compute_atr
        close = bars["close"]
        entry = float(close.iloc[-1])
        a = compute_atr(bars["high"], bars["low"], close, atr_period)
        atr_val = float(a.dropna().iloc[-1]) if not a.dropna().empty else entry * 0.01
        stop = entry - atr_multiplier_stop * atr_val
        tp = entry + atr_multiplier_tp * atr_val
        qty = self.size_long(equity, entry, stop)
        return qty, stop, tp

    def risk_reward(self, entry: float, stop: float, take_profit: float | None) -> float | None:
        """Compute R:R for a long trade. Returns None if take_profit not set."""
        if take_profit is None:
            return None
        risk = entry - stop
        reward = take_profit - entry
        if risk <= 0:
            return None
        return reward / risk

    def evaluate(
        self, order: Order, portfolio: Portfolio, equity: float, ref_price: float
    ) -> RiskDecision:
        if self._halted:
            return RiskDecision(False, None, "kill-switch: total drawdown breached")
        if self._daily_drawdown_breached(equity):
            return RiskDecision(False, None, "daily drawdown breached")
        if order.quantity <= 0:
            return RiskDecision(False, None, "non-positive quantity")

        pos = portfolio.position(order.symbol)

        if order.side is Side.BUY:
            notional = order.quantity * ref_price
            cap = equity * self.config.max_position_pct
            new_notional = (pos.quantity + order.quantity) * ref_price
            if new_notional > cap + 1e-9:
                scaled_qty = max(0.0, (cap - pos.quantity * ref_price) / ref_price)
                if scaled_qty <= 0:
                    return RiskDecision(False, None, "position cap reached")
                order = Order(**{**order.__dict__, "quantity": scaled_qty})
                notional = scaled_qty * ref_price

            gross_after = notional + sum(
                abs(p.quantity) * ref_price for s, p in portfolio.positions.items() if s != order.symbol
            )
            if gross_after > equity * self.config.max_gross_exposure_pct + 1e-9:
                return RiskDecision(False, None, "gross exposure cap exceeded")

            if order.stop_loss is None:
                order = Order(**{**order.__dict__, "stop_loss": ref_price * (1.0 - self.config.stop_loss_pct)})

        else:  # SELL
            if order.quantity > pos.quantity + 1e-9:
                order = Order(**{**order.__dict__, "quantity": pos.quantity})
            if order.quantity <= 0:
                return RiskDecision(False, None, "no position to sell")

        return RiskDecision(True, order, "ok")

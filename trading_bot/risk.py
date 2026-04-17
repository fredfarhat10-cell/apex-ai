from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Any

import numpy as np

from config import RISK


# ── Market Regime ─────────────────────────────────────────────────────────────

def detect_regime(closes: list[float], adx_period: int = 14) -> str:
    """Return 'trending' or 'ranging' based on ADX-proxy from close prices.

    Uses a simplified directional movement proxy: if the standard deviation of
    1-period returns relative to its own rolling mean is high, the market is
    trending; otherwise ranging.
    """
    if len(closes) < adx_period + 5:
        return "ranging"
    arr = np.array(closes, dtype=float)
    rets = np.diff(arr) / arr[:-1]
    # rolling mean of absolute returns vs overall std — simple ADX proxy
    abs_rets = np.abs(rets[-adx_period:])
    mean_move = abs_rets.mean()
    overall_vol = rets.std()
    if overall_vol == 0:
        return "ranging"
    # High signal-to-noise → trending
    ratio = mean_move / overall_vol
    return "trending" if ratio > 1.2 else "ranging"


# ── Position Sizing ───────────────────────────────────────────────────────────

@dataclass
class SizingResult:
    quantity: float
    method: str
    notes: str


def _volatility_based_size(
    equity: float,
    price: float,
    closes: list[float],
    target_vol_pct: float = 0.01,
    atr_multiplier: float = 2.0,
) -> float:
    """Size position so that 1 ATR move = target_vol_pct of equity."""
    if len(closes) < 15 or price <= 0:
        return 0.0
    arr = np.array(closes[-15:], dtype=float)
    atr = np.abs(np.diff(arr)).mean() * atr_multiplier
    if atr <= 0:
        return 0.0
    dollar_risk = equity * target_vol_pct
    return dollar_risk / atr


def _kelly_size(
    equity: float,
    price: float,
    win_rate: float,
    avg_win: float,
    avg_loss: float,
    kelly_fraction: float = 0.25,
) -> float:
    """Fractional Kelly criterion sizing."""
    if avg_loss <= 0 or price <= 0:
        return 0.0
    b = avg_win / avg_loss  # win/loss ratio
    p = win_rate
    q = 1.0 - p
    kelly = (b * p - q) / b
    kelly = max(0.0, kelly) * kelly_fraction
    notional = equity * kelly
    return notional / price


def compute_position_size(
    equity: float,
    price: float,
    stop_price: float,
    closes: list[float] | None = None,
    win_rate: float | None = None,
    avg_win: float | None = None,
    avg_loss: float | None = None,
) -> SizingResult:
    """Return best position size using available data.

    Priority: Kelly (if stats available) → volatility-based → fixed risk-budget.
    Always capped at max_position_pct * equity.
    """
    max_qty = (equity * RISK["max_position_pct"]) / price if price > 0 else 0.0
    stop_dist = abs(price - stop_price)

    # Fixed risk-budget fallback
    if stop_dist > 0:
        fixed_qty = (equity * RISK["max_risk_per_trade"]) / stop_dist
    else:
        fixed_qty = 0.0

    method = "fixed_risk"
    qty = fixed_qty

    if (
        win_rate is not None
        and avg_win is not None
        and avg_loss is not None
        and avg_loss > 0
    ):
        kelly_qty = _kelly_size(
            equity, price, win_rate, avg_win, avg_loss, RISK["kelly_fraction"]
        )
        if kelly_qty > 0:
            qty = kelly_qty
            method = "kelly"

    elif closes and len(closes) >= 15:
        vol_qty = _volatility_based_size(equity, price, closes)
        if vol_qty > 0:
            qty = vol_qty
            method = "volatility"

    qty = min(qty, max_qty)
    return SizingResult(
        quantity=max(0.0, qty),
        method=method,
        notes=f"capped at max_position_pct={RISK['max_position_pct']}",
    )


# ── Risk Gate ─────────────────────────────────────────────────────────────────

@dataclass
class RiskState:
    peak_equity: float = 0.0
    day_start_equity: float = 0.0
    _day: date | None = field(default=None, repr=False)
    halted: bool = False
    halt_reason: str = ""

    def on_bar(self, equity: float, ts: datetime | None = None) -> None:
        now = (ts or datetime.now(timezone.utc)).date()
        if self._day != now:
            self._day = now
            self.day_start_equity = equity
        if equity > self.peak_equity:
            self.peak_equity = equity
        total_dd = _drawdown(equity, self.peak_equity)
        if total_dd >= RISK["max_total_drawdown"]:
            self.halted = True
            self.halt_reason = f"total drawdown {total_dd:.1%} >= {RISK['max_total_drawdown']:.1%}"

    def daily_dd(self, equity: float) -> float:
        return _drawdown(equity, self.day_start_equity)

    def total_dd(self, equity: float) -> float:
        return _drawdown(equity, self.peak_equity)


def _drawdown(equity: float, reference: float) -> float:
    if reference <= 0:
        return 0.0
    return max(0.0, 1.0 - equity / reference)


def validate_trade(trade: dict[str, Any], balance: float, state: RiskState) -> tuple[bool, str]:
    """Return (accepted, reason). Enforces all risk rules."""
    if state.halted:
        return False, state.halt_reason

    daily_dd = state.daily_dd(balance)
    if daily_dd >= RISK["max_daily_drawdown"]:
        return False, f"daily drawdown {daily_dd:.1%} >= {RISK['max_daily_drawdown']:.1%}"

    entry = trade.get("entry", 0)
    stop = trade.get("stop_loss", 0)
    target = trade.get("take_profit", 0)

    if entry <= 0 or stop <= 0:
        return False, "entry or stop_loss missing"

    risk_per_unit = abs(entry - stop)
    if risk_per_unit <= 0:
        return False, "zero risk distance (entry == stop)"

    position_size = (balance * RISK["max_risk_per_trade"]) / risk_per_unit
    if position_size <= 0:
        return False, "computed position size is zero"

    if target > 0 and risk_per_unit > 0:
        rr = abs(target - entry) / risk_per_unit
        if rr < RISK["min_risk_reward"]:
            return False, f"R:R {rr:.2f} < minimum {RISK['min_risk_reward']}"

    return True, "ok"

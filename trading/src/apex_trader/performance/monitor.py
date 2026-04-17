from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import NamedTuple

import numpy as np


class TradeRecord(NamedTuple):
    """Minimal record of a closed trade required by PerformanceMonitor."""

    pnl: float
    strategy: str
    entry: float
    exit: float
    ts: datetime


@dataclass
class StrategyStats:
    """Running performance stats for a single strategy."""

    name: str
    trades: int = 0
    wins: int = 0
    gross_win: float = 0.0
    gross_loss: float = 0.0
    pnls: deque = field(default_factory=lambda: deque(maxlen=200))

    @property
    def win_rate(self) -> float:
        return self.wins / self.trades if self.trades else 0.0

    @property
    def profit_factor(self) -> float:
        if self.gross_loss <= 0:
            return float("inf") if self.gross_win > 0 else 0.0
        return self.gross_win / self.gross_loss

    def sharpe(self, annualisation: float = 252.0) -> float:
        """Sharpe from the stored P&L series (assumes daily frequency)."""
        if len(self.pnls) < 2:
            return 0.0
        arr = np.array(self.pnls, dtype=float)
        mu, sigma = arr.mean(), arr.std(ddof=1)
        if sigma <= 0:
            return 0.0
        return float(np.sqrt(annualisation) * mu / sigma)

    def as_dict(self) -> dict:
        return {
            "strategy": self.name,
            "trades": self.trades,
            "win_rate": round(self.win_rate, 4),
            "profit_factor": round(self.profit_factor, 4) if self.profit_factor != float("inf") else None,
            "sharpe": round(self.sharpe(), 4),
            "gross_win": round(self.gross_win, 4),
            "gross_loss": round(self.gross_loss, 4),
        }


class PerformanceMonitor:
    """Real-time performance tracker for the live/paper trading loop.

    Tracks overall and per-strategy metrics across all closed trades.
    The equity_curve is built from an initial balance + cumulative P&L so
    that Sharpe and drawdown can be computed without re-running the backtest.
    """

    def __init__(
        self,
        starting_equity: float = 10_000.0,
        rolling_window: int = 30,
    ) -> None:
        self._starting_equity = starting_equity
        self._equity = starting_equity
        self._peak_equity = starting_equity
        self._rolling_window = rolling_window

        self._all_pnls: deque[float] = deque(maxlen=500)
        self._equity_curve: list[float] = [starting_equity]
        self._strategy_stats: dict[str, StrategyStats] = defaultdict(
            lambda: StrategyStats(name="?")
        )

    # ── write ──────────────────────────────────────────────────────────────

    def record_close(self, trade: TradeRecord) -> None:
        self._equity += trade.pnl
        if self._equity > self._peak_equity:
            self._peak_equity = self._equity
        self._equity_curve.append(self._equity)
        self._all_pnls.append(trade.pnl)

        key = trade.strategy
        if key not in self._strategy_stats:
            self._strategy_stats[key] = StrategyStats(name=key)
        s = self._strategy_stats[key]
        s.trades += 1
        s.pnls.append(trade.pnl)
        if trade.pnl > 0:
            s.wins += 1
            s.gross_win += trade.pnl
        elif trade.pnl < 0:
            s.gross_loss += abs(trade.pnl)

    # ── overall metrics ────────────────────────────────────────────────────

    def win_rate(self, n_last: int | None = None) -> float:
        n = n_last or self._rolling_window
        pnls = list(self._all_pnls)[-n:]
        if not pnls:
            return 0.0
        return sum(1 for p in pnls if p > 0) / len(pnls)

    def sharpe(self, annualisation: float = 252.0, n_last: int | None = None) -> float:
        n = n_last or self._rolling_window
        pnls = np.array(list(self._all_pnls)[-n:], dtype=float)
        if len(pnls) < 2:
            return 0.0
        mu, sigma = pnls.mean(), pnls.std(ddof=1)
        if sigma <= 0:
            return 0.0
        return float(np.sqrt(annualisation) * mu / sigma)

    def profit_factor(self, n_last: int | None = None) -> float:
        n = n_last or self._rolling_window
        pnls = list(self._all_pnls)[-n:]
        gross_win = sum(p for p in pnls if p > 0)
        gross_loss = sum(-p for p in pnls if p < 0)
        if gross_loss <= 0:
            return float("inf") if gross_win > 0 else 0.0
        return gross_win / gross_loss

    def max_drawdown(self) -> float:
        """Max drawdown over the full equity curve."""
        if len(self._equity_curve) < 2:
            return 0.0
        curve = np.array(self._equity_curve, dtype=float)
        peak = np.maximum.accumulate(curve)
        dd = 1.0 - curve / np.where(peak > 0, peak, 1.0)
        return float(dd.max())

    def current_drawdown(self) -> float:
        if self._peak_equity <= 0:
            return 0.0
        return max(0.0, 1.0 - self._equity / self._peak_equity)

    @property
    def equity(self) -> float:
        return self._equity

    # ── per-strategy ──────────────────────────────────────────────────────

    def strategy_sharpe(self, name: str, annualisation: float = 252.0) -> float:
        if name not in self._strategy_stats:
            return 0.0
        return self._strategy_stats[name].sharpe(annualisation)

    def strategy_report(self) -> dict[str, dict]:
        return {k: v.as_dict() for k, v in self._strategy_stats.items()}

    def summary(self) -> dict:
        return {
            "equity": round(self._equity, 4),
            "win_rate": round(self.win_rate(), 4),
            "sharpe": round(self.sharpe(), 4),
            "profit_factor": round(self.profit_factor(), 4) if self.profit_factor() != float("inf") else None,
            "max_drawdown": round(self.max_drawdown(), 4),
            "current_drawdown": round(self.current_drawdown(), 4),
            "total_trades": len(self._all_pnls),
            "strategies": self.strategy_report(),
        }

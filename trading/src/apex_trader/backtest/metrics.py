from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class PerfSummary:
    roi: float
    cagr: float
    sharpe: float
    sortino: float
    max_drawdown: float
    win_rate: float
    profit_factor: float
    trades: int

    def as_dict(self) -> dict:
        return self.__dict__.copy()


def _periods_per_year(equity: pd.Series) -> float:
    if len(equity) < 2:
        return 252.0
    dt = equity.index.to_series().diff().dropna().median()
    seconds = dt.total_seconds() if dt is not pd.NaT else 86400.0
    if seconds <= 0:
        return 252.0
    return (365.25 * 86400.0) / seconds


def summarize(equity: pd.Series, trade_pnls: list[float]) -> PerfSummary:
    equity = equity.dropna()
    if equity.empty:
        return PerfSummary(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0)

    start, end = float(equity.iloc[0]), float(equity.iloc[-1])
    roi = end / start - 1.0 if start > 0 else 0.0

    ppy = _periods_per_year(equity)
    span_years = max(len(equity) / ppy, 1e-9)
    cagr = (end / start) ** (1.0 / span_years) - 1.0 if start > 0 else 0.0

    rets = equity.pct_change().dropna()
    mu, sigma = rets.mean(), rets.std(ddof=0)
    sharpe = float(np.sqrt(ppy) * mu / sigma) if sigma > 0 else 0.0

    downside = rets.clip(upper=0.0)
    dstd = downside.std(ddof=0)
    sortino = float(np.sqrt(ppy) * mu / dstd) if dstd > 0 else 0.0

    peak = equity.cummax()
    dd = 1.0 - equity / peak
    max_dd = float(dd.max()) if not dd.empty else 0.0

    wins = [p for p in trade_pnls if p > 0]
    losses = [p for p in trade_pnls if p < 0]
    n = len(trade_pnls)
    win_rate = len(wins) / n if n else 0.0
    gross_win = sum(wins)
    gross_loss = -sum(losses)
    profit_factor = (gross_win / gross_loss) if gross_loss > 0 else float("inf") if gross_win > 0 else 0.0

    return PerfSummary(
        roi=float(roi),
        cagr=float(cagr),
        sharpe=sharpe,
        sortino=sortino,
        max_drawdown=max_dd,
        win_rate=float(win_rate),
        profit_factor=float(profit_factor) if profit_factor != float("inf") else float("inf"),
        trades=n,
    )

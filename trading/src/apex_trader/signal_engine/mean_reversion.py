from __future__ import annotations

from dataclasses import dataclass, field

import pandas as pd

from ..indicators.core import atr, bollinger, rsi
from .base import SignalResult


@dataclass
class MeanReversionStrategy:
    """RSI + Bollinger Band mean-reversion strategy (long-only).

    Bullish signal (oversold reversal) when:
      - RSI < rsi_oversold (default 30)         [momentum extreme]
      - Close <= lower Bollinger Band            [price extreme]

    Confidence:
      - 0.5  if only one condition met
      - 1.0  if both conditions met, scaled by degree of overshoot

    Active in *ranging* regimes; emits reduced-confidence in trending.
    """

    name: str = "mean_reversion"
    weight: float = 1.0
    rsi_period: int = 14
    rsi_oversold: float = 30.0
    bb_period: int = 20
    bb_std: float = 2.0
    active_regimes: frozenset[str] = field(
        default_factory=lambda: frozenset({"ranging_high_vol", "ranging_low_vol"})
    )
    min_bars: int = 40

    def generate(self, bars: pd.DataFrame, regime: str) -> SignalResult:
        close = bars["close"]

        if len(close) < self.min_bars:
            return SignalResult("flat", 0.0, None, self.name, "insufficient history")

        rsi_series = rsi(close, self.rsi_period)
        current_rsi = float(rsi_series.iloc[-1])

        lower_bb, mid_bb, _ = bollinger(close, self.bb_period, self.bb_std)
        current_price = float(close.iloc[-1])
        lower = float(lower_bb.iloc[-1])
        mid = float(mid_bb.iloc[-1])

        rsi_extreme = current_rsi < self.rsi_oversold
        bb_touch = current_price <= lower

        if not rsi_extreme and not bb_touch:
            return SignalResult("flat", 0.0, None, self.name, "no oversold condition")

        # Confidence: degree of RSI overshoot + BB penetration
        rsi_score = max(0.0, (self.rsi_oversold - current_rsi) / self.rsi_oversold)
        if lower < mid and current_price < mid:
            bb_score = max(0.0, (lower - current_price) / max(mid - lower, 1e-9))
            bb_score = min(bb_score, 1.0)
        else:
            bb_score = 0.0

        base_score = (rsi_score + bb_score) / 2.0 if (rsi_extreme and bb_touch) else (
            rsi_score if rsi_extreme else bb_score
        )

        # Regime penalty: weaken in trending markets (mean reversion fails in strong trends)
        if regime not in self.active_regimes:
            base_score *= 0.4

        a = atr(bars["high"], bars["low"], close, 14)
        atr_val = float(a.iloc[-1]) if not a.empty else current_price * 0.01
        stop = current_price - atr_val * 1.5
        # Target = reversion to midband
        reward = max(mid - current_price, atr_val)
        risk = max(current_price - stop, 1e-9)
        rr = reward / risk

        rationale = (
            f"rsi={current_rsi:.1f}, price={current_price:.4f}, lower_bb={lower:.4f}, "
            f"rsi_extreme={rsi_extreme}, bb_touch={bb_touch}, regime={regime}"
        )
        return SignalResult("long", min(base_score, 1.0), rr, self.name, rationale)

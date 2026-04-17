from __future__ import annotations

from dataclasses import dataclass, field

import pandas as pd

from ..indicators.core import atr
from .base import SignalResult


@dataclass
class VolatilityBreakoutStrategy:
    """Donchian-channel breakout with ATR expansion confirmation.

    Bullish signal when:
      - Close > max(high) over the last `channel_period` bars  [channel breakout]
      - Current ATR > average ATR over `atr_avg_period`        [volatility expanding]
      - Volume >= volume_threshold × average volume             [participation]

    Confidence is reduced in ranging markets (breakouts fail more often).
    Active in all regimes but requires higher confidence in ranging to proceed.
    """

    name: str = "volatility_breakout"
    weight: float = 1.0
    channel_period: int = 20    # Donchian channel lookback
    atr_period: int = 14
    atr_avg_period: int = 20    # average ATR for expansion check
    volume_threshold: float = 1.5  # current vol must exceed this × avg
    active_regimes: frozenset[str] = field(default_factory=frozenset)  # all regimes
    min_bars: int = 50

    def generate(self, bars: pd.DataFrame, regime: str) -> SignalResult:
        close = bars["close"]
        high = bars["high"]
        volume = bars.get("volume", pd.Series(dtype=float))

        if len(close) < self.min_bars:
            return SignalResult("flat", 0.0, None, self.name, "insufficient history")

        # Donchian breakout: current close > prior N-bar high (exclude last bar)
        prior_high = float(high.iloc[-self.channel_period - 1: -1].max())
        current_close = float(close.iloc[-1])
        breakout = current_close > prior_high

        if not breakout:
            return SignalResult("flat", 0.0, None, self.name, "no channel breakout")

        # ATR expansion
        a = atr(bars["high"], bars["low"], close, self.atr_period)
        if len(a.dropna()) < self.atr_avg_period:
            return SignalResult("flat", 0.0, None, self.name, "insufficient ATR history")

        current_atr = float(a.iloc[-1])
        avg_atr = float(a.iloc[-self.atr_avg_period:].mean())
        atr_expanding = current_atr > avg_atr

        # Volume confirmation (optional)
        vol_ok = True
        if not volume.empty and len(volume) >= self.atr_avg_period:
            avg_vol = float(volume.iloc[-self.atr_avg_period:].mean())
            vol_ok = avg_vol > 0 and float(volume.iloc[-1]) >= avg_vol * self.volume_threshold

        conditions = [atr_expanding, vol_ok]
        partial_score = sum(conditions) / len(conditions)

        # Base confidence: how far above the channel + partial conditions
        overshoot = (current_close - prior_high) / max(prior_high, 1e-9)
        raw_confidence = min(0.6 + overshoot * 10 + partial_score * 0.3, 1.0)

        # Regime penalty: breakouts are noisier in ranging markets
        if "ranging" in regime:
            raw_confidence *= 0.6

        # R:R: stop below prior high channel, target = entry + 2 × ATR
        stop = prior_high - current_atr
        target = current_close + 2.0 * current_atr
        rr = (target - current_close) / max(current_close - stop, 1e-9)

        rationale = (
            f"breakout={breakout}, prior_high={prior_high:.4f}, atr_expanding={atr_expanding}, "
            f"vol_ok={vol_ok}, regime={regime}"
        )
        return SignalResult("long", raw_confidence, rr, self.name, rationale)

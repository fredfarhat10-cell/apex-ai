from __future__ import annotations

from dataclasses import dataclass, field

import pandas as pd

from ..indicators.core import atr, ema
from .base import SignalResult


@dataclass
class MomentumStrategy:
    """EMA-alignment momentum strategy.

    Bullish signal when:
      - EMA(fast) > EMA(mid) > EMA(slow)     [trend alignment]
      - Rate-of-change over `roc_period` > 0  [positive momentum]
      - Current volume >= avg_volume_period avg [participation]

    Confidence = fraction of the three conditions that are met (0.33 / 0.67 / 1.0).
    Most active in *trending* regimes; emits a lower-confidence flat in ranging markets.
    """

    name: str = "momentum"
    weight: float = 1.0
    fast: int = 10
    mid: int = 20
    slow: int = 50
    roc_period: int = 20
    avg_volume_period: int = 20
    # Regimes where a LONG signal carries full weight
    active_regimes: frozenset[str] = field(
        default_factory=lambda: frozenset({"trending_high_vol", "trending_low_vol"})
    )
    min_bars: int = 60

    def generate(self, bars: pd.DataFrame, regime: str) -> SignalResult:
        close = bars["close"]
        volume = bars.get("volume", pd.Series(dtype=float))

        if len(close) < self.min_bars:
            return SignalResult("flat", 0.0, None, self.name, "insufficient history")

        e_fast = ema(close, self.fast)
        e_mid = ema(close, self.mid)
        e_slow = ema(close, self.slow)

        # EMA alignment
        ema_aligned = (
            float(e_fast.iloc[-1]) > float(e_mid.iloc[-1]) > float(e_slow.iloc[-1])
        )

        # Rate of change
        roc = float(close.iloc[-1] / close.iloc[-1 - self.roc_period] - 1.0) if len(close) > self.roc_period else 0.0
        roc_positive = roc > 0.0

        # Volume confirmation (optional — skip if volume not available)
        vol_ok = True
        if not volume.empty and len(volume) >= self.avg_volume_period:
            avg_vol = float(volume.iloc[-self.avg_volume_period:].mean())
            vol_ok = avg_vol > 0 and float(volume.iloc[-1]) >= avg_vol

        conditions = [ema_aligned, roc_positive, vol_ok]
        score = sum(conditions) / len(conditions)

        if not ema_aligned:
            return SignalResult("flat", 0.0, None, self.name, "EMAs not aligned")

        # Regime penalty: in ranging markets halve confidence
        if regime not in self.active_regimes:
            score *= 0.5

        # R:R proxy: reward = distance to EMA(slow), risk = 1 ATR
        a = atr(bars["high"], bars["low"], close, 14)
        atr_val = float(a.iloc[-1]) if not a.empty else float(close.iloc[-1]) * 0.01
        entry = float(close.iloc[-1])
        stop = entry - atr_val * 2.0
        target = entry + atr_val * 4.0  # 2:1 default
        rr = (target - entry) / max(entry - stop, 1e-9)

        rationale = (
            f"ema_aligned={ema_aligned}, roc={roc:.3f}, vol_ok={vol_ok}, regime={regime}"
        )
        return SignalResult("long", min(score, 1.0), rr, self.name, rationale)

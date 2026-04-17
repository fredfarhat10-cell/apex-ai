from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import numpy as np
import pandas as pd

from ..indicators.core import atr, ema


@dataclass
class RegimeState:
    """Current market regime described on two independent axes."""

    trend: Literal["trending", "ranging"]
    volatility: Literal["high_vol", "low_vol"]
    label: str          # e.g. "trending_high_vol"
    trend_strength: float  # 0–1  (1 = very strong trend)
    vol_percentile: float  # 0–1  (1 = most volatile in lookback window)
    atr: float             # raw ATR value for sizing


class RegimeDetector:
    """Classifies the current market into one of four regime labels.

    Trend axis — normalised EMA slope
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Slope = |EMA(close, trend_period) – EMA(close, trend_period).shift(slope_lookback)|
             divided by ATR so it's dimensionless.

    Volatility axis — rolling return std vs its own history
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    vol_percentile = where the most recent 20-bar realised vol sits within
    the prior `vol_history` bars.  Above the `vol_high_pct` quantile → high_vol.
    """

    def __init__(
        self,
        trend_period: int = 20,
        slope_lookback: int = 10,
        vol_period: int = 20,
        vol_history: int = 90,
        trend_threshold: float = 0.5,  # normalised slope above this → trending
        vol_high_pct: float = 0.70,    # rolling vol percentile above this → high_vol
        atr_period: int = 14,
        min_bars: int = 40,
    ) -> None:
        self.trend_period = trend_period
        self.slope_lookback = slope_lookback
        self.vol_period = vol_period
        self.vol_history = vol_history
        self.trend_threshold = trend_threshold
        self.vol_high_pct = vol_high_pct
        self.atr_period = atr_period
        self.min_bars = min_bars

    def detect(self, bars: pd.DataFrame) -> RegimeState:
        """Return regime from the last row of `bars`.

        Falls back to "ranging_low_vol" when there is insufficient history.
        """
        close = bars["close"]
        high = bars["high"]
        low = bars["low"]

        if len(close) < self.min_bars:
            return RegimeState("ranging", "low_vol", "ranging_low_vol", 0.0, 0.0, 0.0)

        # ── Trend strength ────────────────────────────────────────────────
        e = ema(close, self.trend_period)
        a = atr(high, low, close, self.atr_period)
        current_atr = float(a.dropna().iloc[-1]) if not a.dropna().empty else float(close.iloc[-1]) * 0.01

        lookback = min(self.slope_lookback, len(e.dropna()) - 1)
        if lookback > 0:
            slope = abs(float(e.iloc[-1]) - float(e.iloc[-1 - lookback]))
            norm_slope = slope / max(current_atr * lookback, 1e-9)
        else:
            norm_slope = 0.0

        trend_strength = min(norm_slope / (self.trend_threshold * 2), 1.0)
        trend: Literal["trending", "ranging"] = "trending" if norm_slope > self.trend_threshold else "ranging"

        # ── Volatility percentile ─────────────────────────────────────────
        log_rets = np.log(close / close.shift(1)).dropna()
        if len(log_rets) < self.vol_period + 5:
            vol_pct = 0.5
        else:
            rolling_vol = log_rets.rolling(self.vol_period).std().dropna()
            current_vol = float(rolling_vol.iloc[-1])
            history_window = rolling_vol.iloc[-self.vol_history:] if len(rolling_vol) >= self.vol_history else rolling_vol
            vol_pct = float((history_window <= current_vol).mean())

        volatility: Literal["high_vol", "low_vol"] = "high_vol" if vol_pct >= self.vol_high_pct else "low_vol"
        label = f"{trend}_{volatility}"

        return RegimeState(
            trend=trend,
            volatility=volatility,
            label=label,
            trend_strength=round(trend_strength, 4),
            vol_percentile=round(vol_pct, 4),
            atr=current_atr,
        )

from __future__ import annotations

import numpy as np
import pandas as pd

from apex_trader.regime.detector import RegimeDetector, RegimeState


def _make_bars(prices, seed: int = 0) -> pd.DataFrame:
    prices = np.array(prices, dtype=float)
    rng = np.random.default_rng(seed)
    n = len(prices)
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    return pd.DataFrame(
        {
            "open": prices,
            "high": prices * (1 + rng.uniform(0, 0.005, n)),
            "low": prices * (1 - rng.uniform(0, 0.005, n)),
            "close": prices,
            "volume": 1.0,
        },
        index=idx,
    )


def _trending_bars(n: int = 120) -> pd.DataFrame:
    """Strong, consistent uptrend."""
    return _make_bars(np.linspace(100.0, 150.0, n))


def _ranging_bars(n: int = 120, seed: int = 5) -> pd.DataFrame:
    """Sideways choppy bars."""
    rng = np.random.default_rng(seed)
    prices = 100.0 + rng.normal(0, 1.5, n)
    return _make_bars(prices)


def _volatile_bars(n: int = 120, seed: int = 6) -> pd.DataFrame:
    """High volatility — large daily swings."""
    rng = np.random.default_rng(seed)
    prices = 100.0 + rng.normal(0, 8.0, n)
    return _make_bars(prices)


# ── basic API ─────────────────────────────────────────────────────────────────

def test_regime_state_has_expected_fields():
    detector = RegimeDetector()
    bars = _trending_bars()
    state = detector.detect(bars)
    assert isinstance(state, RegimeState)
    assert state.trend in ("trending", "ranging")
    assert state.volatility in ("high_vol", "low_vol")
    assert state.label == f"{state.trend}_{state.volatility}"
    assert 0.0 <= state.trend_strength <= 1.0
    assert 0.0 <= state.vol_percentile <= 1.0
    assert state.atr > 0


def test_detects_trending_market():
    detector = RegimeDetector(trend_threshold=0.3)
    bars = _trending_bars(150)
    state = detector.detect(bars)
    assert state.trend == "trending"


def test_detects_ranging_market():
    detector = RegimeDetector()
    bars = _ranging_bars(150)
    state = detector.detect(bars)
    assert state.trend == "ranging"


def test_detects_high_volatility():
    # Build bars where the final 20-bar window is 10× more volatile than history.
    rng = np.random.default_rng(9)
    n = 120
    quiet = rng.normal(0, 0.5, n - 20)      # low vol history
    noisy = rng.normal(0, 8.0, 20)           # spike at the end
    prices = 100.0 + np.concatenate([quiet, noisy])
    bars = _make_bars(prices)
    detector = RegimeDetector(vol_high_pct=0.70, vol_period=10)
    state = detector.detect(bars)
    assert state.volatility == "high_vol"


def test_fallback_on_short_history():
    detector = RegimeDetector(min_bars=80)
    short = _trending_bars(20)
    state = detector.detect(short)
    assert state.label == "ranging_low_vol"
    assert state.trend_strength == 0.0


def test_label_matches_trend_volatility():
    detector = RegimeDetector()
    for bars_fn in (_trending_bars, _ranging_bars, _volatile_bars):
        bars = bars_fn(120)
        state = detector.detect(bars)
        assert state.label == f"{state.trend}_{state.volatility}"

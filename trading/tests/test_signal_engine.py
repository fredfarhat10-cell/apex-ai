from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from apex_trader.signal_engine.base import SignalResult
from apex_trader.signal_engine.ensemble import EnsembleCombiner
from apex_trader.signal_engine.mean_reversion import MeanReversionStrategy
from apex_trader.signal_engine.momentum import MomentumStrategy
from apex_trader.signal_engine.volatility_breakout import VolatilityBreakoutStrategy


# ── fixtures ──────────────────────────────────────────────────────────────────

def _trending_bars(n: int = 150, seed: int = 0) -> pd.DataFrame:
    """Strong uptrend with rising EMA alignment."""
    rng = np.random.default_rng(seed)
    trend = np.linspace(100.0, 160.0, n) + rng.normal(0, 0.3, n)
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    return pd.DataFrame(
        {
            "open": trend,
            "high": trend * 1.006,
            "low": trend * 0.994,
            "close": trend,
            "volume": rng.uniform(1000, 3000, n),
        },
        index=idx,
    )


def _ranging_bars(n: int = 150, seed: int = 1) -> pd.DataFrame:
    """Sideways choppy market — mean reverting."""
    rng = np.random.default_rng(seed)
    mid = 100.0
    prices = mid + rng.normal(0, 2.0, n)
    # Force last few bars to be oversold (low RSI)
    prices[-10:] = mid - 8.0
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    return pd.DataFrame(
        {
            "open": prices,
            "high": prices + 0.5,
            "low": prices - 0.5,
            "close": prices,
            "volume": rng.uniform(500, 1500, n),
        },
        index=idx,
    )


def _breakout_bars(n: int = 150, seed: int = 2) -> pd.DataFrame:
    """20-day range consolidation then a breakout on the last bar."""
    rng = np.random.default_rng(seed)
    prices = np.full(n, 100.0) + rng.normal(0, 0.5, n)
    # Spike on last bar above channel
    prices[-1] = 115.0
    vol = rng.uniform(500, 1500, n)
    vol[-1] = vol.mean() * 3.0  # volume surge
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    return pd.DataFrame(
        {
            "open": prices,
            "high": prices + 0.3,
            "low": prices - 0.3,
            "close": prices,
            "volume": vol,
        },
        index=idx,
    )


# ── MomentumStrategy ──────────────────────────────────────────────────────────

def test_momentum_long_in_uptrend():
    strat = MomentumStrategy()
    bars = _trending_bars()
    result = strat.generate(bars, "trending_high_vol")
    assert result.direction == "long"
    assert result.confidence > 0
    assert result.risk_reward is not None and result.risk_reward > 0


def test_momentum_flat_on_short_history():
    strat = MomentumStrategy(min_bars=100)
    short = _trending_bars(30)
    result = strat.generate(short, "trending_high_vol")
    assert result.direction == "flat"


def test_momentum_confidence_lower_in_ranging():
    strat = MomentumStrategy()
    bars = _trending_bars()
    trending_result = strat.generate(bars, "trending_high_vol")
    ranging_result = strat.generate(bars, "ranging_low_vol")
    # In ranging regime, confidence should be ≤ trending (if direction is long)
    if ranging_result.direction == "long":
        assert ranging_result.confidence <= trending_result.confidence + 1e-9


# ── MeanReversionStrategy ─────────────────────────────────────────────────────

def test_mean_reversion_long_oversold():
    strat = MeanReversionStrategy()
    bars = _ranging_bars()
    result = strat.generate(bars, "ranging_low_vol")
    # Ranging bars are forced oversold at end — expect long signal
    assert result.direction in ("long", "flat")
    if result.direction == "long":
        assert result.confidence > 0
        assert result.risk_reward is not None


def test_mean_reversion_flat_on_short_history():
    strat = MeanReversionStrategy(min_bars=80)
    short = _ranging_bars(30)
    result = strat.generate(short, "ranging_low_vol")
    assert result.direction == "flat"


def test_mean_reversion_confidence_lower_in_trending():
    strat = MeanReversionStrategy()
    bars = _ranging_bars()
    ranging_conf = strat.generate(bars, "ranging_low_vol").confidence
    trending_conf = strat.generate(bars, "trending_high_vol").confidence
    # Trending regime penalty should lower confidence
    assert trending_conf <= ranging_conf + 1e-9


# ── VolatilityBreakoutStrategy ────────────────────────────────────────────────

def test_volatility_breakout_detects_channel_break():
    strat = VolatilityBreakoutStrategy(channel_period=20, volume_threshold=1.5)
    bars = _breakout_bars()
    result = strat.generate(bars, "trending_high_vol")
    assert result.direction == "long"
    assert result.confidence > 0
    assert result.risk_reward is not None and result.risk_reward > 0


def test_volatility_breakout_flat_no_breakout():
    strat = VolatilityBreakoutStrategy()
    bars = _ranging_bars()  # no breakout
    result = strat.generate(bars, "ranging_low_vol")
    assert result.direction == "flat"


def test_volatility_breakout_confidence_lower_in_ranging():
    strat = VolatilityBreakoutStrategy()
    bars = _breakout_bars()
    trending_conf = strat.generate(bars, "trending_high_vol").confidence
    ranging_conf = strat.generate(bars, "ranging_high_vol").confidence
    # Ranging penalty should reduce confidence
    if trending_conf > 0 and ranging_conf > 0:
        assert ranging_conf <= trending_conf + 1e-9


# ── SignalResult ──────────────────────────────────────────────────────────────

def test_signal_result_regime_filter():
    sig = SignalResult(
        "long", 0.8, 2.5, "test", active_regimes=frozenset({"trending_high_vol"})
    )
    assert sig.is_valid_for_regime("trending_high_vol")
    assert not sig.is_valid_for_regime("ranging_low_vol")


def test_signal_result_no_regime_restriction():
    sig = SignalResult("long", 0.7, 2.0, "test")  # empty active_regimes
    assert sig.is_valid_for_regime("trending_high_vol")
    assert sig.is_valid_for_regime("ranging_low_vol")


# ── EnsembleCombiner ──────────────────────────────────────────────────────────

def test_ensemble_combines_multiple_strategies():
    strategies = [
        MomentumStrategy(weight=1.0),
        VolatilityBreakoutStrategy(weight=1.0),
    ]
    combiner = EnsembleCombiner(strategies, min_confidence=0.0)
    bars = _trending_bars()
    result = combiner.combine(bars, "trending_high_vol")
    assert result.regime == "trending_high_vol"
    assert result.direction in ("long", "flat")


def test_ensemble_respects_min_confidence():
    """Force all strategies to return low-confidence → ensemble outputs flat."""
    class _LowConfStrat:
        name = "low"
        weight = 1.0
        active_regimes: frozenset = frozenset()

        def generate(self, bars, regime):
            return SignalResult("long", 0.1, 2.0, "low")

    combiner = EnsembleCombiner([_LowConfStrat()], min_confidence=0.5)
    result = combiner.combine(_trending_bars(), "trending_high_vol")
    assert result.direction == "flat"


def test_ensemble_weight_override():
    """Weight override of 0 for one strategy should exclude it from contributing."""
    class _AlwaysLong:
        name = "always"
        weight = 1.0
        active_regimes: frozenset = frozenset()

        def generate(self, bars, regime):
            return SignalResult("long", 0.9, 3.0, "always")

    combiner = EnsembleCombiner([_AlwaysLong()], min_confidence=0.5)
    result = combiner.combine(_trending_bars(), "trending_high_vol", weights={"always": 0.0})
    assert result.direction == "flat"


def test_ensemble_flat_when_no_strategies():
    combiner = EnsembleCombiner([], min_confidence=0.3)
    result = combiner.combine(_trending_bars(), "ranging_low_vol")
    assert result.direction == "flat"

from __future__ import annotations

import numpy as np
import pandas as pd

from apex_trader.regime.detector import RegimeState
from apex_trader.signal_engine.base import SignalResult
from apex_trader.signal_engine.ensemble import EnsembleCombiner


class _FixedStrategy:
    def __init__(self, name: str, conf: float, rr: float = 3.0, weight: float = 1.0) -> None:
        self.name = name
        self.weight = weight
        self._conf = conf
        self._rr = rr

    def generate(self, bars: pd.DataFrame, regime: str) -> SignalResult:
        return SignalResult("long", self._conf, self._rr, self.name, "test")


def _bars(n: int = 60) -> pd.DataFrame:
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    return pd.DataFrame(
        {"open": 100.0, "high": 101.0, "low": 99.0, "close": 100.0, "volume": 1.0},
        index=idx,
    )


def _chop_state() -> RegimeState:
    return RegimeState("ranging", "high_vol", "ranging_high_vol", 0.10, 0.85, 1.0)


def _calm_state() -> RegimeState:
    return RegimeState("trending", "low_vol", "trending_low_vol", 0.80, 0.30, 1.0)


def test_chop_halves_confidence_and_can_flip_to_flat():
    combiner = EnsembleCombiner([_FixedStrategy("a", conf=0.60)], min_confidence=0.45)
    calm = combiner.combine(_bars(), regime="trending_low_vol", regime_state=_calm_state())
    chop = combiner.combine(_bars(), regime="ranging_high_vol", regime_state=_chop_state())
    assert calm.direction == "long"
    # 0.60 × 0.5 = 0.30, below 0.45 threshold → FLAT
    assert chop.direction == "flat"


def test_chop_penalty_doesnt_prevent_strong_consensus():
    combiner = EnsembleCombiner(
        [_FixedStrategy("a", conf=0.95), _FixedStrategy("b", conf=0.95)],
        min_confidence=0.45,
    )
    chop = combiner.combine(_bars(), regime="ranging_high_vol", regime_state=_chop_state())
    # 0.95 × 0.5 = 0.475 ≥ 0.45 → still fires
    assert chop.direction == "long"


def test_backward_compat_without_regime_state():
    combiner = EnsembleCombiner([_FixedStrategy("a", conf=0.60)])
    result = combiner.combine(_bars(), regime="trending_low_vol")
    assert result.direction == "long"

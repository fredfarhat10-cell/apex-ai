from __future__ import annotations

import random
from dataclasses import dataclass
from datetime import datetime, timezone

import numpy as np
import pytest

from apex_trader.meta.learner import MetaLearner
from apex_trader.meta.mutation import mutate_strategy
from apex_trader.performance.monitor import PerformanceMonitor, TradeRecord


def _ts(day: int = 1) -> datetime:
    return datetime(2024, 1, day, tzinfo=timezone.utc)


def _losing(n: int = 20) -> list[float]:
    rng = np.random.default_rng(11)
    return (-50.0 + rng.normal(0, 5.0, n)).tolist()


def _winning(n: int = 20) -> list[float]:
    rng = np.random.default_rng(12)
    return (50.0 + rng.normal(0, 5.0, n)).tolist()


def _populate(monitor: PerformanceMonitor, strategy: str, pnls: list[float]) -> None:
    for i, pnl in enumerate(pnls):
        monitor.record_close(
            TradeRecord(pnl=pnl, strategy=strategy, entry=100.0, exit=100.0 + pnl, ts=_ts(i + 1))
        )


# ── Suppression ─────────────────────────────────────────────────────────────

def test_strategy_suppressed_after_strikes():
    ml = MetaLearner(
        ["loser", "winner"],
        rebalance_period_days=0,
        suppression_strikes=2,
    )
    monitor = PerformanceMonitor()
    _populate(monitor, "loser", _losing(20))
    _populate(monitor, "winner", _winning(20))
    ml.update_weights(monitor)
    ml.update_weights(monitor)
    assert "loser" in ml.suppressed()
    weights = ml.get_weights()
    # Suppressed strategies get zero weight after normalisation
    assert weights["loser"] == pytest.approx(0.0, abs=1e-9)
    assert weights["winner"] > 0.9


def test_strikes_reset_when_strategy_recovers():
    ml = MetaLearner(["s"], rebalance_period_days=0, suppression_strikes=3)
    monitor = PerformanceMonitor()
    _populate(monitor, "s", _losing(10))
    ml.update_weights(monitor)

    # Replace history with winners
    monitor2 = PerformanceMonitor()
    _populate(monitor2, "s", _winning(20))
    ml.update_weights(monitor2)
    assert "s" not in ml.suppressed()


def test_reinstate_clears_suppression():
    ml = MetaLearner(["z"], rebalance_period_days=0, suppression_strikes=1)
    monitor = PerformanceMonitor()
    _populate(monitor, "z", _losing(15))
    ml.update_weights(monitor)
    assert "z" in ml.suppressed()
    ml.reinstate("z")
    assert "z" not in ml.suppressed()


# ── Mutation ────────────────────────────────────────────────────────────────

@dataclass
class _FakeStrategy:
    name: str = "momentum"
    weight: float = 1.0
    fast_period: int = 10
    slow_period: int = 30
    threshold: float = 0.5


def test_mutate_perturbs_fields_within_bounds():
    rng = random.Random(42)
    original = _FakeStrategy()
    mutant = mutate_strategy(
        original,
        {"fast_period": (-0.2, 0.2), "threshold": (-0.1, 0.1)},
        rng=rng,
    )
    # Integer field stayed an int and within ±20%
    assert isinstance(mutant.fast_period, int)
    assert 8 <= mutant.fast_period <= 12
    # Float field changed
    assert 0.45 <= mutant.threshold <= 0.55
    # Untouched field unchanged
    assert mutant.slow_period == original.slow_period
    # Name got suffix
    assert mutant.name == "momentum_mut"
    # Parent not mutated
    assert original.fast_period == 10


def test_mutate_rejects_unknown_field():
    with pytest.raises(KeyError):
        mutate_strategy(_FakeStrategy(), {"does_not_exist": (-0.1, 0.1)})


def test_mutate_rejects_non_dataclass():
    with pytest.raises(TypeError):
        mutate_strategy(object(), {})

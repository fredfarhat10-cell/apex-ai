from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pytest

from apex_trader.meta.learner import MetaLearner
from apex_trader.performance.monitor import PerformanceMonitor, TradeRecord


def _ts(day: int = 1) -> datetime:
    return datetime(2024, 1, day, tzinfo=timezone.utc)


def _populate(monitor: PerformanceMonitor, strategy: str, pnls: list[float]) -> None:
    for i, pnl in enumerate(pnls):
        monitor.record_close(
            TradeRecord(pnl=pnl, strategy=strategy, entry=100.0, exit=100.0 + pnl, ts=_ts(i + 1))
        )


def _winning_pnls(n: int = 20) -> list[float]:
    """Variable positive P&Ls so Sharpe > 0."""
    rng = __import__("numpy").random.default_rng(42)
    return (50.0 + rng.normal(0, 10.0, n)).tolist()


def _losing_pnls(n: int = 20) -> list[float]:
    """Variable negative P&Ls so Sharpe < 0."""
    rng = __import__("numpy").random.default_rng(99)
    return (-50.0 + rng.normal(0, 10.0, n)).tolist()


# ── initialisation ────────────────────────────────────────────────────────────

def test_equal_weights_by_default():
    ml = MetaLearner(["A", "B", "C"])
    w = ml.get_weights()
    assert len(w) == 3
    for v in w.values():
        assert v == pytest.approx(1 / 3, abs=1e-9)


def test_custom_initial_weights_normalised():
    ml = MetaLearner(["A", "B"], initial_weights={"A": 3.0, "B": 1.0})
    w = ml.get_weights()
    assert w["A"] == pytest.approx(0.75, abs=1e-9)
    assert w["B"] == pytest.approx(0.25, abs=1e-9)


# ── weight update ─────────────────────────────────────────────────────────────

def test_weights_increase_for_high_sharpe_strategy():
    ml = MetaLearner(["strong", "weak"], rebalance_period_days=0)
    monitor = PerformanceMonitor()

    _populate(monitor, "strong", _winning_pnls(25))
    _populate(monitor, "weak", _losing_pnls(25))

    weights = ml.update_weights(monitor)
    assert weights["strong"] > weights["weak"]


def test_min_weight_floor_applied():
    ml = MetaLearner(["A", "B"], min_weight=0.10, rebalance_period_days=0)
    monitor = PerformanceMonitor()
    # A: all wins; B: all losses
    _populate(monitor, "A", [100.0] * 30)
    _populate(monitor, "B", [-100.0] * 30)
    weights = ml.update_weights(monitor)
    assert weights["B"] >= 0.10 - 1e-9


def test_weights_sum_to_one():
    ml = MetaLearner(["X", "Y", "Z"], rebalance_period_days=0)
    monitor = PerformanceMonitor()
    _populate(monitor, "X", [10.0] * 10)
    _populate(monitor, "Y", [5.0] * 10)
    _populate(monitor, "Z", [-5.0] * 10)
    weights = ml.update_weights(monitor)
    assert sum(weights.values()) == pytest.approx(1.0, abs=1e-9)


def test_no_rebalance_before_period_elapses():
    ml = MetaLearner(["A", "B"], rebalance_period_days=7)
    monitor = PerformanceMonitor()
    _populate(monitor, "A", [100.0] * 5)
    _populate(monitor, "B", [-20.0] * 5)

    now = _ts(1)
    weights_before = ml.update_weights(monitor, as_of=now)
    # A few seconds later — well within 7 days
    same_day = _ts(1)
    weights_after = ml.update_weights(monitor, as_of=same_day)
    assert weights_before == weights_after  # no change


def test_force_update_ignores_period():
    ml = MetaLearner(["A", "B"], rebalance_period_days=30)
    monitor = PerformanceMonitor()
    _populate(monitor, "A", _winning_pnls(20))
    _populate(monitor, "B", _losing_pnls(20))
    # Force rebalance even though period hasn't elapsed
    weights = ml.force_update(monitor)
    assert weights["A"] > weights["B"]


def test_equal_weights_when_all_strategies_underwater():
    ml = MetaLearner(["A", "B"], rebalance_period_days=0)
    monitor = PerformanceMonitor()
    _populate(monitor, "A", [-10.0] * 10)
    _populate(monitor, "B", [-5.0] * 10)
    weights = ml.update_weights(monitor)
    # All Sharpes negative → fall back to equal
    assert weights["A"] == pytest.approx(0.5, abs=0.01)
    assert weights["B"] == pytest.approx(0.5, abs=0.01)


# ── persistence ───────────────────────────────────────────────────────────────

def test_weights_saved_and_loaded(tmp_path: Path):
    path = tmp_path / "weights.json"
    ml = MetaLearner(["A", "B"], rebalance_period_days=0, weights_path=path)
    monitor = PerformanceMonitor()
    _populate(monitor, "A", [80.0] * 15)
    _populate(monitor, "B", [-10.0] * 15)
    saved = ml.update_weights(monitor)

    # New instance should load saved weights
    ml2 = MetaLearner(["A", "B"], weights_path=path)
    loaded = ml2.get_weights()
    for k in saved:
        assert loaded[k] == pytest.approx(saved[k], abs=1e-6)


def test_corrupted_weights_file_falls_back_to_equal(tmp_path: Path):
    path = tmp_path / "bad.json"
    path.write_text("NOT VALID JSON")
    ml = MetaLearner(["X", "Y"], weights_path=path)
    w = ml.get_weights()
    assert w["X"] == pytest.approx(0.5, abs=1e-9)

from __future__ import annotations

from datetime import datetime, timezone

import pytest

from apex_trader.performance.monitor import PerformanceMonitor, TradeRecord


def _ts(i: int = 0) -> datetime:
    return datetime(2024, 1, 1 + i, tzinfo=timezone.utc)


def _trade(pnl: float, strategy: str = "momentum", i: int = 0) -> TradeRecord:
    return TradeRecord(pnl=pnl, strategy=strategy, entry=100.0, exit=100.0 + pnl, ts=_ts(i))


# ── basic recording ───────────────────────────────────────────────────────────

def test_equity_starts_at_starting_value():
    m = PerformanceMonitor(starting_equity=10_000.0)
    assert m.equity == 10_000.0


def test_equity_updates_on_close():
    m = PerformanceMonitor(10_000.0)
    m.record_close(_trade(200.0))
    assert m.equity == 10_200.0
    m.record_close(_trade(-50.0))
    assert m.equity == pytest.approx(10_150.0)


def test_win_rate():
    m = PerformanceMonitor()
    for pnl in [100, 50, -30, 80, -20]:
        m.record_close(_trade(pnl))
    # 3 wins out of 5
    assert m.win_rate() == pytest.approx(3 / 5)


def test_profit_factor():
    m = PerformanceMonitor()
    for pnl in [100, 50, -30, -20]:
        m.record_close(_trade(pnl))
    pf = m.profit_factor()
    assert pf == pytest.approx(150 / 50)


def test_profit_factor_no_losses():
    m = PerformanceMonitor()
    m.record_close(_trade(100.0))
    assert m.profit_factor() == float("inf")


def test_profit_factor_zero_without_trades():
    m = PerformanceMonitor()
    assert m.profit_factor() == 0.0


# ── drawdown ──────────────────────────────────────────────────────────────────

def test_max_drawdown_zero_on_all_wins():
    m = PerformanceMonitor(10_000.0)
    for pnl in [100, 200, 150]:
        m.record_close(_trade(pnl))
    assert m.max_drawdown() == pytest.approx(0.0)


def test_max_drawdown_computed_correctly():
    m = PerformanceMonitor(10_000.0)
    m.record_close(_trade(1_000.0))   # peak 11_000
    m.record_close(_trade(-1_100.0))  # drop to 9_900 → DD ≈ 10%
    dd = m.max_drawdown()
    assert dd == pytest.approx(1_100.0 / 11_000.0, abs=1e-6)


def test_current_drawdown():
    m = PerformanceMonitor(10_000.0)
    m.record_close(_trade(1_000.0))   # peak 11_000
    m.record_close(_trade(-500.0))    # equity 10_500
    current = m.current_drawdown()
    assert current == pytest.approx(500.0 / 11_000.0, abs=1e-6)


# ── per-strategy ──────────────────────────────────────────────────────────────

def test_per_strategy_win_rate():
    m = PerformanceMonitor()
    m.record_close(_trade(100, "momentum"))
    m.record_close(_trade(-50, "momentum"))
    m.record_close(_trade(200, "mean_reversion"))
    assert m._strategy_stats["momentum"].win_rate == pytest.approx(0.5)
    assert m._strategy_stats["mean_reversion"].win_rate == pytest.approx(1.0)


def test_strategy_sharpe_requires_variance():
    m = PerformanceMonitor()
    # All same P&L → zero std → Sharpe=0
    for _ in range(5):
        m.record_close(_trade(100, "flat_strategy"))
    assert m.strategy_sharpe("flat_strategy") == 0.0


def test_strategy_sharpe_positive_for_consistent_wins():
    m = PerformanceMonitor()
    for i in range(20):
        m.record_close(_trade(50.0 + i, "trend", i))
    sh = m.strategy_sharpe("trend")
    assert sh > 0.0


def test_strategy_report_contains_all_strategies():
    m = PerformanceMonitor()
    m.record_close(_trade(100, "A"))
    m.record_close(_trade(-20, "B"))
    report = m.strategy_report()
    assert "A" in report and "B" in report


def test_summary_dict_keys():
    m = PerformanceMonitor(10_000.0)
    m.record_close(_trade(100.0, "x"))
    s = m.summary()
    for key in ("equity", "win_rate", "sharpe", "profit_factor", "max_drawdown", "total_trades"):
        assert key in s

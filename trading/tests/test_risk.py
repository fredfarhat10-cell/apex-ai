from datetime import datetime, timezone

from apex_trader.models import Order, OrderType, Portfolio, Side
from apex_trader.risk.manager import RiskConfig, RiskManager


def _ts(day: int = 1):
    return datetime(2024, 1, day, tzinfo=timezone.utc)


def test_position_cap_trims_quantity():
    cfg = RiskConfig(max_position_pct=0.10, max_gross_exposure_pct=1.0)
    rm = RiskManager(cfg, starting_equity=10_000.0)
    rm.on_bar(_ts(), 10_000.0)
    pf = Portfolio(cash=10_000.0)
    order = Order("BTCUSDT", Side.BUY, 0.5, OrderType.MARKET)
    decision = rm.evaluate(order, pf, equity=10_000.0, ref_price=50_000.0)
    # 10% of 10k = 1000 / 50000 = 0.02 max qty
    assert decision.accepted
    assert decision.order.quantity == 0.02


def test_stop_loss_defaulted_if_missing():
    rm = RiskManager(RiskConfig(stop_loss_pct=0.03), starting_equity=10_000.0)
    rm.on_bar(_ts(), 10_000.0)
    pf = Portfolio(cash=10_000.0)
    order = Order("BTCUSDT", Side.BUY, 0.01, OrderType.MARKET)
    decision = rm.evaluate(order, pf, equity=10_000.0, ref_price=50_000.0)
    assert decision.accepted
    assert decision.order.stop_loss == 50_000.0 * 0.97


def test_daily_drawdown_halts_trading():
    cfg = RiskConfig(max_daily_drawdown_pct=0.05)
    rm = RiskManager(cfg, starting_equity=10_000.0)
    rm.on_bar(_ts(), 10_000.0)
    # Equity drops 6% same day -> breach
    rm.on_bar(_ts(), 9_400.0)
    pf = Portfolio(cash=9_400.0)
    order = Order("BTCUSDT", Side.BUY, 0.001, OrderType.MARKET)
    d = rm.evaluate(order, pf, equity=9_400.0, ref_price=50_000.0)
    assert not d.accepted


def test_total_drawdown_kill_switch():
    cfg = RiskConfig(max_total_drawdown_pct=0.20)
    rm = RiskManager(cfg, starting_equity=10_000.0)
    rm.on_bar(_ts(1), 10_000.0)
    rm.on_bar(_ts(2), 12_000.0)       # new peak
    rm.on_bar(_ts(3), 9_500.0)        # dd from peak = 20.8%
    assert rm.halted()
    pf = Portfolio(cash=9_500.0)
    d = rm.evaluate(Order("BTCUSDT", Side.BUY, 0.001), pf, 9_500.0, 50_000.0)
    assert not d.accepted


def test_size_long_respects_risk_budget():
    cfg = RiskConfig(risk_per_trade_pct=0.01, stop_loss_pct=0.03, max_position_pct=1.0)
    rm = RiskManager(cfg, starting_equity=10_000.0)
    qty = rm.size_long(equity=10_000.0, price=100.0, stop_price=None)
    # risk budget = 100; per-unit risk = 3; qty = 33.33...
    assert abs(qty - 100.0 / 3.0) < 1e-6

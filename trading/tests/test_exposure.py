from datetime import datetime, timezone

from apex_trader.models import Order, OrderType, Portfolio, Position, Side
from apex_trader.risk.exposure import ExposureEngine, ExposureGroup
from apex_trader.risk.manager import RiskConfig, RiskManager


def _ts():
    return datetime(2024, 1, 1, tzinfo=timezone.utc)


def test_group_cap_blocks_correlated_basket():
    pf = Portfolio(cash=100_000.0, positions={
        "BTCUSDT": Position(symbol="BTCUSDT", quantity=0.5, avg_price=50_000.0),
        "ETHUSDT": Position(symbol="ETHUSDT", quantity=10.0, avg_price=2_500.0),
    })
    equity = 100_000.0
    group = ExposureGroup(name="crypto", symbols=frozenset({"BTCUSDT", "ETHUSDT", "SOLUSDT"}), max_exposure_pct=0.5)
    engine = ExposureEngine(groups=[group])
    prices = {"BTCUSDT": 50_000.0, "ETHUSDT": 2_500.0, "SOLUSDT": 100.0}
    # Existing: 25k + 25k = 50k = cap exactly.  Any addition must be rejected.
    ok, reason, headroom = engine.check_order("SOLUSDT", 5_000.0, pf, prices, equity)
    assert not ok
    assert "crypto" in reason
    assert headroom == 0.0


def test_group_cap_allows_partial_up_to_headroom():
    pf = Portfolio(cash=100_000.0, positions={
        "BTCUSDT": Position(symbol="BTCUSDT", quantity=0.4, avg_price=50_000.0),
    })
    equity = 100_000.0
    group = ExposureGroup(name="crypto", symbols=frozenset({"BTCUSDT", "ETHUSDT"}), max_exposure_pct=0.30)
    engine = ExposureEngine(groups=[group])
    prices = {"BTCUSDT": 50_000.0, "ETHUSDT": 2_500.0}
    ok, _, headroom = engine.check_order("ETHUSDT", 20_000.0, pf, prices, equity)
    # current = 20k; cap = 30k → 10k headroom
    assert not ok
    assert headroom == 10_000.0


def test_risk_manager_scales_order_to_group_headroom():
    cfg = RiskConfig(
        max_position_pct=1.0,
        max_gross_exposure_pct=10.0,
        exposure_groups=[ExposureGroup(
            name="crypto", symbols=frozenset({"BTCUSDT", "ETHUSDT"}), max_exposure_pct=0.30
        )],
    )
    rm = RiskManager(cfg, starting_equity=100_000.0)
    rm.on_bar(_ts(), 100_000.0)
    rm.update_prices({"BTCUSDT": 50_000.0, "ETHUSDT": 2_500.0})
    pf = Portfolio(cash=100_000.0, positions={
        "BTCUSDT": Position(symbol="BTCUSDT", quantity=0.4, avg_price=50_000.0),  # 20k
    })
    order = Order("ETHUSDT", Side.BUY, 8.0, OrderType.MARKET)  # 8 × 2_500 = 20k — over headroom
    decision = rm.evaluate(order, pf, equity=100_000.0, ref_price=2_500.0)
    assert decision.accepted
    assert decision.order is not None
    # Scaled to 10k headroom → 4.0 units
    assert decision.order.quantity < 8.0
    assert decision.order.quantity * 2_500.0 <= 10_000.0 + 1e-6


def test_cooldown_blocks_re_entry_after_stop():
    cfg = RiskConfig(post_stop_cooldown_bars=5, max_position_pct=1.0)
    rm = RiskManager(cfg, starting_equity=10_000.0)
    rm.on_bar(_ts(), 10_000.0)
    rm.register_stop_out("BTCUSDT")
    pf = Portfolio(cash=10_000.0)
    order = Order("BTCUSDT", Side.BUY, 0.1, OrderType.MARKET)
    decision = rm.evaluate(order, pf, equity=10_000.0, ref_price=50_000.0)
    assert not decision.accepted
    assert "cooldown" in decision.reason


def test_cooldown_lifts_after_enough_bars():
    cfg = RiskConfig(post_stop_cooldown_bars=3, max_position_pct=1.0)
    rm = RiskManager(cfg, starting_equity=10_000.0)
    rm.on_bar(_ts(), 10_000.0)
    rm.register_stop_out("BTCUSDT")
    for _ in range(4):
        rm.on_bar(_ts(), 10_000.0)
    pf = Portfolio(cash=10_000.0)
    order = Order("BTCUSDT", Side.BUY, 0.01, OrderType.MARKET)
    decision = rm.evaluate(order, pf, equity=10_000.0, ref_price=50_000.0)
    assert decision.accepted


def test_min_hold_blocks_voluntary_exit():
    cfg = RiskConfig(min_hold_bars=5, max_position_pct=1.0)
    rm = RiskManager(cfg, starting_equity=10_000.0)
    rm.on_bar(_ts(), 10_000.0)
    rm.register_entry("BTCUSDT")
    rm.on_bar(_ts(), 10_000.0)
    pf = Portfolio(cash=5_000.0, positions={
        "BTCUSDT": Position(symbol="BTCUSDT", quantity=0.1, avg_price=50_000.0),
    })
    order = Order("BTCUSDT", Side.SELL, 0.1, OrderType.MARKET)
    decision = rm.evaluate(order, pf, equity=10_000.0, ref_price=50_000.0)
    assert not decision.accepted
    assert "min-hold" in decision.reason

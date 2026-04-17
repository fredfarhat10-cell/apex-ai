from datetime import datetime, timezone

from apex_trader.broker.paper import BrokerConfig, PaperBroker
from apex_trader.models import Order, OrderType, Portfolio, Side


def _ts():
    return datetime(2024, 1, 1, tzinfo=timezone.utc)


def test_volatility_slippage_adds_bps_on_wide_bar():
    pf = Portfolio(cash=1_000_000.0)
    cfg = BrokerConfig(fee_bps=0.0, slippage_bps=0.0, volatility_slippage_coeff=1.0)
    broker = PaperBroker(pf, cfg)
    # Bar range = 2% → extra 200 bps slippage
    fill = broker.execute(
        Order("BTCUSDT", Side.BUY, 0.01, OrderType.MARKET),
        bar_open=50_000.0, bar_high=50_500.0, bar_low=49_500.0, ts=_ts(),
    )
    # slip = 1.0 × (1000/50000) × 10_000 = 200 bps → price = 50_000 × 1.02
    assert abs(fill.price - 51_000.0) < 1.0


def test_market_impact_scales_with_order_fraction():
    pf = Portfolio(cash=10_000_000.0)
    cfg = BrokerConfig(fee_bps=0.0, slippage_bps=0.0, market_impact_coeff=1.0)
    broker = PaperBroker(pf, cfg)
    # order_notional = 0.1 × 50000 = 5000; bar_notional = 10 × 50000 = 500_000
    # fraction = 0.01 → impact bps = 1.0 × sqrt(0.01) × 10_000 = 1_000 bps
    fill = broker.execute(
        Order("BTCUSDT", Side.BUY, 0.1, OrderType.MARKET),
        bar_open=50_000.0, bar_high=50_000.0, bar_low=50_000.0, ts=_ts(),
        bar_volume=10.0,
    )
    # capped at max_slippage_bps = 200 by default → 50_000 × 1.02 = 51_000
    assert abs(fill.price - 51_000.0) < 1.0


def test_realistic_profile_is_friction_heavy():
    pf = Portfolio(cash=1_000_000.0)
    broker = PaperBroker(pf, BrokerConfig.realistic())
    fill = broker.execute(
        Order("BTCUSDT", Side.BUY, 0.001, OrderType.MARKET),
        bar_open=50_000.0, bar_high=50_050.0, bar_low=49_950.0, ts=_ts(),
        bar_volume=1.0,
    )
    # Buy price must be strictly above open under the realistic profile.
    assert fill.price > 50_000.0


def test_slippage_capped_at_max_bps():
    pf = Portfolio(cash=1_000_000.0)
    cfg = BrokerConfig(fee_bps=0.0, slippage_bps=0.0, volatility_slippage_coeff=100.0, max_slippage_bps=150.0)
    broker = PaperBroker(pf, cfg)
    fill = broker.execute(
        Order("BTCUSDT", Side.BUY, 0.001, OrderType.MARKET),
        bar_open=50_000.0, bar_high=55_000.0, bar_low=45_000.0, ts=_ts(),
    )
    # Raw calc would be enormous — cap at 150 bps → 50_000 × 1.015 = 50_750
    assert abs(fill.price - 50_750.0) < 1.0

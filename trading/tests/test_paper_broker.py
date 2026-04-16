from datetime import datetime, timezone

import pytest

from apex_trader.broker.paper import BrokerConfig, OrderRejected, PaperBroker
from apex_trader.models import Order, OrderType, Portfolio, Side


def _ts():
    return datetime(2024, 1, 1, tzinfo=timezone.utc)


def test_market_buy_updates_cash_and_position():
    pf = Portfolio(cash=10_000.0)
    broker = PaperBroker(pf, BrokerConfig(fee_bps=10.0, slippage_bps=0.0))
    fill = broker.execute(
        Order("BTCUSDT", Side.BUY, 0.1, OrderType.MARKET),
        bar_open=50_000.0, bar_high=50_100.0, bar_low=49_900.0, ts=_ts(),
    )
    assert fill.price == 50_000.0
    assert pf.position("BTCUSDT").quantity == pytest.approx(0.1)
    assert pf.cash == pytest.approx(10_000.0 - (5_000.0 + 5.0))


def test_insufficient_cash_rejected():
    pf = Portfolio(cash=100.0)
    broker = PaperBroker(pf)
    with pytest.raises(OrderRejected):
        broker.execute(
            Order("BTCUSDT", Side.BUY, 1.0, OrderType.MARKET),
            bar_open=50_000.0, bar_high=50_000.0, bar_low=50_000.0, ts=_ts(),
        )


def test_short_disabled_by_default():
    pf = Portfolio(cash=10_000.0)
    broker = PaperBroker(pf)
    with pytest.raises(OrderRejected):
        broker.execute(
            Order("BTCUSDT", Side.SELL, 0.1, OrderType.MARKET),
            bar_open=50_000.0, bar_high=50_000.0, bar_low=50_000.0, ts=_ts(),
        )


def test_sell_realizes_pnl_and_clears_position():
    pf = Portfolio(cash=10_000.0)
    broker = PaperBroker(pf, BrokerConfig(fee_bps=0.0, slippage_bps=0.0))
    broker.execute(
        Order("BTCUSDT", Side.BUY, 0.1, OrderType.MARKET),
        bar_open=50_000.0, bar_high=50_000.0, bar_low=50_000.0, ts=_ts(),
    )
    broker.execute(
        Order("BTCUSDT", Side.SELL, 0.1, OrderType.MARKET),
        bar_open=60_000.0, bar_high=60_000.0, bar_low=60_000.0, ts=_ts(),
    )
    assert pf.position("BTCUSDT").quantity == 0.0
    assert pf.realized_pnl == pytest.approx(1_000.0)
    assert pf.cash == pytest.approx(10_000.0 + 1_000.0)


def test_limit_buy_only_fills_when_touched():
    pf = Portfolio(cash=10_000.0)
    broker = PaperBroker(pf, BrokerConfig(fee_bps=0.0, slippage_bps=0.0))
    with pytest.raises(OrderRejected):
        broker.execute(
            Order("BTCUSDT", Side.BUY, 0.01, OrderType.LIMIT, limit_price=49_000.0),
            bar_open=50_000.0, bar_high=50_200.0, bar_low=49_500.0, ts=_ts(),
        )
    fill = broker.execute(
        Order("BTCUSDT", Side.BUY, 0.01, OrderType.LIMIT, limit_price=49_500.0),
        bar_open=50_000.0, bar_high=50_200.0, bar_low=49_400.0, ts=_ts(),
    )
    assert fill.price == pytest.approx(49_500.0)

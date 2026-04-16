"""End-to-end backtest on a synthetic bar series — no network required."""
import numpy as np
import pandas as pd

from apex_trader.backtest.runner import Backtest
from apex_trader.broker.paper import BrokerConfig
from apex_trader.risk.manager import RiskConfig
from apex_trader.strategy.ma_crossover import MACrossover


def _synthetic_bars(n: int = 400, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    # Two regimes: downtrend then uptrend — guarantees crossovers.
    half = n // 2
    drift = np.concatenate([np.full(half, -0.002), np.full(n - half, 0.003)])
    shocks = rng.normal(0.0, 0.01, size=n)
    log_price = np.cumsum(drift + shocks) + np.log(100.0)
    close = np.exp(log_price)
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    high = close * (1.0 + rng.uniform(0.0, 0.005, n))
    low = close * (1.0 - rng.uniform(0.0, 0.005, n))
    op = np.concatenate([[close[0]], close[:-1]])
    return pd.DataFrame(
        {"open": op, "high": high, "low": low, "close": close, "volume": 1.0},
        index=idx,
    )


def test_backtest_runs_and_produces_summary():
    bars = _synthetic_bars()
    bt = Backtest(
        symbol="SIMUSDT",
        bars=bars,
        strategy=MACrossover(fast=10, slow=30),
        starting_cash=10_000.0,
        broker_config=BrokerConfig(fee_bps=10.0, slippage_bps=5.0),
        risk_config=RiskConfig(max_position_pct=0.5, risk_per_trade_pct=0.02),
        warmup_bars=40,
    )
    result = bt.run()
    assert len(result.equity_curve) == len(bars)
    assert result.summary.trades >= 0
    # Equity never goes negative with long-only + stops
    assert (result.equity_curve > 0).all()


def test_backtest_respects_no_lookahead():
    """Strategy must see only bars[:i] (strict prior) when deciding at bar i."""
    bars = _synthetic_bars(n=200)

    seen_lengths = []

    class Recorder:
        name = "recorder"

        def decide(self, ctx):
            seen_lengths.append((ctx.now, len(ctx.history)))
            from apex_trader.strategy.base import Signal
            return Signal.FLAT, "test"

    bt = Backtest(
        symbol="SIMUSDT",
        bars=bars,
        strategy=Recorder(),
        starting_cash=10_000.0,
        warmup_bars=10,
    )
    bt.run()
    # The strategy is invoked starting at bar index warmup_bars; at bar i it must see i bars (0..i-1).
    for ts, length in seen_lengths:
        i = bars.index.get_loc(ts)
        assert length == i, f"at ts={ts} expected {i} bars, saw {length}"

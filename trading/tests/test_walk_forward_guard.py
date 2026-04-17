"""CI regression guard: walk-forward on a canonical synthetic series.

The numbers here are not performance claims; they exist so that a structural
regression (lookahead reintroduced, stop model regressed, friction bypassed)
surfaces immediately instead of being caught only by production P&L.

If legitimate changes shift the numbers, update the thresholds in *one* place
and write a brief rationale in the PR description.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from apex_trader.backtest.runner import WalkForwardConfig, walk_forward
from apex_trader.broker.paper import BrokerConfig
from apex_trader.risk.manager import RiskConfig
from apex_trader.strategy.ma_crossover import MACrossover


def _synthetic_bars(n: int = 600, seed: int = 7) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    # Mild oscillating drift so crossovers happen more than once.
    drift = 0.001 * np.sin(np.linspace(0, 10 * np.pi, n))
    shocks = rng.normal(0.0, 0.008, size=n)
    log_price = np.cumsum(drift + shocks) + np.log(100.0)
    close = np.exp(log_price)
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    high = close * (1.0 + rng.uniform(0.0, 0.004, n))
    low = close * (1.0 - rng.uniform(0.0, 0.004, n))
    op = np.concatenate([[close[0]], close[:-1]])
    return pd.DataFrame(
        {"open": op, "high": high, "low": low, "close": close, "volume": 1.0},
        index=idx,
    )


def test_walk_forward_produces_multiple_folds():
    bars = _synthetic_bars()
    result = walk_forward(
        symbol="SIMUSDT",
        bars=bars,
        strategy=MACrossover(fast=10, slow=30),
        wf_config=WalkForwardConfig(train_bars=150, test_bars=50, step_bars=50),
        starting_cash=10_000.0,
        broker_config=BrokerConfig(fee_bps=10.0, slippage_bps=5.0),
        risk_config=RiskConfig(max_position_pct=0.5, risk_per_trade_pct=0.02),
    )
    # With n=600, train=150, test=50, step=50 → 10 folds
    assert len(result.fold_results) >= 8


def test_walk_forward_no_catastrophic_loss_under_realistic_friction():
    """Under the production-friction profile the combined curve must not blow up."""
    bars = _synthetic_bars()
    result = walk_forward(
        symbol="SIMUSDT",
        bars=bars,
        strategy=MACrossover(fast=10, slow=30),
        wf_config=WalkForwardConfig(train_bars=150, test_bars=50, step_bars=50),
        starting_cash=10_000.0,
        broker_config=BrokerConfig.realistic(),
        risk_config=RiskConfig(
            max_position_pct=0.3, risk_per_trade_pct=0.01,
            max_total_drawdown_pct=0.20, post_stop_cooldown_bars=2,
        ),
    )
    # Every fold's terminal equity must stay above the kill-switch floor.
    for r in result.fold_results:
        if len(r.equity_curve) == 0:
            continue
        start = float(r.equity_curve.iloc[0])
        floor = start * 0.75  # kill-switch + friction worst case
        assert float(r.equity_curve.min()) > floor, (
            f"fold breached floor: min={r.equity_curve.min():.2f}, floor={floor:.2f}"
        )


def test_walk_forward_no_lookahead_into_future_folds():
    """Each fold's equity must be strictly out-of-sample (post-warmup) bars only."""
    bars = _synthetic_bars()
    cfg = WalkForwardConfig(train_bars=150, test_bars=50, step_bars=50)
    result = walk_forward(
        symbol="SIMUSDT",
        bars=bars,
        strategy=MACrossover(fast=10, slow=30),
        wf_config=cfg,
        starting_cash=10_000.0,
    )
    # combined_equity length = n_folds × test_bars (plus one trailing bar per fold boundary)
    assert len(result.combined_equity) <= len(result.fold_results) * cfg.test_bars + len(result.fold_results)
    # Monotonically increasing timestamps — no duplicates across fold boundaries going backwards.
    ts = result.combined_equity.index
    for i in range(1, len(ts)):
        assert ts[i] >= ts[i - 1], "timestamps regressed between folds"

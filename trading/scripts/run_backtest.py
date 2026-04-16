#!/usr/bin/env python3
"""Run an MA-crossover backtest against Binance public klines."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from apex_trader.backtest.runner import Backtest
from apex_trader.broker.paper import BrokerConfig
from apex_trader.data.binance import fetch_klines
from apex_trader.risk.manager import RiskConfig
from apex_trader.strategy.ma_crossover import MACrossover


def _synthetic_bars(n: int, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    half = n // 2
    drift = np.concatenate([np.full(half, -0.002), np.full(n - half, 0.003)])
    shocks = rng.normal(0.0, 0.01, size=n)
    close = np.exp(np.cumsum(drift + shocks) + np.log(100.0))
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    high = close * (1.0 + rng.uniform(0.0, 0.005, n))
    low = close * (1.0 - rng.uniform(0.0, 0.005, n))
    op = np.concatenate([[close[0]], close[:-1]])
    return pd.DataFrame(
        {"open": op, "high": high, "low": low, "close": close, "volume": 1.0}, index=idx
    )


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--source", choices=["binance", "synthetic"], default="binance")
    p.add_argument("--symbol", default="BTCUSDT")
    p.add_argument("--interval", default="1h")
    p.add_argument("--days", type=int, default=90)
    p.add_argument("--n-bars", type=int, default=500, help="bars for --source synthetic")
    p.add_argument("--cash", type=float, default=10_000.0)
    p.add_argument("--fast", type=int, default=20)
    p.add_argument("--slow", type=int, default=50)
    p.add_argument("--fee-bps", type=float, default=10.0)
    p.add_argument("--slippage-bps", type=float, default=5.0)
    p.add_argument("--max-position-pct", type=float, default=0.50)
    p.add_argument("--risk-per-trade-pct", type=float, default=0.02)
    p.add_argument("--stop-loss-pct", type=float, default=0.03)
    p.add_argument("--log", default=None, help="JSONL trade log path")
    args = p.parse_args()

    if args.source == "synthetic":
        print(f"Generating {args.n_bars} synthetic bars for {args.symbol}...", flush=True)
        bars = _synthetic_bars(args.n_bars)
    else:
        print(f"Fetching {args.symbol} {args.interval} for {args.days}d from Binance...", flush=True)
        bars = fetch_klines(args.symbol, args.interval, args.days)
    if bars.empty:
        print("no bars returned", file=sys.stderr)
        return 2
    print(f"  {len(bars)} bars from {bars.index[0]} to {bars.index[-1]}")

    bt = Backtest(
        symbol=args.symbol,
        bars=bars,
        strategy=MACrossover(fast=args.fast, slow=args.slow),
        starting_cash=args.cash,
        broker_config=BrokerConfig(fee_bps=args.fee_bps, slippage_bps=args.slippage_bps),
        risk_config=RiskConfig(
            max_position_pct=args.max_position_pct,
            risk_per_trade_pct=args.risk_per_trade_pct,
            stop_loss_pct=args.stop_loss_pct,
        ),
        log_path=args.log,
    )
    result = bt.run()

    print("\n=== Performance summary ===")
    print(json.dumps(result.summary.as_dict(), indent=2, default=str))
    print(f"Fills: {len(result.fills)}  Rejections: {len(result.rejections)}")
    print(f"Start equity: {result.equity_curve.iloc[0]:,.2f}")
    print(f"End   equity: {result.equity_curve.iloc[-1]:,.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

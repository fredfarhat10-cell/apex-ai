#!/usr/bin/env python3
"""Paper-trade a recent window of real market data and report P&L.

Runs the full apex_trader stack (realistic broker friction, risk engine with
kill-switch + daily DD + cooldown, multi-strategy ensemble) against the last
N hours of 5-minute Binance bars for one symbol.  Network is required —
unlike the unit tests this hits api.binance.com directly.

Example:
    python scripts/paper_run_recent.py --symbol BTCUSDT --hours 48
    python scripts/paper_run_recent.py --symbol ETHUSDT --hours 48 --interval 15m
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from statistics import mean, pstdev

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from apex_trader.backtest.runner import Backtest
from apex_trader.broker.paper import BrokerConfig
from apex_trader.data.binance import fetch_klines
from apex_trader.risk.manager import RiskConfig
from apex_trader.signal_engine.ensemble import EnsembleCombiner
from apex_trader.signal_engine.mean_reversion import MeanReversionStrategy
from apex_trader.signal_engine.momentum import MomentumStrategy
from apex_trader.signal_engine.volatility_breakout import VolatilityBreakoutStrategy
from apex_trader.regime.detector import RegimeDetector
from apex_trader.strategy.base import Signal, StrategyContext


class EnsembleStrategy:
    """Adapter: run the multi-strategy ensemble as a ``Strategy``.

    Matches the Strategy protocol (``name``, ``decide(ctx)``) so the existing
    Backtest runner can drive it.  Uses the RegimeDetector to label the
    current regime and pass chop flag into the ensemble for confidence
    scaling.  A position is held until an EXIT signal flips it.
    """

    name = "ensemble_v3"

    def __init__(self, min_confidence: float = 0.50) -> None:
        self._detector = RegimeDetector(min_bars=60)
        self._ensemble = EnsembleCombiner(
            strategies=[
                MomentumStrategy(),
                MeanReversionStrategy(),
                VolatilityBreakoutStrategy(),
            ],
            min_confidence=min_confidence,
        )

    def decide(self, ctx: StrategyContext) -> tuple[Signal, str]:
        hist = ctx.history
        regime = self._detector.detect(hist)
        result = self._ensemble.combine(hist, regime.label, regime_state=regime)
        pos_qty = ctx.portfolio.position(ctx.symbol).quantity
        if result.direction == "long" and pos_qty == 0:
            return Signal.LONG, result.rationale
        # Exit on regime flip or ensemble going flat — no shorting.
        if pos_qty > 0 and result.direction == "flat" and "below threshold" not in result.rationale:
            return Signal.EXIT, result.rationale
        return Signal.FLAT, result.rationale


def _fmt_money(x: float) -> str:
    return f"${x:,.2f}"


def _fmt_pct(x: float) -> str:
    return f"{x*100:+.2f}%"


def _win_rate(pnls: list[float]) -> float:
    if not pnls:
        return 0.0
    return sum(1 for p in pnls if p > 0) / len(pnls)


def _sharpe(returns: list[float], periods_per_year: int) -> float:
    if len(returns) < 2:
        return 0.0
    sd = pstdev(returns)
    if sd == 0:
        return 0.0
    return (mean(returns) / sd) * (periods_per_year ** 0.5)


def _interval_to_periods_per_year(interval: str) -> int:
    minutes = {"1m": 1, "3m": 3, "5m": 5, "15m": 15, "30m": 30, "1h": 60, "4h": 240, "1d": 1440}[interval]
    return int(365 * 24 * 60 / minutes)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--symbol", default="BTCUSDT")
    p.add_argument("--interval", default="5m", choices=["1m", "3m", "5m", "15m", "30m", "1h"])
    p.add_argument("--hours", type=float, default=48.0)
    p.add_argument("--cash", type=float, default=10_000.0)
    p.add_argument("--min-confidence", type=float, default=0.50)
    p.add_argument("--out-csv", default=None, help="optional path to save equity curve")
    p.add_argument("--zero-friction", action="store_true",
                   help="turn off realistic broker config — for diagnostics only")
    args = p.parse_args()

    print(f"Fetching {args.symbol} {args.interval} for last {args.hours}h from Binance...", flush=True)
    days_needed = max(1, int((args.hours / 24) + 1))
    bars = fetch_klines(args.symbol, args.interval, days=days_needed)
    if bars.empty:
        print("no bars returned", file=sys.stderr)
        return 2

    cutoff = bars.index.max() - pd.Timedelta(hours=args.hours)
    bars = bars[bars.index >= cutoff]
    print(f"  {len(bars)} bars from {bars.index[0]} to {bars.index[-1]}")
    print(f"  price range: {bars['low'].min():,.2f} – {bars['high'].max():,.2f}")
    price_start, price_end = float(bars['close'].iloc[0]), float(bars['close'].iloc[-1])
    buy_hold_pct = price_end / price_start - 1.0
    print(f"  buy-and-hold over window: {_fmt_pct(buy_hold_pct)}")

    broker_cfg = BrokerConfig() if args.zero_friction else BrokerConfig.realistic()
    risk_cfg = RiskConfig(
        max_position_pct=0.30,
        risk_per_trade_pct=0.01,
        stop_loss_pct=0.02,
        max_daily_drawdown_pct=0.03,
        max_total_drawdown_pct=0.12,
        min_hold_bars=3,
        post_stop_cooldown_bars=6,
        min_risk_reward=1.5,
    )

    t0 = time.time()
    bt = Backtest(
        symbol=args.symbol,
        bars=bars,
        strategy=EnsembleStrategy(min_confidence=args.min_confidence),
        starting_cash=args.cash,
        broker_config=broker_cfg,
        risk_config=risk_cfg,
        warmup_bars=60,
    )
    result = bt.run()
    elapsed = time.time() - t0

    eq = result.equity_curve
    start_eq = float(eq.iloc[0])
    end_eq = float(eq.iloc[-1])
    peak = float(eq.cummax().iloc[-1])
    max_dd = float(((eq.cummax() - eq) / eq.cummax()).max())
    pnl_dollars = end_eq - start_eq
    pnl_pct = end_eq / start_eq - 1.0

    bars_per_year = _interval_to_periods_per_year(args.interval)
    bar_returns = eq.pct_change().dropna().tolist()
    sharpe = _sharpe(bar_returns, periods_per_year=bars_per_year)
    trades = len(result.trade_pnls)
    win_rate = _win_rate(result.trade_pnls)
    gross_fees = sum(f.fee for f in result.fills)

    fills_by_reason: dict[str, int] = {}
    for f in result.fills:
        fills_by_reason[f.reason or f.side.value] = fills_by_reason.get(f.reason or f.side.value, 0) + 1

    print("\n" + "=" * 62)
    print(f"PAPER RUN  {args.symbol}  {args.interval}  last {args.hours}h")
    print("=" * 62)
    print(f"Window            {bars.index[0]}  →  {bars.index[-1]}")
    print(f"Bars              {len(bars)}   run time: {elapsed:.1f}s")
    print(f"Friction          {'zero (diagnostic)' if args.zero_friction else 'realistic (fee 10bp, slip 3bp, spread 2bp, impact)'}")
    print(f"Starting cash     {_fmt_money(start_eq)}")
    print(f"Ending equity     {_fmt_money(end_eq)}")
    print(f"P&L               {_fmt_money(pnl_dollars)}   ({_fmt_pct(pnl_pct)})")
    print(f"Buy & hold        {_fmt_pct(buy_hold_pct)}   (benchmark)")
    print(f"Max drawdown      {_fmt_pct(-max_dd)}   peak equity {_fmt_money(peak)}")
    print(f"Sharpe (annual)   {sharpe:.2f}")
    print(f"Trades closed     {trades}   win rate: {win_rate*100:.1f}%")
    print(f"Fills total       {len(result.fills)}   gross fees: {_fmt_money(gross_fees)}")
    print(f"Rejections        {len(result.rejections)}")
    if fills_by_reason:
        print(f"Fills by reason   " + ", ".join(f"{k}: {v}" for k, v in fills_by_reason.items()))
    if result.rejections[:5]:
        print("First rejections:")
        for ts, why in result.rejections[:5]:
            print(f"  {ts}  {why}")
    print("=" * 62)

    if args.out_csv:
        eq.to_csv(args.out_csv, header=["equity"])
        print(f"Equity curve written to {args.out_csv}")

    print("\nJSON summary:")
    print(json.dumps({
        "symbol": args.symbol,
        "interval": args.interval,
        "window_hours": args.hours,
        "bars": len(bars),
        "start_equity": start_eq,
        "end_equity": end_eq,
        "pnl_dollars": pnl_dollars,
        "pnl_pct": pnl_pct,
        "buy_and_hold_pct": buy_hold_pct,
        "max_drawdown_pct": max_dd,
        "sharpe_annualised": sharpe,
        "trades": trades,
        "win_rate": win_rate,
        "gross_fees": gross_fees,
    }, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

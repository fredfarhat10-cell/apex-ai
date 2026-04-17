"""Stress-test the Apex trading system against pathological market conditions.

Each scenario is an isolated probe into a specific failure mode. Output is a
structured report — severity, observed behavior, expected behavior — so every
finding is actionable rather than a pass/fail blob.

Run:
    python trading/scripts/stress_test.py
"""

from __future__ import annotations

import math
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

# Allow running the script directly without installing the package.
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(_ROOT / "src"))

from apex_trader.backtest.runner import Backtest
from apex_trader.broker.paper import BrokerConfig, PaperBroker
from apex_trader.meta.learner import MetaLearner
from apex_trader.models import Order, OrderType, Portfolio, Side
from apex_trader.performance.monitor import PerformanceMonitor, TradeRecord
from apex_trader.regime.detector import RegimeDetector
from apex_trader.risk.manager import RiskConfig, RiskManager
from apex_trader.signal_engine.ensemble import EnsembleCombiner
from apex_trader.signal_engine.mean_reversion import MeanReversionStrategy
from apex_trader.signal_engine.momentum import MomentumStrategy
from apex_trader.signal_engine.volatility_breakout import VolatilityBreakoutStrategy
from apex_trader.strategy.ma_crossover import MACrossover


Severity = str  # "OK" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"


@dataclass
class StressResult:
    scenario: str
    severity: Severity
    observed: str
    expected: str

    def render(self) -> str:
        colour = {"OK": "✓", "LOW": "·", "MEDIUM": "!", "HIGH": "!!", "CRITICAL": "✗"}.get(
            self.severity, "?"
        )
        return (
            f"[{colour}] {self.severity:<8} {self.scenario}\n"
            f"         observed: {self.observed}\n"
            f"         expected: {self.expected}"
        )


# ── helpers ───────────────────────────────────────────────────────────────────

def _bars(prices: np.ndarray, *, volume: np.ndarray | None = None, seed: int = 0) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    n = len(prices)
    if volume is None:
        volume = np.full(n, 1000.0)
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    return pd.DataFrame(
        {
            "open": prices,
            "high": prices * (1 + rng.uniform(0, 0.003, n)),
            "low": prices * (1 - rng.uniform(0, 0.003, n)),
            "close": prices,
            "volume": volume,
        },
        index=idx,
    )


# ── scenarios ─────────────────────────────────────────────────────────────────

def s_flash_crash() -> StressResult:
    """Market drops 30% over 3 consecutive bars — stops must fire intrabar."""
    n = 100
    prices = np.full(n, 100.0)
    prices[-3:] = [92.0, 80.0, 70.0]
    bars = _bars(prices)
    bars.loc[bars.index[-3:], "low"] = [92.0, 80.0, 70.0]
    bars.loc[bars.index[-3:], "high"] = [100.0, 92.0, 80.0]

    portfolio = Portfolio(cash=10_000.0)
    broker = PaperBroker(portfolio)
    broker.execute(
        Order("X", Side.BUY, 50, OrderType.MARKET, stop_loss=97.0),
        bar_open=100.0, bar_high=100.0, bar_low=100.0,
        ts=datetime.now(timezone.utc),
    )

    bt = Backtest(
        symbol="X",
        bars=bars,
        strategy=MACrossover(fast=5, slow=20),
        starting_cash=10_000.0,
        warmup_bars=30,
    )
    result = bt.run()

    max_dd = 1 - result.equity_curve.min() / result.equity_curve.iloc[0]
    # Strategy never entered (flat market until crash), so we only test kill-switch wiring
    # via RiskManager directly.
    rm = RiskManager(starting_equity=10_000.0)
    rm.on_bar(datetime.now(timezone.utc), 10_000.0)
    rm.on_bar(datetime.now(timezone.utc), 8_000.0)  # 20% DD
    if rm.halted():
        return StressResult(
            "flash_crash",
            "OK",
            f"kill-switch triggered at 20% DD; backtest max DD {max_dd:.2%}",
            "halt trading once total DD ≥ 12%",
        )
    return StressResult(
        "flash_crash",
        "CRITICAL",
        "kill-switch did NOT trigger at 20% DD",
        "halt trading once total DD ≥ 12%",
    )


def s_gap_through_stop() -> StressResult:
    """Overnight gap-down below stop — fill price should reflect the gap, not the stop."""
    portfolio = Portfolio(cash=10_000.0)
    broker = PaperBroker(portfolio, BrokerConfig(fee_bps=0, slippage_bps=0))
    broker.execute(
        Order("X", Side.BUY, 10, OrderType.MARKET, stop_loss=98.0),
        bar_open=100.0, bar_high=100.0, bar_low=100.0,
        ts=datetime.now(timezone.utc),
    )

    # Build a single bar that gaps from 100 → open at 85, closes at 84
    bars = pd.DataFrame(
        [{"open": 85.0, "high": 86.0, "low": 83.0, "close": 84.0, "volume": 1000}],
        index=pd.DatetimeIndex(["2024-01-02"], tz="UTC"),
    )

    bt = Backtest(
        symbol="X",
        bars=bars,
        strategy=MACrossover(fast=5, slow=10),
        starting_cash=10_000.0,
        warmup_bars=0,
    )
    from apex_trader.models import Position
    pf = Portfolio(
        cash=10_000.0,
        positions={"X": Position(symbol="X", quantity=10, avg_price=100.0, stop_loss=98.0)},
    )
    bar = bars.iloc[0]
    fill = bt._check_stops(
        PaperBroker(pf, BrokerConfig(fee_bps=0, slippage_bps=0)),
        "X",
        bar,
        datetime.now(timezone.utc),
    )
    if fill is None:
        return StressResult(
            "gap_through_stop",
            "HIGH",
            "stop-loss not triggered despite bar low (83) < stop (98)",
            "stop-loss must fire when low pierces the stop level",
        )
    # Fill price is reported at the stop level (98) — but realistic fill on a gap
    # would be near the bar open (85). This is a known simulation weakness.
    realistic = 85.0
    reported = fill.price
    if reported >= 97.0:
        return StressResult(
            "gap_through_stop",
            "HIGH",
            f"stop fills at {reported:.2f} (the stop level), ignoring the {realistic:.2f} gap",
            f"fill near bar_open ({realistic:.2f}) when bar opens below the stop",
        )
    return StressResult(
        "gap_through_stop",
        "OK",
        f"stop fills at {reported:.2f}, close to realistic {realistic:.2f}",
        "gap fills modelled near bar open",
    )


def s_flat_market_zero_volatility() -> StressResult:
    """All bars are identical price — strategies must not crash or emit spurious signals."""
    n = 200
    prices = np.full(n, 100.0)
    bars = _bars(prices)
    # Force high/low to exactly match close to maximise zero-variance edge case
    bars["high"] = bars["close"]
    bars["low"] = bars["close"]

    issues: list[str] = []
    for strat in [
        MomentumStrategy(),
        MeanReversionStrategy(),
        VolatilityBreakoutStrategy(),
    ]:
        try:
            result = strat.generate(bars, "ranging_low_vol")
            if result.direction != "flat":
                issues.append(f"{strat.name} emitted {result.direction}")
            if math.isnan(result.confidence):
                issues.append(f"{strat.name} NaN confidence")
        except Exception as exc:
            issues.append(f"{strat.name} crashed: {type(exc).__name__}: {exc}")

    try:
        det = RegimeDetector().detect(bars)
        if math.isnan(det.vol_percentile) or math.isnan(det.trend_strength):
            issues.append("RegimeDetector returned NaN")
    except Exception as exc:
        issues.append(f"RegimeDetector crashed: {type(exc).__name__}: {exc}")

    if not issues:
        return StressResult(
            "flat_market_zero_vol",
            "OK",
            "all strategies emit FLAT, regime detector stable",
            "graceful degradation under zero-variance input",
        )
    return StressResult(
        "flat_market_zero_vol",
        "MEDIUM",
        "; ".join(issues),
        "all strategies emit FLAT, no NaN propagation",
    )


def s_zero_volume() -> StressResult:
    """Volume = 0 on every bar. Strategies that check volume must degrade gracefully."""
    rng = np.random.default_rng(0)
    prices = 100 + rng.normal(0, 0.5, 150).cumsum()
    bars = _bars(prices, volume=np.zeros(150))

    issues: list[str] = []
    for strat in [
        MomentumStrategy(),
        VolatilityBreakoutStrategy(volume_threshold=1.5),
    ]:
        try:
            result = strat.generate(bars, "trending_high_vol")
            # Momentum: vol_ok should be False when avg_vol == 0; confirmed in code.
            # VolatilityBreakout: avg_vol = 0 → vol_ok logic uses `avg_vol > 0 and ...` so vol_ok=False. Good.
            if math.isnan(result.confidence):
                issues.append(f"{strat.name} NaN confidence")
        except Exception as exc:
            issues.append(f"{strat.name} crashed: {type(exc).__name__}: {exc}")

    if not issues:
        return StressResult(
            "zero_volume",
            "OK",
            "strategies handle zero volume without NaN/crash",
            "volume=0 correctly marks vol_ok=False, not True",
        )
    return StressResult(
        "zero_volume",
        "HIGH",
        "; ".join(issues),
        "no crashes or NaN outputs with zero volume",
    )


def s_nan_in_price_data() -> StressResult:
    """One NaN row in OHLCV — do indicators/strategies propagate NaN into decisions?"""
    n = 150
    prices = 100.0 + np.linspace(0, 20, n)
    bars = _bars(prices)
    # Inject NaN into a mid bar
    bars.iloc[50, bars.columns.get_loc("close")] = np.nan
    bars.iloc[50, bars.columns.get_loc("open")] = np.nan
    bars.iloc[50, bars.columns.get_loc("high")] = np.nan
    bars.iloc[50, bars.columns.get_loc("low")] = np.nan

    issues: list[str] = []
    for strat in [
        MomentumStrategy(),
        MeanReversionStrategy(),
        VolatilityBreakoutStrategy(),
    ]:
        try:
            result = strat.generate(bars, "trending_high_vol")
            if math.isnan(result.confidence):
                issues.append(f"{strat.name} NaN confidence")
            if result.risk_reward is not None and math.isnan(result.risk_reward):
                issues.append(f"{strat.name} NaN R:R")
        except Exception as exc:
            issues.append(f"{strat.name} crashed: {type(exc).__name__}: {exc}")

    if not issues:
        return StressResult(
            "nan_in_price_data",
            "OK",
            "strategies tolerate a NaN bar in history",
            "NaN does not reach decision outputs",
        )
    return StressResult(
        "nan_in_price_data",
        "HIGH",
        "; ".join(issues),
        "NaN input must not corrupt confidence or R:R",
    )


def s_kill_switch_exact_boundary() -> StressResult:
    """Kill-switch should fire at total DD ≥ 12% (default), not before."""
    rm = RiskManager(RiskConfig(max_total_drawdown_pct=0.12), starting_equity=10_000.0)
    ts = datetime.now(timezone.utc)
    rm.on_bar(ts, 10_000.0)   # peak
    rm.on_bar(ts, 8_800.0)    # exactly 12% DD
    below_fire = rm.halted()
    rm2 = RiskManager(RiskConfig(max_total_drawdown_pct=0.12), starting_equity=10_000.0)
    rm2.on_bar(ts, 10_000.0)
    rm2.on_bar(ts, 8_900.0)   # 11% DD
    below_safe = rm2.halted()

    if below_fire and not below_safe:
        return StressResult(
            "kill_switch_boundary",
            "OK",
            "halts at exactly 12% DD, safe at 11%",
            "halt at DD ≥ threshold",
        )
    return StressResult(
        "kill_switch_boundary",
        "CRITICAL",
        f"halt at 12% = {below_fire}, halt at 11% = {below_safe}",
        "halt at 12%, continue at 11%",
    )


def s_daily_dd_breach_and_next_day() -> StressResult:
    """After daily DD breach, the next day should resume (day_start_equity resets)."""
    rm = RiskManager(RiskConfig(max_daily_drawdown_pct=0.03), starting_equity=10_000.0)
    from datetime import timedelta
    t0 = datetime(2024, 3, 1, 10, tzinfo=timezone.utc)
    t1 = datetime(2024, 3, 1, 20, tzinfo=timezone.utc)
    t2 = datetime(2024, 3, 2, 10, tzinfo=timezone.utc)
    rm.on_bar(t0, 10_000.0)   # start of day
    rm.on_bar(t1, 9_600.0)    # 4% daily DD
    order = Order("X", Side.BUY, 0.1, OrderType.MARKET)
    portfolio = Portfolio(cash=10_000.0)
    dec_day1 = rm.evaluate(order, portfolio, 9_600.0, 100.0)
    rm.on_bar(t2, 9_600.0)    # fresh day
    dec_day2 = rm.evaluate(order, portfolio, 9_600.0, 100.0)

    if not dec_day1.accepted and dec_day2.accepted:
        return StressResult(
            "daily_dd_recovery",
            "OK",
            "rejected on day 1 after DD, accepted on day 2",
            "daily DD resets at midnight",
        )
    return StressResult(
        "daily_dd_recovery",
        "HIGH",
        f"day1 accepted={dec_day1.accepted} ({dec_day1.reason}); "
        f"day2 accepted={dec_day2.accepted} ({dec_day2.reason})",
        "day 1 rejected, day 2 accepted",
    )


def s_all_strategies_losing() -> StressResult:
    """Meta-learner must not divide by zero or output negative weights when every strategy loses."""
    ml = MetaLearner(["A", "B", "C"], rebalance_period_days=0, min_weight=0.05)
    monitor = PerformanceMonitor()
    rng = np.random.default_rng(0)
    for i in range(20):
        monitor.record_close(TradeRecord(pnl=-10 + rng.normal(0, 2), strategy="A", entry=100, exit=99, ts=datetime(2024, 1, 1 + i, tzinfo=timezone.utc)))
        monitor.record_close(TradeRecord(pnl=-5 + rng.normal(0, 1), strategy="B", entry=100, exit=99, ts=datetime(2024, 1, 1 + i, tzinfo=timezone.utc)))
        monitor.record_close(TradeRecord(pnl=-8 + rng.normal(0, 2), strategy="C", entry=100, exit=99, ts=datetime(2024, 1, 1 + i, tzinfo=timezone.utc)))

    weights = ml.update_weights(monitor)
    total = sum(weights.values())
    all_positive = all(w > 0 for w in weights.values())
    all_floor = all(abs(w - 1 / 3) < 0.15 for w in weights.values())

    if abs(total - 1.0) < 1e-6 and all_positive and all_floor:
        return StressResult(
            "meta_all_losing",
            "OK",
            f"weights ≈ equal fallback: {weights}",
            "equal weights, sum to 1, all positive",
        )
    return StressResult(
        "meta_all_losing",
        "HIGH",
        f"weights={weights}, sum={total:.4f}, all_positive={all_positive}",
        "equal weights, sum to 1, all positive",
    )


def s_extreme_single_bar_move() -> StressResult:
    """+50% single-bar move — does position sizing explode or ATR blow up?"""
    n = 150
    prices = 100.0 + np.linspace(0, 5, n)
    prices[-1] = 150.0  # +45% jump on last bar
    bars = _bars(prices)
    bars.iloc[-1, bars.columns.get_loc("high")] = 155.0
    bars.iloc[-1, bars.columns.get_loc("low")] = 100.0

    rm = RiskManager(starting_equity=10_000.0)
    qty, stop, tp = rm.size_dynamic(
        equity=10_000.0,
        bars=bars,
        atr_multiplier_stop=2.0,
        atr_multiplier_tp=4.0,
    )
    # Sanity: quantity × price ≤ max_position_pct × equity; stop > 0; tp > entry
    entry = float(bars["close"].iloc[-1])
    notional = qty * entry
    cap = 10_000.0 * rm.config.max_position_pct
    notional_ok = notional <= cap + 1e-6
    stop_positive = stop > 0
    tp_above_entry = tp > entry

    if notional_ok and stop_positive and tp_above_entry and math.isfinite(qty):
        return StressResult(
            "extreme_single_bar_move",
            "OK",
            f"qty={qty:.4f}, notional={notional:.2f} ≤ cap {cap}, stop={stop:.2f}, tp={tp:.2f}",
            "position sized within cap, stop/tp sane",
        )
    return StressResult(
        "extreme_single_bar_move",
        "HIGH",
        f"notional_ok={notional_ok}, stop_positive={stop_positive}, "
        f"tp_above_entry={tp_above_entry}, qty={qty}",
        "all invariants hold",
    )


def s_ensemble_conflicting_signals() -> StressResult:
    """Two strategies emit opposite confident signals — ensemble must pick one direction cleanly."""
    from apex_trader.signal_engine.base import SignalResult

    class _AlwaysLong:
        name = "bull"
        weight = 1.0
        def generate(self, bars, regime):
            return SignalResult("long", 0.9, 2.0, "bull")

    class _AlwaysShort:
        name = "bear"
        weight = 1.0
        def generate(self, bars, regime):
            return SignalResult("short", 0.9, 2.0, "bear")

    rng = np.random.default_rng(0)
    bars = _bars(100 + rng.normal(0, 1, 80).cumsum())

    combiner = EnsembleCombiner([_AlwaysLong(), _AlwaysShort()], min_confidence=0.3)
    result = combiner.combine(bars, "trending_high_vol")

    if result.direction in ("long", "short") and math.isfinite(result.confidence):
        return StressResult(
            "ensemble_conflict",
            "OK",
            f"direction={result.direction}, conf={result.confidence:.2f}",
            "pick dominant direction by weight",
        )
    return StressResult(
        "ensemble_conflict",
        "MEDIUM",
        f"direction={result.direction}, conf={result.confidence}",
        "pick dominant direction by weight",
    )


def s_liquidity_guard() -> StressResult:
    """With min_volume_multiple set, an order larger than the bar should be rejected."""
    portfolio = Portfolio(cash=1_000_000.0)
    broker = PaperBroker(
        portfolio,
        BrokerConfig(fee_bps=0, slippage_bps=0, min_volume_multiple=0.1),
    )
    from apex_trader.broker.paper import OrderRejected

    try:
        broker.execute(
            Order("X", Side.BUY, 1000, OrderType.MARKET),
            bar_open=100.0, bar_high=100.0, bar_low=100.0,
            ts=datetime.now(timezone.utc),
            bar_volume=100.0,  # order = 1000 > 0.1 × 100 = 10
        )
        return StressResult(
            "liquidity_guard",
            "HIGH",
            "broker filled an order 10× the bar volume",
            "reject orders exceeding min_volume_multiple × bar volume",
        )
    except OrderRejected as e:
        return StressResult(
            "liquidity_guard",
            "OK",
            f"broker rejected: {e}",
            "order exceeding min_volume_multiple rejected",
        )


def s_stop_wick_triggers_exit() -> StressResult:
    """One-bar wick below stop: backtest will fire the stop even if close recovers.

    This is by design (bracket orders behave this way in reality) but can cause
    churn losses; we flag it as LOW so users are aware.
    """
    n = 120
    prices = np.full(n, 100.0)
    bars = _bars(prices)
    # Wick on last bar: open=100, low=95, high=100, close=100 (stop at 97)
    bars.iloc[-1, bars.columns.get_loc("low")] = 95.0
    bars.iloc[-1, bars.columns.get_loc("close")] = 100.0
    bars.iloc[-1, bars.columns.get_loc("high")] = 100.0

    from apex_trader.models import Position
    portfolio = Portfolio(
        cash=10_000.0,
        positions={"X": Position(symbol="X", quantity=10, avg_price=100, stop_loss=97.0)},
    )
    broker = PaperBroker(portfolio, BrokerConfig(fee_bps=0, slippage_bps=0))

    bt = Backtest(symbol="X", bars=bars, strategy=MACrossover(), starting_cash=10_000, warmup_bars=0)
    fill = bt._check_stops(broker, "X", bars.iloc[-1], datetime.now(timezone.utc))

    if fill is not None and abs(fill.price - 97.0) < 0.1:
        return StressResult(
            "stop_wick_churn",
            "LOW",
            "stop fires at wick low of 95 with fill at stop level 97 (no gap modelled)",
            "by design: bracket stop fires on wick; churn risk documented",
        )
    return StressResult(
        "stop_wick_churn",
        "MEDIUM",
        f"fill={fill}",
        "stop should fire on a wick below the stop",
    )


def s_insufficient_history() -> StressResult:
    """Strategies should emit FLAT when given fewer bars than their min_bars."""
    bars = _bars(np.linspace(100, 110, 5))
    issues = []
    for strat in [MomentumStrategy(), MeanReversionStrategy(), VolatilityBreakoutStrategy()]:
        try:
            r = strat.generate(bars, "trending_high_vol")
            if r.direction != "flat" or r.confidence != 0.0:
                issues.append(f"{strat.name} direction={r.direction} conf={r.confidence}")
        except Exception as exc:
            issues.append(f"{strat.name} crashed: {exc}")

    if not issues:
        return StressResult(
            "insufficient_history",
            "OK",
            "all strategies return FLAT on tiny history",
            "graceful degradation",
        )
    return StressResult("insufficient_history", "HIGH", "; ".join(issues), "all return FLAT")


# ── runner ────────────────────────────────────────────────────────────────────

SCENARIOS = [
    s_flash_crash,
    s_gap_through_stop,
    s_flat_market_zero_volatility,
    s_zero_volume,
    s_nan_in_price_data,
    s_kill_switch_exact_boundary,
    s_daily_dd_breach_and_next_day,
    s_all_strategies_losing,
    s_extreme_single_bar_move,
    s_ensemble_conflicting_signals,
    s_liquidity_guard,
    s_stop_wick_triggers_exit,
    s_insufficient_history,
]


def main() -> int:
    print("=" * 78)
    print("APEX TRADER — STRESS TEST REPORT")
    print("=" * 78)

    results = []
    for fn in SCENARIOS:
        try:
            r = fn()
        except Exception as exc:
            r = StressResult(
                scenario=fn.__name__,
                severity="CRITICAL",
                observed=f"scenario harness crashed: {type(exc).__name__}: {exc}",
                expected="scenario runs to completion",
            )
        results.append(r)
        print(r.render())
        print("-" * 78)

    counts: dict[str, int] = {}
    for r in results:
        counts[r.severity] = counts.get(r.severity, 0) + 1

    print("\nSUMMARY")
    print("-------")
    for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "OK"]:
        n = counts.get(sev, 0)
        if n:
            print(f"  {sev:<8}  {n}")

    critical = counts.get("CRITICAL", 0) + counts.get("HIGH", 0)
    return 1 if critical else 0


if __name__ == "__main__":
    sys.exit(main())

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

import pandas as pd

from ..broker.paper import BrokerConfig, OrderRejected, PaperBroker
from ..models import Fill, Order, OrderType, Portfolio, Side
from ..risk.manager import RiskConfig, RiskManager
from ..strategy.base import Signal, Strategy, StrategyContext
from ..tradelog.logger import TradeLogger
from .metrics import PerfSummary, summarize


@dataclass
class WalkForwardConfig:
    """Controls the train/test split for walk-forward validation."""

    train_bars: int = 200   # bars used as context (warmup) for each fold
    test_bars: int = 50     # bars on which performance is evaluated per fold
    step_bars: int = 50     # advance this many bars between folds


@dataclass
class WalkForwardResult:
    fold_results: list[BacktestResult]
    combined_equity: pd.Series
    combined_summary: PerfSummary


def walk_forward(
    symbol: str,
    bars: pd.DataFrame,
    strategy: Strategy,
    wf_config: WalkForwardConfig | None = None,
    starting_cash: float = 10_000.0,
    broker_config: BrokerConfig | None = None,
    risk_config: RiskConfig | None = None,
) -> WalkForwardResult:
    """Strict walk-forward backtest.

    For each fold:
      - `train_bars` bars are available as context (warmup only; no in-sample
        fitting is possible here since strategies are rule-based).
      - Performance is evaluated only on the next `test_bars` bars.
      - Folds advance by `step_bars`, which may overlap the test windows.

    This prevents look-ahead bias from training on the full dataset and gives
    a realistic out-of-sample performance picture.
    """
    cfg = wf_config or WalkForwardConfig()
    broker_cfg = broker_config or BrokerConfig()
    risk_cfg = risk_config or RiskConfig()

    total = len(bars)
    fold_start = cfg.train_bars  # first test window begins after initial warmup
    fold_results: list[BacktestResult] = []
    equity_chunks: list[pd.Series] = []

    while fold_start + cfg.test_bars <= total:
        window_bars = bars.iloc[max(0, fold_start - cfg.train_bars): fold_start + cfg.test_bars]
        bt = Backtest(
            symbol=symbol,
            bars=window_bars,
            strategy=strategy,
            starting_cash=starting_cash,
            broker_config=broker_cfg,
            risk_config=risk_cfg,
            warmup_bars=cfg.train_bars,
        )
        result = bt.run()
        fold_results.append(result)
        # Only keep the out-of-sample (test) slice of the equity curve
        test_eq = result.equity_curve.iloc[-cfg.test_bars:]
        equity_chunks.append(test_eq)
        fold_start += cfg.step_bars

    if not fold_results:
        empty_eq = pd.Series(dtype=float)
        return WalkForwardResult([], empty_eq, summarize(empty_eq, []))

    combined_equity = pd.concat(equity_chunks)
    all_pnls: list[float] = [p for r in fold_results for p in r.trade_pnls]
    combined_summary = summarize(combined_equity, all_pnls)

    return WalkForwardResult(
        fold_results=fold_results,
        combined_equity=combined_equity,
        combined_summary=combined_summary,
    )


@dataclass
class BacktestResult:
    equity_curve: pd.Series
    fills: list[Fill]
    trade_pnls: list[float]
    summary: PerfSummary
    rejections: list[tuple[datetime, str]] = field(default_factory=list)


@dataclass
class Backtest:
    symbol: str
    bars: pd.DataFrame                       # OHLCV with DatetimeIndex (UTC)
    strategy: Strategy
    starting_cash: float = 10_000.0
    broker_config: BrokerConfig = field(default_factory=BrokerConfig)
    risk_config: RiskConfig = field(default_factory=RiskConfig)
    log_path: str | Path | None = None
    warmup_bars: int = 60

    def _check_stops(
        self, broker: PaperBroker, symbol: str, bar: pd.Series, ts: datetime
    ) -> Fill | None:
        """Intra-bar stop-loss / take-profit check using bar high/low."""
        pos = broker.portfolio.position(symbol)
        if pos.quantity <= 0:
            return None

        stop = pos.stop_loss
        tp = pos.take_profit
        bar_open = float(bar["open"])
        low = float(bar["low"])
        high = float(bar["high"])

        triggered: tuple[str, float] | None = None
        if stop is not None and low <= stop:
            # Gap-down: if bar opens below the stop, realistic fill is at bar_open
            # (worse than stop).  Otherwise the stop was touched intrabar → fill at stop.
            fill_price = min(stop, bar_open)
            triggered = ("stop_loss", fill_price)
        elif tp is not None and high >= tp:
            # Gap-up: if bar opens above TP, realistic fill is at bar_open (better than tp).
            # Otherwise TP was touched intrabar → fill at tp.
            fill_price = max(tp, bar_open)
            triggered = ("take_profit", fill_price)

        if triggered is None:
            return None

        reason, ref_price = triggered
        order = Order(
            symbol=symbol,
            side=Side.SELL,
            quantity=pos.quantity,
            order_type=OrderType.MARKET,
            reason=reason,
        )
        return broker.execute(order, bar_open=ref_price, bar_high=high, bar_low=low, ts=ts)

    def run(self) -> BacktestResult:
        if not isinstance(self.bars.index, pd.DatetimeIndex):
            raise ValueError("bars must have a DatetimeIndex")

        portfolio = Portfolio(cash=self.starting_cash)
        broker = PaperBroker(portfolio=portfolio, config=self.broker_config)
        risk = RiskManager(self.risk_config, starting_equity=self.starting_cash)
        logger = TradeLogger(self.log_path) if self.log_path else None

        fills: list[Fill] = []
        equity_points: list[tuple[datetime, float]] = []
        rejections: list[tuple[datetime, str]] = []
        entry_price_by_trade: list[tuple[float, float]] = []  # (entry_px, qty) fifo for pnl attribution
        trade_pnls: list[float] = []

        bars = self.bars
        for i in range(len(bars)):
            ts = bars.index[i].to_pydatetime()
            bar = bars.iloc[i]
            last_price = float(bar["close"])

            # 1. Mark-to-market + risk daily update
            equity_now = portfolio.equity({self.symbol: last_price})
            risk.on_bar(ts, equity_now)

            # 2. Intra-bar stop/take-profit check (using high/low of current bar)
            stop_fill = self._check_stops(broker, self.symbol, bar, ts)
            if stop_fill is not None:
                fills.append(stop_fill)
                risk.register_stop_out(self.symbol)
                if logger:
                    logger.write("fill", {"fill": stop_fill})
                # FIFO pnl
                remaining = stop_fill.quantity
                while remaining > 1e-12 and entry_price_by_trade:
                    ep, q = entry_price_by_trade[0]
                    take = min(q, remaining)
                    trade_pnls.append((stop_fill.price - ep) * take - stop_fill.fee * (take / stop_fill.quantity))
                    if take >= q - 1e-12:
                        entry_price_by_trade.pop(0)
                    else:
                        entry_price_by_trade[0] = (ep, q - take)
                    remaining -= take

            # 3. Strategy decision on bars up to and including t-1 (no lookahead of this bar's close for entries)
            if i < self.warmup_bars or i < 1:
                equity_points.append((ts, portfolio.equity({self.symbol: last_price})))
                continue

            history = bars.iloc[: i]  # bars up to previous bar (strict: avoids lookahead)
            ctx = StrategyContext(
                symbol=self.symbol,
                history=history,
                now=ts,
                last_price=float(history["close"].iloc[-1]),
                portfolio=portfolio,
            )
            signal, reason = self.strategy.decide(ctx)

            # 4. Translate signal to order, filled at this bar's open
            bar_open = float(bar["open"])
            bar_high = float(bar["high"])
            bar_low = float(bar["low"])

            if signal is Signal.LONG:
                qty = risk.size_long(equity_now, bar_open, stop_price=None)
                if qty > 0:
                    order = Order(
                        symbol=self.symbol,
                        side=Side.BUY,
                        quantity=qty,
                        order_type=OrderType.MARKET,
                        reason=f"{self.strategy.name}: {reason}",
                    )
                    decision = risk.evaluate(order, portfolio, equity_now, bar_open)
                    if decision.accepted and decision.order is not None:
                        try:
                            fill = broker.execute(decision.order, bar_open, bar_high, bar_low, ts)
                            fills.append(fill)
                            entry_price_by_trade.append((fill.price, fill.quantity))
                            risk.register_entry(self.symbol)
                            if logger:
                                logger.write("fill", {"fill": fill})
                        except OrderRejected as e:
                            rejections.append((ts, str(e)))
                            if logger:
                                logger.write("rejection", {"ts": ts, "reason": str(e)})
                    else:
                        rejections.append((ts, decision.reason))
                        if logger:
                            logger.write("rejection", {"ts": ts, "reason": decision.reason})
            elif signal is Signal.EXIT:
                pos_qty = portfolio.position(self.symbol).quantity
                if pos_qty > 0:
                    order = Order(
                        symbol=self.symbol,
                        side=Side.SELL,
                        quantity=pos_qty,
                        order_type=OrderType.MARKET,
                        reason=f"{self.strategy.name}: {reason}",
                    )
                    decision = risk.evaluate(order, portfolio, equity_now, bar_open)
                    if decision.accepted and decision.order is not None:
                        try:
                            fill = broker.execute(decision.order, bar_open, bar_high, bar_low, ts)
                            fills.append(fill)
                            remaining = fill.quantity
                            while remaining > 1e-12 and entry_price_by_trade:
                                ep, q = entry_price_by_trade[0]
                                take = min(q, remaining)
                                trade_pnls.append((fill.price - ep) * take - fill.fee * (take / fill.quantity))
                                if take >= q - 1e-12:
                                    entry_price_by_trade.pop(0)
                                else:
                                    entry_price_by_trade[0] = (ep, q - take)
                                remaining -= take
                            risk.register_exit(self.symbol)
                            if logger:
                                logger.write("fill", {"fill": fill})
                        except OrderRejected as e:
                            rejections.append((ts, str(e)))

            equity_points.append((ts, portfolio.equity({self.symbol: last_price})))

        if logger:
            logger.close()

        eq_index = [t for t, _ in equity_points]
        eq_values = [v for _, v in equity_points]
        equity = pd.Series(eq_values, index=pd.DatetimeIndex(eq_index), name="equity")
        summary = summarize(equity, trade_pnls)

        return BacktestResult(
            equity_curve=equity,
            fills=fills,
            trade_pnls=trade_pnls,
            summary=summary,
            rejections=rejections,
        )

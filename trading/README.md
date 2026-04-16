# apex-trader

Autonomous trading agent. Paper-trading first; no real capital until backtests and ≥2 weeks of live paper results justify it.

## Layout

```
src/apex_trader/
  models.py           Order, Fill, Position, Portfolio dataclasses
  data/binance.py     Public Binance klines (no auth)
  indicators/core.py  SMA, EMA, RSI, MACD, Bollinger, ATR
  strategy/           Strategy interface + baseline MA crossover
  risk/manager.py     Position sizing, stop-loss, drawdown cap
  broker/paper.py     Paper broker (cash, positions, slippage, fees)
  backtest/runner.py  Event-loop backtest engine
  backtest/metrics.py ROI, Sharpe, max DD, win rate, profit factor
  tradelog/           JSONL trade logger
scripts/run_backtest.py
tests/
```

## Quickstart

```bash
cd trading
pip install -e ".[dev]"
pytest
python scripts/run_backtest.py --symbol BTCUSDT --interval 1h --days 90
```

## Design principles

- **Paper first.** Every strategy goes through backtest → paper live → (only then) small-capital live.
- **Risk gate is non-negotiable.** Every order passes through `risk.manager` before the broker. Stop-loss and drawdown caps are hard rules.
- **Honest metrics.** Report max drawdown and Sharpe alongside ROI. Large returns with 40% DD are not "good."
- **Deterministic backtests.** No lookahead bias: strategies see bars up to `t`, act at `t+1` open (or close-of-bar fill).

## Roadmap

- v0 (this commit): end-to-end backtest with MA crossover baseline.
- v1: LLM decision agent (Claude) with structured JSON orders + risk gate.
- v2: Live paper trading loop against Binance WebSocket.
- v3: Stocks (Alpha Vantage), Polymarket, news/sentiment inputs.

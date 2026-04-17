# apex-trader

Autonomous trading agent. Paper-trading first; no real capital until backtests + ≥2 weeks of logged paper results justify it.

## Objective (v1)

- **Target:** 5–15%/month with strict drawdown control.
- **Max total drawdown:** ≤ 12% (kill-switch halts trading).
- **Risk per trade:** 0.5–2% of equity — hard cap at 2%.
- **Min R:R:** 2.0 — trades below this are rejected before they reach the broker.
- **Capital split:** 85% core (proven strategies) / 15% experimental (aggressive bets).

The "double capital in 30 days" framing from the initial spec was dropped — it drives overtrading, ignores tail risk, and consistently blows up real accounts.

## Layout

```
src/apex_trader/
  models.py              Order, Fill, Position, Portfolio
  data/binance.py        Public Binance klines (no auth)
  indicators/core.py     SMA, EMA, RSI, MACD, Bollinger, ATR
  strategy/              Strategy protocol + MA crossover baseline
  risk/manager.py        Position sizing, stop-loss, drawdown cap
  broker/paper.py        Paper broker (fees, slippage, long-only)
  backtest/              Event-loop backtest + metrics
  allocation/allocator.py   Core/experimental sleeve policy (85/15)
  phase/controller.py       Phase 1→2→3 risk-config progression
  agent/
    prompts.py           Frozen system/post-trade/scanner prompts
    llm.py               LLMClient protocol; AnthropicClient + MockLLM
    decision_agent.py    Strategy impl: LLM-driven JSON-schema'd orders
  scanner/
    base.py              Opportunity + OpportunityList + Scanner protocol
    rule_based.py        Rule-based scanner (LLM scanner next)
  postmortem/reviewer.py Post-trade review + JSONL learning log
  tradelog/logger.py     JSONL trade logger
scripts/run_backtest.py
tests/
```

## Architecture

```
Scanner  ──►  Decision Engine (LLM) ──►  Risk Gate ──►  Paper Broker ──►  Logger
   ▲                                                       │
   │                                                       ▼
   └──────────── Post-Mortem  ◄──── closed trades ◄── Portfolio
```

1. **Scanner** — ranks opportunities by expected value, R:R ≥ 2.0.
2. **Decision Engine** — Claude Opus 4.7 with the system prompt in `agent/prompts.py`, structured JSON output (`TradeProposal` Pydantic schema), adaptive thinking, `effort=high`. Pluggable `LLMClient` interface — swap in `MockLLM` for tests.
3. **Risk Gate** — `RiskManager.evaluate()` enforces position cap, risk-per-trade sizing, stop-loss defaults, daily DD, total DD kill-switch, gross exposure cap, min R:R.
4. **Execution** — `PaperBroker` fills at bar open with fees + slippage; intra-bar stop/TP checks use bar high/low.
5. **Post-Mortem** — on every close, `PostMortem.review(trade)` calls Claude with the trade record, returns a `TradeReview` (decision quality, signals right/wrong, sizing commentary, pattern, rule adjustment) and appends to `learning.jsonl`.
6. **Phase Controller** — three phases (Capital Protection → Edge Exploitation → Aggressive); progression gated on equity multiple + trade count + win rate. Regression back to Phase 1 if equity falls below the Phase 2 threshold.

## Quickstart

```bash
cd trading
pip install -e ".[dev]"
pytest                                      # 36 tests
python scripts/run_backtest.py --source synthetic --n-bars 500 --fast 10 --slow 30
# With the real LLM agent:
export ANTHROPIC_API_KEY=...
# (integration scripts for the agent land in the next commit)
```

## Safety principles

- **Paper first.** Every strategy: backtest → paper live → (only then) small-capital live.
- **Risk gate is non-negotiable.** Every order passes through `RiskManager` before the broker.
- **Honest metrics.** Report max DD and Sharpe alongside ROI — large returns with 40% DD are not "good."
- **Deterministic backtests.** Strict no-lookahead: at bar `t`, strategy sees `bars[0:t)`, fills at `t`'s open.
- **Kill-switch.** Total DD > 12% halts all trading. Daily DD > 3% halts for the day. No override.

## Roadmap

- [x] v0: end-to-end paper backtest with MA crossover baseline.
- [x] v1 (this commit): LLM decision agent + capital split + phase controller + post-mortem + scanner.
- [ ] v2: LLM scanner, live paper-trading loop against Binance WebSocket.
- [ ] v3: Stocks (Alpha Vantage), Polymarket, news/sentiment inputs.
- [ ] v4: Walk-forward + regime-tagged backtests.

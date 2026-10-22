# Adaptive Quant — overnight MVP

An evidence-driven market-intelligence research system with a **£10,000 paper fund**. It observes real market
data and investigates situations with two agents: a **Market Intelligence Scout** and a **Devil's Advocate**. It
gates every idea through a **deterministic risk engine** and opens *simulated* positions only when all conditions
pass. It closes positions on real subsequent prices and writes a post-trade lesson.

> **Experimental paper performance — not live trading results.** No real money, no exchange keys, no live orders.
> See [WHITEPAPER.md](WHITEPAPER.md) §22 for what the system does not claim.

(The repository also contains an unrelated, previously uploaded zip archive, which this project does not touch.)

## Quick start
```bash
pip install -r requirements.txt
cp .env.example .env            # optional: add ANTHROPIC_API_KEY to enable LLM agents
python scripts/smoke_live.py    # checks the real data providers are reachable from your network
python -m aq                    # dashboard + API at http://127.0.0.1:8000
python -m pytest tests -q       # 58 tests, fully offline
```
Requires Python ≥ 3.11 and outbound HTTPS to `api.exchange.coinbase.com`, `data-api.binance.vision` and
`api.frankfurter.app` (plus `api.anthropic.com` when the LLM is enabled).

## Dashboard
* **Trade** (Binance-style dark terminal) has:
  * a pair header with 24h change, high, low and volume;
  * a candlestick chart (5m / 1H / 1D) with volume, a crosshair and an OHLC readout;
  * paper-trade overlays: BUY/SELL entry markers, exit dots, and ENTRY/STOP/TARGET lines for open positions;
  * the live L2 order book;
  * a markets list with 24h change and an agent-activity feed for the pair;
  * the **AI Investigation** panel, where Binance has its buy/sell box, with a "Run Investigation" button and the
    latest Scout / Devil's Advocate / Risk Engine result;
  * Open Positions / Trade History / Investigations / System Log tabs.
* **Portfolio** (CoinMarketCap-style light) has:
  * the current balance with a 24h change chip and all-time profit;
  * best/worst performer and evidence-quality cards;
  * a **History** chart with 24h / 7d / 30d / 90d / All ranges and an **Allocation** donut;
  * the **Investment trend** by day (Day 1 £10,000 → Day N);
  * **Your Assets** (price, 24h %, holdings, average buy price, P/L), **Transactions**, and a comparison against
    BTC buy-and-hold and an SMA trend bot from the same fixed start.

Everything is rendered from stored records or live provider data. When data is missing the UI says so; the 24h
change, for example, shows "not enough history" for a fund younger than a day.

## Acceptance demo (the 12 steps)
| Step | Where |
|---|---|
| 1. Open the app | `python -m aq` → http://127.0.0.1:8000 |
| 2. Real prices | Trade page: pair header, candles, order book, markets list |
| 3. Run investigation | Trade → pick a market → **Run Investigation** |
| 4–6. Scout → Devil's Advocate → Risk Engine | Rendered as a five-step chain with every check |
| 7. TRADE / NO TRADE | Decision step + feed event |
| 8. Simulated position | Trade → *Open Positions*; chart shows ENTRY/STOP/TARGET; Portfolio → *Your Assets* |
| 9. Close on real data | Automatic: the monitor checks stop, target and horizon on real 5m candles. Manual: trade page → *Close at current market price* |
| 10–11. Post-trade review + lesson | Trade page → *What did we learn?*; Lessons tab |
| 12. Dashboard updates | Portfolio balance, history, investment trend, transactions, benchmarks |

The automated monitor (every 15 min) runs cheap deterministic filters first. It calls the agents only for
assets that trip a trigger, and applies a per-asset cooldown.

## Layout
```
aq/
  config.py            env-driven settings (risk, costs, monitor, LLM)
  data/                MarketDataProvider ABC, Coinbase, Binance, FX, fallback service, retrying HTTP client
  db/                  SQLite ledger + SQL migrations (PostgreSQL-portable)
  features.py          deterministic features, market regime, monitor triggers
  agents/              Scout, Devil's Advocate, typed schemas, LLM wrapper (no tools)
  risk.py              deterministic risk engine + trade plan
  execution.py         cost model: order-book slippage walk, short funding
  memory.py            experience memory: similar past trades at decision time (no lookahead)
  portfolio.py         paper positions, conservative exit evaluation, P/L
  learning.py          post-trade diagnosis, lessons, evidence accumulation
  analytics.py         sample-size-gated metrics, BTC buy-and-hold + SMA baselines
  engine.py            pipeline orchestration, monitor cycle, read models
  signals/base.py      SocialSignalProvider / NewsProvider interfaces (unavailable by default)
  api.py               FastAPI + scheduler
web/                   dashboard (vanilla JS, no build step)
tests/                 unit + integration tests (synthetic data lives in tests/ only)
docs/                  DATA_SOURCES.md, METHODOLOGY.md, ROADMAP.md
WHITEPAPER.md
```

## Agent engines
* **With `ANTHROPIC_API_KEY`**: Claude (`AQ_LLM_MODEL`, default `claude-opus-5-5`) interprets the deterministic
  features through schema-validated structured outputs. Invented evidence keys are stripped, parameters are
  clamped, and an LLM veto without concrete evidence is downgraded to MONITOR. The Devil's Advocate's
  deterministic checks always run as well.
* **Without a key**: the transparent rule engine `rules:v1` runs, and the UI labels it as such. It is a baseline
  hypothesis (momentum continuation with volume confirmation), not a claimed edge.

## Costs
* Market data: **free** (public keyless endpoints).
* LLM, rough estimate at Opus 5.5 list prices ($4 / $20 per million input / output tokens):
  * Scout call: ~5–8k input + 2–4k output tokens ≈ **$0.05–0.11**.
  * Devil's Advocate call (only when a trade is proposed) ≈ **$0.05–0.10**.
  * Post-trade narrative ≈ **$0.04–0.08**.
  * The monitor makes no LLM calls unless a deterministic trigger fires. With a 4h per-asset cooldown and at most
    2 investigations per run, the worst case is ~36 investigations/day (≈ $5–7); typical days are far lower.
* Use `AQ_LLM_MODEL=claude-sonnet-5-5` ($2 / $10) or raise trigger thresholds to cut costs.

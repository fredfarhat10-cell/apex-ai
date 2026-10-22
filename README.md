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
python -m pytest tests -q       # 54 tests, fully offline
```
Requires Python ≥ 3.11 and outbound HTTPS to `api.exchange.coinbase.com`, `data-api.binance.vision` and
`api.frankfurter.app` (plus `api.anthropic.com` when the LLM is enabled).

## Dashboard ("Arena")
The design follows the viral AI-trading-arena style: a dark terminal look, a scrolling live price ticker, and a big
account value. A **return race chart** puts the AI fund against BTC buy-and-hold and an SMA trend bot from the same
fixed start. Alongside it are a **leaderboard**, position cards with a stop↔target bar, **completed trades**, an
**Agent Chat** (Scout / Devil's Advocate / Risk Engine / Learning messages) and a **system log**. Every message,
line and number is a stored backend record. The ticker scrolls real quotes, and the monitor countdown is the real
scheduler time.

## Acceptance demo (the 12 steps)
| Step | Where |
|---|---|
| 1. Open the app | `python -m aq` → http://127.0.0.1:8000 |
| 2. Real prices | Ticker tape + positions (source and timestamps on each investigation) |
| 3. Run investigation | Arena → pick an asset chip → **▶ RUN** |
| 4–6. Scout → Devil's Advocate → Risk Engine | Rendered as a five-step chain with every check |
| 7. TRADE / NO TRADE | Decision step + feed event |
| 8. Simulated position | Arena → *Positions* cards |
| 9. Close on real data | Automatic: the monitor checks stop, target and horizon on real 5m candles. Manual: trade page → *Close at current market price* |
| 10–11. Post-trade review + lesson | Trade page → *What did we learn?*; Lessons tab |
| 12. Dashboard updates | Account value, race chart, leaderboard, agent chat |

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

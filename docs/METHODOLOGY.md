# Paper Fund Methodology

## Separation of concerns
| Layer | Stored in | What it holds |
|---|---|---|
| OBSERVATION | `market_observations` | spot price, last *closed* 1h candle, 72 context candles, features, FX, source, timestamps |
| INTERPRETATION | `investigations.scout_output_json` | Scout explanations, evidence keys (values attached deterministically) |
| PREDICTION | `investigations` | direction, horizon, confirm/invalidate conditions, Research Confidence |
| DECISION | `challenges`, `risk_evaluations`, `investigations.final_decision` | Devil's Advocate verdict, every risk check, final TRADE / NO_TRADE |
| OUTCOME | `trade_outcomes` | exit, P/L decomposition, MFE/MAE, the exact candles used |
| LEARNING | `lessons` | diagnosis, failure category, hypothesis tag, validation status, horizon follow-up |

Earlier records are never rewritten with later information. The one exception is that the outcome evaluation
updates `trade_outcomes.thesis_correct` and the lesson fields. Those belong to the OUTCOME and LEARNING layers.

## Anti-lookahead rules
1. Features use **closed** candles only (`closed_only()`); the still-forming bar is discarded.
2. The entry price is the provider's spot quote at decision time, not a later candle.
3. Exit evaluation uses only candles that **open at or after entry** and have closed. The bar containing the entry
   moment is excluded, because it contains pre-entry prices.
4. The SMA baseline decides the position for hour *t+1* from data at the close of hour *t*.
5. The horizon-end timing check runs only after the horizon has elapsed. It updates the *lesson*, never the
   original decision record.

## Execution assumptions (conservative)
* Stop and target touched in the same bar → **stop assumed first**.
* Bar opens beyond the stop (a gap) → fill at that bar's **open**, which is worse than the stop.
* Target fills **at** the target price; a favourable gap earns no extra credit.
* Time exit → the open of the first bar at or after expiry.
* Intrabar exits are timestamped at the bar's close (when the system could know it).
* There is a gap of up to 5 minutes between entry and the first fully post-entry 5m bar, which is not evaluated.

## Costs (configurable)
* **Fees**: `AQ_FEE_BPS_PER_SIDE` (default **10 bps**), applied to entry and exit notional. Retail Coinbase taker
  fees can be **40–120 bps** per side; raise this if that is your venue.
* **Slippage, from the order book**: at decision time the engine sizes a provisional position, fetches the live L2
  book (Coinbase, then Binance), and walks it for that notional on both the entry and the exit side. The VWAP vs mid
  (which includes half the spread) gives bps per side, with a floor of `AQ_MIN_SLIPPAGE_BPS_PER_SIDE` (2 bps).
  * The *entry-time* book is used for the exit estimate as well. Exit-time books are not available historically.
  * If the book is unavailable or too thin, the flat `AQ_SLIPPAGE_BPS_PER_SIDE` (10 bps) is used and labelled.
* **Short funding**: paper shorts are modelled as perpetual-futures shorts.
  * The latest Binance funding rate is held constant over the horizon.
  * Shorts pay when the rate is negative. When it is positive, the funding **income is ignored** (conservative).
  * Without funding data, `AQ_SHORT_BORROW_BPS_PER_DAY` (5 bps/day) is charged.
  * The funding cost reduces the planned net reward/risk and is charged for the actual holding time at exit.
* The exact cost model used is stored per trade (`paper_trades.costs_json`) and shown in the UI. Costs are always
  reported as *estimates*, separately from gross P/L.

## Experience memory
* At decision time the system retrieves past paper trades in the same direction whose outcome was known **before**
  the decision. Similarity is a scaled distance over `z_24h`, `volume_ratio_24h`, `rsi_14`, `vol_regime_ratio`,
  `dist_sma20_atr` and `rel_perf_vs_btc_24h_pct`, plus a penalty when the regime label differs.
* The Scout and Devil's Advocate see the summary; the snapshot is stored in `investigations.memory_json`.
* Memory carries challenge weight only with ≥ `AQ_MEMORY_MIN_SIMILAR` (5) similar trades. Then a negative
  expectancy becomes a *major* Devil's Advocate finding. Below that it is informational only. It never changes
  rules or parameters.

## Position sizing
`units = (equity × 0.5 %) / (|entry − stop| + entry × round-trip cost) × FX`, then capped so that total exposure
stays ≤ 30 % of equity. The risk figure therefore **includes** estimated costs. Reward/risk is also evaluated net
of costs.

## Mark-to-market and P/L
* Equity = starting capital + realised net P/L + unrealised P/L. Unrealised P/L is the move on open positions,
  converted at current FX, minus entry costs already incurred.
* P/L is converted at the FX rate at exit. A small FX effect on the notional is ignored.
* Daily loss = today's realised P/L + **all** open unrealised P/L. This is conservative.

## Benchmarks
* **BTC buy-and-hold** in GBP from the fund's first BTC observation (`fund.benchmark_start_at`). The start date is
  fixed automatically; there is no date picking.
* **SMA50 baseline**: long BTC when the hourly close is above the 50-hour SMA, otherwise cash. Costs are charged on
  each switch. It is reported as a USD price return (FX not applied); this is labelled in the UI.

## Sample-size gates
| Metric | Shown when |
|---|---|
| Win rate, profit factor, expectancy | always, but labelled "Insufficient sample size" below 20 closed trades |
| Sharpe / Sortino | ≥ 30 daily returns |
| Annualised return | ≥ 90 days of history |
| 7d / 30d return | the fund is older than the window |

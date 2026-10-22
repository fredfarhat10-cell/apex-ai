# Data Sources

Adaptive Quant uses only legitimate, public, documented market-data APIs. It does not scrape websites, does not
use fabricated responses and does not hard-code prices. When a source fails, the UI shows **"Data unavailable"**
and no analysis or trade is produced from missing data.

## Market data (OHLCV + spot)

| Order | Provider | Base URL | Key needed | Used for |
|---|---|---|---|---|
| 1 (primary) | Binance public market-data endpoint | `https://data-api.binance.vision` | No | exchangeInfo, klines, ticker, depth |
| 2 (fallback) | Coinbase Exchange public REST | `https://api.exchange.coinbase.com` | No | product list, candles, ticker, book, implied GBP/USD |

Both are wrapped behind the `MarketDataProvider` interface (`aq/data/base.py`), so another provider is one class.
The service (`aq/data/service.py`) tries providers in order per request and records which source served each
observation (`market_observations.data_source`, `paper_trades.data_source`).

### Why these two
* Both publish free, keyless OHLCV and ticker endpoints with documented formats.
* Coinbase quotes in **USD**, Binance in **USDT**. Adaptive Quant treats USDT ≈ USD when Binance is the fallback.
  This is a documented approximation; USDT has historically traded within a fraction of a percent of USD, but not
  always.
* CoinGecko was considered. Its free tier is rate-limited (on the order of tens of calls per minute), and its OHLC
  granularity is coarse for short horizons. It was not needed for a six-asset universe.

### Endpoints used
Coinbase ([docs](https://docs.cdp.coinbase.com/exchange/reference/exchangerestapi_getproductcandles)):
* `GET /products` — which `*-USD` products exist and are `online` (universe resolution)
* `GET /products/{id}/candles?granularity=3600|300&start&end` — `[time, low, high, open, close, volume]`, newest
  first, **max 300 rows per request** (the client pages automatically)
* `GET /products/{id}/ticker` — last trade price and time
* `BTC-USD` and `BTC-GBP` tickers → *implied* GBP/USD rate (sanity-bounded)
* `GET /products/{id}/book?level=2` — aggregated L2 order book, used for slippage estimates

Binance ([docs](https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints)):
* `GET /api/v3/exchangeInfo?symbol=XXXUSDT` — `status == TRADING`
* `GET /api/v3/klines` — max 1000 rows per request (paged)
* `GET /api/v3/ticker/price`
* `GET /api/v3/depth?limit=100` — L2 order book (fallback for slippage estimates)
* `GET https://fapi.binance.com/fapi/v1/premiumIndex?symbol=XXXUSDT` — latest perpetual funding rate per 8h,
  used to cost paper shorts. This is the public futures market-data host; no account is involved.

### Rate limits and handling
* Coinbase public endpoints allow roughly 10 requests/second per IP. Binance allows a request-weight budget of
  6000/minute per IP. Both limits change over time, so check the docs.
* The client throttles per host (≥ 100–200 ms between calls) and caches candles for 60 s and spot prices for 10 s.
* It retries `429`/`418`/`5xx` and connection errors with exponential backoff, honouring `Retry-After`.
* A **circuit breaker** marks a host down for 60 s after repeated failures, so a dead provider fails fast.
* Other `4xx` responses (for example an unknown symbol) are not retried.

### Universe
Configured with `AQ_UNIVERSE` (default `BTC,ETH,SOL,BNB,XRP,DOGE`). Any asset no reachable provider lists is
**removed automatically** and shown with its reason. For example, BNB is not listed on Coinbase, so it is served by
Binance when Binance is reachable, and removed otherwise.

## Real-time streaming (browser)
The dashboard's Trade page opens a WebSocket from the viewer's browser directly to the exchange that served the chart:
* Binance: `wss://data-stream.binance.vision/stream?streams=<sym>@ticker/<sym>@kline_<iv>/<sym>@depth20@100ms`
  (public market-data streams, no key).
* Coinbase (fallback source): `wss://ws-feed.exchange.coinbase.com`, `ticker` channel.

Ticks update the pair header, the forming candle and (Binance) the order book live. The page shows "LIVE" with
the time of the last tick, and falls back to polling the backend every 15 s if the stream drops. The backend
never trades on stream ticks; decisions still use closed candles and a fresh spot quote.

## FX (GBP/USD)
The fund is denominated in GBP; crypto prices are in USD. Sources, in order:
1. Coinbase implied rate: `BTC-USD / BTC-GBP`. This is a live market rate, refreshed every 60 s and shown in the UI
   with its source and timestamp.
2. [Frankfurter](https://www.frankfurter.app) — ECB reference rates. Free and keyless, but they update **once per
   business day**, so intraday FX moves are not captured.

If neither is available, no new trade can be opened (the risk engine's `market_data_available` check fails), and
the dashboard shows that open positions are valued at entry.

## Terms / licensing
Public market data from these APIs is used for **personal, non-commercial research and display**. Before any
commercial use or redistribution, review each provider's current terms:
* Coinbase: <https://www.coinbase.com/legal/user_agreement> and developer platform terms
* Binance: <https://www.binance.com/en/terms>
* Frankfurter / ECB reference rates: <https://www.frankfurter.app/docs/>

## News and social data — not implemented
* `NewsProvider` and `SocialSignalProvider` interfaces exist (`aq/signals/base.py`). Their default
  implementations return `available: false`; they never return placeholder items.
* Platform access restrictions to respect when implementing these:
  * **X/Twitter**: paid API tiers; scraping violates its terms.
  * **TikTok**: the Research API is restricted to approved academic researchers.
  * **Discord**: bots may only read servers they were invited to, with consent.
  * **Reddit**: the Data API has rate limits and commercial terms.
  * **YouTube Data API v3**: keyed quota (10,000 units/day by default) and the most practical starting point.
* All such text is untrusted input. See the security section of `WHITEPAPER.md`.

## Network requirements
The app needs outbound HTTPS to `api.exchange.coinbase.com`, `data-api.binance.vision`, `fapi.binance.com` and
`api.frankfurter.app`,
plus `api.anthropic.com` when the LLM is enabled. In a sandbox whose egress policy blocks these hosts, the app runs
but shows "Data unavailable" everywhere. That is the intended degraded mode.

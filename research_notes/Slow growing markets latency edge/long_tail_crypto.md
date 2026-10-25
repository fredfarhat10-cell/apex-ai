# Long-tail crypto venues as candidate markets for a "Polymarket latency-bot-style" edge (UK, spot only, as of Oct 2026)

Scope note: Research was run on 2026-10-25. Direct page fetches of arxiv.org and ethresear.ch failed (DNS blocked in the research environment), so academic figures below come from search-result abstracts and excerpts, not full-text reading. Treat exact numbers as "as reported in the abstract". Evidence labels used throughout: **Verified** (primary source / official doc, consistent across sources), **Strong evidence** (peer-reviewed or preprint academic work, or multiple consistent independent sources), **Anecdotal** (single press report, vendor blog, single example), **Speculative** (inference or projection), **Unknown**.

Context on the benchmark itself:
- Polymarket put dynamic taker fees on its 15-minute crypto up/down markets in early January 2026. It changed the documentation without a formal announcement. Reported maximum fee levels vary by outlet: 1.80%, about 3%, or 3.15%. Cointelegraph worked an example of about $1.56 on a 100-share trade at $0.50, just over 3% of the trade's value. [Strong evidence] — [TradingView/Cointelegraph](https://www.tradingview.com/news/cointelegraph:e59c32089094b:0-polymarket-quietly-introduces-taker-fees-on-15-minute-crypto-markets/); [Finance Magnates](https://www.financemagnates.com/cryptocurrency/polymarket-introduces-dynamic-fees-to-curb-latency-arbitrage-in-short-term-crypto-markets/); [KuCoin news](https://www.kucoin.com/news/flash/polymarket-introduces-taker-fees-for-15-minute-crypto-prediction-markets)
- Finance Magnates describes the mechanism the fees were aimed at. Bots exploited the small delay between Polymarket prices and spot prices on major exchanges, entering near 50/50 odds and exiting once prices converged. An on-chain analysis it cites found one unnamed wallet doing thousands of these trades in a single month with a very high success rate. [Anecdotal] — [Finance Magnates](https://www.financemagnates.com/cryptocurrency/polymarket-introduces-dynamic-fees-to-curb-latency-arbitrage-in-short-term-crypto-markets/)
- The specific wallet 0x8dxd and its reported $313 to ~$438k run did not appear in any source I found. [Unknown]. Lesson [Speculative]: the venue closed this edge with a fee change once it became public, about a year after these markets launched. Any edge found on a long-tail venue should be assumed to have a similar lifespan.

## 1. CEX-DEX arbitrage: who captures it, on Ethereum vs L2s vs Solana, and what is left for small players

### Takeaway
CEX-DEX and atomic DEX arbitrage are heavily concentrated, latency- and infrastructure-dominated industries on every major chain studied: Ethereum (searcher-builder vertical integration), Base and Optimism (spam and probabilistic probing), Arbitrum (first-come-first-served latency races, then Timeboost auctions) and Solana (Jito tips, about $1.58 average profit per arb). A 50-200ms retail operator is structurally behind on all of them. The academic evidence points to "not much left" for small players on established chains [Strong evidence].

### Cited Findings
**Ethereum L1**
- Wu, Sui, Thiery and Pai (arXiv 2507.13023, July 2025) studied 19 months of data (August 2023 to March 2025). They estimate that 19 major CEX-DEX searchers extracted **$233.8M** from **7,203,560** CEX-DEX arbitrages. [Strong evidence] — [arXiv abstract](https://arxiv.org/abs/2507.13023)
- The same paper finds increasing centralisation: **three searchers captured about three-quarters** of both volume and extracted value. [Strong evidence] — [arXiv](https://arxiv.org/abs/2507.13023)
- Searcher profitability "is tied to their integration level with block builders". The authors describe exclusive searcher-builder relationships. **Two of the three dominant builders vertically integrate their own CEX-DEX searchers**, and the profitability of integrated builders was previously underestimated. [Strong evidence] — [arXiv HTML v1](https://arxiv.org/html/2507.13023v1)
- CEX-DEX arbitrages often take less than 2% of block space but contribute more than 15% of total block value. [Strong evidence] — [arXiv HTML v1](https://arxiv.org/html/2507.13023v1)
- An earlier ethresear.ch empirical analysis reported one searcher (0xa69) holding **55.7%** market share and another (0x98) holding **20.23%** of CEX-DEX arbitrages. [Strong evidence; older, roughly 2023] — [ethresear.ch](https://ethresear.ch/t/empirical-analysis-of-cross-domain-cex-dex-arbitrage-on-ethereum/17620)
- A follow-up paper (arXiv 2601.00738, January 2026) models how proposed 1-second subslots would change CEX-DEX arbitrage on Ethereum. Faster blocks are a protocol direction that further favours low-latency players. [Strong evidence on existence; I did not read the findings] — [arXiv 2601.00738](https://arxiv.org/pdf/2601.00738)
- I could not retrieve the exact share of searcher revenue paid to builders/proposers. The full text was not fetchable. [Unknown] (see Gaps).

**Ethereum L2s (Base, Optimism, Arbitrum, ZKsync, Unichain)**
- In Q1 2025, cyclic arbitrage used about **51% of gas on Base** and **55% on Optimism**, but only about **7% on Arbitrum**. Only **6.3%** (Base) and **12%** (Optimism) of these transactions resulted in a successful trade, against **52.6%** on Arbitrum. The authors attribute this to Arbitrum's first-come-first-served ordering, "which turns MEV extraction into a latency race". [Strong evidence; AFT 2025 peer-reviewed] — [Dagstuhl LIPIcs AFT 2025](https://drops.dagstuhl.de/storage/00lipics/lipics-vol354-aft2025/LIPIcs.AFT.2025.28/LIPIcs.AFT.2025.28.pdf); [arXiv 2506.14768](https://arxiv.org/pdf/2506.14768)
- A study of five rollups (January to July 2025) finds that on Arbitrum and ZKsync, reverted transactions cluster at the very start of blocks, consistent with intense low-latency races. On Base and Optimism the reverts peak later in the block. [Strong evidence] — [arXiv 2506.01462](https://arxiv.org/html/2506.01462v3)
- On Base (June 2025 to February 2026), "probabilistic search" was about **23% of arbitrage activity but 95% of spam** and **20% of Base gas**. After Base changed its configuration, protocol revenue shifted toward successful arbitrages and away from spam. [Strong evidence, preprint] — [arXiv 2607.24172 / related](https://arxiv.org/pdf/2607.24172) (as summarised in search results; attribution to Wu and Öz per search excerpt)
- Arbitrum's Timeboost (an auctioned express lane) has an empirical study titled "The Express Lane to Spam and Centralization". I did not read the details. [Anecdotal on details; Strong on existence] — [arXiv 2509.22143](https://arxiv.org/pdf/2509.22143)
- A 2026 AFT paper ("To Wait or To Probe") models arbitrage competition on high-throughput chains. [Strong evidence on existence; findings not read] — [arXiv 2606.00720](https://arxiv.org/pdf/2606.00720)

**Solana**
- A Helius-hosted analysis of Jito's detection algorithm counts about **90.4M successful arbitrage transactions in a year**, totalling about **$142.8M** profit. The **average profit was $1.58 per arb**, and the largest single arb made $3.7M. [Strong evidence; vendor-hosted but data-based. The date window is "the past year" as of publication, roughly 2024] — [Helius Solana MEV report](https://www.helius.dev/blog/solana-mev-report)
- Jito tips grew from about 10% of priority fees (April 2023) to over 60% (early 2025). One post estimates that searchers typically pay **50-60% of expected profit as the Jito tip**. [Anecdotal for the 50-60% ratio; Strong-ish for the tip share trend] — [Gate.com Jito deep dive](https://www.gate.com/learn/articles/jito-s-role-in-solana-deep-dive/8724); [sanj.dev](https://sanj.dev/post/solana-mev-jito-deep-dive/)
- An RPC Fast blog says cumulative Jito searcher profits passed $480M by Q2 2026, at $30-50M a month. This is a vendor (RPC infrastructure seller) claim and unsourced. [Anecdotal] — [RPC Fast](https://rpcfast.com/blog/solana-mev)
- Vendor and analyst commentary says what separates consistent winners "is almost entirely infrastructure". It also says a typical 0.1-0.5% spread trade often nets little or nothing after fees, tips and slippage. [Anecdotal] — [RPC Fast arbitrage bot guide](https://rpcfast.com/blog/solana-arbitrage-bot-setup); [Extropy cross-chain analysis](https://academy.extropy.io/pages/articles/mev-crosschain-analysis-2025.html)
- Sandwich bots are estimated to have taken $370-500M from Solana users over 16 months, and a single program reportedly accounts for nearly half of Solana sandwiches. [Anecdotal] — [Business Model Analyst](https://businessmodelanalyst.com/the-400-million-mev-problem-how-solanas-block-production-became-a-competitive-sport/)

**Hyperliquid (on-chain order book)**
- An Arrakis lead-lag analysis (February 2026, 16-day window, **perps**) found Binance led every asset and **Hyperliquid lagged by about 700ms**. Lighter versus Binance was about 10x tighter, at around -100ms. [Anecdotal; vendor study, short window, perps not spot] — [Arrakis](https://arrakis.finance/blog/crypto-price-discovery)
- Crypto Briefing reports that Hyperliquid rolled out sub-millisecond matching in September 2026, cutting settlement latency by about 38%, with depth within ±1bp on major perps comparable to Binance. [Anecdotal; date-stamp inconsistencies on a repost] — [Crypto Briefing](https://cryptobriefing.com/hyperliquid-closes-execution-gap-centralized-exchanges/)
- In HIP-3 (builder-deployed) markets, each oracle update can move at most **1%** from the previous value, so the on-chain price diverges from the true price whenever the true price moves fast. That is structurally a stale-price design. However, HIP-3 markets are **perpetuals**, not spot. [Anecdotal; single research blog] — [Jsquare Research](https://medium.com/@Jsquare_co/jsquare-research-why-exotic-hip-3-markets-dont-work-87c268309db1)

### Inferences
- [Strong evidence → inference] On Ethereum L1 the edge sits inside the block-building supply chain (exclusive order flow, builder integration). A 50-200ms operator without builder relationships cannot win contested CEX-DEX arbs; it would be bidding against firms that are also the auctioneer.
- [Speculative] On Base and Optimism, cheap gas lets "spam and probe" strategies work, but the 6-12% success rates mean the rents go to sequencer fees, and Base has been tuning against spam. On Arbitrum, FCFS ordering and then Timeboost make it a pure latency or auction race. Neither suits a home-latency operator.
- [Strong evidence → inference] Solana's $1.58 average arb, with 50-60% paid as tips, means the industry runs on very high volume and very thin margins, with co-located RPC/validator infrastructure. Small operators can technically participate but are price-takers on tips.
- [Speculative] Hyperliquid's ~700ms lag to Binance is big by HFT standards, so a 50-200ms bot could in principle react inside it. But (a) the measurement is for perps, which UK retail can't legally use via a regulated route. The UK ban covers *retail* crypto derivatives sold by UK-authorised firms, so using an offshore perp DEX is a regulatory grey zone and not recommended. (b) Professional market makers quote on Hyperliquid and are already arbitraging that lag. (c) Hyperliquid spot pairs for long-tail tokens are thin, so fill sizes are small. Spot-on-Hyperliquid versus Binance-spot is a plausible niche, but there is no measured evidence of spreads.
- [Speculative] "Newer or less-served chains" (new L1s and new L2s in their first months) are the only places where the searcher landscape may not yet be consolidated. The window is likely weeks to months before professional searchers port their infrastructure. Thin liquidity also caps the absolute profit.

### Gaps
- Exact share of CEX-DEX searcher revenue paid to builders/proposers (the Wu et al. paper reportedly quantifies this, but the full text was not fetchable). Earlier public commentary (not verified here) has suggested a large majority of CEX-DEX profit is bid away to builders. Treat as [Unknown] until checked against the paper.
- No independent 2026 numbers on what share of Solana arb profit is captured by the top N searchers.
- No measured spot-spread data for Hyperliquid spot or HIP-3 versus Binance.
- No EigenPhi or Dune data was retrieved for small-chain (e.g. new L1, Sonic, Berachain, Monad, MegaETH) arbitrage competition. [Unknown]

## 2. Listing-announcement lag (Binance / Coinbase / Upbit) and listing snipers

### Takeaway
Listing announcements still move prices sharply, especially Upbit (Korean retail) announcements, and other venues reprice within seconds to about a minute. The fastest public bots in 2021 already reached about 0.1s. The more recent evidence on Binance says most of the premium is captured *before* the announcement (leaks, on-chain tells, rumour) and mean-reverts after. This is the closest long-tail analogue to the Polymarket stale-odds trade, but it is competitive, episodic and prone to "buy the peak" losses [Strong evidence on existence of effect; Anecdotal on residual profitability].

### Cited Findings
- An academic working paper (Blockchain Research Lab, 2019) covering **327 listings of 180 cryptocurrencies across 22 exchanges** found Binance listings had a positive listing-day CAAR of **14.7%**. Upbit was the only exchange among the significant results with a *negative* effect: 73% negative reactions in that sample. [Strong evidence; dated 2019] — [BRL working paper](https://www.blockchainresearchlab.org/wp-content/uploads/2019/10/Exploring-Market-Reactions-to-Exchange-Listings-of-Cryptocurrencies-BRL-working-paper3.pdf); [ResearchGate](https://www.researchgate.net/publication/335690724_Market_Reaction_to_Exchange_Listings_of_Cryptocurrencies)
- The Tie studied 14 tokens already listed on three or more major exchanges (2025-era). The **pre-listing run-up** is the primary price event, most of the premium has been captured by Day 0, and prices **mean-revert quickly** afterwards. [Anecdotal/industry research, small sample] — [The Tie](https://www.thetie.io/insights/what-a-binance-listing-delivers-for-already-listed-tokens)
- Recent Upbit examples. SIGN rose 60% on an Upbit listing despite a slow start on Binance (April 2025). [Anecdotal] — [CoinDesk](https://www.coindesk.com/business/2025/04/29/sign-rises-60-on-upbit-listing-despite-slow-start-on-binance). CAP token rose 34% **in one minute** on Upbit listing news. [Anecdotal] — [BigGo Finance](https://finance.biggo.com/news/e5663b55-0efb-49b8-9fd7-1cb7db04d3cd). One Upbit listing announcement moved 9 altcoins. [Anecdotal] — [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/upbit-listing-announcement-triggers-price-033217292.html)
- CoinMarketCap cautioned on a Bittensor move that "it is not possible to isolate whether these price movements are entirely attributable to the Upbit listing effect". [Anecdotal] — [CoinMarketCap](https://coinmarketcap.com/top-stories/6992cfd391e1aa08d1a1668b/)
- A listing-alert vendor claims a **+32.6% median 24h peak gain** across 62 Upbit listings since April 2026. The methodology is unverified, it is a *peak* measure (not entry-to-exit), and the source sells alerts. [Anecdotal / conflict of interest] — [cryptolisting.ws](https://cryptolisting.ws/upbit-listing-alert/)
- A 2024 ChainCatcher research report on listing effects measured performance at 1, 7 and 30 days, finding Binance and Upbit perform best in favourable, high-volatility markets. [Anecdotal/industry] — [ChainCatcher](https://www.chaincatcher.com/en/article/2175717)
- Open-source bots (2021) scanned Binance announcements and bought on Gate.io, because Gate often listed tokens before Binance. The author reported **~0.1s** as the fastest achievable reaction, above which Binance temporarily IP-banned the scraper. Buying at the listing peak was a recurring problem. [Anecdotal; dated] — [GitHub CyberPunkMetalHead](https://github.com/CyberPunkMetalHead/gateio-crypto-trading-bot-binance-announcements-new-coins); [cryptomaton](https://www.cryptomaton.org/2021/10/17/a-binance-and-gate-io-crypto-trading-bot-for-new-coin-announcements/)
- Leaks and insider front-running. RON gained more than 30% in the week *before* its Binance announcement and fell 18% in the hour *after*. On-chain data showed Binance preparing to receive the token, and Binance offered a $5M "snitch" bounty. A Coinbase director also flagged wallets buying minutes before Binance listings. [Strong evidence on existence of leakage; Anecdotal on frequency] — [FXStreet](https://www.fxstreet.com/amp/cryptocurrencies/news/binance-offers-5m-snitch-bounty-after-ron-token-listing-sparks-heated-debate-202402060943)
- Post-listing price declines have become more common ("buy the rumour, sell the news"), per 2025 coverage of the PUMP token. [Anecdotal] — [iTiger](https://www.itiger.com/news/2553209885)

### Inferences
- [Speculative, but well-grounded] The structure matches the Polymarket trade: a fast "source of truth" (Upbit/Binance/Coinbase announcement feed or API listing endpoint) and slower venues (DEX pools on the token's home chain, mid-tier CEXs like Gate/MEXC/Bitget, Hyperliquid spot) that reprice with a lag. The difference is that the event is *public*, high-salience and watched by many bots. Competition happens in the first 100ms-5s, where a 50-200ms operator with a fast announcement source (WebSocket/API rather than scraping) is not hopeless but is not the fastest either.
- [Speculative] The highest-value variant is Upbit/Bithumb KRW listings of tokens that already trade on DEXs or offshore CEXs. Korean retail demand is concentrated and slow-ish, and the token's home-chain DEX pool often reprices a beat later. Main risks: (1) adverse selection, since you are buying from faster bots at the top of the first spike; (2) reversals (the 2019 study found Upbit's average reaction negative); (3) DEX execution latency, slippage and gas priority auctions on the token's chain.
- [Speculative] Expected per-event P&L is lumpy. There are perhaps a few dozen tradeable Upbit/Binance/Coinbase spot listings a month, and liquidity in the lagging pools caps size, plausibly at four-figure to low five-figure notional per event for a careful operator. That is a niche, not a scalable business.
- [Speculative] Coinbase "roadmap" additions and Binance Alpha/futures-first listings create *multi-stage* signals. Each stage is a mini-event, but each is now widely tracked.

### Gaps
- No peer-reviewed 2024-2026 event study measuring *how fast* (in seconds) cross-venue gaps close after Upbit/Binance/Coinbase announcements. The available evidence is daily-horizon (1/7/30 day) or single-event anecdotes.
- No data on the number or profitability of listing-sniper bots in 2025-2026.
- Unknown whether Upbit/Binance announcement APIs are now rate-limited or delayed by geography (relevant for a UK-hosted bot).

## 3. Small or regional exchange vs large exchange price gaps (kimchi premium etc.) and UK access

### Takeaway
Persistent regional premia like the kimchi premium exist *because* capital controls and KYC block arbitrage, and those same barriers block a UK resident. In 2026 the BTC kimchi premium has been small (about -1.3% to +1%), far below the 2021-2022 peaks of about 20% [Strong evidence]. Gaps on small offshore exchanges are usually compensation for withdrawal friction and counterparty risk, not free money [Speculative but consistent with sources].

### Cited Findings
- In early September 2026, Upbit BTC traded **about 1% above Binance**, the longest positive streak since early May. [Anecdotal/press, citing exchange data] — [Digital Today](https://www.digitaltoday.co.kr/en/view/99036/kimchi-premium-reappears-as-bitcoin-surges-trades-1-percent-higher-on-upbit); [Bref Crypto](https://brefcrypto.com/en/bitcoin-south-korea-kimchi-premium-1-percent/)
- Earlier in 2026 a **reverse kimchi premium of -1.33%** was reported. [Anecdotal] — [BigGo Finance](https://finance.biggo.com/news/c212b68c-0f23-4752-9b08-958e17c12e54)
- A live tracker showed about **+0.00%** on 21 October 2026. [Anecdotal; tracker methodology unverified] — [KimpWatch](https://kimpwatch.dev/en); [Market Lens](https://www.market-lens.io/kimchi-premium)
- Historical peaks were **21.5% in 2022** and **20.8% on 19 May 2021**. [Strong evidence] — [Digital Today](https://www.digitaltoday.co.kr/en/view/99036/kimchi-premium-reappears-as-bitcoin-surges-trades-1-percent-higher-on-upbit); [Finance Research Letters via IDEAS/RePEc](https://ideas.repec.org/a/eee/finlet/v50y2022ics1544612322004056.html)
- Barriers to arbitrage. Korean FX law limits outbound transfers by residents, and Korean exchanges require a **real-name Korean bank account**, which effectively shuts out foreigners and non-residents. A 2022 study found most kimchi-premium profits were exploited by **foreign arbitrageurs** with access, i.e. well-connected firms. [Strong evidence] — [Finance Research Letters 2022 (RePEc)](https://ideas.repec.org/a/eee/finlet/v50y2022ics1544612322004056.html); [Bitcoin Foundation](https://bitcoinfoundation.org/news/bitcoin/bitcoins-kimchi-premium-is-back-is-south-korean-fomo-driving-btc-higher/)
- Transfers above KRW 10M to foreign VASPs or wallets reportedly face extra reporting, with further rules added in August 2026. [Anecdotal; rule text not verified] — [tokenfollow](https://tokenfollow.com/kimchi-premium-explained-why-korean-crypto-prices-are-higher)

### Inferences
- [Strong evidence → inference] A UK resident cannot open an Upbit/Bithumb KRW account, so they cannot run the classic kimchi arb directly. At most they can use Korean listing *announcements* as a signal (see section 2), which needs no Korean account.
- [Speculative] Similar regional premia (Turkey/TRY, Argentina, Nigeria, India) are also guarded by local KYC and banking rails. A UK resident would need local fiat accounts, which is typically impossible or legally risky.
- [Speculative] Gaps between Binance and small offshore CEXs (MEXC, Gate, LBank, XT, BitMart etc.) on long-tail tokens are often real but persistent *because* deposits/withdrawals are suspended, slow, or the network is congested. Inventory-based arbitrage (pre-funded balances on both venues, rebalancing occasionally) is the standard approach. It converts latency risk into counterparty risk on exchanges that are often on the FCA warning list.

### Gaps
- No academic quantification of 2025-2026 price gaps between top-tier and tier-3 offshore CEXs for long-tail tokens.
- No verified primary text of the August 2026 Korean transfer rules.

## 4. Memecoin and launchpad markets (pump.fun etc.): do most participants lose? Sniper/bundler dominance, rug rates

### Takeaway
Launchpad markets are retail-dominated and fast-growing, but they are adversarial rather than "slow". Most traders lose or barely profit, about 98.6% of pump.fun tokens show rug or pump-and-dump patterns (disputed by pump.fun), graduation rates are below 1%, and snipers and bundlers enter before ordinary buyers [Strong evidence on loss/rug rates; Anecdotal on sniper share]. The "fast source of truth" here is on-chain mempool and slot data, where Solana-native infra players dominate.

### Cited Findings
- Solidus Labs studied **7M+ tokens** launched on pump.fun (January 2024 to March 2025) and flagged **98.6%** as rug pulls or pump-and-dump patterns. Only about **97,000** ever kept more than $1,000 in liquidity. **93% of Raydium pools** showed soft-rug signs. **Pump.fun disputed the assessment.** [Strong evidence on scale, but a single source with a contested definition] — [Solidus Labs report](https://www.soliduslabs.com/reports/solana-rug-pulls-pump-dumps-crypto-compliance); [Bitget news summary](https://www.bitget.com/news/detail/12560604746174)
- Graduation (bonding-curve completion) rate was about **0.7-0.8%** of launches in July-August 2025, with a seven-day graduation rate around **0.26%** by mid-June. [Anecdotal/exchange education content] — [BloFin Academy](https://blofin.com/en/academy/education/solana/solana-memecoins-and-pump-fun-explained)
- March 2026 Dune dashboard (@oladee): **50.6%** of traders lost money and **45.6%** made profits *of up to $500*. The widely shared "96% lose" figure conflated losers with small winners. [Anecdotal, Dune dashboard; misreporting flagged] — [crypto.news](https://crypto.news/pump-fun-data-shows-49-of-march-traders-in-the-red-as-platform-locks-fees/); [CoinMarketCap](https://coinmarketcap.com/top-stories/69cac98635bc806ad6e55590/); [ourcryptotalk](https://ourcryptotalk.com/news/pump-fun-96-percent-traders-losing-money)
- A mid-2025 Dune dashboard showed more than **60%** of addresses had incurred losses. [Anecdotal] — [BeInCrypto](https://beincrypto.com/pump-fun-trading-data-majority-lose-money/)
- In one month, **250 token deployers extracted $79M** from traders. [Anecdotal, single outlet framing] — [CryptoRank](https://cryptorank.io/news/feed/0501b-over-50-pump-fun-traders-lose-money-as-launchers-extract-79m)
- January 2026 coverage: Pump.fun generates billions while about 97% of traders lose money. This likely uses the same conflated metric. [Anecdotal] — [CoinAlertNews](https://coinalertnews.com/news/2026/01/08/pump-fun-trader-losses-token-decline)
- Bonding-curve mechanics create rapid price surges in the first minutes, letting a few sniper bots and early buyers take most of the gains. Snipers, bundlers and priority-execution tools enter curves before ordinary buyers. [Anecdotal/qualitative] — [CryptoRank](https://cryptorank.io/news/feed/0501b-over-50-pump-fun-traders-lose-money-as-launchers-extract-79m); [BloFin](https://blofin.com/en/academy/education/solana/solana-memecoins-and-pump-fun-explained)
- A 2026 arXiv paper (6.4M Solana memecoins, 7 months) shows gradient boosting can flag rug pulls within 5 minutes of trading. A critique notes that class imbalance (rugs are the majority class) inflates headline accuracy. [Strong evidence (preprint) with caveats] — [arXiv 2608.20271](https://arxiv.org/html/2608.20271v1); [Pith review](https://pith.science/paper/2608.20271)
- Pump.fun captured about 80% of Solana memecoin launches at one point. [Anecdotal/press] — [TradingView/Cointelegraph](https://www.tradingview.com/news/cointelegraph:9c3a24b10094b:0-how-pump-fun-captured-80-of-solana-memecoins-and-can-it-last/)

### Inferences
- [Speculative] Launchpads are not a "lagging market with a faster source of truth". They are mostly a *negative-sum game against insiders* (deployers, bundlers, snipers). The analogue of a stale-price edge is the bonding-curve to AMM graduation transition and the price gaps between the pump.fun curve, PumpSwap/Raydium and aggregators, which professional Solana searchers already arbitrage (see the $1.58/arb Solana data).
- [Speculative] A possible non-latency niche is *defensive filtering*: using rug-prediction models to avoid losers and trading only graduated tokens with real liquidity. That is a statistical edge, not a latency edge, and the evidence it is profitable after fees is absent.
- [Speculative] With the UK spot-only constraint, memecoin trading is legal (spot), but CGT applies to every disposal, which creates heavy record-keeping load (see section 6).

### Gaps
- No reliable quantitative share of launches or volume captured by snipers/bundlers (the Pine Analytics report cited by Solidus was not located).
- No data on profitability distribution among *bot* wallets specifically.

## 5. Cross-chain price gaps; fees, transfer/withdrawal times, inventory and counterparty risk

### Takeaway
Cross-chain gaps exist (about 20bp average between ZKsync and other rollups, wider on Ethereum due to 12s blocks), but they are traded mainly with **pre-positioned inventory** (about 9s settlement) rather than bridges (about 242s). Profit depends on the ratio of transaction cost to trade size, so the strategy is capital-intensive and carries inventory and depreciation risk [Strong evidence]. CEX-side inventory adds exchange counterparty risk, which in the UK has no FSCS backstop [Strong evidence].

### Cited Findings
- In a cross-chain arbitrage study (arXiv 2501.17335), most trades used **pre-positioned inventory and settled in about 9 seconds**, while bridge-based trades took **about 242 seconds**. Key profitability drivers were opportunity frequency, bridge time and token depreciation. **67.63%** of cross-chain arbitrages do not use a bridge. [Strong evidence, preprint] — [arXiv 2501.17335 PDF](https://arxiv.org/pdf/2501.17335); [Pandora's Box HTML](https://arxiv.org/html/2501.17335v1)
- "Cross-Rollup MEV" (arXiv 2406.02172): the largest average price discrepancies, **about 20bp**, are between ZKsync and other rollups, linked to thin pools. Ethereum's ~12s blocks (versus 0.25-2s on rollups) widen gaps on the L1 side. [Strong evidence] — [arXiv 2406.02172](https://arxiv.org/pdf/2406.02172)
- Shared-sequencing work finds an arbitrageur does not always benefit from atomic execution. [Strong evidence on existence] — [arXiv 2410.11552](https://arxiv.org/html/2410.11552v3)
- "The Price of Interoperability" (ACM POMACS 2026) measures bridge latency, fees and value across chains, using daily aggregates. [Strong evidence] — [arXiv 2604.03083](https://arxiv.org/html/2604.03083); [ACM](https://dl.acm.org/doi/pdf/10.1145/3805650)
- A preprint argues that cross-chain arbitrage viability is governed by the transaction-cost-to-trade-size ratio, not absolute gaps. [Anecdotal/unreviewed] — [Pith 2609.17897](https://pith.science/paper/2609.17897)
- An empirical study of cross-chain transactions documents costs and inconsistencies. [Strong evidence on existence] — [ACM AsiaCCS 2025](https://dl.acm.org/doi/10.1145/3708821.3733878)
- Cryptoassets remain **outside FSCS protection** even under the incoming UK regime. [Anecdotal, single secondary source, consistent with FCA's long-standing position] — [IG](https://www.ig.com/uk/trading-strategies/uk-crypto-regulation-2026-what-investors-need-to-know-260616)

### Inferences
- [Speculative] For a small operator, an inventory model means splitting £X across, say, 3-5 venues and chains. Each pocket must be large enough that fixed costs (gas, CEX taker fees ~0.05-0.2%, slippage) are small relative to a ~20bp gap. That points to tens of thousands of pounds before the strategy is even fee-viable, and the inventory sits exposed to token price moves.
- [Speculative] Counterparty risk is the dominant tail risk on long-tail CEXs. Historical exchange failures and freezes (e.g. FTX in 2022) show that inventory held on an exchange can be lost entirely. Exchanges hosting the juiciest long-tail gaps tend to be offshore and on FCA warning lists. Withdrawal suspensions on specific tokens are often the *reason* a gap exists.
- [Speculative] Fees on Binance/Coinbase-grade venues (~0.1% retail taker) already eat most of a 10-20bp gap. Arb at small size works mainly where gaps are 1%+, which almost always means illiquid or transfer-blocked tokens.

### Gaps
- No systematic 2026 dataset found on CEX withdrawal times and suspension frequency for long-tail tokens.
- Current exchange fee schedules were not retrieved. The figures above are approximate background knowledge [Speculative].

## 6. UK legality and tax: spot trading on own account, offshore/unregistered exchanges, CGT and HFT tax treatment

### Takeaway
Spot trading crypto on one's own account is legal for a UK resident. Using an exchange that is not FCA-registered is not itself an offence for the customer, but it forfeits UK protections and puts the money with firms the FCA explicitly warns against [Strong evidence]. HMRC treats most individuals' crypto activity as CGT (share-pooling with same-day and 30-day rules). Very high-frequency activity risks being taxed as trading income, at income tax rates [Strong evidence]. From 1 January 2026, CARF reporting means UK exchanges report user transactions to HMRC [Strong evidence].

### Cited Findings
- The FCA warning list includes Huobi/HTX, KuCoin, Bybit and BitMEX among other crypto firms. One report says the FCA added 143 entities in one batch. [Strong evidence] — [CoinMarketCap Academy](https://coinmarketcap.com/academy/article/huobi-kucoin-bybit-and-bitmex-among-crypto-firms-in-uk-fcas-warning-list); [Blockchain Reporter](https://blockchainreporter.net/fca-expands-warning-list-adds-143-crypto-exchanges-as-uk-regulator-takes-action/)
- Bybit relaunched in the UK through an arrangement with **Archax** (FCA-authorised) acting as the financial-promotions approver. Bybit itself says it is not FCA authorised, regulated or registered. [Strong evidence] — [The Block](https://www.theblock.co/post/383291/bybit-relaunches-crypto-exchange-in-uk)
- OKX's UK status is **contested across sources**. One review says it is not FCA registered and was warning-listed in 2021. Another lists "Okcoin Europe Ltd (UK branch) 948407" as registered. A third says OKX uses an Archax promotions arrangement. [Conflicting / Unknown] — [ExchangeAtlas](https://exchangeatlas.io/guides/okx-review-2026/); [cryptolounge](https://cryptolounge.co.uk/best-crypto-exchanges-uk/fca-registered); [cryptoreview.co.uk](https://cryptoreview.co.uk/fca-regulated-crypto-exchanges). Check the FCA register directly.
- KuCoin has been on the FCA warning list since 2023. [Anecdotal, single source] — [ExchangeAtlas / cryptolounge](https://cryptolounge.co.uk/best-crypto-exchanges-uk/fca-registered)
- Current FCA crypto registration is **AML (MLR) registration only**, not full authorisation. [Strong evidence] — [cryptolounge](https://cryptolounge.co.uk/best-crypto-exchanges-uk/fca-registered)
- One investing guide gives the new regime's dates as regulations enacted 4 February 2026, authorisation gateway opening 30 September 2026, full regime from 25 October 2027, with unregistered platforms needing to apply by 28 February 2027. [Anecdotal; not confirmed against FCA/HMT primary] — [IG](https://www.ig.com/uk/trading-strategies/uk-crypto-regulation-2026-what-investors-need-to-know-260616)
- UK CARF: the Reporting Cryptoasset Service Providers Regulations 2025 took effect **1 January 2026**. UK providers collect user transaction and tax-residence data, the first report (calendar 2026) is due **31 May 2027**, and international exchange of data starts in 2027. Reported penalties conflict: £100-£5,000 per failure, versus £300 per user. [Strong evidence on regime; Conflicting on penalties] — [RPC Legal](https://www.rpclegal.com/thinking/tax-take/tracking-crypto-asset-tax-rules-in-2026-and-beyond/); [MHA](https://www.mha.co.uk/insights/hmrc-issues-new-reporting-guidelines-for-uk-crypto-asset-service-providers); [FStech](https://fstech.co.uk/fst/Carf_tax_reporting_regime_comes_into_force_in_the_uk.php)
- HMRC's Cryptoassets Manual says most individual investors pay **CGT**, and investing rarely amounts to trading. HMRC would usually argue trading (income tax) only where there are many transactions *and* a profit, applying the usual "badges of trade". [Strong evidence; secondary summaries of HMRC manual] — [Ross Martin](https://www.rossmartin.co.uk/private-client-a-estate-planning/capital-gains-tax/5429-how-are-bitcoin-cryptocurrencies-or-cryptoassets-taxed-in-the-uk-at-a-glance); [Hawsons](https://www.hawsons.co.uk/crypto-assets/)
- Share-pooling rules: the same-day rule, then the 30-day "bed and breakfast" rule (TCGA 1992 s106A), then the section 104 pool. Acquisitions within 30 days are matched earliest-first. [Verified, HMRC manual] — [HMRC CRYPTO22200](https://gov.uk/hmrc-internal-manuals/cryptoassets-manual/crypto22200); [HMRC CRYPTO22253](https://gov.uk/hmrc-internal-manuals/cryptoassets-manual/crypto22253)
- Every crypto-to-crypto swap is a disposal. A Dextools guide quotes **outdated** CGT rates (10%/20%), so beware secondary sites. [Anecdotal; outdated source flagged] — [Dextools](https://www.dextools.io/tutorials/crypto-tax-guide-uk-hmrc-2026)

### Inferences
- [Strong evidence from background knowledge; verify on GOV.UK] The CGT rates for individuals have been 18% (basic) and 24% (higher) since 30 October 2024, with a £3,000 annual exempt amount. If HMRC deems the activity trading (an automated bot doing thousands of trades for profit is a strong badge-of-trade fact pattern), profits fall under income tax (20/40/45%) plus Class 4 NIC, with losses treated differently. Running it through a UK limited company gives corporation tax treatment (19-25%). This needs a UK crypto tax adviser.
- [Speculative] A latency bot generates thousands of disposals, including every DEX swap and every stablecoin conversion. Same-day and 30-day matching across many tokens and venues is a real compliance burden and needs dedicated crypto tax software and complete exportable records, which offshore exchanges and DEXs do not always provide cleanly.
- [Speculative] Using an FCA-warning-listed exchange is not a criminal offence for a UK customer, but (a) the exchange may geoblock or offboard UK users without notice, (b) UK banks increasingly block payments to such exchanges, (c) there is no FOS/FSCS recourse, and (d) the exchange may be in breach of UK financial-promotion rules. DEX use (self-custody) is legal and avoids exchange counterparty risk, though smart-contract and bridge risk remain.
- [Speculative] The UK derivatives restriction (FCA ban on selling crypto derivatives/ETNs to retail, in force since January 2021; the ETN part was relaxed for professional and later some retail access in 2025) means Hyperliquid perps, HIP-3 markets and Polymarket-style binary contracts are off-limits or grey. Only spot venues are clean.

### Gaps
- No FCA primary source retrieved confirming the 2026 regime timetable.
- No HMRC guidance found specifically on automated or high-frequency crypto bots. Badges of trade would apply case by case.
- No clarity on whether a UK resident's use of a geoblocked offshore exchange via VPN has contractual or AML consequences (it typically breaches exchange terms of service, which risks frozen funds).

## 7. Realistic profit capacity for a small operator; documented examples; scoring of candidate venues

### Takeaway
I found no credible, documented example of a small UK-style operator sustainably profiting from latency arbitrage on long-tail crypto spot venues in 2025-2026. Public evidence shows concentration among a handful of professional searchers and builders, thin per-trade margins, and venues adding fees or auctions once an edge becomes visible (Polymarket January 2026, Arbitrum Timeboost, Base anti-spam config) [Strong evidence for concentration; Unknown for small-player P&L]. The least-bad candidates are event-driven (listing announcements) and new or underserved chains in their first months, each with capped capacity and short shelf life [Speculative].

### Cited Findings
- Ethereum CEX-DEX: $233.8M over 19 months to just 19 searchers, with the top 3 taking ~75%. [Strong evidence] — [arXiv 2507.13023](https://arxiv.org/abs/2507.13023)
- Solana: $142.8M over a year from 90.4M arbs, an average of $1.58 per arb. [Strong evidence] — [Helius](https://www.helius.dev/blog/solana-mev-report)
- Base cyclic arb: 6.3% success rate, with spam consuming a large share of gas. [Strong evidence] — [AFT 2025](https://drops.dagstuhl.de/storage/00lipics/lipics-vol354-aft2025/LIPIcs.AFT.2025.28/LIPIcs.AFT.2025.28.pdf)
- Hyperliquid lags Binance by about 700ms on perps. [Anecdotal] — [Arrakis](https://arrakis.finance/blog/crypto-price-discovery)
- Polymarket added dynamic taker fees once latency arb was identified. [Strong evidence] — [Finance Magnates](https://www.financemagnates.com/cryptocurrency/polymarket-introduces-dynamic-fees-to-curb-latency-arbitrage-in-short-term-crypto-markets/)
- Infrastructure, not logic, determines winners on Solana, and typical 0.1-0.5% spreads net little after costs. [Anecdotal] — [RPC Fast](https://rpcfast.com/blog/solana-arbitrage-bot-setup)

### Inferences
Scoring rubric [all scores Speculative, analyst judgement from the evidence above]. Scale 1 (poor) to 5 (good). "Lag edge" means how real and accessible the stale-price lag is for a 50-200ms operator. "Competition" means how *uncrowded* it is (5 = uncrowded). "UK/legal" means spot-legal with a clean venue. "Capacity" means profit ceiling. "Risk" means low tail risk (5 = low).

| Candidate | Lag edge | Competition | UK/legal | Capacity | Risk | Overall | Notes |
|---|---|---|---|---|---|---|---|
| Ethereum L1 CEX-DEX | 1 | 1 | 4 | 4 | 3 | **1.5** | Builder-integrated searchers dominate (Strong evidence) |
| Base/OP/Arbitrum DEX arb | 2 | 1 | 4 | 2 | 3 | **2** | Spam/probe or FCFS/Timeboost races (Strong evidence) |
| Solana DEX arb | 2 | 1 | 4 | 2 | 3 | **2** | $1.58/arb, tips 50-60% (Strong/Anecdotal) |
| New or underserved chains (first months after launch) | 3-4 | 3 | 4 | 1-2 | 2 | **3** | Window closes as pros arrive; thin liquidity (Speculative) |
| Hyperliquid spot vs Binance spot | 3 | 2 | 3 | 2 | 3 | **2.5** | 700ms lag measured on perps only; spot books thin (Speculative) |
| Listing-announcement reaction (Upbit/Binance/Coinbase → DEX / mid-tier CEX) | 4 | 2 | 4 (DEX) / 2 (offshore CEX) | 2 | 2 | **3** | Closest analogue to the Polymarket trade; lumpy, adverse selection, reversals (Strong on effect / Speculative on profit) |
| Kimchi or regional premium | 3 | 3 | 1 | 2 | 2 | **1.5** | UK resident cannot access KRW rails (Strong evidence) |
| Tier-3 offshore CEX vs Binance gaps | 3 | 3 | 2 | 2 | 1 | **2** | Gaps exist because withdrawals are blocked; FCA warning list, insolvency risk (Speculative) |
| Pump.fun / launchpad sniping | 2 | 1 | 4 | 2 | 1 | **1.5** | Insider and bundler dominated, ~98.6% rug-pattern tokens (Strong, contested) |
| Cross-chain (inventory-based) price gaps | 3 | 2 | 4 | 2 | 2 | **2.5** | ~20bp gaps, capital-intensive, cost/size ratio governs (Strong evidence) |

- [Speculative] Realistic capacity: for a solo operator with £10k-£100k, the plausible outcome on the best-scored candidates (listing reactions, new-chain arb) is low-thousands to low-tens-of-thousands of pounds a year *if* the system is good, with high variance and a meaningful probability of net loss after infrastructure, fees, adverse selection and tax. The "$313 → $438k" profile depended on a structurally mispriced venue (binary contracts priced off exchange data with a slow update) and is unlikely to repeat on spot venues where professional arbitrageurs already operate.
- [Speculative] The most transferable insight from the Polymarket case: look for venues where **prices are set by humans or slow oracles** rather than by arbitrage-connected order books. Examples are newly launched prediction-like or "event" spot tokens, HIP-3-style capped oracle markets (derivatives, so off-limits for UK retail), slow-moving long-tail AMM pools on newly launched chains, and Korean-retail-driven listing reactions. Each candidate should be validated with tick-level data before building.
- [Speculative] Recommended validation step: collect tick and announcement data for 4-8 weeks (Upbit/Binance/Coinbase announcement timestamps vs DEX pool prices on the token's chain; Binance spot vs Hyperliquid spot for overlapping tokens). Measure the time-to-convergence distribution and the realisable spread after fees at a given size before committing capital.

### Gaps
- No independent, verifiable P&L disclosures from small operators in any of these segments.
- No measured spot spreads for Hyperliquid spot vs Binance, or for new-chain DEX vs CEX in 2026.
- No seconds-level 2025-2026 study of post-listing cross-venue convergence speed.
- 0x8dxd wallet figures were not independently verified in this research.

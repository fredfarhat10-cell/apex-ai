# Wildcard Markets: Other Slow, Retail-Heavy, Growing Venues With a Possible "Stale Price vs Faster Truth" Edge (UK resident, as of 25 Oct 2026)

Scope note: this file excludes mainstream stocks/crypto, CS2 skins, tokenised stocks/collectibles, UK betting exchanges and long-tail crypto, which other researchers cover. Evidence labels used throughout: **[Verified]** (primary or official source, or several independent sources), **[Strong]** (credible secondary source), **[Anecdotal]** (forum, vendor blog, single interested party), **[Speculative]** (my inference), **[Unknown]**.

Method caveat: about 24 searches and fetches in one session. Two primary-source fetches failed with DNS errors (developer.octopus.energy, finance.yahoo.com), so some platform-policy points rest on secondary sources and are labelled that way. Where I rely on background knowledge I could not re-check this session, I put it under Inferences or Gaps and mark it "[Unverified this session]".

The 0x8dxd template has four parts. (1) A truth source that updates faster than the venue. (2) A venue that re-prices slowly, has no professional market maker and lets you fill at the stale price. (3) Volume that is growing. (4) Being early, before the venue fixes the lag. A key point for this whole scan: most non-financial retail markets have no tradeable binary contract that settles on the truth source. The "lag" there is a stale listing (a seller's asking price that has not caught up with news or comparable sales). Exploiting one means buying a physical or digital good, holding it and reselling it. That brings shipping, authentication, settlement and inventory risk that the Polymarket trade did not have. Scores below take this into account.

---

## Q1. Longlist: candidate markets and the evidence for each

### Takeaway
Of the 15 candidates screened, none reproduces the 0x8dxd structure cleanly: a binary contract on a slow venue that settles against a fast, public number, with automation allowed. The closest structural matches are UK-licensed exchange prediction products (outside my scope; see Q3) and the brand-new GPU-rental index futures (CME/Silicon Data). The futures are professional venues, though, not slow retail ones. The retail candidates that do have real stale-price lags (TCG singles, LEGO and watch event repricing, underpriced resale listings) are physical-goods trades with heavy friction and ToS limits on automation.

### Cited Findings

**1. Physical trading cards (Pokemon/MTG singles on Cardmarket, eBay UK, TCGplayer)**
- Truth source: free card-price APIs sync on a schedule and "can lag after rapid market moves". This is the vendor's description, not measured latency **[Anecdotal]** — [ScrapingBee](https://www.scrapingbee.com/blog/pokemon-card-api/)
- Card-data APIs have tight rate limits (e.g. 100 requests/hour on pokewallet.io), and past that limit "the only path forward is scraping the marketplaces directly" **[Anecdotal]** — [ScrapingBee](https://www.scrapingbee.com/blog/pokemon-card-api/)
- PSA holds about 67% of Pokemon grading and publishes population data daily. No source measures how fast prices react to population changes **[Anecdotal]** — [PokemonPriceTracker](https://www.pokemonpricetracker.com/blog/posts/pokemon-card-population-report-guide-rarity-analysis-2026)
- TCGplayer "Market Price" is calculated from completed transactions, so it lags by construction **[Strong]** — via [ScrapingBee summary of TCGplayer explainer](https://www.scrapingbee.com/blog/pokemon-card-api/)
- Competition: commercial auto-repricing tools already exist. TCG Sync reprices hourly or daily against TCGplayer and Cardmarket data; SortSwift starts at $15.99/month with eBay/CardTrader sync; TCG Automate (beta) reprices eBay/Shopify listings **[Strong]** — [TCG Sync](https://tcgsync.com/autopricing), [SortSwift](https://sortswift.com/pricing-automation), [TCG Automate](https://tcgautomate.com/docs/automatic-repricing)
- Cardmarket API access: a third-party guide describes OAuth access tokens and fetching listings and stock. No official current terms were confirmed **[Anecdotal]** — [Cardmarket API guide (Linktree)](https://linktr.ee/using_cardmarket_api)
- Spread between grades in a 5-card sample: PSA 10 was about 3.4x raw NM, PSA 9 about 1.0x. Tiny vendor sample **[Anecdotal]** — [Massive](https://www.joinmassive.com/blog/pokemon-card-market-data-2026)

**2. Sneakers/streetwear resale (StockX, GOAT)**
- The market is contracting after its boom. Nike raised production of hyped models, pushing values down; StockX and GOAT have diversified and consolidated **[Strong]** — [Business of Fashion](https://businessoffashion.com/articles/retail/the-sneaker-resale-market-is-broken/)
- Average StockX price return on 100+ releases was -7% in 2022 versus +23% in 2021 (Altan Insights) **[Strong, dated 2023]** — [Axios](https://www.axios.com/2023/02/22/sneakers-resale-price-drop)
- A March 2026 claim: GOAT launched Sneakers.com, an outlet selling general releases at $25-30, and Jordan Brand was down 16% in Nike's last fiscal year **[Anecdotal]** — [Shopenauer](https://www.shopenauer.com/en/news/the-end-of-the-sneakerhead-era-why-resale-no-longer-sells-and-what-is-saving-it)
- API: the StockX Public API v2 (catalog, live bid/ask, bulk listings, orders) is open only to approved Developer Program members. Unofficial ask-placing libraries exist, with ToS risk **[Strong]** — [API Evangelist](https://providers.apievangelist.com/providers/stockx/), [cyberoby/stockx.py](https://github.com/cyberoby/stockx.py)

**3. Luxury watches (Chrono24 vs WatchCharts and other grey-market indices)**
- WatchCharts Overall Market Index: May 2026 -1.4% (Rolex -2.2%, record new listings); June -0.1%; September 0.0% (Rolex -0.4%, 11 of 15 collections down) **[Verified - primary index publisher]** — [WatchCharts May](https://watchcharts.com/articles/p/9374), [June](https://watchcharts.com/articles/p/9418), [Sept](https://watchcharts.com/articles/p/9508)
- Context: Rolex gained +6.0% in calendar 2025 after eleven straight quarterly declines **[Strong]** — [WatchCharts](https://watchcharts.com/articles/p/9508)
- The asset-based-lending industry is reviewing watch collateral in mid-2026 (Hilco) **[Strong]** — [Hilco Global PDF](https://hilcoglobal.com/wp-content/uploads/2026/08/Collateral-In-Question-A-Mid-2026-Assessment-of-the-Luxury-Watch-Segment-for-Asset-Based-Lenders.pdf)
- Note: the "truth" index is itself built from dealer listings, so it is not faster than the venue. The real fast signal is brand news (e.g. Watches & Wonders discontinuations) **[Speculative]**

**4. Fine wine (Liv-ex) and whisky casks**
- Liv-ex 1000 fell 9.5% in the first 8 months of 2023 but was up about 24% over five years **[Strong, dated 2023]** — [Decanter](https://www.decanter.com/?p=511037)
- Opinion: the Liv-ex index peaked mid-to-late 2022, and casks lag by about 2 years **[Anecdotal]** — [Whiskey Wash](https://thewhiskeywash.com/whiskey-articles/the-safe-haven-lie-why-whiskey-casks-are-not-immune-to-the-real-world/)
- Casks are unregulated in the UK: sellers need no FCA authorisation, and Cask Whisky Ltd was ordered into liquidation in October 2024 **[Strong]** — [Vinetur, Aug 2026](https://www.vinetur.com/20260821105948/britain-still-leaves-whisky-cask-investors-outside-financial-regulation.html); there is a history of fraud and a City of London Police investigation **[Strong]** — [MFMac legal analysis, Mar 2025](https://www.mfmac.com/insights/food-drink/on-the-rocks-legal-safeguards-and-risks-in-whisky-cask-investment/)
- In July 2026 the ASA ruled against Capgroup Int (ex-London Cask Company) over misleading cask marketing **[Strong]** — [Whisky Monkeys](https://whiskymonkeys.com/en/news/uk-watchdog-cracks-down-on-whisky-cask-investment-firm-over-misleading-claims)
- The Scotch Whisky Association says casks have no regulated market **[Strong]** — [Which?](https://www.which.co.uk/news/article/be-wary-of-whisky-cask-investments-aU7k97S6hvTN)

**5. Music royalties (Royalty Exchange, SongVest)**
- Royalty Exchange self-reports $200M+ brokered across 2,000-2,500 deals and 30,000+ registered investors. AltStreet counts 2,460 completed transactions **[Anecdotal - self-reported]** — [Angel Investors Network](https://angelinvestorsnetwork.com/alternative-investments/music-royalty-investing-platforms-2026-royalty-exchange-songvest), [AltStreet](https://altstreet.investments/guides/songvest-vs-royalty-exchange)
- The format is a public auction of whole royalty streams. SongVest sells primary Reg A+ fractional issues at issuer-set prices, so it is not a continuous secondary market **[Strong]** — [AltStreet](https://altstreet.investments/guides/songvest-vs-royalty-exchange)
- The SEC qualified the sale of fractional shares in a hit song at $16 (Reg A) **[Strong]** — [Music Business Worldwide](https://musicbusinessworldwide.com/the-sec-just-green-lit-the-sale-of-shares-in-a-hit-song-and-fans-can-buy-them-for-16)

**6. Domain names (expired-domain drop-catching and auctions)**
- Drop-catching is a speed race at the moment of release. Contested names go to private auctions, and automation is essential **[Strong]** — [Media Options](https://mediaoptions.com/blog/the-competitive-world-of-drop-catching-expired-domains/)
- Registrars can sell expired customer domains before they go back to general availability (USENIX Security 2017) **[Verified - peer reviewed, dated]** — [Lauinger et al., USENIX 2017](https://usenix.org/conference/usenixsecurity17/technical-sessions/presentation/lauinger)
- Nominet called the .UK random-release model an "arms race" for high-value names (2020 consultation) **[Verified - primary, dated]** — [Nominet](https://nominet.uk/wp-content/uploads/2024/09/2020-.UK-Expiring-Domains-Consultation.pdf)
- DropCatch backorders start at $69 with the "highest success rate" (vendor-style comparison) **[Anecdotal]** — [NameSilo blog](https://www.namesilo.com/blog/en/backorders/backorders-expired-domains)

**7. GPU/compute rental (Vast.ai marketplace) and the new compute futures**
- Vast.ai H100: verified datacenter hosts about $1.50-2.27/hr (PCIe) and $1.80-2.50/hr (SXM) in July 2026; marketplace floor about $1.49/hr (Aug 2026) **[Anecdotal-Strong - third-party trackers that conflict]** — [Spheron](https://www.spheron.network/blog/vastai-pricing-2026/), [CloudZero](https://cloudzero.com/blog/h100-gpu-cost/), [IntuitionLabs](https://intuitionlabs.ai/articles/h100-rental-prices-cloud-comparison)
- SemiAnalysis H100 1-year contract index: about $1.70/hr (Oct 2025) to about $2.35/hr (Mar 2026); the spot market was tightening again by June 2026 **[Strong]** — [SemiAnalysis](https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity), [NextBigFuture](https://www.nextbigfuture.com/2026/06/live-rental-prices-for-h100-and-other-gpus-increasing.html)
- Compute futures: CME/Silicon Data H100 and B200 Rental Index futures were planned for launch on 5 Oct 2026, pending review. ICE/Ornn (OCPI index) and Nodal/Compute Desk were announced for 2026; ICE/NATIVX (COIL index) was announced July 2026 **[Strong - exchange announcements; actual go-live not confirmed]** — [Pulse2 on ICE/Ornn](https://pulse2.com/intercontinental-exchange-and-ornn-launching-suite-of-gpu-compute-futures-contracts/), [ICE IR](https://ir.theice.com/press/news-details/2026/ICE-and-NATIVX-to-Launch-Energy-Normalized-Compute-Futures-Contracts/default.aspx), [Markets Media on Nodal](https://www.marketsmedia.com/nodal-exchange-compute-desk-to-launch-compute-futures/), [FIA explainer](https://www.fia.org/marketvoice/articles/explainer-what-are-compute-futures-and-how-do-they-work)
- FIA explainer versions conflict on the first trade date (October vs November 2026) **[Unknown]** — [FIA](https://www.fia.org/fia/articles/explainer-what-are-compute-futures-and-how-do-they-work)

**8. Voluntary carbon credits (Toucan / KlimaDAO tokens)**
- The KlimaDAO project "faces challenges associated with market maturity and participant retention" (peer-reviewed, Oct 2024) **[Verified - academic]** — [Frontiers in Blockchain](https://www.frontiersin.org/journals/blockchain/articles/10.3389/fbloc.2024.1474540/epub)
- KLIMA at about $0.21, about $114K 24h volume, about $4M market cap; all-time low $0.1813 (May 2025). Snapshot date unclear **[Anecdotal]** — [Mobula](https://mobula.io/asset/klimadao)
- After Verra banned tokenising retired credits, BCT fell from $8.31 to about $2.14 **[Strong, dated ~2022]** — [Redd Monitor](https://reddmonitor.substack.com/p/verra-prohibits-tokenisation-of-retired), [Quantum Commodity Intelligence](https://www.qcintel.com/carbon/article/klima-price-falls-below-3-toucan-nct-at-deep-discount-6995.html)
- S&P reports BCT credits sold into Klima "despite no arbitrage", meaning the bridge-arb was already exhausted **[Strong]** — [S&P Global](https://www.spglobal.com/energy/en/news-research/latest-news/energy-transition/121421-bct-carbon-credits-issued-sold-into-klima-dao-in-dec-despite-no-arbitrage)

**9. UK domestic energy (Octopus Agile, NESO Demand Flexibility Service)**
- A 10 kWh GivEnergy battery on Agile reportedly made £487 from arbitrage in 2025, versus £214 from self-consumption (vendor case study) **[Anecdotal]** — [SurgePV](https://www.surgepv.com/blog/battery-arbitrage-vs-self-consumption)
- Octopus cut fixed Outgoing export from 15p to 12p/kWh; one live system averaged about 17p/kWh on Agile Outgoing **[Anecdotal]** — [Heatable](https://heatable.co.uk/battery-storage/advice/agile-outgoing-vs-fixed-export)
- Open-source automation is mature: a Home Assistant GivEnergy optimiser and Solis Agile Manager cover all Octopus smart tariffs **[Strong]** — [HA community](https://community.home-assistant.io/t/givenergy-tariff-optimiser-automated-octopus-agile-battery-scheduling-arbitrage-add-on/1021514), [GitHub solisagilemanager](https://github.com/webreaper/solisagilemanager)
- Warning that forced-discharge-then-recharge earns little once battery wear is counted **[Anecdotal]** — [FoxESS forum](https://foxesscommunity.com/viewtopic.php?p=7973)
- Saving Sessions run under NESO's DFS: 8 OctoPoints = 1p, about 24h notice, one reported session worth £2.02. In January 2025 Octopus complained households got £900/MWh while petrol stations got up to £5,570/MWh **[Strong - Octopus primary]** — [Octopus Saving Sessions](https://octopus.energy/saving-sessions/), [The Eco Experts](https://www.theecoexperts.co.uk/news/octopus-energy-neso-power-plants)
- Saving Sessions have "faded in 2026" (headline only) **[Anecdotal]** — [Household Money Saving](https://www.householdmoneysaving.com/?p=21619)

**10. Event tickets** — excluded on legal grounds; see Q3.

**11. Peer-to-peer lending secondary markets (UK)** — no evidence gathered this session **[Unknown]**; see Gaps.

**12. Other in-game economies (Roblox Limiteds, EVE PLEX)**
- Free Roblox limiteds sell out "within seconds" because of bots and "item snipers", which caused backlash **[Strong - community wiki]** — [Roblox Wiki](https://roblox.fandom.com/wiki/Limited_item)
- A third-party "Trade Bot Defender" extension blocks a list of 6,000+ known trade bots **[Anecdotal]** — [Chrome Web Store](https://chrome.google.com/webstore/detail/roblox-trade-bot-defender/ndamkiaclbnglafnkemaomabalakdmmm/reviews)
- Trading requires Premium and a verified account (2026); Rolimons is the de facto valuation source **[Anecdotal]** — [NoPing](https://noping.com/blog/how-to-trade-on-roblox), [Nitro blog](https://blog.nitropay.com/publisher-showcase-rolimons/)

**13. Spread betting on events (Spreadex / Sporting Index)**
- Spreadex is FCA-regulated (FRN 190941); one review says it has no API or algo support **[Strong]** — [Investing.co.uk](https://www.investing.co.uk/spreadex), [DayTrading.com](https://www.daytrading.com/spreadex-vs-fusion-markets)
- The CMA found the Spreadex-Sporting Index deal removed Spreadex's "only competitor in the sports spread betting market in the UK" and ordered a divestment. The sale is still pending **[Strong]** — [Gaming Intelligence](https://www.gamingintelligence.com/tag/spread-betting/)

**14. (Added) LEGO retirement / end-of-life repricing (BrickLink, eBay)**
- 826 sets, 16,200 BrickLink sales (6 months to Sep 2022): average sale price 54% above RRP, not annualised **[Strong, dated]** — [Bricknerd](https://bricknerd.com/home/investing-in-lego-gold-rush-or-fools-gold-12-1-22)
- Median estimated value +22.3% at 12 months after retirement and +41.0% at 24 months; about 1 in 5 sets showed no gain after a year **[Strong]** — [Brickfact EOL study](https://brickfact.com/blog/research/lego-eol-price-study)
- Counterexample: one set was still about 50% below RRP a year after retiring **[Anecdotal]** — [Brickpicker forum](https://www.brickpicker.com/forums/topic/4008-retiring-soon-open-speculation/page/570)
- After the X-Mansion sold out, early post-retirement asking prices included "FOMO" mark-ups that may not hold **[Strong]** — [Brick Fanatics](https://www.brickfanatics.com/retiring-lego-x-mansion-sells-out-prices-soar)

**15. (Added) Underpriced-listing sniping on second-hand marketplaces (Vinted, eBay UK)**
- Vendor claim: Vinted's new terms (effective 8 Oct 2026) ban resellers from unauthorised third-party apps and bots, including cross-listers. Detection has led to 24h suspensions, and "commercial selling" (buying to resell) on private accounts can mean a permanent ban **[Anecdotal - single interested vendor]** — [Crosslist](https://crosslist.com/blog/does-vinted-allow-resellers), [Crosslist discontinuing Vinted](https://crosslist.com/blog/vinted-cross-listing)
- Many Vinted scrapers are sold commercially, which shows existing bot competition **[Strong]** — [Apify Vinted scraper](https://apify.com/webdatalabs/vinted-scraper-pro), [dev.to 2026](https://dev.to/datakaz/vinted-scraper-how-to-extract-listing-data-automatically-in-2026-26kj)
- eBay API PlaceOffer addendum: the developer "will not provide or operate an automated sniping tool" (bidding on time remaining or on a schedule) **[Verified - primary eBay PDF]** — [eBay PlaceOffer addendum](https://developer.ebay.com/cms/files/placeoffer_api_license_addendum_uv_0.pdf); the Buy Offer API does support proxy bids up to a maximum **[Verified]** — [eBay Buy Offer API](https://developer.ebay.com/api-docs/buy/offer/resources/methods)

**16. (Added, overlaps excluded scope) UK prediction-style markets**
- Polymarket geoblocks UK IPs; Kalshi lists the UK as restricted; neither holds a Betting Intermediary licence **[Strong - multiple secondary sources]** — [Inside Predictions](https://insidepredictions.com/learn/prediction-markets-uk), [CCN](https://www.ccn.com/news/crypto/polymarket-kalshi-uk-fca-prediction-markets-push-back-gambling/)
- On 6 Oct 2026 the FCA confirmed talks with prediction-market operators, but no approval or framework. The retail binary options ban (since April 2019) still applies to financial contracts **[Strong]** — [CCN](https://www.ccn.com/news/crypto/polymarket-kalshi-uk-fca-prediction-markets-push-back-gambling/), [casino.com](https://www.casino.com/news/industry/fca-confirms-prediction-market-talks-as-kalshi-and-polymarket-eye-britain/)
- The Gambling Commission said in Feb 2026 that a GB prediction-market operator may need a betting intermediary licence and cannot classify itself as non-gambling **[Strong]** — [iPredicta](https://ipredicta.co/learn/the-uk-gambling-commission-s-view-on-prediction-markets/)
- Conflict: nextpredict.io claims an invite-only Polymarket UK beta since April 2026; other sources say it is blocked **[Unknown - unverified claim]** — [nextpredict.io](https://nextpredict.io/legal/uk/) vs [Inside Predictions](https://insidepredictions.com/learn/prediction-markets-uk)
- Matchbook Predictions launched in the UK in January 2026 on Matchbook's exchange infrastructure, with an API suite and pricing feeds for operators. Matchbook agreed to buy Betdaq in October 2026 **[Strong]** — [Good Money Guide](https://goodmoneyguide.com/trading/matchbook-prediction-markets/), [SBC News](https://sbcnews.co.uk/sportsbook/2026/10/14/matchbook-builds-on-prediction-markets-momentum-with-betdaq-takeover/), [Bloomberg Gov](https://news.bgov.com/securities-law/matchbook-to-launch-uk-prediction-markets-ahead-of-us-entry)

### Inferences
- **[Speculative]** The 0x8dxd edge needed a *contract settling on the fast truth*. Of all candidates, only Matchbook Predictions/Betfair-style exchange products (excluded scope, flagged for the betting-exchange researcher) and CME/ICE compute futures have that. Matchbook's January 2026 launch on a thin-liquidity exchange is the closest UK-legal analogue. If it lists short-horizon crypto or financial "up/down" style markets, that is the single most direct replication path. Note, though, that the FCA binary-options ban could stop Matchbook listing such financial markets for UK retail at all.
- **[Speculative]** For physical collectibles the fast truth is usually *information* (tournament results, reprint or set announcements, grading-pop jumps, LEGO retirement lists, Rolex discontinuations), not a price feed. The slow side is human-set asking prices on Cardmarket, eBay and Vinted. The edge is buying stale listings within minutes of news. Repricing tools that update hourly or daily (TCG Sync) leave that window open, but scraping/bot competition (Vinted scrapers, Roblox snipers) shows it is already contested.
- **[Speculative]** Octopus Agile is legally and technically the cleanest (public tariff data; Agile prices published day-ahead, per the brief). But it is *not a lag edge*: there is no counterparty pricing stale. It is deterministic optimisation, capped at roughly hundreds of pounds per battery per year (vendor figure £487 gross), and already commoditised by free open-source tools.
- **[Speculative]** Carbon tokens (about $114K daily KLIMA volume), music royalties (auctions with no continuous price), whisky casks (no price feed, fraud-heavy) and fine wine (Liv-ex is a B2B merchant exchange; prices fell from the 2022 peak) all fail criterion (3) "growing" or (2) "lets you fill fast", or both.
- **[Unverified this session]** EVE Online's EULA bans botting and real-money trading, and UK P2P lending secondary markets have largely closed to retail (several major platforms exited around 2020-2024). Both are probably dead ends, but neither was re-checked here.

### Gaps
- No measured latency (minutes or hours) between a news event and Cardmarket/eBay listing repricing was found for any collectible category. No academic price-efficiency study for TCG or LEGO secondary markets surfaced.
- Octopus developer API docs could not be fetched (DNS failure), so the publication time, auth requirement and rate limits for Agile prices are unconfirmed this session.
- Whether the CME Silicon Data H100 futures actually began trading on 5 Oct 2026 is unconfirmed, as is whether UK retail can reach them through UK brokers.
- No primary Vinted ToS text and no primary Roblox ToS clause on trade bots was retrieved.
- Chrono24 API and automation terms, Liv-ex 2026 index levels, and StockX Developer Program approval criteria were not found.
- P2P lending secondary markets (UK) were not researched; no sources.

---

## Q2. Scoring and shortlist (top 5)

### Takeaway
No candidate scores well on all four 0x8dxd criteria. The best realistic options for a UK solo founder are, in order: (1) TCG singles news-to-listing sniping on Cardmarket/eBay; (2) UK exchange prediction products such as Matchbook Predictions (flagged, excluded scope); (3) GPU spot-marketplace arbitrage plus the new compute-index futures (watch-list); (4) LEGO and watch event-driven repricing; (5) Octopus Agile home-battery automation, which is a low but near-certain yield rather than a lag edge. Expected profit capacity for any of these is likely £ thousands to low £ tens of thousands per year, not 0x8dxd-scale **[Speculative]**.

### Cited Findings
Scoring rubric (1 = poor, 5 = excellent). Columns: Truth = speed advantage of the truth source; Slow = how stale venue prices are and how easy it is to fill; Comp = absence of bots or pros; Growth = market growth 2024-26; Legal = UK legality plus ToS on automation; API = data and execution access; Friction = fees, shipping, settlement (5 = low); Capacity = realistic £ for a small operator. All scores are **[Speculative]** judgements grounded in the Q1 citations.

| # | Market | Truth | Slow | Comp | Growth | Legal | API | Friction | Capacity | Total /40 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | TCG singles (Cardmarket/eBay UK) vs set/reprint/tournament news and pop reports | 4 | 4 | 2 | 3 | 3 | 3 | 2 | 3 | **24** |
| 2 | UK exchange prediction products (Matchbook Predictions) — *excluded scope, flag only* | 4 | 3 | 3 | 4 | 4 | 3 | 4 | 2 | **27** |
| 3 | GPU spot rental (Vast.ai) and compute-index futures (CME/ICE) | 3 | 3 | 2 | 5 | 4 | 4 | 3 | 2 | **26** |
| 4 | LEGO retirement / watch discontinuation event repricing (BrickLink, eBay, Chrono24) | 3 | 3 | 2 | 2 | 4 | 2 | 2 | 2 | **20** |
| 5 | Octopus Agile + home battery + DFS (not a lag edge) | 2 | 1 | 4 | 3 | 5 | 5 | 3 | 1 | **24** |
| 6 | Underpriced-listing sniping on Vinted/eBay vs sold comps | 3 | 4 | 1 | 3 | 1 | 2 | 2 | 2 | 18 |
| 7 | Sneakers (StockX/GOAT) | 3 | 2 | 1 | 1 | 3 | 2 | 2 | 1 | 15 |
| 8 | Domain drop-catching / expired auctions | 2 | 2 | 1 | 2 | 4 | 3 | 3 | 2 | 19 |
| 9 | Roblox Limiteds | 3 | 3 | 1 | 3 | 1 | 2 | 4 | 1 | 18 |
| 10 | Luxury watches standalone (Chrono24 vs WatchCharts) | 1 | 2 | 3 | 2 | 4 | 2 | 1 | 2 | 17 |
| 11 | Music royalties (Royalty Exchange/SongVest) | 1 | 2 | 4 | 2 | 2 | 1 | 1 | 1 | 14 |
| 12 | Fine wine (Liv-ex) / whisky casks | 1 | 2 | 3 | 1 | 2 | 1 | 1 | 1 | 12 |
| 13 | Carbon tokens (Toucan/Klima) | 2 | 2 | 3 | 1 | 3 | 4 | 3 | 1 | 19 |
| 14 | Event spread betting (Spreadex) | 3 | 2 | 2 | 2 | 4 | 1 | 2 | 1 | 17 |
| 15 | Event tickets (bots) | — | — | — | — | **0 (criminal offence)** | — | — | — | Excluded |

Supporting evidence per shortlisted item:
- **#1 TCG singles**: repricers run only hourly or daily (TCG Sync), leaving a news-to-reprice window **[Strong]** — [TCG Sync](https://tcgsync.com/autopricing); price APIs lag on rapid moves **[Anecdotal]** — [ScrapingBee](https://www.scrapingbee.com/blog/pokemon-card-api/); PSA pop data updated daily **[Anecdotal]** — [PokemonPriceTracker](https://www.pokemonpricetracker.com/blog/posts/pokemon-card-population-report-guide-rarity-analysis-2026)
- **#2 Matchbook Predictions**: UK-licensed, launched Jan 2026, API suite for operators, consolidating with Betdaq **[Strong]** — [Good Money Guide](https://goodmoneyguide.com/trading/matchbook-prediction-markets/), [SBC News](https://sbcnews.co.uk/sportsbook/2026/10/14/matchbook-builds-on-prediction-markets-momentum-with-betdaq-takeover/)
- **#3 GPU**: Vast.ai prices vary widely by host tier and date (sources conflict) **[Anecdotal-Strong]** — [Spheron](https://www.spheron.network/blog/vastai-pricing-2026/); contract index rose about 38% Oct 2025 to Mar 2026 **[Strong]** — [SemiAnalysis](https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity); exchange-listed rental-index futures arriving in late 2026 **[Strong]** — [FIA](https://www.fia.org/marketvoice/articles/explainer-what-are-compute-futures-and-how-do-they-work)
- **#4 LEGO/watches**: median +22.3% at 12 months after retirement, but about 20% of sets flat or down **[Strong]** — [Brickfact](https://brickfact.com/blog/research/lego-eol-price-study); watch index flat to slightly negative mid-2026 **[Verified]** — [WatchCharts](https://watchcharts.com/articles/p/9508)
- **#5 Agile**: £487/yr gross arbitrage claim **[Anecdotal]** — [SurgePV](https://www.surgepv.com/blog/battery-arbitrage-vs-self-consumption); degradation erodes it **[Anecdotal]** — [FoxESS forum](https://foxesscommunity.com/viewtopic.php?p=7973)

### Inferences
- **[Speculative]** #2 scores highest on paper but sits in another researcher's scope. The report writer should cross-check it against the betting-exchange notes rather than double-count it.
- **[Speculative]** #3 (GPU) is the most "0x8dxd-like" growth story: a brand-new venue in late 2026 settling on daily indices built from spot listings. Early CME/ICE contracts may be thin and mispriced relative to intraday Vast.ai/Ornn spot moves after model releases or GPU launches. The counter-arguments: participants will be professional (data-centre operators, trading firms), and futures margin and UK broker access for a retail founder are unclear **[Unknown]**. A more retail-scale play is renting out or re-listing compute on Vast.ai when spot spikes, but that needs hardware or a reserved-capacity contract.
- **[Speculative]** #1 capacity is limited by physical turnover. Each card needs listing, shipping and possibly grading, so a solo operator might handle tens to low hundreds of trades a week; profits are likely £5k-£50k a year at best. The Cardmarket API's official terms on automated buying need checking before building.
- **[Speculative]** None of the top five offers the frictionless, instant cash settlement that made 0x8dxd's compounding from $313 possible. The physical candidates compound slowly because capital is tied up in inventory.

### Gaps
- No platform-level data on how quickly Cardmarket/eBay listings reprice after news; this would need a custom measurement (e.g. scraping listings around a known announcement).
- Matchbook Predictions market list (whether it has any short-horizon financial/crypto markets for UK users) not confirmed.
- UK retail broker access to CME Silicon Data futures, contract size and margin not found.

---

## Q3. UK legality, platform ToS on automation, and hard exclusions

### Takeaway
UK law flatly excludes ticket bots and US-style prediction markets (Polymarket/Kalshi are blocked; FCA bans retail binary options). Platform ToS are the binding constraint elsewhere: eBay prohibits API-based snipe tools, Vinted reportedly tightened anti-bot and anti-reseller terms in October 2026, StockX automation needs Developer Program approval, and Roblox bots are actively blocked. Energy-tariff automation and GPU marketplaces are the most automation-friendly.

### Cited Findings
- Polymarket blocks UK IPs; Kalshi restricts the UK **[Strong]** — [Inside Predictions](https://insidepredictions.com/learn/prediction-markets-uk), [hotminute](https://hotminute.co.uk/2026/06/03/wall-street-calls-them-prediction-markets-britain-calls-it-gambling/)
- FCA talks (6 Oct 2026) but no framework; retail binary options ban in force since April 2019 **[Strong]** — [CCN](https://www.ccn.com/news/crypto/polymarket-kalshi-uk-fca-prediction-markets-push-back-gambling/)
- Gambling Commission (Feb 2026): GB prediction-market operators may need a betting intermediary licence **[Strong]** — [iPredicta](https://ipredicta.co/learn/the-uk-gambling-commission-s-view-on-prediction-markets/)
- eBay PlaceOffer addendum bans automated sniping tools via the API **[Verified]** — [eBay PDF](https://developer.ebay.com/cms/files/placeoffer_api_license_addendum_uv_0.pdf); an eBay community post says third-party scheduled bids are accepted, which may be outdated **[Anecdotal]** — [eBay community](https://community.ebay.com/t5/Ask-a-Mentor/Using-Third-party-Snipe-software-in-an-EBAY-Auction/qaq-p/28481491)
- Vinted: bots and unauthorised apps banned for resellers; private accounts can't resell commercially; Pro accounts only in some European countries **[Anecdotal - vendor]** — [Crosslist](https://crosslist.com/blog/does-vinted-allow-resellers)
- StockX API limited to approved developers **[Strong]** — [API Evangelist](https://providers.apievangelist.com/providers/stockx/)
- Whisky casks are outside FCA regulation and have a history of fraud and liquidations **[Strong]** — [Vinetur](https://www.vinetur.com/20260821105948/britain-still-leaves-whisky-cask-investors-outside-financial-regulation.html), [MFMac](https://www.mfmac.com/insights/food-drink/on-the-rocks-legal-safeguards-and-risks-in-whisky-cask-investment/)
- Spreadex is FCA-regulated but offers no API **[Strong]** — [Investing.co.uk](https://www.investing.co.uk/spreadex), [DayTrading.com](https://www.daytrading.com/spreadex-vs-fusion-markets)

### Inferences
- **[Unverified this session]** Event tickets: under the Digital Economy Act 2017 s.106 and the Breaching of Limits on Ticket Sales Regulations 2018, using software to buy tickets beyond limits is an offence in the UK. Exclude (consistent with the brief).
- **[Speculative]** Resale-for-profit at scale creates trading-income tax obligations (HMRC "badges of trade") and possibly consumer-law duties as a trader. This applies to all physical-goods candidates and reduces net returns.
- **[Speculative]** Octopus Agile automation is explicitly supported by Octopus's own ecosystem and public data, so its ToS risk is lowest; GPU marketplaces like Vast.ai are API-first by design.

### Gaps
- Primary text of Roblox Terms of Use on automated trading, Vinted's 8 Oct 2026 terms, Cardmarket API terms and Chrono24 terms not retrieved.
- Whether a UK resident's use of a VPN for Polymarket would breach the Gambling Act or only the platform's ToS: not researched (and not recommended).

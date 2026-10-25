# B2B, Infrastructure and Regulation-Driven Niches Adjacent to AI Trading, Crypto and Prediction Markets (UK focus, as of 25 Oct 2026)

Evidence labels used throughout: **[Verified]** = primary source or multiple independent reputable sources; **[Strong]** = reputable secondary source (law firm, trade press) consistent with others; **[Anecdotal]** = single blog/vendor/forum/affiliate source; **[Speculative]** = my inference; **[Unknown]** = could not find.

Method note: 16 searches/fetches. Several direct fetches failed with DNS errors (fca.org.uk, leaprate.com, secprove.com), so FCA facts rest on law-firm and trade-press summaries rather than the FCA page itself. Searches were "US-only" web index, so UK small-vendor coverage is thinner than ideal. No pricing was found for Solidus Labs, Eventus, Chainalysis, Elliptic, Finspector or Sedric (all appear to be quote-based).

---

## 1. Guardrails / risk-gate middleware for retail AI trading agents

### Takeaway
Brokers have shipped coarse, account-level controls (sandboxed sub-accounts, kill switches, push notifications, IBKR's capped AI Partitions), but not fine-grained, policy-as-code enforcement (per-order caps, loss limits, instrument allow-lists, audit logs) outside the model. Big VC money is going into horizontal agent-security firewalls and into retail trading-agent apps, but I found no funded startup specifically doing broker-side trading-agent policy enforcement, only small vendor/open-source projects. The gap is real; whether retail users will pay for it is unproven.

### Cited Findings
- [Verified/Strong] Robinhood's agentic trading beta launched 27 May 2026 via an MCP endpoint; agent trading is restricted to a dedicated agentic account and every agent trade fires a push notification — [Vorp Labs](https://vorplabs.com/agent-tools/robinhood-cli); [The Planet Tools](https://theplanettools.ai/blog/robinhood-agentic-trading-credit-card-mcp-may-2026); [Creeta](https://news.creeta.com/en/robinhood-mcp-agentic-trading-credit-card-2026/)
- [Anecdotal] One Robinhood review argues the controls "limit blast radius rather than behavior": nothing stops the agent from making bad trades, it only caps how much money they can touch — [AlgoAlpha review](https://algoalpha.co/blog/robinhood-agentic-trading-review)
- [Anecdotal, conflicting] One guide says Robinhood's documented controls are only the account boundary, a trade-approvals setting, notifications and disconnect (no per-order or loss caps); another vendor guide lists a "hard per-agent budget cap" as something to confirm. Treat per-order/loss caps on Robinhood as unverified — [Vorp Labs](https://vorplabs.com/agent-tools/robinhood-cli); [SecProve](https://secprove.com/trading-agent-safety)
- [Strong] Interactive Brokers "AI Partitions": clients can allocate up to 10% of account equity, minimum $1,000 lifetime funding, maximum $25,000 across all AI Partitions, plus a kill switch in Client Portal — [IBKR Traders' Insight](https://www.interactivebrokers.com/campus/traders-insight/ibkr-toolbox/traders-toolbox-ai-order-placement-is-here/)
- [Anecdotal] eToro uses a budgeted sub-account per agent; Coinbase lets users pick main account or an isolated sandbox — [BrokerChampion](https://brokerchampion.com/ai-trading-agents-brokers)
- [Anecdotal] SecProve (security vendor) argues broker "safety kit" configs are advisory and a manipulated agent can ignore them; it pitches an open-source, still-in-development firewall enforcing policy between agent and broker. Could not fetch the page to check customers/pricing (DNS failure) — [SecProve](https://secprove.com/trading-agent-safety)
- [Anecdotal] FinOps-style "agent spend guardrails" content exists for LLM spend, showing the runtime-control pattern is a recognised category — [FinOps LLM](https://finopsllm.com/research/agent-spend-guardrails-production)
- [Strong] Catalyst raised a $30M Sequoia-led seed (Oct 2026) to build AI trading agents for retail investors, with a human required to approve each move — [Fortune](https://fortune.com/2026/10/08/sequoia-backed-catalyst-raises-30-million-build-ai-trading-agents-everyday-investors/); [Dealroom](https://dealroom.co/news/161249-catalyst-raises-30m-seed-to-put-ai-trading-agents-in-retail-investors-ha/)
- [Strong] Horizontal agent-security funding in 2026: AIR Security ($10M Sequoia seed + $40M Greenoaks; firewall vetting skills/plugins/MCP servers agents may call), Trent AI (€11M seed), General Analysis ($10M seed), Manifold ($8M seed; action tracking/anomaly detection) — [Gravity Q3 2026 tracker](https://gravity.fast/blog/ai-agent-funding-tracker-q3-2026/); [EU-Startups](https://www.eu-startups.com/2026/04/with-74-of-businesses-planning-agentic-ai-deployment-trent-ai-secures-e11-million-in-seed-funding/); [Tech Startups](https://techstartups.com/2026/04/29/general-analysis-raises-10m-in-seed-funding-to-secure-agentic-ai-against-real-world-attacks/); [iHLS](https://i-hls.com/archives/135449)
- [Anecdotal] A Medium article says MiFID II requires firms to be able to immediately cancel outstanding orders and halt a malfunctioning algorithm (this is the RTS 6 kill-switch concept; secondary source, not checked against text) — [Medium](https://medium.com/@Micheal-Lanham/can-an-ai-agent-legally-trade-stocks-in-2026-e44b0365323c)

### Inferences
- [Speculative] The founder's deterministic risk engine "the LLM cannot override" is almost exactly the missing layer (policy enforced outside the model). Fit with existing code: high.
- [Speculative] Retail willingness to pay is the weak point: brokers are giving coarse controls free, and Catalyst-style apps bundle approvals. A B2C £5-20/month guardrail is likely a sub-£300k business. A better wedge is B2B: selling the policy/audit layer to (a) small agent-app builders, (b) UK/EU brokers or CFD firms opening MCP endpoints who need RTS 6-style controls and Consumer Duty evidence, (c) trading communities running shared bots.
- [Speculative] Horizontal agent-firewall companies (AIR, Manifold) could add trading-specific rules, and brokers could ship per-order caps natively, squeezing a standalone tool. Moat must be domain depth (instrument-aware limits, cost/slippage-aware pre-trade checks, regulator-ready audit logs).
- [Speculative] Regulatory exposure: pure middleware that does not place orders or give advice is probably outside the FCA perimeter, but if it executes orders on behalf of users it could become arranging/managing. Needs legal check.
- Speed to first revenue: [Speculative] fast (weeks) for an open-source core + paid hosted audit log; slow for broker sales (6-12 month cycles).

### Gaps
- No pricing or customer evidence for SecProve or any trading-specific guardrail vendor (page unreachable).
- No data on how many users are actually connecting agents to Robinhood/eToro/Alpaca/Kraken MCP, or loss incidents driving demand.
- Not checked whether Alpaca or Kraken offer native per-order caps for agent keys.
- No UK broker found offering an MCP agent endpoint; IG/CMC/Freetrade status unknown.

---

## 2. Verified track-record / performance-audit services (traders, signal sellers, bots, AI agents)

### Takeaway
Incumbents are forex/MetaTrader-centric (Myfxbook), signal marketplaces (Collective2), or track-record-as-a-product with capital allocation (Darwinex Zero). Verification for crypto exchange accounts and for AI agents is poorly served in what I could find, and even incumbent "verified" badges are known to be gameable (deposits, chosen start dates). Regulation (FCA finfluencer crackdown, AI-trading scams) creates a reason for third-party verification, but buyer willingness to pay is mostly at low retail price points.

### Cited Findings
- [Strong] Myfxbook verification has two checks: track-record (history matches broker data via investor password) and trading privileges (proves control via a trade with a supplied comment) — [Myfxbook Help](https://www.myfxbook.com/help/?p=300)
- [Anecdotal] Myfxbook only works with MetaTrader (not cTrader, TradingView or proprietary platforms) — [BabyPips forum](https://forums.babypips.com/t/ways-to-recognize-fake-and-real-accounts-on-myfxbook/194062)
- [Anecdotal] Verified records can still mislead: "Gain" can be inflated by a tiny initial deposit then larger deposits; custom start dates let traders hide failures — [BabyPips forum](https://forums.babypips.com/t/a-guide-to-using-and-recognising-myfxbook-accounts/52656); [EarnForex forum](https://www.earnforex.com/forum/threads/ways-to-recognize-fake-and-real-accounts-on-myfxbook.33417/post-168107)
- [Anecdotal] Collective2 subscription range $20-$200/month with 14-day trial; supports stocks, options, futures, forex (undated third-party listing) — [NexusFi](https://nexusfi.com/d/education/collective2)
- [Anecdotal, dated 2023] Darwinex Zero: €95 sign-up fee and €38/month — [Darwinex blog](https://blog.darwinex.com/darwinex-zero-new-subscription-service-what-is-it-and-how-it-works)
- [Strong] Darwinex CEO describes Zero as selling certification of an auditable track record and argues it belongs outside any regulated perimeter — [Finance Magnates](https://financemagnates.com/executives/darwinex-zero-belongs-outside-any-regulated-perimeter-says-ceo)
- [Anecdotal, Aug 2026] Darwinex rating bar of 75 must be crossed before real capital allocation; 15% profit share (author has referral link) — [MQL5 blog](https://www.mql5.com/en/blogs/post/773634)
- [Anecdotal] FundSeeder was used historically to verify shared track records — [NexusFi thread](https://nexusfi.com/showthread.php?p=857916)
- [Strong] FCA finfluencer guidance is FG24/1 (26 Mar 2024); the FCA ramped up enforcement against illegal promotions in 2026; IOSCO ran a week-long, 17-regulator operation against unlawful online investment promotions in April 2026 — [Skadden, Oct 2026](https://www.skadden.com/insights/publications/2026/10/social-media-meets-financial-regulation); [Kennedys](https://www.kennedyslaw.com/en/thought-leadership/article/2026/the-rise-of-tech-driven-financial-crime/)

### Inferences
- [Speculative] Gap: exchange-API-based (read-only key) verification for crypto bots and AI agents, with deposit-adjusted (time-weighted) returns, mandatory full history, cost-realistic metrics and sample-size gating ("not enough trades to judge"). The founder's sample-size-gated analytics and lessons ledger map directly.
- [Speculative] Most valuable buyer is not the individual trader but the platform that needs to vet others: signal marketplaces, Telegram/Discord community operators, copy-trading platforms, small allocators and prop firms. B2B "verification API" pricing could be per-account-verified (£5-50/account/month) rather than consumer subscription.
- [Speculative] Regulatory caution: publishing rankings/leaderboards of strategies with performance could be a financial promotion or edge into advice if tied to "follow this"; issuing a "verified" badge for an unauthorised signal seller might enable the activity the FCA is targeting. Positioning as an audit/attestation (facts only, no recommendation) is safer.
- [Speculative] Size: likely a niche capped near the low end of the £300k-£5m range unless sold B2B; Myfxbook-style models monetise via ads/broker affiliation rather than verification fees.

### Gaps
- No current revenue/user figures for Myfxbook, Collective2, Darwinex Zero, Kinfo or Zignaly.
- Did not find any crypto-native or AI-agent track-record verification provider; absence of evidence in a US-centric index is not proof of absence.
- No direct evidence of buyers stating willingness to pay for verification.

---

## 3. Compliance tooling for UK crypto firms seeking FCA authorisation; finfluencer content compliance

### Takeaway
The regulatory clock is Verified: the FCA gateway opened 30 Sep 2026, firms should apply by 28 Feb 2027, regime live 25 Oct 2027, and existing MLR registrations do not convert. Final market-abuse rules (PS26/9, July 2026) require "proportionate" surveillance, with heavier on-chain monitoring only for large CATPs (>£10m revenue), explicitly allowing smaller firms to use regtech. This creates a time-boxed demand window for small-firm tooling. Large vendors exist for surveillance/AML; for financial-promotions/finfluencer review there are at least two AI vendors (Finspector, Sedric). The founder's assets fit only partially (surveillance analytics and audit logs yes; legal/compliance domain credibility no).

### Cited Findings
- [Strong, multiple law firms] FCA cryptoasset authorisation gateway opened 30 Sep 2026; firms intending to continue operating in the UK should apply by 28 Feb 2027; regime in force 25 Oct 2027 — [Davis Polk](https://www.davispolk.com/insights/client-update/fca-s-cryptoasset-authorisation-gateway-now-open); [Morrison Foerster](https://www.mofo.com/resources/insights/261012-uk-crypto-regulation-underway); [FCA press release (title)](https://www.fca.org.uk/news/press-releases/fca-opens-gateway-regulated-crypto)
- [Strong] Applications via FCA Connect for Part 4A permission; already-authorised firms apply for variation of permission — [Davis Polk](https://www.davispolk.com/insights/client-update/fca-s-cryptoasset-authorisation-gateway-now-open)
- [Strong] Existing MLR cryptoasset registrations do not convert automatically; firms applying within the window can keep operating while assessed (transitional) — [Farrer & Co](https://www.farrer.co.uk/news-and-insights/high-stakes-uk-cryptoasset-regulation/); [EisnerAmper](https://www.eisneramper.com/insights/cryptocurrency-insights/fca-cryptoasset-authorization-0926)
- [Strong] FCA offers pre-application support meetings and webinars — [Nominal](https://nominal.top/en/blog/fca-crypto-authorisation-gateway-opens); [MoFo](https://www.mofo.com/resources/insights/261012-uk-crypto-regulation-underway)
- [Strong] PS26/9 (22 July 2026) market-abuse regime for cryptoassets: CATPs and intermediaries must have effective, proportionate systems to prevent, detect and disrupt market abuse; order/transaction monitoring, PA dealing rules, information barriers, training, records, ability to sanction/off-board users — [Simmons & Simmons](https://www.simmons-simmons.com/en/publications/cmrvytdhw00e4uom8r2q9i3y7/ps-26-9-market-abuse-regime-for-cryptoassets); [Skadden](https://www.skadden.com/insights/publications/2026/04/crypto-admissions-disclosures-and-market-abuse-regime)
- [Strong] On-chain monitoring obligations apply to Large CATPs only (>£10m average annual revenue over three years); smaller CATPs need proportionate measures and may adopt regtech — [Simmons & Simmons](https://www.simmons-simmons.com/en/publications/cmrvytdhw00e4uom8r2q9i3y7/ps-26-9-market-abuse-regime-for-cryptoassets); [Hogan Lovells on CP25/41](https://www.hoganlovells.com/en/publications/key-takeaways-from-fca-consultation-paper-2541)
- [Strong] FCA has published guidance on how the new regime applies to crypto firms; tech providers and non-custodial/decentralised businesses must consider whether they are in scope — [FCA](https://www.fca.org.uk/news/press-releases/crypto-firms-get-guidance-how-new-regime-applies); [Farrer & Co](https://www.farrer.co.uk/news-and-insights/high-stakes-uk-cryptoasset-regulation/)
- [Strong] Finspector (Cambridge regtech) rebuilt its platform in March 2026 to review financial promotions across video, image and text, including TikTok/Instagram influencer posts, with audit trails; vendor claims "up to 99% approval-ready rate" (unverified) — [IT Brief UK](https://itbrief.co.uk/story/finspector-revamps-ai-to-police-finfluencer-promos); [Finspector](https://www.finspector.ai/financial-promotions-compliance)
- [Anecdotal] Sedric.ai markets influencer/finfluencer compliance covering FCA, SEC, FINRA — [Sedric](https://www.sedric.ai/blog/influencer-compliance)
- [Strong] UK has no finfluencer-specific statute; regulated under existing financial-promotion regime with FG24/1 — [Skadden](https://www.skadden.com/insights/publications/2026/10/social-media-meets-financial-regulation)
- [Anecdotal] StarCompliance (employee/PA-dealing compliance) is writing about the UK crypto overhaul, indicating incumbents are targeting this market — [StarCompliance](https://www.starcompliance.com/the-uks-2025-crypto-regulatory-overhaul/)
- [Unknown] Pricing for Solidus Labs, Eventus, Chainalysis, Elliptic, Finspector, Sedric — not found; all appear quote-based.
- [Unknown] Number of firms expected to apply to the gateway; FCA press page could not be fetched.

### Inferences
- [Speculative] The cleanest founder-fit wedge is "proportionate market-abuse surveillance for small CATPs/brokers" (wash trading, spoofing, pump detection, insider patterns around listings) as a hosted service priced well below enterprise surveillance (e.g. £1-4k/month vs enterprise six figures). Buyers: the tail of UK crypto firms below £10m revenue. The founder's live data ingestion, deterministic rules engine and audit logging are relevant; but credibility with compliance officers and FCA expectations (alert tuning, case management, STOR workflows) is a big build.
- [Speculative] Time-boxed demand: firms need evidence of systems at application (by Feb 2027) and operating by Oct 2027. Selling into a deadline is good for speed but the window is short and many small firms may exit rather than apply (registered MLR firm count historically small; firms may apply via larger groups).
- [Speculative] Finfluencer/financial-promotion review: an LLM-based review tool is easy to build, but Finspector, Sedric and large regtech already compete; pure-software differentiation is weak. A narrower angle is "pre-publication checks for crypto/trading content creators and their sponsoring brokers" or "s21 approver workflow support", but this sells to compliance teams, not creators, and creators largely won't pay.
- [Speculative] Regulatory exposure for the vendor itself is low (tooling, not regulated activity), but liability/reputation risk if tool misses issues; needs PI insurance and clear "decision support" framing.

### Gaps
- No count of UK crypto firms likely to apply, nor of small CATPs below the £10m threshold.
- No pricing for any surveillance or financial-promotion review vendor.
- Could not verify any smaller UK crypto-compliance regtech competitors (e.g. surveillance-as-a-service for small firms) — searched but not surfaced.
- Did not research Consumer Duty evidence tooling or record-keeping tools specifically.

---

## 4. Strategy validation / backtest-audit service (lookahead, leakage, overfitting, cost realism)

### Takeaway
This niche is already being commoditised from below: open-source Python/npm packages (vetted, canli-validation-mcp) and hosted MCP validators (AlphaAssay) implement deflated Sharpe, PBO/CSCV, purged CV and look-ahead checks, while freelancers sell one-off verdicts for $75-$450. I found no established audit firm. Demand at higher price points (prop firms, small funds, allocators) is plausible but unevidenced.

### Cited Findings
- [Anecdotal] Upwork freelancer sells backtest verdict (deflated Sharpe, permutation test, purged k-fold CV; "real edge / borderline / overfit") at $75-$450 tiers; seller claims J.P. Morgan background — [Upwork](https://www.upwork.com/services/product/development-it-a-clear-verdict-is-your-trading-backtest-a-real-edge-or-overfit-noise-2062266493605952387)
- [Anecdotal] AlphaAssay: hosted MCP service for strategy/backtest validation (deflated Sharpe, out-of-sample, look-ahead/leakage checks), returning pass/conditional/fail/insufficient_evidence with provenance hashes; positioned as methodology audit, not advice — [mcpservers.org](https://mcpservers.org/fr/servers/alphaassay/mcp); [Glama](https://glama.ai/mcp/servers/gyin7gtm5z)
- [Anecdotal] canli-validation-mcp: free MIT npm package with deflated Sharpe, CSCV PBO, Hansen's SPA, White's Reality Check, Romano-Wolf, minimum track record length — [Socket](https://socket.dev/npm/package/canli-validation-mcp)
- [Anecdotal] vetted: open-source Python package with statistics checked against reference implementations — [PyPI](https://pypi.org/project/vetted/)
- [Strong, educational] Trading Strategy docs summarise CSCV, DSR, PBO and note Sharpe t-stats near 3.0 rather than 1.96 are needed to claim an edge — [TradingStrategy.ai](https://tradingstrategy.ai/docs/learn/backtesting.html)
- [Unknown] QuantConnect, Composer, Trade Ideas pricing/features in this context were not researched in this pass.

### Inferences
- [Speculative] As a standalone service for retail quants, this is a low-ticket, crowded niche, likely <£300k/yr. The statistical checks are free; the defensible value is (a) cost/slippage realism with venue-specific fee models, (b) leakage detection that requires reading the user's code/data pipeline, and (c) a signed attestation a third party trusts.
- [Speculative] Combining this with Niche 2 (verified live track record) is stronger: "backtest audit + live paper/real forward test with verified record" for prop firms or allocators deciding whom to fund. The founder's paper fund with realistic costs and sample-size gating is directly reusable.
- Speed to first revenue: [Speculative] fast (Upwork/Fiverr-style audits within weeks), but this is consulting income, not scalable.

### Gaps
- No evidence of prop firms or small funds paying for third-party backtest audits.
- No data on AlphaAssay traction or pricing.

---

## 5. White-label research desks / risk engines for small crypto funds, prop firms, communities, newsletter operators

### Takeaway
The retail prop-firm tech stack is an established B2B market with priced white-label vendors (Match-Trader from $2.5k/month; HashCodex from $15k one-off; risk engines quoted at $20k-$150k by one vendor). Risk/rule-monitoring engines are a recognised line item. A solo founder can compete only in a narrow sub-niche (e.g. crypto or prediction-market prop, or risk analytics plug-in), not as a full stack.

### Cited Findings
- [Anecdotal] Trade Tech Solutions claims to power 70+ prop firms with CRM, payouts and risk tech for CFD, futures, crypto and sports prop firms — [NexusFi listing](https://nexusfi.com/d/b2b-services/trade-tech-solutions/)
- [Anecdotal] Match-Trader white label: Basic from $2,500/month, Turnkey from $4,000/month, server licence from $5,000/month (FundedTrading guide, mid-Aug 2026) — [FundedTrading](https://fundedtrading.com/es/best-white-label-prop-trading-firm-providers/)
- [Anecdotal] FPFX Tech described as among the most established prop tech vendors; pricing demo/quote-based — [FundedTrading](https://fundedtrading.com/tech-provider/fpfx/)
- [Anecdotal] HashCodex listed from $15,000 one-time — [Capterra](https://www.capterra.com/p/10046831/HashCodex/)
- [Anecdotal, vendor] Track360 buyer's guide puts a risk management engine at $20K-$150K — [Track360](https://www.track360.io/blog/prop-firm-software-buyer-guide-2026)
- [Anecdotal, vendor] Soft-FX claims white label launch in weeks vs 12-24 months to build in-house — [Soft-FX](https://www.soft-fx.com/solutions/prop-trading/)
- [Anecdotal] YourPropFirm and others integrate with MT4/MT5, cTrader, DXtrade, Match-Trader, TradeLocker, Rithmic, NinjaTrader etc. — [Track360](https://www.track360.io/blog/prop-firm-software-buyer-guide-2026)

### Inferences
- [Speculative] Plausible sub-niches for the founder: (a) "risk co-pilot" plug-in that monitors funded accounts for rule breaches, copy-trading/hedging abuse, and toxic flow (prop firms' main P&L risk), sold per-account; (b) an "LLM research desk" white-labelled for newsletter/community operators. (b) carries FCA perimeter risk (investment advice/financial promotion) if outputs are recommendations sent to UK retail.
- [Speculative] Selling to small crypto funds: small market in UK, long sales cycles, high trust bar; weak fit for solo founder.

### Gaps
- No independent comparison of prop risk engines; no evidence on what prop firms pay specifically for anti-abuse/risk analytics add-ons.
- Did not find any white-label AI research desk vendors or pricing.

---

## 6. Prop-firm (funded trader) ecosystem: size, shakeout, risk-rule tools

### Takeaway
The prop-firm count is shrinking (80-100 closures in 2024-25; further 2026 closures tied to platform access and broker exits) while leaders consolidate. Market-size figures conflict and come from vendors. Tools for traders (rule-compliance monitors, trade-copier risk controls) are low-ticket B2C; tools for firms (risk/abuse) are B2B but compete with established stack vendors.

### Cited Findings
- [Anecdotal, vendor] Track360 estimates 2026 prop industry revenue at $850M (+45% YoY), 2.1M funded traders, 12M challenge purchases — [Track360](https://track360.io/blog/prop-trading-industry-report-2026-market-analysis); contradicted by [FORTRADERS](https://fortraders.com/blog/future-prop-firms-industry-headed) estimating the 2024-25 shakeout removed 80-100 firms and contracted the market ~13-14%, with pressure continuing into 2026.
- [Anecdotal] 80-100 prop firms closed in 2024, mostly after MetaQuotes pulled MT4/MT5 licences — [The Prop Firm Guide](https://thepropfirmguide.com/prop-firms-that-shut-down/)
- [Anecdotal] 2026 closures mostly futures firms losing platform access (FundedSeat Sept, Rev One Trading Aug); most 2026 closures refunded active accounts vs 2024 closures leaving payouts unpaid — [The Prop Firm Guide](https://thepropfirmguide.com/prop-firms-that-shut-down/); [Prop Firm Reviews](https://propfirmreviews.net/prop-firms-that-shut-down/)
- [Anecdotal] Q2 2026: MyFundedFX acquired by Seacrest Markets and prop operations discontinued; SurgeTrader shut down; 8 new firms launched — [PropFirmMap](https://propfirmmap.com/blog/prop-firm-industry-news-shutdowns-rebrands-new-firms-q2-2026)
- [Anecdotal] Seacrest ended prop business Feb 2026; ATFX paused ATFunded June 2026; FundingTicks began winding down Jan 2026 after rule changes — [The Prop Firm Guide](https://thepropfirmguide.com/prop-firms-that-shut-down/)
- [Anecdotal] FundedNext reportedly distributed >$261M to >93,000 funded traders by end Q1 2026 — [MarketGrid](https://marketgrid.com/blog/prop-firm-industry-update-what-every-trader-needs-to-know-test)
- [Anecdotal] Trade Tech Solutions analysis of why prop firms close — [TradeTech Solutions](https://www.tradetechsolutions.io/insights/why-are-prop-firms-closing)

### Inferences
- [Speculative] Retail "rule-compliance monitor" tools (daily drawdown alerts, news-trading bans, consistency rules) are valuable to traders but compete with prop dashboards and cheap MT/TradingView add-ons; likely £10-30/month; reaching £300k ARR needs ~1,000-2,500 paying users, feasible but marketing-heavy and dependent on platform access that has proven fragile.
- [Speculative] UK regulatory exposure: the FCA has previously looked at whether prop challenges are regulated (not researched in this pass); a tool vendor is less exposed than a prop firm.
- [Speculative] Firm-side "abuse/toxic flow detection" fits the founder's analytics and is a real cost centre for prop firms, but the shakeout means buyers are fewer and more price-sensitive.

### Gaps
- No authoritative market-size dataset; all figures are vendor/affiliate.
- FCA stance on UK prop firms in 2026 not researched.
- No pricing data on existing trader-side rule-monitor tools.

---

## 7. Tools for UK prediction-market venues (Matchbook Predictions, IG) and Betfair power users

### Takeaway
Matchbook Predictions has reportedly launched (Jan 2026) under its UK Gambling Commission exchange licence and offers B2B white-label/API/liquidity products; IG is targeting a UK predictions launch as early as Q4 2026 via IG Consumer. These are gambling-regulated (UKGC) rather than FCA-regulated in Matchbook's case, which lowers financial-regulation exposure for tool builders but adds gambling-ad and responsible-gambling constraints. The venues are young and liquidity is unproven, so a third-party tools market is speculative right now.

### Cited Findings
- [Strong] Matchbook prediction markets registered with UKGC; UK product under Matchbook's existing exchange licence, initial sports focus — [iGaming News](https://www.igamingnews.com/article/matchbook-to-launch-uk-prediction-markets-261996/); [EGR Intel](https://www.egr.global/intel/news/matchbook-to-debut-uk-facing-prediction-markets-offering/)
- [Anecdotal] Matchbook launched its predictions platform in January 2026 with ambitions to expand into the US — [DeFi Rate](https://defirate.com/news/matchbook-begins-uk-prediction-market-rollout/); [SiGMA](https://sigma.world/news/matchbook-uk-prediction-market-launch-us-expansion/)
- [Anecdotal] Matchbook offers operators a full white-label predictions platform, an API suite, or pricing/liquidity options — [iGaming News](https://www.igamingnews.com/article/matchbook-to-launch-uk-prediction-markets-261996/)
- [Strong] IG Group targeting UK prediction-markets launch as early as Q4 2026 via IG Consumer, alongside CFDs, spread betting, share dealing, crypto; trade press questions execution — [SBC News, 22 Oct 2026](https://sbcnews.co.uk/sportsbook/2026/10/22/ig-group-uk-predictions-launch/); [SBC News comment, 23 Oct 2026](https://sbcnews.co.uk/features/comment/2026/10/23/can-ig-group-make-uk-predictions-jump/)
- [Anecdotal] Commentary on Matchbook's UK prediction-market potential — [Good Money Guide](https://goodmoneyguide.com/trading/matchbook-prediction-markets/); [Caan Berry](https://caanberry.com/matchbook-uk-prediction-markets/)
- [Unknown] IG predictions API; Matchbook predictions public API docs; liquidity/volumes.

### Inferences
- [Speculative] Most realistic near-term angle: B2B to operators (affiliates, tipster communities, media) wanting pricing models, fair-value feeds or risk dashboards for event contracts, rather than retail tools. Betfair power-user tooling (Bet Angel, Geeks Toy etc. — not researched here) is mature, so differentiation would need AI-driven fair-value/edge measurement with honest sample-size gating.
- [Speculative] Timing: wait for IG launch and observable volume before building; low regret to build a small "event-contract fair value + CLV tracking" prototype on Matchbook/Betfair APIs.

### Gaps
- No volume/liquidity data for Matchbook Predictions.
- Did not research Betfair third-party tool pricing (Bet Angel, Gruss, Geeks Toy) or Betfair API licensing costs.

---

## 8. UK crypto tax/reporting for active traders and bots (CARF)

### Takeaway
CARF went live 1 Jan 2026 with first UK reports due 31 May 2027, which raises HMRC visibility and demand for accurate returns. But consumer crypto-tax software is a crowded, price-compressed category (Koinly, Recap, CoinLedger, CoinTracking) with annual plans around €49-€279. Likely saturated for a solo entrant; possible sub-niches are high-frequency bot accounts (transaction counts above consumer tiers) and accountant-facing reconciliation of CARF data vs user records.

### Cited Findings
- [Strong, multiple advisers] UK CARF effective 1 Jan 2026; reporting providers collect 2026 data, register with HMRC by 31 Jan 2027, notify users, first reports by 31 May 2027; penalties up to £300 per user; UK providers must report UK-resident users too — [Crowe UK](https://www.crowe.com/uk/insights/cryptoasset-reporting-framework); [Alexander & Co](https://alexander.co.uk/news/carf-crypto-asset-reporting-framework/); [CryptoBooks](https://cryptobooks.tax/en/blog/carf-crypto-reporting)
- [Verified] Koinly plans: Newbie (≤100 txns), Hodler (≤1,000), Trader (≤3,000), Pro (≤10,000); extra 1,000-txn packs only on Pro — [Koinly support](https://support.koinly.io/en/articles/9856841-tax-plans)
- [Anecdotal, competitor source] Koinly approx €49 / €99 / €199 tiers (June 2026); per-tax-year licences — [CoinTracking blog](https://cointracking.info/blog/cointracking-vs-koinly); affiliate lists $49/$99/$199/$279 — [Koinly review (affiliate)](https://koinly-io.wasmer.app/?p=17)
- [Unknown] Recap and CoinLedger current UK pricing; UK market share.

### Inferences
- [Speculative] Saturated for a generic product. Bot traders generating >10k transactions/year are underserved by consumer tiers, but they are few; accountants serving them may pay £500-2,000/client/year for reconciliation, a services business rather than software.
- [Speculative] Weak fit with founder's assets (tax lot matching, HMRC share-pooling rules are a different domain).

### Gaps
- No data on number of UK active crypto traders/bot users; no Recap/CoinLedger pricing.

---

## Additional niches surfaced (brief)
- [Speculative] **"Consumer Duty evidence pack" for UK brokers/CFD firms opening AI-agent access** — brokers like IG (launching predictions) or UK firms adding MCP endpoints will need outcome monitoring and audit trails for agent-driven retail trading. No source found specifically; the IBKR AI Partition caps ([IBKR](https://www.interactivebrokers.com/campus/traders-insight/ibkr-toolbox/traders-toolbox-ai-order-placement-is-here/)) show brokers are already thinking in risk-limit terms.
- [Speculative] **Scam / fake-AI-bot due diligence reports** for retail or for platforms vetting advertisers, tied to FCA/IOSCO enforcement against unlawful promotions ([Skadden](https://www.skadden.com/insights/publications/2026/10/social-media-meets-financial-regulation)). Buyer unclear.

## Cross-niche ranking (all [Speculative], based on the above)
1. **Agent trading policy/audit layer, sold B2B** (to agent-app builders, small brokers, communities) — best code fit, real gap, but demand unproven and risk of brokers/horizontal firewalls closing it.
2. **Verification + backtest-audit combined (crypto/AI-agent native), sold to platforms/prop firms/allocators** — good fit, clear regulatory tailwind, low-ticket if sold B2C.
3. **Proportionate market-abuse surveillance for small UK CATPs/brokers** — deadline-driven demand (Feb/Oct 2027), higher ticket, but needs compliance credibility and deep build; window is short.
4. **Prop-firm risk/abuse analytics plug-in** — real budget line, but shrinking/fragile buyer base and established vendors.
5. **Prediction-market tooling** — watch-and-prototype; market too young.
6. **Finfluencer promo review** — competitors exist, weak differentiation.
7. **Crypto tax** — saturated.

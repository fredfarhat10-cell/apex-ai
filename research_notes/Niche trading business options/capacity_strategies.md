# Capacity-constrained trading strategies for a UK solo founder trading their own capital (as of Oct 2026)

Labels used: **[Verified]** = primary source (regulator, DOJ, HMRC, peer-reviewed or arXiv paper, exchange's own announcement); **[Strong]** = several reputable secondary sources agree; **[Anecdotal]** = blogs, forums, single practitioner accounts, vendor marketing; **[Speculative]** = my inference; **[Unknown]** = no reliable data found.

Research scope note: 17 web searches, mostly at snippet level. Few full papers were read end to end. Figures quoted from search summaries should be checked against the source before anyone relies on them financially.

## Q1. Market making for small or illiquid crypto tokens: is a small UK MM business viable and legal?

### Takeaway
Legitimate token market-making exists and is paid through retainers and/or token loans plus call options. Reputationally, the niche is contaminated: in 2024–25 the US DOJ prosecuted firms such as Gotbit and CLS Global for selling "volume support", which is wash trading. From 25 Oct 2027 the UK requires FCA authorisation for crypto activities, and a crypto market abuse regime (PS26/9) arrives with it. A solo UK MM business is therefore possible only as an authorised, compliance-heavy operation. It would also need its own inventory or credit risk capacity, and it competes with established firms. It is not a quick small business.

### Cited Findings
- **Deal structures [Anecdotal, vendor sources]:** In the main model, the project lends tokens and pays no cash. The MM earns mostly from call options on the loaned tokens. Loans are typically 1–5% of token supply for 12–24 months. The alternatives are a monthly cash retainer (project supplies inventory) or a hybrid where the DAO keeps PnL on its loan and pays a retainer. — [Tokenomist: loan & call option model](https://tokenomist.ai/learn/glossary-term/loan-and-call-option-market-making); [Tokenomist: retainer model](https://tokenomist.ai/learn/glossary-term/retainer-model-market-making); [Wallfacer Labs DAO Deal Tracker](https://wallfacerlabs.substack.com/p/introducing-the-dao-deal-tracker); [Arrakis, Market Makers 101 (Mar 2026)](https://arrakis.finance/blog/market-makers-101). Caveat: Tokenomist and Arrakis sell MM-adjacent services.
- **Misaligned incentives [Anecdotal, journalism]:** Cointelegraph reports a pattern of MMs dumping loaned tokens early, crashing the price, then buying back cheaper while keeping the option profit. — [Cointelegraph, "Market maker deals quietly killing crypto projects"](https://cointelegraph.com/news/market-maker-deals-quietly-killing-crypto-projects)
- **Gotbit [Verified, DOJ]:** Gotbit and founder Aleksei Andriunin pleaded guilty in March 2025 to wire fraud and conspiracy to commit market manipulation and wire fraud. Prosecutors said Gotbit wash-traded for several crypto clients from 2018 to 2024 to inflate volume. Andriunin was sentenced in June 2025 to 8 months, treated as time served after his October 2024 arrest in Portugal. Gotbit agreed to forfeit about $23M in crypto. — [DOJ D. Mass. sentencing release](https://www.justice.gov/usao-ma/pr/cryptocurrency-financial-services-firm-gotbit-and-founder-sentenced-market-manipulation); [DOJ plea release](https://www.justice.gov/usao-ma/pr/cryptocurrency-financial-services-firm-gotbit-and-founder-plead-guilty-market); [Decrypt](https://decrypt.co/325111/gotbit-founder-sentenced-prison-crypto-wash-trading)
- **Operation Token Mirrors [Strong]:** This was the FBI investigation in which the Bureau created its own token for the first time, to catch fraudulent market makers. CLS Global FZC LLC pleaded guilty and was sentenced for offering illegal "volume support" services uncovered by the same operation. — [Decrypt](https://decrypt.co/325111/gotbit-founder-sentenced-prison-crypto-wash-trading); [DOJ](https://www.justice.gov/usao-ma/pr/cryptocurrency-financial-services-firm-gotbit-and-founder-sentenced-market-manipulation)
- **UK regime timing [Strong, law firms citing FCA]:** The FCA published final cryptoasset rules on 30 June 2026. The authorisation application window runs from 30 Sep 2026 to 28 Feb 2027, and the mandatory regime starts on 25 Oct 2027. Market abuse and admissions/disclosures rules are in PS26/9, which followed CP25/41 (16 Dec 2025). Until Oct 2027, FCA oversight of crypto firms is limited to financial promotions and AML. — [AIMA](https://www.aima.org/article/fca-publishes-final-rules-for-the-new-uk-cryptoasset-regime.html); [Linklaters](https://financialregulation.linklaters.com/post/102n7ho/crypto-countdown-begins-fca-releases-final-rules-for-uk-cryptoasset-regime); [The Block](https://theblock.co/post/406546/uk-sets-capital-market-abuse-rules-landmark-crypto-framework); [BCLP](https://www.bclplaw.com/en-US/events-insights-news/the-fcas-final-crypto-regime-what-firms-need-to-know-and-do-next.html)

### Inferences
- [Speculative] Wash trading or "volume support" is criminal in the US (DOJ wire fraud and manipulation charges). It would almost certainly breach the UK crypto market abuse regime from Oct 2027, and existing fraud law applies now. Any MM offering that sells "volume" or "chart support" is a non-starter.
- [Speculative] Legitimate MM economics for a solo operator: the revenue (retainer plus options) comes from contracts with token projects, so this is a B2B service business rather than trading one's own capital. It needs a sales pipeline, exchange API relationships and, after Oct 2027, probably FCA authorisation plus a prudential capital requirement. The inventory risk sits on the founder (loaned tokens of small-cap projects can go to zero, and options expire worthless). Return on effort is uncertain, and the regulatory overhead is large for one person.
- [Speculative] Fit with the existing app: high technically. The app already has live order-book data, a risk engine and a slippage model, and a quoting engine is a natural extension. The barriers are legal, counterparty and business-development, not code.

### Gaps
- [Unknown] Typical retainer sizes for small MMs (often quoted informally as $5k–$20k a month) were not found in a citable source.
- [Unknown] Whether a firm that only trades its own account on offshore CEXs, with no UK clients, needs authorisation under the new regime. The PS26/9 text and the territorial scope of the regulated activities were not read directly. A UK lawyer should be consulted.
- [Unknown] The exact CLS Global sentence and forfeiture figures (the DOJ pages were not fetched).

## Q2. DEX liquidity provision (Uniswap v3/v4, Hyperliquid HLP/vaults, Meteora): do LPs make money?

### Takeaway
The academic evidence is that passive LPs on volatile pairs lose to arbitrageurs. The cost has been formalised as loss-versus-rebalancing (LVR). On Uniswap v3 in 2021, total impermanent loss exceeded fees, and about half of LPs lost money relative to holding. Profits go to arbitrageurs, searchers, builders, JIT liquidity bots and active, hedged professional LPs. Hyperliquid's HLP vault has been profitable since launch, but it carries tail risk from manipulation events (JELLY, March 2025).

### Cited Findings
- **Uniswap v3, May–Sep 2021 [Verified paper; note the Bancor co-authorship conflict]:** For almost all pools studied, impermanent loss exceeded fees. Reported totals were about $199M in fees against about $260M in IL, a net loss of roughly $60M. 49.5% of LPs were at a loss, and the share reached 74% in the MKR/WETH pool. — [Loesch et al., arXiv 2111.09192](https://arxiv.org/pdf/2111.09192); [Nasdaq/coverage](https://www.nasdaq.com/articles/half-of-uniswap-liquidity-providers-are-losing-money); [CryptoSlate](https://cryptoslate.com/new-report-shows-50-of-uniswap-v3-liquidity-providers-are-losing-money/)
- **Concentrated liquidity amplifies IL [Verified, arXiv]:** Impermanent loss grows faster with concentrated liquidity, so LPing volatile pools requires active management and high sophistication. — [Risks and Returns of Uniswap V3 LPs, arXiv 2205.08904](https://ar5iv.labs.arxiv.org/html/2205.08904)
- **LVR [Verified, arXiv / peer-reviewed]:** Milionis, Moallemi, Roughgarden and Zhang define LVR as the gap between a hedged LP and a rebalancing strategy trading at market prices. It is an adverse-selection running cost from stale AMM prices being picked off by informed arbitrageurs, and it depends only on asset volatility and marginal pool liquidity. Fees must exceed LVR for a hedged LP to profit, and the model matched actual losses on Uniswap v2 WETH-USDC. — [arXiv 2208.06046](https://arxiv.org/abs/2208.06046v3); [author explainer](https://anthonyleezhang.substack.com/p/automated-market-making-and-loss)
- **Hyperliquid HLP [Strong/Anecdotal, CoinGecko and news]:** HLP had about $136.9M cumulative profit since its May 2023 launch, and its cumulative PnL has reportedly never turned negative. TVL peaked at about $603.9M in Sep 2025 and was about $268.6M by June 2026. — [CoinGecko HLP analysis](https://www.coingecko.com/learn/hyperliquid-hlp-vault-analysis)
- **JELLY incident, March 2025 [Strong]:** A trader manipulated the JELLY price, and the liquidated short passed to HLP, leaving the vault about $13.5M underwater. Hyperliquid force-closed the market at $0.0095 against the oracle price of about $0.50. TVL fell from $510M to $150M. A point-in-time APR of about 13.4% was cited after the recovery. — [CoinAcademy](https://coinacademy.fr/actu/hyperliquid-vault-250-millions-tvl-2-mois-jelly/); [BIT Knowledge Hub](https://www.bit.com/knowledge-hub/hyperliquid); [OneKey HLP liquidation history](https://onekey.so/blog/ecosystem/hlp-liquidation-history/) (OneKey dates JELLY to 2024, which conflicts with the other sources; March 2025 is better supported)

### Inferences
- [Speculative] HLP's positive record partly depends on discretionary intervention by the validator set (the JELLY delisting). A depositor is exposed to governance and tail risk, and HLP is a perp venue product, which interacts with the UK retail crypto-derivatives ban (Q6).
- [Speculative] The edge in LPing belongs to the arbitrageur or JIT side, a latency and MEV game the founder has already judged low value. Passive LP is not a capacity-constrained edge. It is a short-volatility position, and the LVR literature says it usually has negative expectancy on volatile pairs.
- [Speculative] The niche where LP can work is stable-stable or correlated pairs, and long-tail new-token pools with high fees (Meteora DLMM-type). In those pools fees can exceed LVR, but rug, token-crash and smart-contract risk dominate. Returns are anecdotal.

### Gaps
- [Unknown] No 2025–26 systematic study of LP profitability on Uniswap v4 hooks, Meteora DLMM or Aerodrome was found.
- [Unknown] HLP calendar-year 2025 return and maximum drawdown were not found.
- [Unknown] UK tax treatment of LP positions (HMRC DeFi lending/staking guidance, CRYPTO61000 onward) was not checked in this session.

## Q3. Betfair exchange professional trading: can a solo person earn a living, and what does the Expert Fee do?

### Takeaway
From 6 Jan 2025, Betfair replaced the Premium Charge (up to 60%) with an "Expert Fee" based on rolling 52-week gross profit: 0% under £25k, 20% from £25k to £100k, and 40% above £100k. This caps after-fee income for the most successful traders and creates a soft ceiling on capacity at exactly the level a small business would need. No reliable data exists on how many full-time professionals there are.

### Cited Findings
- **Expert Fee tiers [Strong, Racing Post reporting Betfair]:** The fee starts 6 Jan 2025, replacing the Premium Charge (introduced in 2008, with a higher tier of up to 60% added later). It is based on 52-week gross profit: 0% below £25k, 20% from £25k to £100k, 40% above £100k. Betfair says 80% of affected customers pay less and 50% pay nothing additional (company figures). A professional gambler quoted in the piece said deposit restrictions make it very hard to operate. — [Racing Post](https://racingpost.com/news/britain/betfair-exchange-to-introduce-new-commission-system-for-2025-as-premium-charge-is-dropped-a7wbg0v4GCAJ)
- [Unknown] No source gave the number of Expert Fee payers or full-time Betfair traders. — searched; only low-quality pages were found ([pm.wiki](https://pm.wiki/uk/projects/betfair-exchange), which also gives a conflicting date of 1 Dec 2025 for the change).
- **Tax [Strong]:** In the UK, gambling winnings are not subject to income tax. — [UK Tax Calculators, matched betting](https://www.uktaxcalculators.co.uk/side-hustles/matched-betting/)

### Inferences
- [Speculative] Worked example under the reported tiers, if the fee applies marginally to gross profit (unverified): £25k gross keeps £25k, £100k gross keeps about £85k, and £200k gross keeps about £145k (before base commission). Each pound above £100k keeps only 60p. The structure makes Betfair trading a decent lifestyle income but a poor scalable business, and it explicitly taxes the top tail.
- [Speculative] Fit with the app: medium. The Betfair Exchange API is order-book-like, and the slippage and risk modules transfer. Pre-race horse-racing "trading" is dominated by bots and in-play latency, which mirrors the founder's crypto latency conclusion.
- [Speculative] Tax-free status is a real advantage over trading, where an individual faces CGT or income tax. HMRC could argue a trade exists for a business-like operation, but the general principle is that betting is not taxable.

### Gaps
- [Unknown] Whether the Expert Fee is marginal or applies to the whole profit once a tier is crossed; Betfair's own T&Cs were not fetched.
- [Unknown] Any post-2025 changes, and the effect of the UK Nov 2025 Budget gambling duty changes on exchange commission (not researched).
- [Unknown] Credible income distributions for Betfair traders.

## Q4. Matched betting and bonus arbitrage in the UK

### Takeaway
Profits are tax-free for individuals. Realistic income is a few hundred pounds a month and decays as accounts are "gubbed" (restricted). It is a side income of roughly £600–£12k a year, not a business, and it is not scalable because it is per-person and per-account.

### Cited Findings
- **Income [Anecdotal]:** A typical estimate is about £250 a month, with a range of £50 to £1,000 (roughly £600 to £12k a year), falling as accounts are limited and offers dry up. Forum claims of £3,500 a month are unverified. — [UK Tax Calculators](https://www.uktaxcalculators.co.uk/side-hustles/matched-betting/); [Overclockers forum](https://forums.overclockers.co.uk/posts/32255860)
- **Tax [Strong]:** Profits are generally tax-free because UK gambling winnings are outside income tax. Sources advise keeping records. — [UK Tax Calculators](https://www.uktaxcalculators.co.uk/side-hustles/matched-betting/); [Household Money Saving](https://www.householdmoneysaving.com/is-matched-betting-risk-free/)
- **Restrictions [Strong, Gambling Commission data via trade press]:** 643,779 UK online betting accounts (4.31% of active accounts) were restricted in some way in 2024. Gubbing means losing free bets, stake limits or closure. — [SBC News](https://sbcnews.co.uk/sportsbook/2025/08/26/entain-liquidity-trading/); [Household Money Saving](https://www.householdmoneysaving.com/is-matched-betting-risk-free/)

### Inferences
- [Speculative] Capacity is bounded by the number of bookmaker accounts one person can legitimately hold. Operating multiple accounts for other people ("account farming") breaches bookmaker terms and may raise fraud or AML issues. This cannot become a business except by selling tools and training, which is the other researcher's scope.
- [Speculative] App fit: low. Odds-matching tools already exist cheaply.

### Gaps
- [Unknown] Hard data on median matched-betting income; all figures come from affiliates, blogs or forums.

## Q5. Small-cap and special-situation equity strategies with natural capacity limits (UK access)

### Takeaway
The best-evidenced, legal, low-ruin options for a UK individual are event-driven trades that big funds cannot scale. These include odd-lot tender offers in US stocks (deal-by-deal gains of hundreds to a few thousand dollars), SPAC trust-floor arbitrage (T-bill-plus yield with a free option), UK investment-trust discount capture around tender offers and Saba-style activism, and merger arbitrage in small deals. They are all real, but they total single-digit to low-double-digit percent returns on modest capital. Post-earnings drift appears to have died even in microcaps. None of them alone makes a "very successful business", and they work best inside an ISA or SIPP.

### Cited Findings
- **Odd-lot tenders [Anecdotal, documented deal examples]:** Holders of fewer than 100 shares are often exempt from proration. They must own fewer than 100 shares in total and tender all of them. Examples: J&J/Kenvue in 2023 made about $1,350 on about $17k, roughly 8%, after about 23% proration for others. United Rentals in 2008 made 16.1% in about a month but only $302. Optimum Communications (OPTU) was a $2.50 tender against a market price of about $1.04, and odd lots were accepted in full. Offers can be withdrawn or amended, some can only be done once per person, and absolute profits are small. — [MyMoneyBlog J&J/Kenvue](https://mymoneyblog.com/johnson-and-johnson-kenvue-odd-lot-arbitrage-deal.html); [MyMoneyBlog URI](https://www.mymoneyblog.com/united-rentals-uri-stock-tender-follow-up.html); [Doctor of Credit OPTU](https://www.doctorofcredit.com/odd-lot-tender-opportunity-buy-optu-for-1-05-sell-for-2-5-145-money-maker/); [Old School Value](https://oldschoolvalue.com/investing-strategy/profit-from-special-situations-stock-tenders)
- **SPAC arbitrage [Anecdotal, manager letters and interviews]:** Returns are trust interest plus the discount to NAV, with a free option on a deal "pop" and a redemption right as the floor. One manager's Q2 2026 letter reports +6.1% for the quarter and +7.5% YTD, with 55 SPAC IPOs raising $8.9bn and 28 deal announcements in Q2 2026, the most in three years (self-reported). RLH Capital in May 2025 described the strategy as Treasury exposure at above-IG-credit yields with embedded optionality. — [BuySide Digest manager letter](https://www.buysidedigest.com/?p=31869); [EisnerAmper interview](https://www.eisneramper.com/insights/blogs/financial-services/camhi-tw-ai-blog-0525/); [CMC Markets Opto explainer](https://cmcmarkets.com/en/opto/demystifying-the-art-of-spac-arbitrage)
- **UK investment trust discounts [Verified, AIC]:** The average discount was 9.6% on 31 May 2026, the first month-end below 10% since Aug 2022. The H1 2026 review gives a narrowing from 12.3% to 11.6%, and the end-2025 figure was 12.5%. Buybacks totalled a record £10.2bn in 2025 and £4.10bn in H1 2026. Large H1 2026 tenders included Impax Environmental Markets (£733M), BlackRock Smaller Companies (£163M) and Vietnam Enterprise (£147M). — [AIC H1 2026 review](https://www.theaic.co.uk/aic/news/press-releases/investment-trust-h1-2026-review); [AIC single-digit discount release](https://www.theaic.co.uk/aic/news/press-releases/average-investment-trust-discount-hits-single-digits)
- **Saba activism [Strong]:** Saba secured NAV exits through tenders at CQS Natural Resources (CYN) and European Smaller Companies (ESCT). Herald and Impax ran 100% tender offers conditional on Saba tendering. Saba launched a UK-focused discount ETF in March 2026. — [ii.co.uk](https://www.ii.co.uk/analysis-commentary/investment-trusts-vs-saba-pressure-and-progress-ii540521); [ii.co.uk Saba ETF](https://www.ii.co.uk/analysis-commentary/saba-etf-target-investment-trust-discounts-ii538363); [AIC industry news](https://www.theaic.co.uk/aic/news/industry-news/saba-drops-bravado-but-is-still-quietly-stocking-up-on-cheap-trusts)
- **Merger arbitrage [Verified, academic]:** Mitchell and Pulvino (2001) studied 4,750 deals from 1963 to 1998 and found about 4% a year in abnormal returns after transaction costs. Payoffs resemble short index puts (correlated with the market in severe downturns). Commentary lists small deal size, illiquidity and difficulty shorting as costs, which points toward small deals being harder to trade, not obviously more lucrative. — [Alpha Architect summary](https://alphaarchitect.com/merger-spread/); [Cochrane hedge-fund notes](https://www.johnhcochrane.com/s/hedge_questions_and_answers.pdf); [UCC: merger arbitrage in the UK 2001–04](https://www.ucc.ie/en/media/research/centreforinvestmentresearch/wp/wp0705risk-and-return-of-merger-arbitrage-uk-2001-2004.pdf)
- **Post-earnings drift [Verified, academic]:** Martineau's "Rest in Peace Post-Earnings Announcement Drift" finds no PEAD in large stocks since 2006, and it has only recently disappeared in microcaps. S&P 500 studies find it small and benchmark-sensitive. — [Martineau](https://cfr.ivo-welch.info/published/papers/martineau2021rest.pdf); [Quantpedia](https://quantpedia.com/strategies/post-earnings-announcement-effect/)

### Inferences
- [Speculative] Capacity. Odd-lot tenders cap at 99 shares per deal per person, so absolute profit is tiny; the edge is that funds cannot use it at all. SPAC trust arbitrage scales to about £1–5M for an individual before liquidity in small SPACs binds, with returns near T-bill rate plus 1–3%. Investment-trust tender capture scales to roughly £0.5–5M. Small-deal merger arbitrage is limited by deal liquidity.
- [Speculative] Realistic combined return on £100k–£500k: perhaps 6–12% a year with careful work, about £6k–£60k, and drawdown risk from deal breaks. That is meaningful but similar to the founder's latency-edge estimate, not transformative.
- [Speculative] UK access: IBKR UK offers US stocks with API access, and US tender participation goes through broker corporate actions (some UK brokers do not support US voluntary tenders or SPAC redemptions, so check before trading). ISA wrapping makes gains tax-free. US withholding and W-8BEN apply.
- [Speculative] App fit: medium. The research and agent tooling could screen SEC filings (SC TO-I for tenders, 8-K and S-4 for SPACs) and RNS for UK trust tenders. That automation is a genuine edge-multiplier for a solo operator, even though the execution engine matters little here.

### Gaps
- [Unknown] Systematic returns for odd-lot tenders and for UK investment-trust tender participation were not found.
- [Unknown] Evidence that small-deal merger arb yields more than large-deal merger arb was not found. A direct search did not confirm it.
- [Unknown] UK AIM microcap anomaly evidence (2020s) was not researched for lack of time.
- [Unknown] Whether US odd-lot and SPAC participation is available via IBKR UK specifically in 2026 was not verified with broker docs.

## Q6. Crypto yield, airdrops, CEX promos, funding/basis and UK rules

### Takeaway
Under UK rules a retail resident cannot buy crypto derivatives (FCA ban since Jan 2021, still in force), which blocks the perp funding/basis trade on UK-facing venues. Crypto ETNs have been retail-available since 8 Oct 2025, but they have been excluded from stocks and shares ISAs since 6 Apr 2026. HMRC taxes airdrops received for doing something (farming) as miscellaneous or trading income, then CGT on disposal. Airdrop farming as a business is therefore taxable income, and the sybil-detection arms race makes it a grind with collapsing per-wallet payouts.

### Cited Findings
- **Derivatives ban [Verified, FCA, plus 2025 confirmation]:** The FCA banned the sale, marketing and distribution of crypto derivatives (CFDs, options, futures) and crypto ETNs to retail from 6 Jan 2021. The October 2025 change reopened only cETNs, and the retail crypto-derivatives ban remains. — [FCA press release](https://www.fca.org.uk/news/press-releases/fca-proposes-ban-sale-crypto-derivatives-retail-consumers); [The Block](https://www.theblock.co/amp/post/79911/uk-regulator-fca-bans-crypto-derivatives-retail-users); [Charles Russell Speechlys](https://www.charlesrussellspeechlys.com/en/insights/expert-insights/financial-services/2025/fca-reopens-retail-access-to-crypto-etns-a-strategic-turning-point-for-regulated-crypto-exposure/)
- **cETNs and ISA [Strong]:** cETNs have been retail-accessible since 8 Oct 2025 if listed on the Official List and traded on a UK RIE, with no FSCS cover. From 6 Apr 2026 they are excluded from stocks and shares ISAs (moved to the Innovative Finance ISA, which no platform currently offers for cETNs), with existing holdings grandfathered. — [Charles Russell Speechlys](https://www.charlesrussellspeechlys.com/en/insights/expert-insights/financial-services/2025/fca-reopens-retail-access-to-crypto-etns-a-strategic-turning-point-for-regulated-crypto-exposure/); [Morningstar UK](https://global.morningstar.com/en-gb/personal-finance/can-you-invest-crypto-tax-free-uk-isa-rules-just-changed); [Regulation Tomorrow](https://www.regulationtomorrow.com/2025/10/fca-provides-information-for-firms-looking-to-offer-cetns/)
- **Airdrop tax [Verified, HMRC manual]:** Airdrops received without doing anything in return, and not as part of a trade, may fall outside income tax. Airdrops received in return for a service or as part of a trade are miscellaneous income or trading receipts. A later disposal can trigger CGT, and income tax takes priority where a trade computation already captures the value. — [HMRC CRYPTO21250](https://www.gov.uk/hmrc-internal-manuals/cryptoassets-manual/crypto21250); [Crunch](https://www.crunch.co.uk/knowledge-tax/crypto-airdrops-tax-guide)

### Inferences
- [Speculative] Airdrop farming done systematically (many wallets, tasks, bridging) fits HMRC's "in return for a service" or trading characterisation. Tax at income rates is due on receipt value, even if the token later collapses, which risks a tax bill larger than the realised cash.
- [Speculative] Funding/basis: a UK individual using offshore perp venues may be breaching venue terms (many geo-block UK retail). Doing it through a company that qualifies as professional or elective-professional is a possible route but needs legal advice.
- [Speculative] Stablecoin yield and CEX promos are low single-digit to T-bill-like yields with counterparty risk (exchange failure). They are not a business.
- [Speculative] The founder's app helps most with spot cross-venue or DEX-CEX spot arbitrage and spot-only rebalancing, which remain legal for UK retail.

### Gaps
- [Unknown] 2025–26 airdrop-farming income data was not researched. All public figures are anecdotal, from X/Twitter.
- [Unknown] CGT rates (18%/24% since 30 Oct 2024) and the £3,000 annual exempt amount are from background knowledge and were not verified this session.
- [Unknown] The current state of UK access to Hyperliquid and other offshore perps was not checked.

## Q7. Cross-strategy comparison: which options could make a small business "very successful"?

### Takeaway
None of the own-capital strategies reviewed has evidence of scaling to "very successful business" income (for example £150k+ a year) for one person with modest capital at low ruin risk. The legal, evidence-backed ones (special-situations equities, Betfair trading below the Expert Fee threshold, matched betting) are capped at tens of thousands of pounds a year or by fees and gubbing. The higher-ceiling ones (token market making, long-tail LP, airdrop farming) have high ruin, counterparty or legal risk, and from Oct 2027 an FCA authorisation burden in the UK.

### Cited Findings
- Betfair's fee caps high earners: 40% above £100k of 52-week gross profit. — [Racing Post](https://racingpost.com/news/britain/betfair-exchange-to-introduce-new-commission-system-for-2025-as-premium-charge-is-dropped-a7wbg0v4GCAJ)
- Passive LP is negative-expectancy on volatile pairs. — [arXiv 2111.09192](https://arxiv.org/pdf/2111.09192); [arXiv 2208.06046](https://arxiv.org/abs/2208.06046v3)
- Wash-trading MM services are prosecuted. — [DOJ](https://www.justice.gov/usao-ma/pr/cryptocurrency-financial-services-firm-gotbit-and-founder-sentenced-market-manipulation)
- The UK crypto authorisation regime starts 25 Oct 2027. — [AIMA](https://www.aima.org/article/fca-publishes-final-rules-for-the-new-uk-cryptoasset-regime.html)
- PEAD is dead even in microcaps. — [Martineau](https://cfr.ivo-welch.info/published/papers/martineau2021rest.pdf)

### Inferences (summary table, all estimates [Speculative] unless noted)

| Strategy | Plausible annual return | Capacity before edge decays | Time | Competition | Ruin / failure risk | UK legality / tax | App helps? |
|---|---|---|---|---|---|---|---|
| Token MM (legit, B2B) | Unknown; contract-driven | Limited by number of clients and inventory risk | Full-time plus sales | Wintermute, GSR, many small Asian/EU firms | High (token collapse, counterparty, legal) | Authorisation likely needed from Oct 2027; wash trading criminal | High (tech) |
| Passive DEX LP (volatile pairs) | Negative median (Verified 2021 data) | n/a | Low to medium | Arbs and JIT bots win | High | Legal; DeFi tax complex | Low |
| Active hedged LP / long-tail pools | Unknown; anecdotal high APRs | £10k–£500k | High | Pro LPs, bots | High (rug, smart contract) | Legal; tax complex | Medium |
| HLP / vault deposit | Point-in-time ~13% APR, not annual return (Anecdotal) | Large | Low | n/a (passive) | Tail events (JELLY) | Perp exposure, UK retail ban implications unclear | Low |
| Betfair trading | 0 to £100k for the rare few; most lose | Expert Fee bites >£25k / >£100k | Full-time | Bots, syndicates | Medium | Tax-free winnings | Medium |
| Matched betting | £600–£12k (Anecdotal) | Per-person accounts | 5–20 h/week | Saturated | Low | Tax-free | Low |
| Odd-lot tenders | Hundreds to a few thousand £ a year | 99 shares per deal | Low | Low (funds cannot play) | Low (deal changes) | Legal; ISA possible | Medium (filing screener) |
| SPAC trust arbitrage | ~T-bill + 1–3% (Anecdotal managers) | ~£1–5M | Medium | Hedge funds (SPAC arb funds) | Low (trust floor) | Legal; broker support varies | Medium |
| IT discount / tender capture | Unknown; event-dependent | ~£0.5–5M | Medium | Saba, other activists | Medium (market beta) | Legal; ISA/SIPP | Medium |
| Small merger arb | ~4% abnormal historically (Verified, all sizes) | Small-deal liquidity | Medium | Event-driven funds | Deal-break tail | Legal | Medium |
| Airdrop farming | Highly variable, collapsing | Sybil limits | High | Industrial farms | Medium | Income tax on receipt | Low to medium |
| Funding/basis | n/a for UK retail | — | — | — | — | Retail derivative ban | — |

- [Speculative] Most realistic own-capital route: a diversified UK-ISA/SIPP plus IBKR "special situations desk" (odd-lot tenders, SPAC trust arbitrage, UK trust tender capture, small merger arb), automated by the founder's agents for SEC/RNS filing screening. Expect roughly £10k–£60k a year on £200k–£500k of capital. That is a good side business but not "very successful" without much more capital.
- [Speculative] The highest ceiling with legitimacy is a properly authorised small token-MM or liquidity-services firm. From a UK base it looks like a regulated financial services start-up, not a solo trading side-business.

### Gaps
- [Unknown] Evidence on UK AIM microcap anomalies, rights issue arbitrage and UK small-cap tender offers was not gathered.
- [Unknown] No independent performance data exists for small crypto MMs, HLP-type vault depositors in 2025–26, or full-time Betfair traders.

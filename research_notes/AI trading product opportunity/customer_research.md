# Customer Research: What Retail and Semi-Pro Traders Want and Struggle With (Trading Bots, AI Tools, Signals, Journals), 2025-2026

**Evidence labels used throughout.**
- **[Verified]**: a primary source such as a regulator, a peer-reviewed or working paper, an official company page or an official GitHub repo, with the figure confirmed in the source text or snippet.
- **[Strong evidence]**: several consistent secondary sources, or a large published survey.
- **[Anecdotal]**: individual posts, reviews or forum threads.
- **[Speculative]**: my own inference or scoring.
- **[Unknown]**: no reliable data found.

**How the research was done, and its limits.** Direct page fetches of fca.org.uk, trustpilot.com, reddit.com and the reddit mirror reddit.sentinel-team.org were blocked in this environment, by proxy or DNS refusal. Evidence from those domains therefore comes from search-engine snippets and summaries, not from full-page reads. Quotes marked "(via search snippet)" are short excerpts surfaced by the search tool. They should be spot-checked against the live page before anyone publishes them. GitHub issues were read directly through the GitHub API.

---

## Q1. What are the recurring complaints about bots, AI tools, signals and journals, and how strong is the evidence for each?

### Takeaway
The strongest and best-documented pains are these:
1. Performance claims that cannot be verified, and outright scams (regulators on several continents warn specifically about "AI trading bot" fraud).
2. The gap between backtest and live results, plus regime failure ("it backtested well, then lost money").
3. Behavioural self-sabotage: overtrading, revenge trading and FOMO, against a background where most active retail traders lose money.

Black-box opacity, not knowing when to switch a bot off (or when to do nothing), and wanting AI as a research aid rather than an autonomous trader all recur, but the evidence for them is mostly anecdotal or survey-based. Journaling fails mainly because logging takes too long and logs are never reviewed.

### Cited Findings

**1. Scams, fake bots and unverifiable P&L (very frequent, very severe)**
- [Verified] The FCA has published a warning about an unauthorised firm called "Ai Trader Bot" (ai-traderbot.net) that may be targeting UK consumers. People who deal with it have no access to the Financial Ombudsman Service and no FSCS protection. The publication date was not visible. — [FCA warning: Ai Trader Bot](https://www.fca.org.uk/news/warnings/ai-trader-bot)
- [Verified] The FCA warned that "Quantum AI" may be providing or promoting financial services without permission. The scheme was promoted with deepfake videos of Martin Lewis. Lewis called it the first deepfake scam he had seen featuring himself. — [Which?: What is the Quantum AI scam](https://www.which.co.uk/news/article/what-is-the-quantum-ai-scam-acsiK7o1b7qr); [Which? deepfakes article](https://which.co.uk/news/article/quantum-ai-scams-warning-aRelP4u7EbDf)
- [Verified, secondary record] In March 2026 a later deepfake showed Lewis's wife, Lara Lewington, apparently being attacked while promoting the same scheme. Lewis accused social media firms of taking money to publish such fakes. — [OECD AI incident record](https://oecd.ai/en/incidents/2026-03-10-3a4e)
- [Anecdotal / unverified] A law firm's marketing page claims that "Quantum AI" and "XTradeMax" have taken tens of millions of pounds from the UK public. — [Richardson Hartley Law page](https://www.rhlaw.it.com/index__q-1hzjfm2.html)
- [Strong evidence] In February 2025 BaFin warned about 17 unauthorised websites offering "AI-controlled algorithmic trading" in financial instruments and crypto, all with nearly identical design. — [Finance Magnates on BaFin](https://www.financemagnates.com/forex/regulation/how-fraudsters-use-ai-to-lure-investors-bafin-exposes-the-scam)
- [Verified] The CFTC advisory "AI Won't Turn Trading Bots into Money Machines" (January 2024) says promises of high or guaranteed returns from AI bots are fraud red flags. It cites Mirror Trading International, which took more than $1.7bn in bitcoin from at least 23,000 people. — [CFTC Release 8854-24](https://www.cftc.gov/PressRoom/PressReleases/8854-24)
- [Verified] The SEC, NASAA and FINRA issued a joint investor alert on frauds that claim to use AI. — [Orrick InfoBytes summary](https://infobytes.orrick.com/2024-02-02/securities-regulators-issue-guidance-and-rfc-ai-trading-scams/)
- [Strong evidence] FBI IC3 figures:
  - 2024: $9.3bn in crypto-related losses, up 66%, from nearly 150,000 complaints. Crypto investment fraud accounted for $5.8bn.
  - 2025 (report published April 2026): more than $11.37bn in crypto-related losses, with $7.2bn from crypto investment fraud.
  - [Yahoo/FBI summary](https://www.yahoo.com/news/fbi-says-americans-lost-9-121501978.html); [Fox Business](https://www.foxbusiness.com/lifestyle/crypto-fraud-tops-fbis-annual-crime-report-americans-lose-billions-scams)
- [Strong evidence, figures need checking] UK Finance figures for UK investment scam losses (APP fraud):
  - 2024: £144.4m, up 34%, from 7,767 cases. — [Financial Planning Today](https://financialplanningtoday.co.uk/news/investment-scam-losses-rise-34-in-2024)
  - 2025: £221.5m, up 40%, from 14,893 cases, with crypto among the lures. — [Crypto Times](https://www.cryptotimes.io/2026/06/15/uk-investment-scam-losses-hit-221m-as-ai-fuels-crypto-fraud/)
  - **Conflict:** the 2025 case count is reported as "up 26%", but going from 7,767 to 14,893 would be about +92%. The case-count definitions probably differ. Check the UK Finance report itself.
- [Verified] FCA action on finfluencers:
  - June 2025: led a nine-regulator week of action. In the UK this produced three arrests, criminal proceedings against three individuals, 7 cease-and-desist letters and 50 warning alerts, which led to more than 650 takedown requests. The FCA has run a targeted campaign against forex and crypto promoters since 2022. — [FCA press release](https://www.fca.org.uk/news/press-releases/fca-leads-international-crackdown-illegal-finfluencers)
  - April 2026 follow-up: 17 regulators took part. — [UKTN](https://www.uktech.news/news/government-and-policy/fca-continues-illegal-finfluencer-crackdown-20260424)
- [Anecdotal / strong pattern] Fake "AI signal" groups:
  - They are advertised on Facebook, Instagram and TikTok with claims of 300-1000% daily returns, then move people into Telegram or WhatsApp groups that charge $250-$600 "registration" fees. — [MalwareTips](https://malwaretips.com/blogs/fake-ai-crypto-signal-groups-scam-on-whatsapp-and-telegram/)
  - A forex VIP-group complaint (via search snippet): "by the end of the day they claim 1000 pips achieved when only 20 pips was profit." — [Forex Peace Army](https://www.forexpeacearmy.com/community/goto/post?id=354707)
  - A BabyPips user paid $150 for "60% in five days" and was then blocked by the admins. — [BabyPips forum](https://forums.babypips.com/t/fx-free-signals-scam/232388)
- [Anecdotal] Viral claims of AI trading wins are routinely unverifiable. Finance Magnates said an r/ChatGPT "$400 into AI-picked options" story could not be verified. — [Finance Magnates](https://www.financemagnates.com/trending/redditor-claims-chatgpt-is-his-personal-trade-whisperer/)

**2. Backtests that do not survive live trading, overfitting and regime failure (frequent, severe, concentrated among quant hobbyists and bot users)**
- [Verified, primary GitHub, 2026] Freqtrade (the most popular open-source crypto bot) has a steady stream of issues about backtest and live results disagreeing. Each item below is a separate issue.
  - Dry-run signals differ from backtest signals for the same period, even though `lookahead-analysis` reports no bias. — [freqtrade#12894](https://github.com/freqtrade/freqtrade/issues/12894)
  - A Chinese-language report says dry-run trade times were "completely scrambled" against the backtest, and "the profit results also differ hugely." — [freqtrade#12893](https://github.com/freqtrade/freqtrade/issues/12893)
  - Across 54,988 exits, 85.7% of backtest exit prices did not match 1-minute ground truth, some by more than 30%. — [freqtrade#13269](https://github.com/freqtrade/freqtrade/issues/13269)
  - Stoploss fills at the candle low/high in backtests, so "we cannot properly backtest or optimize stoploss levels today." — [freqtrade#12934](https://github.com/freqtrade/freqtrade/issues/12934)
  - Directional trade limits that work live fail in backtests, which opened 25+ longs when the limit was 3. — [freqtrade#12954](https://github.com/freqtrade/freqtrade/issues/12954)
  - A search of the Freqtrade repo returned 444 issues matching backtest/live/dry-run discrepancy terms. — [GitHub search, freqtrade/freqtrade](https://github.com/freqtrade/freqtrade/issues)
- [Verified, primary GitHub] Freqtrade's issue template now warns: "Has your strategy or configuration been generated by an AI model, and is now not working? This is almost certainly NOT a bug in Freqtrade… We'll close such issues." The template text was seen in [freqtrade#12893](https://github.com/freqtrade/freqtrade/issues/12893). This is direct evidence that LLM-generated strategies are now common among hobbyists, and that they fail often enough for maintainers to pre-empt them.
- [Anecdotal, r/algotrading via mirror] A trend-following FX algo was run for 8 months and ended up down. The poster said (via search snippet): "No regime filter meant it got chopped apart during ranging conditions. Sizing was static so when volatility expanded, I was overexposed." They also admitted tweaking the system during drawdowns. — [r/algotrading mirror snapshot](https://reddit.sentinel-team.org/posts/1t5bh8x/snapshots/2026-05-07T05%3A46%3A57.26771Z)
- [Anecdotal] In a beginner-advice thread, one commenter saw "avg 45% over 10 years" returns that turned out to come from "a very small error in my code that basically introduced lookahead bias." Others note that backtests "look great until they hit regime they've never seen." — [r/algotrading mirror](https://reddit.sentinel-team.org/posts/1t72n04/snapshots/2026-05-15T19%3A02%3A50.96329Z)
- [Anecdotal] A DEV Community post describes a backtest of +740% that made roughly $2.81 live. — [DEV Community](https://dev.to/aurora_systems/your-trading-bots-backtest-is-lying-to-you-here-are-the-4-ways-5044)
- [Anecdotal / vendor] A vendor post on ChatGPT-written Pine Script says the model omits lookahead settings on higher-timeframe calls, which causes repainting. It reports $4,180 in the backtest against $612 live on the same logic. — [PickMyTrade blog](https://blog.pickmytrade.io/chatgpt-pine-script-strategy-automated-no-code/)
- [Strong evidence] TradeZella and MarketCalls both warn that an LLM asked to "backtest" without data "estimates or simply invents the results". — [TradeZella blog](https://www.tradezella.com/blog/chatgpt-claude-backtesting); [MarketCalls](https://www.marketcalls.in/chatgpt/reasons-why-you-should-not-be-using-chatgpt-for-backtesting.html)
- [Anecdotal] An EliteTrader thread on trusting AI-written code before going live: "the code looks right, backtests clean, then it behaves differently in live." — [EliteTrader](https://www.elitetrader.com/et/threads/trusting-ai-written-strategy-code-before-going-live.390259/latest)
- [Anecdotal] Grid bots losing in trending or sharp moves:
  - A Pionex 1-star review says the futures grid bot lost money in a sharp price move. Pionex replied that profit "depends on… the bot's parameters, investment amount, market conditions." — [Pionex Trustpilot (CA)](https://ca.trustpilot.com/review/pionex.com?page=7)
  - A 3Commas reviewer said (via search snippet) that the grid bots "never made money, always losing despite being advertised as successful", and that a prorated refund was refused. — [3Commas Trustpilot UK p.4](https://uk.trustpilot.com/review/3commas.io?page=4)

**3. LLM autonomous trading: evidence of overtrading and failure (2025-2026)**
- [Strong evidence] Alpha Arena Season 1 (nof1, 18 October to around 3 November 2025) gave six LLMs $10,000 each to trade crypto perpetuals on Hyperliquid with no human help.
  - Only two made money: Qwen3-Max (+22.32%) and DeepSeek (+4.89%).
  - Claude Sonnet 4.5 lost about 30.8%, and GPT-5 ended with about $4,126.
  - [Forklog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/)
- [Anecdotal / secondary blog] Reported trade counts: Gemini 2.5 Pro made 238 trades in 17 days and paid about $1,331 in fees, roughly 13% of capital. Qwen made 43 trades. Analysts blamed overtrading. — [iWeaver](https://iweaver.ai/es/blog/alpha-arena-ai-trading-season-1-results)
- [Anecdotal / secondary blog] Chinese coverage was headlined "AI traders' 'interview' collapses: overtrading, chaotic strategies." — [Wallstreetcn](https://wallstreetcn.com/articles/3771681)
- [Strong evidence] Season 1.5 (US stocks): only one model ("Grok 4.20") was still profitable as of 8 December. — [Forklog](https://forklog.com/en/ai-model-grok-4-2-triumphs-in-trading-tournament/)
- The nof1 sample is tiny and short (noted by [Innobu](https://www.innobu.com/en/articles/ai-trading-competition-chinese-llms-investors.html)). It is not proof that LLMs cannot trade. It is, however, widely cited evidence that LLMs left alone overtrade and do not know when to sit still.

**4. Black box, "why did it do that?", and trust in automation**
- [Strong evidence, survey] Betterment Retail Investor Survey 2025 (n=1,200, published 25 June 2025):
  - 53% use generative AI for financial purposes at least monthly.
  - 30% trust AI for financial advice.
  - About 26% would let AI manage their investments. This figure appeared in a snippet of the survey PDF but I could not re-confirm it.
  - Betterment's 2026 survey puts trust in AI for financial advice at 31%.
  - [Betterment 2025 PDF](https://www.betterment.com/hubfs/PDFs/b4c/Betterment%20Retail%20Survey%202025.pdf); [Betterment 2026 release](https://digital-release.wowktv.com/business/press-releases/cision/20260812NY23035/betterments-2026-retail-investor-survey-reveals-a-new-generation-of-investors-is-blurring-the-lines-between-information-advice-and-entertainment)
- [Strong evidence, survey] Investing.com survey (n=938 US investors drawn from its own users, 3-10 March 2026):
  - 62% have used AI for investment decisions, mainly for research and ideas.
  - 54% trust AI analysis "only somewhat and typically verify", while 23% trust it mostly or completely.
  - 39% worry about incorrect or misleading recommendations, and 21% about over-reliance.
  - 15% say AI helps reduce emotional decisions.
  - [Hedge Fund Alpha](https://hedgefundalpha.com/news/retail-investors-now-use-ai-to-inform-investment-decisions/); [Investing.com blog](https://www.investing.com/blog/how-retail-investors-are-using-ai-in-2026-339)
- [Strong evidence] In WEF/BCG/Robinhood research (March 2025), 41% of Gen Z and Millennials would let an AI assistant manage their investments, against 14% of Baby Boomers. — [WEF press release](https://www.weforum.org/press/2025/03/new-research-finds-retail-investing-shift-towards-younger-investors-reshaping-market-trends/)
- [Strong evidence] EY reports that about 11% of consumers globally already let AI manage their finances with little or no human input. — via [InvestmentNews](https://www.investmentnews.com/transformation/half-of-investors-now-turning-to-ai-for-financial-decisions-as-autonomy-accelerates-study-finds/266315)
- [Verified, older] eToro Retail Investor Beat (2023, n=10,000 across 13 countries):
  - 11% used ChatGPT-style AI to pick or adjust investments.
  - 61% of users or open-minded respondents would let AI execute trades in future.
  - 46% (US) cited saving time on research.
  - [eToro press release](https://www.etoro.com/news-and-analysis/press-releases/one-in-ten-retail-investors-using-chat-gpt-style-ai-to-help-pick-and-manage-investments/)
- [Anecdotal] An r/algotrading commenter says LLMs "are better as judges (evaluating a setup you already found) than predictors." In other words, they want AI for research and critique, not autonomy. — [r/algotrading mirror](https://reddit.sentinel-team.org/posts/1rrnizz/snapshots/2026-03-12T22%3A51%3A16.46177Z)
- [Anecdotal] Copy-trading opacity: Brokerchooser notes that "little is known about many traders' backgrounds" on eToro CopyTrader, which makes risk hard to judge. — [Brokerchooser](https://brokerchooser.com/broker-reviews/etoro-review/copy-trading)
- [Verified] UK Financial Ombudsman cases about copy trading:
  - In one, a customer lost money when eToro closed the account of the trader he was copying. The complaint was not upheld. — [FOS DRN-4467717](https://financial-ombudsman.org.uk/decision/DRN-4467717.pdf)
  - In another, a mandatory "copy stop loss" closed all copied trades. — [FOS DRN-4069307](https://www.financial-ombudsman.org.uk/decision/DRN-4069307.pdf)
- [Strong evidence] ESMA's 2025 Final Report on Online Imitative Trading Practices (copy, mirror and social trading) flags possible investor harm "due to the automated nature of these strategies". This is known only from a secondary summary. — [Citi summary](https://www.citibank.com/icg/sa/flippingbook/2025/Global-Trustee-and-Fiduciary-Services-Bite-Sized-Issue-6-2025/8/)

**5. Not knowing when to turn a bot off, or when to do nothing**
- [Anecdotal] The lack of a regime filter and the urge to tweak during drawdowns are cited as causes of an 8-month algo loss. — [r/algotrading mirror](https://reddit.sentinel-team.org/posts/1t5bh8x/snapshots/2026-05-07T05%3A46%3A57.26771Z)
- [Anecdotal] Retail developers ask brokers for a programmable kill switch. Zerodha said there is no API for its kill switch. On cTrader the advice was "push the stop button." — [Kite forum](https://kite.trade/forum/discussion/10460/is-there-api-to-enable-kill-switch-feature); [cTrader forum](https://community.ctrader.com/forum/ctrader-support/21648)
- [Anecdotal] A G2 reviewer of 3Commas complained that cancelling a subscription moves the account to the free plan and can cancel active deals that are "deep in the red". The bot's lifecycle is tied to billing. — [G2 3Commas pricing reviews](https://www.g2.com/products/3commas/pricing)
- [Strong evidence, secondary] Overtrading by autonomous LLMs in Alpha Arena (see section 3).

**6. Behavioural mistakes: overtrading, revenge trading, FOMO. Background: most active traders lose**
- [Verified, academic] Barber & Odean (2000, Journal of Finance), 66,465 US households, 1991-96: the most active traders earned 11.4% a year against a 17.9% market return. — [Berkeley PDF / abstract page](https://faculty.haas.berkeley.edu/odean/papers/returns/returns.html)
- [Verified, academic] Taiwan day traders (Barber, Lee, Liu & Odean): more than 8 in 10 lose money. Fewer than 1% "predictably and reliably earn positive abnormal returns net of fees". A later version puts it at under 3%. — [Odean day trading skill paper](https://faculty.haas.berkeley.edu/odean/papers/day%20traders/Day%20Trading%20Skill%20110523.pdf); [Learning fast or slow](https://www.econ.puc-rio.br/uploads/adm/seminarios/Learning_fast_or_slow_180606.pdf)
- [Verified, academic] Brazil: Chague, De-Losso & Giovannetti, "Day Trading for a Living?" (FGV/SSRN 2019-2020).
  - Among people who day traded mini-index futures for 300 or more days (cohort starting 2013-15), 97% lost money.
  - Only 0.4% earned more than a bank teller's wage (about US$54 a day). The best earned about US$310 a day.
  - There was "no evidence of learning".
  - The CXO summary gives 19,646 starters, 3.0% with positive returns and 0.5% above teller wages. The difference comes from the denominator.
  - [FGV repository](https://repositorio.fgv.br/items/e87d04fc-4b4c-4a56-ab5a-1c84c1afde1b/full); [CXO Advisory](https://www.cxoadvisory.com/investing-expertise/day-trading-a-bust/)
- [Verified] CFD loss rates:
  - ESMA (2018): national regulators' data show 74-89% of retail CFD accounts lose money, with average losses of €1,600-€29,000 per client. — [ESMA](https://www.esma.europa.eu/node/84933)
  - FCA (2016 sample): 82% of clients lost money on CFDs. — [FCA press release](https://fca.org.uk/news/press-releases/fca-proposes-stricter-rules-contract-difference-products)
  - Current broker disclosures: IG 71% (a July 2025 page), with 69-78% on other pages. Plus500 is around 80%. These figures could not be fully dated. — [FXEmpire comparison](https://www.fxempire.com/brokers/compare/plus500-vs-ig)
- [Verified, multiple studies] Polymarket:
  - Most estimates put loss-making wallets at 70-84%: Sergeenkov (April 2026, 2.5m wallets) found 84.1%, and Reichenbach & Walter and DeFi Oasis found about 70%. — [The Defiant](https://thedefiant.io/news/research-and-opinion/polymarket-profitability-report-april-2026); [Casino.org](https://www.casino.org/news/84-of-polymarket-traders-arent-profitable/)
  - A Martineau co-authored paper found about 69% lost money and the top 1% captured three-quarters of profits.
  - An LBS/Yale paper classed only 3.14% of accounts as skilled winners. — [KuCoin summary](https://www.kucoin.com/news/flash/3-14-of-polymarket-traders-account-for-30-of-profits-67-of-users-bear-all-losses)
  - Bloomberg: since the start of 2025, more than 100,000 wallets have lost at least $1,000, nearly twice as many as gained that much. Remove the top winners and everyone else is down $131m net. Most of the winners' profits went to what look like bots. — [Finance Magnates on Bloomberg](https://www.financemagnates.com/fintech/100000-polymarket-wallets-lost-at-least-1000-bloomberg-analysis-shows/); [Bloomberg Gov](https://news.bgov.com/crypto/prediction-market-users-suffer-broad-losses-as-bots-reap-gains)
- [Verified] FCA research (2021) on young high-risk investors: 76% felt "a sense of competitiveness" when investing, and only 21% planned to hold their latest investment for more than a year. — [FCA press release](https://www.fca.org.uk/news/press-releases/young-investors-driven-competition-hype)
- [Anecdotal] Typical r/Daytrading pattern (December 2025, via mirror): won two trades, wanted more, took a big loss and blew the account. A commenter said the behaviour "can be changed". — [r/Daytrading mirror](https://reddit.sentinel-team.org/posts/1ptxh7x/snapshots/2025-12-23T19%3A41%3A14.44227Z)
- [Anecdotal] A NinjaTrader forum user gave up trying to "develop discipline" and instead hard-coded intraday loss gates that shut trading off. This is demand for enforced, not advisory, risk rules. — [NinjaTrader Discourse](https://discourse.ninjatrader.com/t/how-do-you-guys-deal-with-overtrading/6334?page=2)
- [Anecdotal / vendor] Prop firms: about 70% of evaluation failures come from breaching a loss limit (maximum drawdown or daily cap). — [HackerNoon](https://hackernoon.com/the-real-reason-traders-blow-prop-firm-evaluations)

**7. Journaling discipline**
- [Anecdotal / vendor blogs] Reasons traders quit journaling:
  - Logging takes too long: 15 fields plus screenshots can come to more than 8 hours a week at 5 trades a day, or 30-60 minutes after the close, and "nobody does that for more than a few days." — [Traders Second Brain](https://traderssecondbrain.com/guides/trading-journal-for-day-trading)
  - Logs never get reviewed: "A journal you do not review is a diary." — [TradeZella tips](https://www.tradezella.com/blog/trading-journal-tips)
  - Avoidance after painful trades, and doubt about whether it helps ("It feels like extra work after a bad day"). — [The Perceptive Trader](https://theperceptivetrader.substack.com/p/why-most-traders-quit-journaling)
- [Anecdotal] Broker auto-sync failures are the most common TradeZella complaint and a reason given for wanting to cancel. Examples: "wasn't able to sync with my forex broker", and a CSV import that failed on day one. — [TradeZella Trustpilot](https://uk.trustpilot.com/review/tradezella.com?page=7)
- [Anecdotal, secondary aggregator] TraderSync 2026 reviews are described as mostly negative: "stats calculated wrongly, especially with currency conversion, failing syncs and a mandatory redesign." — [thegodfunded TraderSync](https://thegodfunded.com/en/tools/tradersync/)

**8. Too many signals, low-quality signal groups, no time to monitor**
- [Anecdotal] A Trustpilot reviewer tried several paid groups, one of which "cost them money and confidence". As a student they could not keep up with a paid group's time demands. — [PlayBit Trustpilot](https://ch.trustpilot.com/review/playbit.info?page=7)
- [Anecdotal] Positive signal-group reviews praise education and community more than the calls themselves. — [Trader Signals Trustpilot](https://nl-be.trustpilot.com/review/tradersignals.io)
- [Strong evidence] Saving time on research is a main reason for using AI (eToro 2023, 46% in the US), and "analyse market data faster" is the top AI benefit (Investing.com 2026, nearly 40%). — [eToro US](https://www.etoro.com/en-us/news-and-analysis/latest-news/press-release/four-in-ten-u-s-retail-investors-use-or-are-open-to-using-chat-gpt-style-ai-to-help-pick-and-manage-investments/); [Hedge Fund Alpha](https://hedgefundalpha.com/news/retail-investors-now-use-ai-to-inform-investment-decisions/)
- [Unknown] I found no quantitative data on "alert fatigue" or signal overload among retail traders.

**9. Platform complexity, reliability, billing and security**
- [Verified] 3Commas API-key compromise (October to December 2022): HAPI verified losses of $27.3m across 86 users, of which about $23.5m was on Binance. ZachXBT verified $14.8m across 44 victims. 3Commas denied a breach at first and confirmed it on 29 December 2022. — [BleepingComputer](https://www.bleepingcomputer.com/news/security/crypto-platform-3commas-admits-hackers-stole-api-keys); [Forklog/HAPI](https://forklog.com/en/news/api-key-leaks-and-exchange-inaction-a-hapi-analysis-of-the-3commas-incident)
- [Anecdotal] r/3commasCommunity still has recurring threads on API-key leaks, including a $150k loss, and on whether the bots are profitable at all. — [GummySearch r/3commasCommunity](https://gummysearch.com/r/3commasCommunity/)
- [Anecdotal] Other 3Commas complaints: charged despite a "free trial"; a rebalancing bot bought BTC about €700 above market; an App Store reviewer called it "a waste of time and money" and said a refund never arrived. The company replies that it "never guarantees profits." — [3Commas Trustpilot](https://uk.trustpilot.com/review/3commas.io?page=3); [Apple App Store](https://apple.co/4dWYmbC)
- [Anecdotal, competitor source] In October 2025 3Commas overhauled pricing and limited its Starter plan to one exchange connection. — [Gainium on 3Commas](https://gainium.io/review/3commas)
- [Strong evidence] Pionex's Trustpilot score is about 2.3-2.6, with complaints clustering on withdrawal delays and verification friction. One review said "it took me months to get my money out." — [Coin Bureau Pionex review (August 2025)](https://coinbureau.com/review/pionex/); [RFP.wiki](https://www.rfp.wiki/vendors/pionex)
- [Strong evidence] Cryptohopper's Trustpilot score is about 3.8/5 from roughly 362-389 reviews, and polarised: 59% five-star and 25% one-star. "Inconsistent trading bot performance" is a recurring negative. A reviewer wrote (via search snippet): "The UI is not the best, but its not so important if u want to make money." — [Gainium on Cryptohopper](https://gainium.io/review/cryptohopper); [SaaSworthy](https://www.saasworthy.com/product/cryptohopper/reviews)
- [Anecdotal] TradingView: a September 2025 reviewer says the basic plan now has a 10-minute data delay, "forcing you to buy a more expensive one". Other reviews complain of chatbot-only support for billing. — [TradingView Trustpilot](https://www.trustpilot.com/review/tradingview.com?page=9)

### Inferences
- [Speculative] Trust and verification is the pain that ties the others together. Scams, faked P&L, LLM-fabricated backtests and backtest/live divergence are all the same problem: claims about performance that cannot be checked. A product that verifies its own claims (out-of-sample, live-tracked and auditable records, with costs included) is answering the most frequent complaint, not adding a nice-to-have.
- [Speculative] Users rarely say "the bot doesn't know when to do nothing" in those words. It shows up instead as "no regime filter", "chopped up in ranging markets", "grid bot lost in a trend", "overtrading" (Alpha Arena) and "I tweaked it during drawdown". The behaviour users actually want is a regime-aware stand-down plus a hard kill switch.
- [Speculative] Survey data consistently show a gap: about 50-60% use AI for research, but only about 25-30% would hand it their money (Betterment, Investing.com, WEF). That supports a "research copilot with a human approving each trade" positioning over "autonomous AI trader", at least for mainstream UK and US users.
- [Speculative] Behavioural mistakes are where the most money is lost, but they are the hardest to monetise. Traders know the problem, and journals already sell "mistake tagging", yet the evidence (no learning effect in the Brazil study, and people quitting journaling) suggests advisory tools are not enough. Enforced guardrails (loss gates, cooldowns) come up as what actually works.

### Gaps
- Full Reddit threads (r/algotrading, r/Daytrading, r/CryptoCurrency, r/Polymarket, r/UKInvesting, r/Forex) could not be read directly. Fetches were blocked, so only mirror snippets were used. I have no upvote counts and so no way to weight frequency by engagement.
- Trustpilot star distributions for 3Commas, TradeZella and eToro could not be read directly. 3Commas's TrustScore is about 4.3-4.5 from 1,754 reviews according to snippets, which is surprisingly positive and may reflect solicited reviews. I could not check this.
- I could not find a 2025 FTC enforcement action specifically on AI trading bots. US enforcement material found was from the CFTC, SEC, NASAA, FINRA and the FBI.
- I found no data on how often users switch bots off, or for what reasons.

---

## Q2. What do traders currently use and pay for, what makes them cancel, and what would make them recommend a product?

### Takeaway
The typical paid stack is: TradingView (charting and alerts, roughly $15-$70+ a month); a journal (TradeZella about $29-$49 a month, Edgewonk $169 a year, TraderSync, Tradervue or the free TradesViz); in crypto, bot platforms such as 3Commas, Cryptohopper or Pionex; paid Discord or Telegram signal groups; and general LLMs (ChatGPT, Claude) used for free or on existing subscriptions. Cancellations are driven by bots that don't make money, broken broker sync, price rises and paywalled data, billing and refund friction, and security or withdrawal fears. Positive reviews praise responsive human support, ease of use, education and community, and honest framing ("no profit guarantee").

### Cited Findings

**Charting and alerts**
- [Anecdotal / single source] TradingView is said to have raised every paid plan by about 17-20% on 10 April 2026, with Premium at $69.95 a month or $59.95 a month billed annually. This is not confirmed on TradingView's own site. — [ChartingLens](https://chartinglens.com/blog/tradingview-price-increase-2026)
- [Anecdotal] TradingView tiers range from $0 to $239.95 a month. This comes from a page labelled "PR Sample". — [ImpactWealth](https://impactwealth.org/how-much-does-tradingview-really-cost-full-pricing-breakdown-2026/)
- [Anecdotal] TradingView complaints: delayed data on lower tiers, refunds on annual plans ($178.32 example) and chatbot-only support. — [TradingView Trustpilot](https://www.trustpilot.com/review/tradingview.com?page=9)

**Journals** (all prices vary by source and date)
- [Strong evidence] Edgewonk costs $169 a year, with no trial but a 14-day money-back guarantee. It is known for its psychology tools. — [DayTradingz](https://daytradingz.com/best-trading-journal)
- [Strong evidence] TradeZella has Essential at $29 a month or $288 a year, and Premium at $49 a month or $399 a year. There is no free tier. It offers trade replay and tags for mistakes such as FOMO and revenge trading. — [DayTradingz](https://daytradingz.com/best-trading-journal); [TradeZella alternatives](https://daytradingz.com/tradezella-alternatives/)
- [Strong evidence] TraderSync covers 950+ brokers and has mobile apps, priced at about $14.97-$29.95 a month. — [NYC Servers](https://newyorkcityservers.com/blog/best-trading-journal-apps)
- [Strong evidence] Tradervue has a free tier (30-100 trades a month depending on the source). TradesViz offers a free tier with about 3,000 executions a month. — [Tradervue blog](https://tradervue.com/blog/best-trading-journal)
- [Anecdotal] Trustpilot ratings:
  - Edgewonk: 4.5/5 from only 40 reviews. — [Edgewonk Trustpilot](https://ca.trustpilot.com/review/edgewonk.com)
  - TradeZella: claims 4.8/5. This is self-reported. — [TradeZella blog](https://www.tradezella.com/blog/tradezella-review-2026-honest)

**Crypto bots**
- [Anecdotal / competitor source] 3Commas restructured its plans in October 2025, with a single-exchange limit on Starter. — [Gainium](https://gainium.io/review/3commas)
- [Strong evidence] Cryptohopper scores about 3.8/5 and is polarised between 5-star and 1-star reviews. — [Gainium](https://gainium.io/review/cryptohopper)
- [Strong evidence] Pionex has free built-in bots, makes money on exchange fees and is registered with FinCEN. Its Trustpilot score is about 2.3/5, mainly over withdrawals. — [Coin Bureau](https://coinbureau.com/review/pionex/)

**Quant platforms**
- [Verified] QuantConnect plans: Free $0, Researcher $84 a month ($888 a year), Team $168, Trading Firm $480. Alternative data costs extra. — [QuantConnect pricing](https://www.quantconnect.com/pricing.md)
- [Anecdotal] A QuantConnect user found the local-data pricing "confusing and spent money unnecessarily". — [QuantConnect forum](https://www.quantconnect.com/forum/discussion/14609/my-notes-on-payment-for-local-historical-data-using-lean-cli/)

**Copy trading**
- [Strong evidence] eToro Popular Investors can earn up to 2% of the assets copying them, which gives them an incentive to market themselves. — [Share-Talk interview](https://www.share-talk.com/etoro-director-we-onboarded-more-customers-in-a-day-than-an-entire-year.md)

**Polymarket tools**
- [Anecdotal / vendor] A cottage industry of Polymarket copy-trading Telegram bots (PolyCop, Polycopy and others) has grown up. Vendors concede that speed matters ("missing copy trades by 10 seconds"). — [Medium: Polymarket copy trading 2026](https://medium.com/@0xicaruss/polymarket-copy-trading-in-2026-how-it-actually-works-which-bots-are-worth-using-and-how-to-set-0176a4d1ddad); [Product Hunt Polycopy](https://www.producthunt.com/products/polycopy/launches/polycopy-2-0)

**LLM use**
- [Strong evidence] 53% of investors use generative AI at least monthly for financial purposes (Betterment 2025), and 62% have used AI for investment decisions (Investing.com 2026). — [Betterment](https://www.betterment.com/retail-report); [Hedge Fund Alpha](https://hedgefundalpha.com/news/retail-investors-now-use-ai-to-inform-investment-decisions/)

**Why users cancel**
- Bots unprofitable or not as advertised (3Commas, Pionex grid, Cryptohopper "inconsistent performance") — [3Commas Trustpilot](https://uk.trustpilot.com/review/3commas.io?page=4); [SaaSworthy](https://www.saasworthy.com/product/cryptohopper/reviews)
- Broker sync failures (TradeZella, TraderSync) — [TradeZella Trustpilot](https://uk.trustpilot.com/review/tradezella.com?page=7); [thegodfunded](https://thegodfunded.com/en/tools/tradersync/)
- Paywalls, delayed data and price rises (TradingView) — [Trustpilot](https://www.trustpilot.com/review/tradingview.com?page=9)
- Refund and billing friction: annual plans with no prorated refund, charges during a "free trial", and cancellation that kills active deals — [3Commas Trustpilot p.3](https://uk.trustpilot.com/review/3commas.io?page=3); [G2](https://www.g2.com/products/3commas/pricing)
- Security fears (API-key leak) and withdrawal delays — [BleepingComputer](https://www.bleepingcomputer.com/news/security/crypto-platform-3commas-admits-hackers-stole-api-keys); [Coin Bureau](https://coinbureau.com/review/pionex/)
- Time cost (students and other time-poor users leaving paid groups) — [PlayBit Trustpilot](https://ch.trustpilot.com/review/playbit.info?page=7)

**Why users recommend**
- Human support that resolves problems. Several TradeZella reviewers say support stopped them cancelling. — [TradeZella Trustpilot](https://uk.trustpilot.com/review/tradezella.com?page=7)
- Education and community rather than raw calls. — [Trader Signals Trustpilot](https://nl-be.trustpilot.com/review/tradersignals.io)
- Value for money and custom statistics. — [Edgewonk Trustpilot](https://ca.trustpilot.com/review/edgewonk.com)

### Inferences
- [Speculative] Willingness to pay is proven at roughly £15-£60 a month per tool among active traders, and many stack 2-4 tools (charting, journal, bot, signals). The proposition with room left is consolidation plus verification: a research copilot, risk governor and journal in one place.
- [Speculative] Journals keep customers through support and analytics, but churn when data gets in (sync) or when the user won't keep it up. An auto-populated journal with AI review ("here is what you did wrong this week") would address both causes of churn.
- [Speculative] Bot platforms lose users when results disappoint, and users take an honest "no profit guarantee" framing as a sign of credibility. Transparent records of live performance, costs included, could become a competitive edge.

### Gaps
- I found no public churn or retention figures for TradeZella, 3Commas, Cryptohopper or TradingView. [Unknown]
- I found no reliable UK-specific data on how many retail traders pay for signal groups, or how much they pay. [Unknown]
- I have no direct evidence on whether traders pay for ChatGPT or Claude specifically for trading. Usage is shown, but not attributable spend. [Unknown]
- I found no Edgewonk-specific complaints.

---

## Q3. Which segments exist, how big are they, and which combines the most acute pain, willingness to pay and weakest existing solution?

### Takeaway
By headcount, beginners and casual crypto holders dominate: about 8% of UK adults held crypto in 2025, roughly 4.5m people. They are the most exposed to scams but have low willingness to pay and churn quickly. The segment with the best mix of acute pain, proven spending and weak existing solutions looks like **intermediate-to-experienced active traders**: crypto bot users, prop-firm challengers, retail CFD and futures day traders, and quant hobbyists. They already pay for several tools, lose money in documented ways (regime failure, rule breaches, overtrading), and today's tools are either opaque bots or passive journals. Polymarket traders feel the pain acutely, but in the UK they are a small and legally grey group, since the platform blocks UK users.

### Cited Findings

**UK crypto holders**
- [Strong evidence] FCA Cryptoasset Consumer Research 2025 (Wave 6, YouGov, fieldwork 5 August to 2 September 2025, 2,353 interviews in the first phase):
  - 8% of UK adults hold crypto, down from 12% in 2024. Press reports put that at about 4.5m holders, down from about 7m.
  - Awareness is 91%.
  - Ownership is 11% among men and 15% among 18-34s.
  - The mean holding rose to about £2,500, though one report gave it in dollars.
  - 9% bought with credit.
  - 25% would invest more if crypto were better regulated.
  - [FCA research note 2025](https://www.fca.org.uk/publications/research-notes/cryptoassets-consumer-research-2025); [FCA Wave 6 PDF](https://www.fca.org.uk/publication/research-notes/cryptoasset-consumer-research-2025-wave-6.pdf)
  - Figures came via search summaries. The FCA site could not be fetched directly.
- [Strong evidence] An FCA cost-benefit analysis says demand for crypto doubled between 2020 and 2025, from 4% to 8%, and that consumers are "mainly motivated by large price rises and the chance to make money quickly." — [FCA CBA](https://www.fca.org.uk/publication/policy/cba-aggregate-cryptoasset.pdf)
- [Strong evidence, secondary analysis of FCA Financial Lives 2024] 4.3% of UK adults hold crypto and 0.7% trade CFDs. 44% of crypto holders first invested three or more years ago, and only 10% have less than a year's experience. For CFD traders the figures are 46% and 16%. — [The Citizen, on a TradingPlatforms.co.uk analysis](https://thecitizen.co.tz/tanzania/business/britain-s-high-risk-investors-were-not-mostly-beginners-fca-based-study-found-5405006)
  - **Conflict:** this 4.3% (Financial Lives 2024) differs from the 8-12% in the FCA crypto tracker. They are different surveys with different questions and samples. Use them as a range: roughly 2.3m-4.5m UK adults.
- [Speculative] With about 53m UK adults, 0.7% CFD traders works out at roughly 370k UK CFD and spread-bet traders.
- [Verified] FCA Financial Lives 2024 had 17,950 respondents. Among people with more than £10k of investible assets, 61% held at least three-quarters of it in cash. — [FCA Financial Lives 2024](https://www.fca.org.uk/financial-lives/financial-lives-2024)

**Loss rates by segment**
- [Verified] CFDs: 74-89% of accounts lose money (ESMA). — [ESMA](https://www.esma.europa.eu/node/84933)
- [Verified] Persistent day traders: 97% lose money (Brazil). — [FGV](https://repositorio.fgv.br/items/e87d04fc-4b4c-4a56-ab5a-1c84c1afde1b/full)
- [Verified] Taiwan day traders: more than 80% lose, and fewer than 1-3% are reliably profitable. — [Odean papers](https://faculty.haas.berkeley.edu/odean/papers/day%20traders/Day%20Trading%20Skill%20110523.pdf)
- [Strong evidence] Polymarket: 70-84% of wallets unprofitable. — [The Defiant](https://thedefiant.io/news/research-and-opinion/polymarket-profitability-report-april-2026)

**Polymarket size and UK access**
- [Strong evidence] Monthly active traders hit an all-time high of 477,850 in October 2025 (the previous high was 462,600 in January 2025). The number fell to about 242,000 in June 2025. — [The Block](https://www.theblock.co/post/377214/polymarket-rebounds-kalshi-leads); [Sigma](https://sigma.world/news/polymarket-hits-1-2b-june-volume-despite-declining-users/)
- [Anecdotal / affiliate guides] UK IP addresses are reportedly geoblocked. Using a VPN breaks Polymarket's terms of service and risks suspension. Neither Kalshi nor Polymarket US serves UK residents. — [StartPolymarket UK](https://startpolymarket.com/countries/united-kingdom/); [TradeTheOutcome](https://www.tradetheoutcome.com/how-to-use-polymarket-in-uk/)

**Prop-firm challengers (semi-pro, high willingness to pay, acute rule-breach pain)**
- [Strong evidence, mixed quality] Reported pass rates:
  - Industry estimates range from 5-14% to 15-25%.
  - Firms that publish figures for 2025: Earn2Trade 8.89% of attempts, Topstep 16.8%, Take Profit Trader 36.22%. Counted per person instead, 51.8% of Topstep's 2025 participants passed at least once.
  - About 7% of everyone who buys a challenge is ever paid out. This may be a single source repeated.
  - [Track360](https://track360.io/blog/prop-trading-industry-statistics-2026); [Thor Trade Copier](https://thortradecopier.com/blog/prop-firm-challenge-pass-rate)
- [Anecdotal / vendor] About 70% of failures are breaches of drawdown or daily loss limits. — [HackerNoon](https://hackernoon.com/the-real-reason-traders-blow-prop-firm-evaluations)

**Quant hobbyists**
- [Verified] Freqtrade issue volume (444 matches on backtest/live/dry-run terms), and maintainers proactively closing issues about AI-generated strategies. — [freqtrade#12893](https://github.com/freqtrade/freqtrade/issues/12893)
- [Verified] They pay for tools and data. QuantConnect Researcher costs $84 a month. — [QuantConnect pricing](https://www.quantconnect.com/pricing.md)

**AI trust by age**
- [Strong evidence] 41% of Gen Z and Millennials would let AI manage their investments, against 14% of Boomers. — [WEF](https://www.weforum.org/press/2025/03/new-research-finds-retail-investing-shift-towards-younger-investors-reshaping-market-trends/)
- [Strong evidence] In one self-selected survey of 1,400 US crypto traders, 70% were comfortable with AI managing their portfolio within parameters they set. This should not be generalised. — via [InvestmentNews](https://www.investmentnews.com/transformation/half-of-investors-now-turning-to-ai-for-financial-decisions-as-autonomy-accelerates-study-finds/266315)

### Segment matrix

All ratings below are [Speculative] analyst judgements built from the cited evidence above.

| Segment | Est. size (UK unless stated) | Acute pain | Willingness to pay | Strength of existing solutions | Notes |
|---|---|---|---|---|---|
| Beginner / casual crypto holder | ~2.3m-4.5m UK adults (4.3-8%) | High (scams, FOMO) but they often don't recognise it | Low | Moderate (exchanges, education, FCA warnings) | Most scam exposure. Low tolerance for complexity. High churn. Regulatory risk if marketed "AI trading". |
| Intermediate active retail (day/swing trader, CFD/spread bet) | ~370k UK CFD traders (0.7%) plus share traders; [Unknown] precise | Very high (74-89% lose; overtrading, revenge trading) | Medium to high (journals, TradingView, signals) | Weak to moderate (journals are passive, signals opaque) | Strong candidate. |
| Experienced / semi-pro incl. prop-firm challengers | [Unknown] UK count. Prop pass rates ~5-36% per attempt | Very high (rule breaches cause ~70% of failures) | High (buy repeated challenges, several tools) | Weak (few products enforce discipline for the trader) | Strong candidate. |
| Crypto bot users (3Commas, Cryptohopper, Pionex) | [Unknown]; 3Commas has 1,754 Trustpilot reviews, Cryptohopper ~360-390 | High (regime losses, black box, security) | Medium (subscriptions); fragile trust | Weak to moderate (opaque grid/DCA bots) | Strong candidate if the product is explainable and regime-aware. |
| Polymarket / prediction-market traders | ~242k-478k global MAU (2025); UK officially blocked | Very high (70-84% lose; bots take profits) | Medium (copy bots) | Weak | UK access is a blocker. Better for a US/EU/global product. |
| Quant hobbyist (Freqtrade, QuantConnect, Pine) | [Unknown] | High (backtest/live parity, overfitting, AI-written code) | Medium (pay for data and compute; dislike black boxes) | Moderate (strong open-source tools, weak validation) | Wants validation and diagnostics, not signals. |
| Long-term investor (ISA/SIPP) | Large (most UK investors) | Low to medium (noise, research time) | Low to medium | Strong (robo-advisers, platforms) | 26-30% trust AI with money. Research-copilot use only. |
| Professional | Small | Medium | High | Strong (Bloomberg, in-house) | Out of scope. |

### Inferences
- [Speculative] The best wedge segment is **intermediate-to-experienced active traders, including prop-firm challengers and crypto bot users**. Their pain is documented and expensive: rule breaches, regime losses, overtrading. They already pay £15-£60+ per tool, and current tools are either opaque (bots, signals) or passive (journals). This is where explainability, a "should I be trading at all today?" regime gate, enforced risk limits and a verified track record do the most work.
- [Speculative] For UK positioning, Polymarket is risky to lead with because of the geoblock and regulatory grey zone. Crypto (8% of adults, regulated FCA promotions regime) and CFD/spread-bet traders are the accessible UK markets.
- [Speculative] Beginners are the largest group but the worst first market: low willingness to pay, high scam adjacency (marketing an "AI trading bot" to them looks like the scams regulators warn about), and the highest chance of harm.

### Gaps
- I found no reliable count of UK retail day traders, UK users of crypto bot platforms, or UK prop-firm participants. [Unknown]
- The Financial Lives 2024 Annex A spreadsheet (numbers of UK adults holding shares and investments) could not be accessed. [Unknown]
- I found no audited FTMO pass-rate disclosure. FTMO's figure of about 9-10% is second-hand.
- No user-count disclosures for 3Commas, Cryptohopper or Pionex were found.

---

## Q4. Ranked pain points: frequency × severity × willingness to pay × weakness of existing solutions

### Takeaway
On a 1-5 scale for each factor (all scores [Speculative], based on the evidence above), the top opportunities are:
1. Performance claims that can't be verified, and scams.
2. Backtest-to-live failure and regime blindness.
3. No regime-aware "stand down" or kill switch.
4. Behavioural self-sabotage without enforced guardrails.
5. Black-box opacity and low trust in automation.

Journaling friction, signal overload and time-to-monitor are real but less acute, or already partly solved.

### Cited Findings
The scoring rests on the evidence in Q1-Q3. Key anchors for each pain point:
- **Unverifiable claims and scams.** FBI IC3: $5.8bn crypto investment fraud in 2024 and $7.2bn in 2025 ([Fox Business](https://www.foxbusiness.com/lifestyle/crypto-fraud-tops-fbis-annual-crime-report-americans-lose-billions-scams)). UK Finance: £221.5m in investment scams in 2025 ([Crypto Times](https://www.cryptotimes.io/2026/06/15/uk-investment-scam-losses-hit-221m-as-ai-fuels-crypto-fraud/)). FCA "AI trader bot" and Quantum AI warnings ([FCA](https://www.fca.org.uk/news/warnings/ai-trader-bot); [Which?](https://www.which.co.uk/news/article/what-is-the-quantum-ai-scam-acsiK7o1b7qr)). LLMs inventing backtests ([TradeZella](https://www.tradezella.com/blog/chatgpt-claude-backtesting)).
- **Backtest-to-live gap and regime failure.** Freqtrade issues #12894, #12893, #13269 and #12934 ([GitHub](https://github.com/freqtrade/freqtrade/issues/13269)). The r/algotrading 8-month regime loss ([mirror](https://reddit.sentinel-team.org/posts/1t5bh8x/snapshots/2026-05-07T05%3A46%3A57.26771Z)). Grid-bot losses on Pionex and 3Commas ([Pionex TP](https://ca.trustpilot.com/review/pionex.com?page=7); [3Commas TP](https://uk.trustpilot.com/review/3commas.io?page=4)).
- **No "do nothing" logic or kill switch.** Alpha Arena overtrading: Gemini made 238 trades and paid about 13% of capital in fees ([iWeaver](https://iweaver.ai/es/blog/alpha-arena-ai-trading-season-1-results)). Kill-switch API requests ([Kite forum](https://kite.trade/forum/discussion/10460/is-there-api-to-enable-kill-switch-feature)).
- **Behavioural mistakes.** Barber & Odean: 11.4% against 17.9% for the market ([Berkeley](https://faculty.haas.berkeley.edu/odean/papers/returns/returns.html)). Brazil: 97% lose, with no learning ([FGV](https://repositorio.fgv.br/items/e87d04fc-4b4c-4a56-ab5a-1c84c1afde1b/full)). Prop failures mostly loss-limit breaches ([HackerNoon](https://hackernoon.com/the-real-reason-traders-blow-prop-firm-evaluations)). FCA: 76% of young high-risk investors feel competitive ([FCA](https://www.fca.org.uk/news/press-releases/young-investors-driven-competition-hype)).
- **Black box and trust.** Only about 26-30% would trust AI with their money ([Betterment](https://www.betterment.com/hubfs/PDFs/b4c/Betterment%20Retail%20Survey%202025.pdf)). 54% verify AI output and 39% fear wrong recommendations ([Hedge Fund Alpha](https://hedgefundalpha.com/news/retail-investors-now-use-ai-to-inform-investment-decisions/)). Copy-trading opacity and FOS complaints ([FOS](https://financial-ombudsman.org.uk/decision/DRN-4467717.pdf)).
- **Wanting AI research without autonomy.** 62% use AI for research and ideas, but far fewer delegate. LLMs as "judges, not predictors" ([r/algotrading mirror](https://reddit.sentinel-team.org/posts/1rrnizz/snapshots/2026-03-12T22%3A51%3A16.46177Z)).
- **Security and custody.** 3Commas API-key losses of $14.8m-$27.3m ([Forklog/HAPI](https://forklog.com/en/news/api-key-leaks-and-exchange-inaction-a-hapi-analysis-of-the-3commas-incident)). Pionex withdrawal complaints ([Coin Bureau](https://coinbureau.com/review/pionex/)).
- **Journaling discipline.** Time cost and never reviewing logs ([Traders Second Brain](https://traderssecondbrain.com/guides/trading-journal-for-day-trading); [Perceptive Trader](https://theperceptivetrader.substack.com/p/why-most-traders-quit-journaling)). Sync failures ([TradeZella TP](https://uk.trustpilot.com/review/tradezella.com?page=7)).
- **Signal quality and overload.** Fake VIP results and paid groups that cost money ([Forex Peace Army](https://www.forexpeacearmy.com/community/goto/post?id=354707); [PlayBit TP](https://ch.trustpilot.com/review/playbit.info?page=7)).
- **Time to monitor.** Saving research time is the main reason for adopting AI ([eToro](https://www.etoro.com/en-us/news-and-analysis/latest-news/press-release/four-in-ten-u-s-retail-investors-use-or-are-open-to-using-chat-gpt-style-ai-to-help-pick-and-manage-investments/)).
- **Complex UIs, billing and support.** Cryptohopper "UI is not the best", 3Commas billing and cancellation issues, TradingView chatbot support ([SaaSworthy](https://www.saasworthy.com/product/cryptohopper/reviews); [G2](https://www.g2.com/products/3commas/pricing); [TradingView TP](https://www.trustpilot.com/review/tradingview.com?page=9)).

### Inferences

Ranking table. Every score is [Speculative] analyst judgement. F = frequency, S = severity, WTP = willingness to pay, W = weakness of existing solutions (5 = weakest). Score = product of the four, maximum 625.

| Rank | Pain point | F | S | WTP | W | Score | Evidence label | Best-fit segment |
|---|---|---|---|---|---|---|---|---|
| 1 | Unverifiable performance claims (fake backtests, P&L screenshots, AI-invented results) and scams | 5 | 5 | 3 | 4 | 300 | Verified (regulators, FBI) + Anecdotal (forums) | All; acute for beginners and crypto |
| 2 | Backtest-to-live gap, overfitting, regime blindness (bot loses in chop or trend) | 4 | 4 | 4 | 4 | 256 | Verified (GitHub) + Anecdotal | Quant hobbyists, crypto bot users |
| 3 | Not knowing when to switch off; the bot can't "do nothing"; no kill switch or regime gate | 3 | 4 | 4 | 5 | 240 | Anecdotal + Strong (Alpha Arena) | Bot users, semi-pro, prop |
| 4 | Behavioural self-sabotage (overtrading, revenge, FOMO, rule breaches) with no enforced guardrails | 5 | 4 | 3 | 3 | 180 | Verified (academic loss data) + Anecdotal | Intermediate, prop challengers |
| 5 | Black box: not knowing why a trade was taken; low trust in automation with money | 4 | 3 | 3 | 4 | 144 | Strong (surveys) + Anecdotal | Bot users, copy traders, investors |
| 5= | Wants AI research and second opinion, not autonomy; fear of hallucination | 4 | 3 | 3 | 4 | 144 | Strong (surveys) | Intermediate, investors, quant hobbyists |
| 7 | Security and custody (API keys, withdrawals) | 3 | 5 | 2 | 3 | 90 | Verified (3Commas breach) + Anecdotal | Crypto bot users |
| 8 | Journaling discipline (too slow, never reviewed, broken sync) | 4 | 2 | 3 | 3 | 72 | Anecdotal (vendor blogs, reviews) | Intermediate, prop |
| 9 | Too many or low-quality signals; opaque paid groups | 3 | 3 | 2 | 3 | 54 | Anecdotal | Beginner, intermediate |
| 10 | No time to monitor markets | 3 | 2 | 3 | 2 | 36 | Strong (survey motive) | Time-poor professionals |
| 11 | Complex UIs, billing and support friction | 3 | 2 | 2 | 2 | 24 | Anecdotal | All |

- [Speculative] Pain points 1-5 point to a single product shape: an explainable, human-in-the-loop AI research and risk copilot. It would:
  - Show its reasoning for every idea.
  - Publish a live, auditable, cost-inclusive track record.
  - Run regime detection that can recommend "no trade today".
  - Enforce user-set loss limits and cooldowns.
  - Turn the trade log into an automated journal with weekly AI review.

  That would address the top five pains together. The "autonomous AI trader" framing is weaker: it clashes with low trust (26-30%), with regulators' scam warnings, and with LLMs' public record of overtrading in Alpha Arena.
- [Speculative] The differentiator most likely to earn recommendations is verifiability: published out-of-sample and live results, including periods when the system said "stand aside". Every competing category (signals, bots, finfluencers, copy traders) is distrusted on exactly this point.
- [Speculative] UK compliance angle: the FCA's finfluencer crackdown and its "AI trader bot" warnings mean any UK product promising returns faces both regulatory and reputational risk. Positioning as decision support or education, without return claims, fits UK users and regulators better.

### Gaps
- The scores are qualitative. No dataset lets frequency be counted across Reddit or Trustpilot at scale; that would need a scraped corpus with topic classification. [Unknown]
- I found no direct survey of willingness to pay for specific features such as explainability, regime gates or verified records. [Unknown]
- "Not knowing when to switch the bot off" and "the bot not knowing when to do nothing" are supported indirectly (regime-failure posts, Alpha Arena overtrading), not by surveys. [Anecdotal]

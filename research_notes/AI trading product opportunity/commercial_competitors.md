# Commercial landscape: AI / agent-powered trading, investing and crypto products (as of late Oct 2026)

Evidence labels used throughout: **[Verified]** = primary or company source, or several credible outlets agree; **[Strong]** = one credible outlet (Bloomberg/CNBC/CoinDesk/TechCrunch/Reuters) or several consistent secondary sources; **[Anecdotal]** = review blogs, affiliate comparisons, single user reports; **[Speculative]** = my inference; **[Unknown]** = could not establish.

Method note: WebFetch could not resolve most hosts (fortune.com, techcrunch.com, coindesk.com, traderank.ai all failed with DNS errors), so most findings come from search-result summaries of the cited pages, not full-page reads. Many pricing sources are affiliate comparison blogs that contradict each other. Figures should be checked against vendor pricing pages before anyone relies on them. Items marked "prior knowledge" were not re-verified this session.

---

## 1. Competitor map: which products exist in each category

### Takeaway
The market splits into (a) **brokers and exchanges adding agents** (Robinhood, eToro, Bitget, Bybit, SoFi/Composer, Pionex). These have distribution and execution, and this is where the 2026 momentum is. (b) **Legacy crypto bot SaaS** (3Commas, Cryptohopper, Coinrule, Bitsgap, Cornix, WunderTrading). These are rule engines with "AI" assistants bolted on. (c) **AI research and scoring tools** (Fiscal.ai, Perplexity Finance, Danelfin, Tickeron, Kavout, TrendSpider, Magnifi). (d) **Copy and follow products** (eToro CopyTrader, Bitget/Bybit copy trading, Autopilot's politician tracking). (e) **On-chain intelligence** (Nansen, Arkham). (f) **Journals and coaches** (TradeZella, TraderSync, Edgewonk, Tradervue). (g) **Crypto-native agent token ecosystems** (ElizaOS/ai16z, Virtuals), which have largely collapsed. The "AI" label in bot SaaS is mostly marketing for rule-based automation [Anecdotal, consistent across reviewers].

### Cited Findings

**Broker/exchange-native agents (the 2026 frontier)**
- Robinhood launched "agentic trading" on 27 May 2026. It lets customers connect third-party AI agents to an isolated account funded only with money the user deposits into it **[Strong]**. Sources: [TechCrunch](https://techcrunch.com/2026/05/27/robinhood-now-lets-your-ai-agents-trade-stocks/), [CNBC](https://www.cnbc.com/2026/05/27/your-ai-agent-can-now-trade-for-you-on-robinhood-and-buy-stuff-with-your-credit-card-too.html), [Bloomberg](https://www.bloomberg.com/news/articles/2026-05-27/robinhood-launches-ai-stock-trading-purchases-on-credit-cards)
- Robinhood says more than 15,000 users have opened agentic trading accounts and agents call its tools almost 30 million times a day. These are company-reported figures, so the label is **[Strong]** for the claim being made and **[Unknown]** for whether the numbers are accurate. Sources: [Fortune](https://fortune.com/2026/09/29/robinhood-trading-agents-hood-openai-anthropic/), [CoinDesk](https://www.coindesk.com/markets/2026/09/29/robinhood-adds-ai-agents-perps-and-weekend-trading-in-push-to-win-active-traders)
- At HOOD Summit on 29 Sep 2026, Robinhood announced its own in-house "Robinhood Agents". They analyse markets, build strategies and execute trades, using OpenAI or Anthropic models. Trade approvals are on by default but can be switched off, and a planned "Loops" feature would allow standing automated instructions. Rollout is to "eligible US customers soon" **[Strong]**. Source: [Fortune](https://fortune.com/2026/09/29/robinhood-trading-agents-hood-openai-anthropic/)
- eToro relaunched its app as "AI-first" on 7 Jul 2026. Its agent "Tori" helps with or executes trades with user approval across the app, WhatsApp and Telegram. Users can build or copy AI agents that trade 24/7, each in its own sub-account **[Verified]**, company press release. Sources: [GlobeNewswire](https://www.globenewswire.com/news-release/2026/07/07/3323457/0/en/etoro-launches-new-app-ai-first-smart-and-social.html), [FinTech Global](https://fintech.global/2026/07/08/etoro-unveils-ai-first-app-with-proactive-agent-tori/), [Finance Magnates](https://www.financemagnates.com/fintech/etoro-lets-investors-delegate-trades-to-ai-agents-as-automation-usage-nearly-doubles/)
- On 8 Oct 2026 eToro launched MCP connectors for Claude, ChatGPT and Grok. These are not available in the US, Australia or Singapore, which implies UK availability **[Verified]** for the launch and **[Speculative]** for UK availability. Source: [eToro press release](https://www.etoro.com/news-and-analysis/press-releases/your-ai-already-runs-your-day-now-it-knows-your-portfolio/)
- SoFi acquired Composer in late June 2026 and rebranded it "Composer by SoFi". Users describe strategies in plain language, the AI drafts editable logic, and live automation starts only after the user reviews the strategy and funds an account **[Verified]**. Sources: [SoFi IR](https://investors.sofi.com/news/news-details/2026/Introducing-Composer-by-SoFi-AI-Powered-Investing-From-Idea-to-Execution/default.aspx), [Yahoo/Reuters](https://finance.yahoo.com/markets/stocks/articles/sofi-deepens-ai-powered-trading-120337750.html), [The Paypers](https://thepaypers.com/mergers-aquisitions-and-investments/news/sofi-acquires-ai-startup-composer-to-democratise-trading-strategies)
- Bitget GetAgent / GetClaw: Bitget claims more than 1M users have completed AI-powered trades and more than $1.2B in cumulative volume. GetAgent 2.0 covers crypto, stocks, gold and oil research. A "Playbook" layer of ready-made strategies is for Plus/Pro users. An AI daily briefing was added in Jul 2026. Bitget also launched "AI trading avatars". The label is **[Anecdotal/company-reported]**. Sources: [CCN review](https://www.ccn.com/bitget-getagent-review/), [Yellow](https://yellow.com/news/bitget-ai-trading-beyond-prompts-playbook), [CoinGape](https://coingape.com/bitget-expands-getagent-2-0-with-ai-research-across-crypto-stocks-gold-and-oil/), [Bitget blog](https://www.bitget.com/blog/articles/bitget-getagent-ai-briefing-crypto-stocks), [Bitget avatars](https://www.bitgetapp.com/blog/articles/bitget-ai-trading-avatars-launch)
- Bybit has "Bybit AI" plus an "AI Hub / AI Skills Hub" that exposes more than 274 API endpoints to ChatGPT, Claude and Gemini **[Anecdotal]**, from a single Russian-language comparison site. Source: [Profinvestment](https://profinvestment.com/ai-bots-exchanges/)
- Pionex is an exchange with built-in bots and no bot subscription; it charges a 0.05% trading fee. "PionexGPT" lets users configure bots in natural language. It is not available to US residents, though a separate pionex.us exists **[Anecdotal]**. Sources: [crypto.news](https://crypto.news/10-ai-bot-trading-in-2026-features-and-pricing/), [Koinly](https://koinly.io/blog/best-crypto-trading-bots/)

**Crypto bot SaaS (connect-your-exchange via API keys)**
- 3Commas: every paid plan includes an "AI Assistant". Reviewers say the engine is rule-based, not machine learning **[Anecdotal]**. Sources: [crypto.news](https://crypto.news/10-ai-bot-trading-in-2026-features-and-pricing/), [algotrading.ink](https://algotrading.ink/)
- Cryptohopper: its main draw is a marketplace of strategies, signals and bots. Its "AI" is closer to a rule engine **[Anecdotal]**. Source: [crypto.news](https://crypto.news/10-ai-bot-trading-in-2026-features-and-pricing/)
- Coinrule, Bitsgap, Cornix (Telegram signal automation) and WunderTrading (TradingView-webhook automation) are all active in 2026 with tiered SaaS pricing (see Section 4) **[Anecdotal]**. Sources: [HackerNoon](https://hackernoon.com/top-10-best-ai-bot-trading-in-2026-features-and-pricing), [Capterra Bitsgap](https://www.capterra.com/p/10004220/Bitsgap), [Gainium on Cornix](https://gainium.io/review/cornix), [ComparEdge](https://comparedge.com/best/crypto-trading-bots)

**AI investment research / scoring**
- Fiscal.ai, formerly FinChat, raised a $10M Series A led by Portage, with Social Leverage also participating, and rebranded at the same time (about early 2026) **[Strong]**. Reviewers rank it the best research-led tool **[Anecdotal]**. Sources: [Amassed Insights](https://blog.amassinsights.com/amassed-insights-5-ai-in-investing/), [Walnut (competitor blog)](https://walnutinvest.com/resources/best-ai-investment-research-tools)
- Perplexity Finance is described as the easiest free entry point for news and context synthesis **[Anecdotal]**. The parent company's valuation was reported at about $21B **[Anecdotal, single Substack]**. Source: [Sid Saladi Substack](https://sidsaladi.substack.com/p/perplexity-finance-101-the-complete)
- Magnifi is positioned as conversational fund discovery: thematic searches, fund comparison and questions about connected holdings **[Anecdotal]**. Source: [DIY AI](https://diyai.io/ai-tools/finance/best-ai-investing-apps/)
- Danelfin (AI score for US stocks and STOXX 600), Tickeron (AI bots with "confidence %"), Kavout (K-Score) and TrendSpider (charting and backtesting automation) are all active **[Anecdotal]**. Sources: [Stork](https://www.stork.ai/en/danelfin), [AlphaGainDaily](https://alphagaindaily.com/en/tools/ai-stock-screener-comparison), [ChartingLens](https://chartinglens.com/blog/best-ai-stock-analysis-tools)

**Copy / follow / smart-money**
- Autopilot follows politicians and famous investors. AUM was about $1.3B by Mar 2026, up from about $2M at its 2023 launch. About 40–45% of assets sit in politician-tracking portfolios, and the Pelosi Tracker holds about $462–464M **[Strong]**, from Benzinga plus CB Insights, which agree. Autopilot Advisers LLC is an SEC-registered investment adviser. Sources: [Benzinga](https://www.benzinga.com/news/politics/26/03/51248325/exclusive-pelosi-tracker-creator-reveals-top-3-lawmakers-to-watch-new-trump-white-house-stock-strategy), [Finviz/Benzinga](https://finviz.com/news/335508/exclusive-from-2-million-to-13-billion-autopilots-focus-on-pelosi-and-other-politicians-is-paying-off), [CB Insights](https://www.cbinsights.com/company/autopilot-2), [Cool Curation UK review](https://coolcuration.com/autopilot-app-review-uk)
- Bitget copy trading: more than 130,000 "elite traders" and 800,000 copiers; leaders need at least 50 USDT **[Anecdotal]**. Source: [Datawallet](https://www.datawallet.com/crypto/bitget-review)
- Nansen in 2026 has Free and Pro tiers. It offers API, CLI and MCP access, plus pay-per-call in USDC for agents ($0.01 for basic endpoints, $0.05 for premium signal endpoints). It launched on-chain trading in Jan 2026 with a 0.10% fee for Pro and 0.25% for Free **[Anecdotal]**, from multiple reviews that conflict with older pages. Sources: [DIY AI Nansen review](https://diyai.io/ai-tools/crypto/reviews/nansen-ai-review/), [ChainPlay](https://chainplay.gg/blog/nansen-review/), [Pump Parade](https://blog.pumpparade.com/reviews/nansen-review-2026-smart-money-features-verdict/)
- Arkham: the core Intel platform is free and premium features are paid in ARKM tokens. It is weaker than Nansen for "smart money" views **[Anecdotal]**. Sources: [Toolchase Arkham](https://toolchase.com/tool/arkham/), [Levex](https://levex.com/en/blog/arkham-vs-nansen)

**Journals / coaches**
- TradeZella (AI on all plans), TraderSync (AI coach "Cypher", metered by tier) and Edgewonk ("Edge Finder" weekly scan, not a conversational coach) **[Anecdotal]**. Sources: [TradeZella vs TraderSync (vendor)](https://www.tradezella.com/vs/tradersync), [TraderNotion](https://www.tradernotion.com/blog/tradersync-vs-edgewonk-2026), [Memeburn](https://memeburn.com/best-ai-trading-journals/)
- Long-tail AI journals with decision-quality features include StonkJournal, TradeDoctor AI and ChartyTool (Go/No-Go gate) **[Anecdotal, vendor pages]**. See Section 3. Sources: [StonkJournal](https://stonkjournal.com/), [TradeDoctor features](https://tradedoctorai.com.growthradarhq.com/features/), [AlternativeTo ChartyTool](https://alternativeto.net/software/chartytool)

**AI-agent crypto ecosystems**
- ElizaOS (formerly ai16z): the ELIZAOS token, which replaced AI16Z (peak about $2.4B), was down about 97% to roughly a $2.3M market value by Aug 2026. Founder Shaw Walters said the foundation is closing, called the token "dead" and urged holders to sell, while saying he would keep building the software without a token **[Strong]**, CoinDesk. A class action, SDNY Case 1:26-cv-3238 filed 21 Apr 2026, reportedly alleges misuse of the ai16z name **[Anecdotal]**, cited by secondary sources only. Sources: [CoinDesk](https://www.coindesk.com/markets/2026/08/05/ai-agent-token-once-worth-usd2-4-billion-ends-with-founder-calling-it-dead), [niteagent](https://niteagent.com/blog/why-agent-tokens-keep-dying-elizaos-bittensor/)
- Virtuals Protocol: revenue collapsed from about $3.5M/month (Jan 2025) to under $200k/month (Jun 2025), and new agent launches plummeted **[Strong]** for the 2025 figures. 2026 trailing-year fees are cited as $15.7M in one source and $20.7M in another, an unresolved conflict **[Anecdotal]**. Sources: [Cointelegraph](https://cointelegraph.com/news/new-ai-agent-launches-virtuals-plummet-token-drawdowns), [TradingView/Todayq](https://tr.tradingview.com/news/todayq:1af82f429094b:0-virtual-protocol-revenue-drops-97-as-ai-agent-demand-declines), [ownyourmind.ai](https://ownyourmind.ai/projects/virtuals/)

### Inferences
- **[Speculative]** Distribution has moved to the broker and exchange layer. Robinhood, eToro, SoFi and Bitget now own both the agent and the execution. Third-party bot SaaS that holds user API keys is structurally squeezed: it must compete on strategy quality or UX, not access.
- **[Speculative]** "Bring-your-own-LLM" (MCP connectors, agent APIs at Robinhood, eToro, Bybit and Nansen) is becoming standard. Model intelligence is commoditised, so differentiation shifts to risk controls, explanation and trust.
- **[Speculative]** Crypto agent tokens (ElizaOS, Virtuals) are a cautionary case of tokenised hype, not a viable commercial category for a regulated UK product.

### Gaps
- Binance's AI agent offerings and Bybit's user numbers were not found.
- I found no 2026 data on Hyperliquid-native agent vaults or agent ecosystems beyond Alpha Arena.
- No Bloomberg Terminal AI or AlphaSense 2026 product or pricing details were found this session. Prior knowledge, unverified: AlphaSense is enterprise-only (tens of thousands of dollars per seat per year), and Bloomberg has GPT-style summarisation inside the Terminal (about $30k/yr per seat).
- Lookonchain is a free X/Telegram feed, not a commercial product (prior knowledge, unverified).
- No Cortex product was found. Robo-advisors with LLMs (Wealthfront, Betterment, Nutmeg, Moneybox in the UK) were not covered in searches.

---

## 2. Public "AI vs AI" trading competitions (Nof1 Alpha Arena) and their results

### Takeaway
Alpha Arena Season 1 (18 Oct–3 Nov 2025) gave six frontier LLMs $10k each of real money on Hyperliquid perps, with identical prompts. Four of six lost money, most badly: GPT-5 −62.7%, Gemini 2.5 Pro −56.7%, Grok 4 −45.3%, Claude Sonnet 4.5 −30.8%. Qwen3 Max won at +22.3% and DeepSeek V3.1 made about +4.9%. Season 1.5 (to 3 Dec 2025, eight models, including equities) saw almost all models lose; the only winner was a "Mystery Model", later identified as Grok 4.20, at about +12%. The competitions went viral but mainly show that **LLMs overtrade and that the results are noise from a small sample**, not that they have trading skill.

### Cited Findings
- Season 1 ran 18 Oct–3 Nov 2025, with $10k per model in real money on crypto perps on Hyperliquid. Final results: Qwen3 Max +22.3% (about $12,287), DeepSeek V3.1 +4.89%, Claude Sonnet 4.5 −30.8%, Grok 4 −45.3%, Gemini 2.5 Pro −56.7%, GPT-5 −62.7% **[Strong]**, multiple outlets agree. Sources: [ForkLog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/), [sipi.bot incident log](https://sipi.bot/incidents/alpha-arena-six-models-lose-2025-11), [iWeaver](https://www.iweaver.ai/blog/alpha-arena-ai-trader-showdown/)
- Qwen3 Max's winning record was a 30.2% win rate across 43 trades. So the season was won with fewer than 50 trades and a sub-third hit rate, which is statistically meaningless **[Anecdotal]** for the numbers and **[Speculative]** for the interpretation. Source: [TradeRank](https://www.traderank.ai/blog/alpha-arena-alternatives-2026)
- Season 1.5 had eight models and included equities. A "Mystery Model", identified as Grok 4.20, won with about +12.11% over two weeks (about $4,844 profit). The competition ended 3 Dec 2025 at 5pm EST **[Strong]**. Sources: [ForkLog – Grok 4.2 triumphs](https://forklog.com/en/ai-model-grok-4-2-triumphs-in-trading-tournament/), [OneDayAdvisor](https://www.onedayadvisor.com/2025/12/nof1ai-alpha-arena-review-season-15.html), [Alpha Arena site](https://www.alphaarena.ai/)
- BigGo Finance headlined that "all eight major models post losses in overtrading frenzy". It reported that Qwen executed 1,418 trades in a single round under identical prompts **[Anecdotal]**. This conflicts with the "Grok 4.20 profitable" reports, perhaps because it counted only named and released models. Source: [BigGo Finance](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)
- Commentators argue the results reflect market regime and risk settings more than model skill. Qwen3 Max "happened to have the best risk parameters for the market that played out" **[Anecdotal]**. Sources: [Buildix](https://www.buildix.trade/blog/nof1-alpha-arena-lessons-ai-trading-byok-strategy-advisor-2026), [ScienceShot](https://scienceshot.com/post/ai-trading-agents-losing-money)
- Season 2 status: as of a 6 Aug 2026 check, no Season 2 roster, leaderboard or results were visible on the public site, although CoinDesk referred to a "Season Two" **[Anecdotal]**. A Manifold market exists on the winner. Sources: [TradeRank](https://www.traderank.ai/blog/alpha-arena-alternatives-2026), [Manifold](https://manifold.markets/predyx_markets/alpha-arena-ai-trading-competition), [ForkLog – new season](https://forklog.com/en/new-season-of-ai-trading-tournament-kicks-off/)
- Unofficial GitHub "Alpha Arena" bots are circulating. They are not Nof1 releases and are a scam or quality risk **[Anecdotal]**. Source: [ReviewNexa](https://reviewnexa.com/nof1-ai-review/)

### Inferences
- **[Speculative]** Why it went viral: real money, brand-name models, a live public leaderboard, and visible "model chat" reasoning. It made LLM trading legible and dramatic. The lesson for product builders is that transparent, real-money, public track records drive attention, while losses are just as viral as wins.
- **[Speculative]** The main research signal is behavioural, not about skill. Models given the same prompt diverge wildly in trade frequency, leverage and holding time. Overtrading, with fees and funding drag, was the dominant failure, which directly supports the value of a "no-trade"/abstention discipline.
- **[Speculative]** A competition with about 2–3 weeks, about 6–8 agents and a few dozen trades each cannot separate skill from luck. Any product citing Alpha Arena rankings as evidence of edge is overclaiming.

### Gaps
- Nof1's company funding, business model and any 2026 Season 2 results could not be confirmed, because the fetch tool failed.
- Exact Season 1 rules (asset list, leverage limits, prompt) were not re-verified this session. Prior knowledge, unverified: BTC, ETH, SOL, BNB, DOGE and XRP perps with leverage allowed.

---

## 3. Deep dives: the ~10 most important commercial products

### Takeaway
The most important products by distribution and momentum are Robinhood Agents, eToro (Tori, agent portfolios and CopyTrader), Composer by SoFi, Bitget GetAgent, Pionex, 3Commas, Autopilot, Nansen, Fiscal.ai and TradeZella/TraderSync. Nof1 Alpha Arena is included as a reference point. None publishes audited evidence of AI-driven outperformance. Their defensibility comes from distribution, regulation, execution and data, not from model alpha.

### Cited Findings

**1. Robinhood Agents / agentic trading (US only)**
- Target customer: active US retail traders. Markets: US equities, with perps and weekend trading also announced on 29 Sep 2026 **[Strong]**. Source: [CoinDesk](https://www.coindesk.com/markets/2026/09/29/robinhood-adds-ai-agents-perps-and-weekend-trading-in-push-to-win-active-traders)
- Autonomy: the third-party agent API (May 2026) executes live trades in an isolated sub-account. The in-house agent uses OpenAI or Anthropic models, approvals are on by default but can be disabled, and "Loops" standing instructions are planned **[Strong]**. Sources: [TechCrunch](https://techcrunch.com/2026/05/27/robinhood-now-lets-your-ai-agents-trade-stocks/), [Fortune](https://fortune.com/2026/09/29/robinhood-trading-agents-hood-openai-anthropic/)
- Risk controls: account isolation, plus deposit caps set by the funds the user moves in. Liability: Robinhood states it does not "control, supervise, monitor, recommend or audit" third-party agents, and customers assume all risk **[Strong]**. Sources: [Finder](https://www.finder.com/investments/ai-trading-agent-liability), [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/responsible-ai-agent-loses-money-210732192.html)
- Traction: more than 15k agentic accounts and about 30M tool calls a day (company-reported) **[Strong/claim]**. Pricing for agents: **[Unknown]**.
- Evidence it works: none on performance **[Unknown]**.
- Lesson **[Speculative]**: incumbents treat agents as order flow. The disclaimers push all decision-quality responsibility onto the user, leaving room for a product that owns explanation and quality.

**2. eToro (Tori agent, AI agent portfolios, MCP connectors, CopyTrader); available in the UK**
- Tori executes with user approval across the app, WhatsApp and Telegram. Users build or copy AI agents that trade 24/7 in sub-accounts. MCP connectors for Claude, ChatGPT and Grok launched 8 Oct 2026 and exclude the US, AU and SG. Finance Magnates reports automation usage "nearly doubling" **[Verified/Strong]**. Sources: [GlobeNewswire](https://www.globenewswire.com/news-release/2026/07/07/3323457/0/en/etoro-launches-new-app-ai-first-smart-and-social.html), [eToro PR](https://www.etoro.com/news-and-analysis/press-releases/your-ai-already-runs-your-day-now-it-knows-your-portfolio/), [Finance Magnates](https://www.financemagnates.com/fintech/etoro-lets-investors-delegate-trades-to-ai-agents-as-automation-usage-nearly-doubles/), [MarketBeat](https://www.marketbeat.com/instant-alerts/etoro-group-unveils-ai-trading-push-with-tori-agent-new-app-and-desktop-platform-2026-07-10/)
- Independent review questions whether the agent portfolios and Tori are worth it **[Anecdotal]**. Source: [agent-finder](https://agent-finder.co/reviews/etoro-ai-agent-agent-portfolios-tori-)
- Defensibility **[Speculative]**: FCA-regulated UK entity (prior knowledge), social graph and copy-trading network effects, plus the "AI agent as a copyable trader" concept fused with existing CopyTrader. eToro is the most direct UK incumbent competitor.

**3. Composer by SoFi**
- Plain-language strategy is turned into editable logic, then backtested, then run live only after user review and funding. Price: the Annual Trading Pass is about $32/month, and an earlier $5 promo has expired. Funding before the acquisition was about $16.7M (Tracxn) or $11.4M (PitchBook), which conflict **[Strong/Anecdotal]**. Sources: [The Rundown AI](https://www.therundown.ai/tools/composer), [Tracxn](https://tracxn.com/d/companies/composer/__pA20885_v_ub5A3IFCCMiivy6N4pQnnCtLikLqGC7s8), [PitchBook](https://pitchbook.com/profiles/company/455170-33), [Corporate Insight](https://corporateinsight.com/sofi-acquires-ai-investment-trading-platform-composer/)
- Lesson **[Speculative]**: human-in-the-loop "AI drafts, user approves, rules execute" is the template that got acquired. It gives deterministic execution with an LLM only at authoring time, which avoids Alpha-Arena-style LLM-in-the-loop overtrading.

**4. Bitget GetAgent / GetClaw**
- Covers research, strategy playbooks, AI avatars and a daily briefing across crypto, stocks, gold and oil. Bitget claims more than 1M users and more than $1.2B in AI-driven volume. Monetised via Plus/Pro tiers plus trading fees **[Anecdotal/company]**. Sources: [CCN](https://www.ccn.com/bitget-getagent-review/), [Yellow](https://yellow.com/news/bitget-ai-trading-beyond-prompts-playbook), [CoinGape](https://coingape.com/bitget-expands-getagent-2-0-with-ai-research-across-crypto-stocks-gold-and-oil/)
- UK caveat **[Speculative]**: Bitget's UK access has been restricted following FCA financial-promotion rules (prior knowledge, unverified).

**5. Pionex**
- An exchange with about 16 built-in bot types (prior knowledge) and PionexGPT natural-language setup. Price: no subscription, 0.05% fee per trade **[Anecdotal]**. Source: [crypto.news](https://crypto.news/10-ai-bot-trading-in-2026-features-and-pricing/)
- Lesson **[Speculative]**: monetising through trading fees, not SaaS, wins on entry price, but creates an incentive to encourage more trading, which is the opposite of an abstention philosophy.

**6. 3Commas (archetype of bot SaaS)**
- Plans are $20, $50 or $140 a month (prices checked 6 Oct 2026). The AI Assistant is on all paid plans, and the engine is rule-based (DCA, grid, signal bots) **[Anecdotal]**. Source: [crypto.news](https://crypto.news/10-ai-bot-trading-in-2026-features-and-pricing/)
- Biggest trust failure: the 2022 API-key leak (see Section 5).
- Lesson **[Speculative]**: the custodial-adjacent API-key model is a permanent security liability. Brokers' native sub-account agents remove it.

**7. Autopilot (follow politicians and investors)**
- Target customer: US retail. Autonomy: automated mirroring of disclosed portfolios via linked brokerages, under an SEC RIA. Traction: about $1.3B AUM (Mar 2026); the Pelosi Tracker holds about $464M; 3M downloads (2025); more than 100k investors. Pricing (conflicting): one portfolio free with more at $29/quarter or $100/yr, versus $99.99/yr with a $500 minimum per portfolio **[Strong for AUM, Anecdotal for pricing]**. Sources: [Benzinga](https://www.benzinga.com/news/politics/26/03/51248325/exclusive-pelosi-tracker-creator-reveals-top-3-lawmakers-to-watch-new-trump-white-house-stock-strategy), [College Investor](https://thecollegeinvestor.com/59796/autopilot-review/), [Cool Curation](https://coolcuration.com/autopilot-app-review-uk)
- Why viral **[Speculative]**: a simple narrative ("trade like Pelosi"), a political news hook, and no AI claims needed. It shows that **a story plus a trust wrapper beats "AI"** for retail growth. Evidence it works: **[Unknown]**. Disclosure lags (up to 45 days under the STOCK Act, prior knowledge) undermine the premise.

**8. Nansen (on-chain smart money with an agent API)**
- Free and Pro tiers ($49/mo annual or $69/mo monthly per reviews; older pages show $99–$1,899). MCP/CLI access and x402-style USDC pay-per-call for agents. On-chain trading launched Jan 2026 with 0.10–0.25% fees **[Anecdotal, conflicting]**. Sources: [Pump Parade](https://blog.pumpparade.com/reviews/nansen-review-2026-smart-money-features-verdict/), [Toolchase](https://toolchase.com/tool/nansen/), [Eco support](https://eco.com/support/en/articles/14800361-nansen-smart-money-how-it-works)
- Lesson **[Speculative]**: data vendors are repositioning as "tools for agents" and adding execution, so data plus execution converge.

**9. Fiscal.ai (formerly FinChat)**
- AI equity research on fundamentals data. $10M Series A (Portage) **[Strong]**. Pricing **[Unknown]** this session. Source: [Amassed Insights](https://blog.amassinsights.com/amassed-insights-5-ai-in-investing/)
- Research-only autonomy: no execution.

**10. TradeZella / TraderSync (journals with AI coaches)**
- TradeZella costs about $29–$99/mo with AI credits (500–1,000 a month) on every plan. TraderSync Pro starts at $29.95/mo, and its Cypher coach is metered at about 5, 15 or 60 messages by tier; Elite pricing conflicts ($79.95/mo versus $719.52/yr). Edgewonk is a flat $197/yr **[Anecdotal]**. Sources: [TradeZella blog (vendor)](https://www.tradezella.com/blog/best-trading-journal-software), [Insigtrade](https://insigtrade.com/blog/tradersync-vs-edgewonk-which-trading-journal-wins-in-2026), [Lunefi](https://lunefi.com/blog/best-edgewonk-alternatives-2026-tradersync-tradezella-tradervue)
- Target customer: active day traders and the prop-firm challenge crowd. Source: [Tradeify](https://tradeify.co/post/best-trading-journals-2026)
- Lesson **[Speculative]**: the closest existing "learn from mistakes" products are journals. They analyse trades taken, not the quality of each decision or trades skipped (see Section 4 below and Section 3 of key questions).

**Reference point: Danelfin / Tickeron (AI scoring)**
- Danelfin claims +376% (Jan 2017–Jun 2026) for its top-rated stocks versus +166% for the S&P 500. This is **backtested**, though the reviewer calls it "publicly verifiable" **[Anecdotal; treat as marketing]**. Tickeron bots "claim 40–169% annual returns", while one tester found retail win rates "hovering close to random" **[Anecdotal]**. Kavout has limited transparency on how its score is computed **[Anecdotal]**. Sources: [ChartingLens](https://chartinglens.com/blog/best-ai-stock-screener), [AlphaGainDaily](https://alphagaindaily.com/en/tools/ai-stock-screener-comparison), [Prospero](https://www.prospero.ai/resources-blog/the-10-best-ai-stock-analysis-tools-in-2026-tested-ranked)

### Inferences
- **[Speculative]** Common complaints across the categories (from reviewer summaries): AI that is just rebranded rules; opaque scores (Kavout, Tickeron confidence %); conflicting and hidden pricing; metered AI messages (TraderSync); and backtested performance marketing.
- **[Speculative]** UX strengths: natural-language setup (PionexGPT, Composer), chat-app distribution (eToro Tori on WhatsApp/Telegram), and copyable agents. UX weaknesses: little or no explanation of *why* an agent acted, no calibration feedback, and no post-mortems.
- **[Speculative]** Defensibility ranking: brokers and exchanges (regulation, custody, order flow) > data vendors (Nansen, Fiscal.ai) > journals (user data lock-in) > bot SaaS (commoditised; security liability) > token agent ecosystems (none).

### Gaps
- Revenue figures were not found for any of these products.
- Trustpilot and App Store review patterns could not be retrieved (fetch failed). Prior knowledge, unverified: bot-SaaS Trustpilot complaints centre on billing and cancellation, bots losing money in trending markets, and support.
- Model and architecture details are only public for Robinhood (OpenAI/Anthropic). Bitget, eToro (Tori) and Pionex do not disclose their models in the sources found.

---

## 4. Who values "no trade"/abstention, explains decisions, tracks calibration, or learns from mistakes?

### Takeaway
**No major commercial product is positioned around decision quality, calibrated abstention or mistake-learning.** Big platforms monetise activity: trading fees (Pionex, exchanges), order flow (Robinhood) or copy volume. The only explicit features are in long-tail AI journals: ChartyTool's pre-trade Go/No-Go gate, and TradeDoctor's and StonkJournal's "no-trade conditions" and confidence-miscalibration analytics. Even these analyse trades taken, not skipped ones. Alpha Arena showed that the dominant LLM failure is overtrading, so this is a real white space **[Speculative but well-supported]**.

### Cited Findings
- ChartyTool checks a setup against the user's written rules and returns a Go/No-Go before entry, producing a documented rule-based "no" **[Anecdotal, listing]**. Source: [AlternativeTo](https://alternativeto.net/software/chartytool)
- TradeDoctor AI supports "no-trade conditions" in session plans and offers "confidence calibration analytics" **[Anecdotal, vendor page]**. Source: [TradeDoctor features](https://tradedoctorai.com.growthradarhq.com/features/)
- StonkJournal's Pro AI coach surfaces "confidence miscalibration" and "what you could've done differently". It works only from logged trades **[Anecdotal, vendor]**. Source: [StonkJournal](https://stonkjournal.com/)
- TraderShape is described as focused on behaviour and decision quality over PnL; details are thin **[Anecdotal]**. Same search set; see [AlternativeTo Quant Journal listing](https://alternativeto.net/software/quant-journal)
- Composer by SoFi requires explicit user review before automation goes live, a human checkpoint rather than abstention logic **[Strong]**. Source: [The Rundown AI](https://www.therundown.ai/tools/composer)
- Robinhood defaults to trade approval but lets users switch it off, and plans to add standing automation (Loops), moving toward more autonomy, not more abstention **[Strong]**. Source: [Fortune](https://fortune.com/2026/09/29/robinhood-trading-agents-hood-openai-anthropic/)
- Alpha Arena: Qwen made 1,418 trades in one round under identical prompts, and losses were attributed to overtrading **[Anecdotal]**. Source: [BigGo Finance](https://finance.biggo.com/news/5BSX_Z0BaoGGrU-ID27J)
- Edgewonk positions on trading psychology with a weekly "Edge Finder" scan **[Anecdotal]**. Source: [TraderNotion](https://www.tradernotion.com/blog/tradersync-vs-edgewonk-2026)

### Inferences
- **[Speculative]** A "decision-quality" product would log every decision, including holds and skips, with the stated thesis, confidence and invalidation level. It would then score calibration (for example Brier score or reliability curves) and outcome versus process, and feed the post-mortems into the agent's memory. This is not offered by any major platform found. The closest are niche journals with very low traction evidence.
- **[Speculative]** Incentive misalignment explains the gap: fee-based and PFOF-based businesses earn from activity, so a product that sells *fewer, better* trades needs subscription monetisation. That fits UK regulatory expectations under Consumer Duty (prior knowledge) better than activity-driven models.
- **[Speculative]** The Alpha Arena "model chat" logs are a viral precedent for showing reasoning. Pairing visible reasoning with calibration scoring ("this agent said 70% and was right 52% of the time") is unexploited.

### Gaps
- I found no evidence of any product publishing calibration curves for its AI signals. Tickeron shows "confidence %" but no reliability data was found.
- Traction for ChartyTool, TradeDoctor, StonkJournal and TraderShape is unknown and probably tiny.

---

## 5. Pricing benchmarks across categories

### Takeaway
Consumer AI trading tools cluster at **about $20–$60/month for an entry or mid paid tier and $100–$150/month for pro**, with free tiers ubiquitous. Exchange-native products charge nothing for bots and earn on fees (about 0.05–0.25%). Journals cost about $30–$100/month, or about $200/yr flat. Copy and follow apps cost about $100/yr. Performance fees appear mainly in copy trading (profit share to leaders, typically about 10%+, prior knowledge) rather than in AI SaaS. All figures are **[Anecdotal]** unless noted, because sources conflict.

### Cited Findings
| Product | Free | Entry | Mid | Pro/Top | Notes | Source |
|---|---|---|---|---|---|---|
| 3Commas | limited | $20/mo | $50/mo | $140/mo | prices checked 6 Oct 2026 | [crypto.news](https://crypto.news/10-ai-bot-trading-in-2026-features-and-pricing/) |
| Cryptohopper | Pioneer (free) | $29/mo | $69/mo | $129/mo | marketplace extra | [crypto.news](https://crypto.news/10-ai-bot-trading-in-2026-features-and-pricing/) |
| Pionex | no subscription | — | — | — | 0.05% trading fee | [Koinly](https://koinly.io/blog/best-crypto-trading-bots/) |
| Coinrule | Starter free | $29.99/mo (annual) | $59.99/mo | $749/mo Fund | AI credits by tier | [HackerNoon](https://hackernoon.com/top-10-best-ai-bot-trading-in-2026-features-and-pricing) |
| Bitsgap | trial/free | from $23/mo | — | — | | [Capterra](https://www.capterra.com/p/10004220/Bitsgap) |
| Cornix | — | $32.99 (or $19–24.99, conflicting) | $52.99 | $333.33 Asset Manager | conflicting | [Gainium](https://gainium.io/review/cornix), [ComparEdge](https://comparedge.com/best/crypto-trading-bots) |
| WunderTrading | — | $4.95 (or $19, conflicting) | $39 | $69 | conflicting | [ComparEdge](https://comparedge.com/best/crypto-trading-bots) |
| Composer by SoFi | — | about $32/mo (annual pass) | — | — | $5 promo ended | [The Rundown](https://www.therundown.ai/tools/composer) |
| Autopilot | 1 portfolio free (one source) | $29/qtr or $99–100/yr | — | — | $500 min per portfolio (one source) | [College Investor](https://thecollegeinvestor.com/59796/autopilot-review/), [Cool Curation](https://coolcuration.com/autopilot-app-review-uk) |
| Nansen | Free | Pro $49/mo annual or $69/mo monthly | — | — | API $0.01–0.05 per call; trading fee 0.10% (Pro) or 0.25% (Free) | [Pump Parade](https://blog.pumpparade.com/reviews/nansen-review-2026-smart-money-features-verdict/) |
| Arkham | core free | ARKM-token premium | — | — | no fiat tier | [Toolchase](https://toolchase.com/tool/arkham/) |
| Danelfin | free | about $20+/mo | — | about $840/yr Pro | conflicting | [Stork](https://www.stork.ai/en/danelfin) |
| Tickeron | — | $30/mo (or from $5) | $60 | $90 | conflicting | [ChartingLens](https://chartinglens.com/blog/best-ai-stock-screener) |
| TrendSpider | — | about $22–33/mo | — | about $97–156/mo | conflicting | [AlphaGainDaily](https://alphagaindaily.com/en/tools/ai-stock-screener-comparison) |
| Kavout | — | about $49/mo | — | enterprise | unclear | [ChartingLens](https://chartinglens.com/blog/best-ai-stock-analysis-tools) |
| TradeZella | — | $29–35/mo | $59 | $99 | AI on all plans | [Memeburn](https://memeburn.com/best-ai-trading-journals/) |
| TraderSync | trial | $29.95/mo | Premium | Elite $79.95/mo | AI coach messages metered | [TradeZella vs TraderSync](https://www.tradezella.com/vs/tradersync) |
| Edgewonk | — | $197/yr flat | — | — | VAT extra | [Insigtrade](https://insigtrade.com/blog/tradersync-vs-edgewonk-which-trading-journal-wins-in-2026) |
| Bitget copy trading | free to copy | leader minimum 50 USDT | — | — | profit share to leaders | [Datawallet](https://www.datawallet.com/crypto/bitget-review) |

### Inferences
- **[Speculative]** A UK consumer product would need about £15–£40/month to sit in the mainstream band. A "pro" tier above about £100/month is only justified by execution or data access.
- **[Speculative]** Metered AI (credits or messages) is the emerging norm for LLM-heavy features, because inference costs are real.

### Gaps
- Fiscal.ai, Magnifi, Perplexity Finance (Pro bundle) and Bitget GetAgent Plus/Pro prices were not found.
- eToro does not charge directly for its agent; its fees are spreads and commissions (prior knowledge, unverified).
- Copy-trading profit-share percentages for 2026 were not verified.

---

## 6. Failures, shutdowns and scandals of AI trading products

### Takeaway
The failure record is dominated by (1) **security and key-custody failures** (3Commas, 2022), (2) **autonomous agents misexecuting or being manipulated** (Lobstar Wilde/OpenClaw, Feb 2026; Grok–Bankrbot Morse-code exploit, May 2026), (3) **token-economy collapses** (ElizaOS/ai16z down about 97–99.9% with the foundation closing; Virtuals revenue collapse), (4) **public LLM trading losses** (Alpha Arena), and (5) **outright "AI trading bot" scams** (FCA warnings, a £21M UK scam). Regulators (FINRA, FCA, the US House FSC) flagged agent liability in 2026 without resolving it.

### Cited Findings
- **3Commas API leak (Oct–Dec 2022):** about 100k API keys were published. 3Commas initially blamed users' phishing, then admitted the leak in Dec 2022. Losses were estimated at $14.8M (44 victims verified by ZachXBT) to about $20M. Binance told users to disable their keys. Whether it was an inside job is unproven, and a US class action was reportedly prepared **[Verified]**. Sources: [The Block](https://www.theblock.co/amp/post/198295/binance-warns-about-3commas-api-leak-says-users-should-disable-keys), [Decrypt](https://decrypt.co/118094/after-repeated-denials-3commas-admits-it-was-source-for-earlier-hacks/), [BleepingComputer](https://www.bleepingcomputer.com/news/security/crypto-platform-3commas-admits-hackers-stole-api-keys/amp/), [Halborn](https://www.halborn.com/blog/post/explained-the-3commas-breach-december-2022), [Web3IsGoingGreat](https://web3isgoinggreat.com/single/3commas-finally-owns-up-to-api-key-leak)
- **Lobstar Wilde / OpenClaw (Feb 2026):** an AI trading agent built on the OpenClaw framework mis-parsed a quantity and sent all 52.43M LOBSTAR tokens it held instead of a small tip. The tokens were dumped within 15 minutes; about $40k was realised, against about $250k claimed by the agent's own account. Copycat exploits used OpenClaw's command execution to trigger wallet transfers **[Anecdotal–Strong]**; figures conflict. Source: [KuCoin News](https://www.kucoin.com/news/flash/openclaw-ai-agent-incident-causes-millions-in-user-losses)
- **Grok / Bankrbot (4 May 2026):** Grok decoded a Morse-code message, and Bankrbot treated Grok's reply as a payment order, transferring about $150–200k. This was a prompt-injection or agent-chaining failure **[Anecdotal/Strong]**. Sources: [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/responsible-ai-agent-loses-money-210732192.html), [Finder](https://www.finder.com/investments/ai-trading-agent-liability)
- **Regulatory flags (2026):** FINRA named autonomous AI agents a top concern in its 2026 report. The House Financial Services Committee wrote to the SEC in June about accountability, with no public SEC response reported. JPMorgan blocks external AI agents from moving retail money **[Strong]**. Sources: [Finder](https://www.finder.com/investments/ai-trading-agent-liability), [Finextra blog](https://www.finextra.com/blogposting/33255/ai-agents-can-now-trade-for-retail-customers-the-liability-question-is-still-open), [KRDO/Stacker](https://krdo.com/stacker-personal-finance-investing/2026/08/27/what-happens-to-your-money-if-your-ai-trading-agent-makes-a-mistake/)
- **ElizaOS/ai16z collapse (Aug 2026):** down about 97% from its $2.4B peak to about $2.3M market cap, with the foundation closing. An SDNY class action was reportedly filed in Apr 2026 **[Strong for the collapse, Anecdotal for the suit]**. Sources: [CoinDesk](https://www.coindesk.com/markets/2026/08/05/ai-agent-token-once-worth-usd2-4-billion-ends-with-founder-calling-it-dead), [niteagent](https://niteagent.com/blog/why-agent-tokens-keep-dying-elizaos-bittensor/)
- **Virtuals:** revenue fell about 97% in 2025 and new agent launches collapsed. ARC, ElizaOS and Virtuals lost about 75–90% of market cap from a January peak **[Strong]**. Source: [Cointelegraph](https://cointelegraph.com/news/new-ai-agent-launches-virtuals-plummet-token-drawdowns)
- **UK scams and regulation:**
  - The FCA warning list includes "AI Trading Hub" (24 Feb 2026) and "Ai Trader Bot" (Jun 2025) **[Verified]**. Sources: [FCA AI Trading Hub](https://www.fca.org.uk/news/warnings/ai-trading-hub), [FCA Ai Trader Bot](https://www.fca.org.uk/news/warnings/ai-trader-bot)
  - A £21M "AI trading bot" crypto scam was reported by IBTimes UK **[Anecdotal]**. Source: [IBTimes UK](https://www.ibtimes.co.uk/21-million-crypto-scam-exposed-ai-trading-bot-that-was-pure-fantasy-1757771)
  - AI-powered trading bots are one of the fastest-growing UK online scam categories (May 2026) **[Anecdotal]**. Source: [London Business Journal](https://londonbusinessjournal.co.uk/2026/05/28/uk-social-media-financial-scams/)
  - FCA finfluencer actions rose from 1 to 74 between 2023 and 2025 **[Strong]**. Source: [Finextra](https://www.finextra.com/newsarticle/48563/fca-cracks-down-on-finfluencers)
  - In Oct 2026 the FCA's chief data officer urged general-purpose AI firms to add warnings to financial guidance and flagged "agentic finance" **[Anecdotal]**. Source: [fintech.garden](https://fintech.garden/news/2026-10-19-fca-presses-ai-companies-to-warn-users-as-chatbot-financial-guidance-tests-regul/)
  - The Bank of England plans to test AI agents in trading markets after the Treasury Committee's warnings (Apr 2026) **[Verified]**. Source: [UK Parliament](https://committees.parliament.uk/committee/158/treasury-committee/news/213162/bank-of-england-and-fca-commit-to-action-on-ai-following-warnings-from-mps/)
  - Bot and signal software is typically unregulated in the UK, so user protection depends on the broker **[Anecdotal]**. Source: [InvestingCube](https://www.investingcube.com/learn-to-trade/the-ai-trading-boom-has-a-verification-problem-and-uk-retail-traders-are-paying-for-it)

### Inferences
- **[Speculative]** Every major incident involved an agent with too much authority and no independent policy or risk layer (quantity sanity checks, allow-lists, approvals, rate limits). A product whose core is a deterministic risk and abstention layer that is separate from the LLM addresses the observed failure modes directly.
- **[Speculative]** In the UK, "AI trading bot" is a scam-associated phrase with a regulatory reputation problem. Positioning around "decision quality / process" rather than "AI that makes you money" reduces both financial-promotion risk and scam association.

### Gaps
- No confirmed shutdown of a commercial AI trading SaaS in 2026 was found.
- The outcome of the 3Commas class action is unknown.
- A reported $15B "AI" loss at Jane Street came only from a low-quality site and is excluded as unverified.
- Exact losses in the OpenClaw and Bankrbot incidents conflict across sources.

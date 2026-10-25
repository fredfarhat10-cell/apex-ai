# Build the trade veto, not the bot

There is a real but narrow product opportunity here, and it is not the one the founder is pitching. **Do not build an autonomous real-money trading bot, and do not build a real-time "shared learning network" of bots.** The evidence that LLM agents produce durable risk-adjusted returns after costs is absent. The regulatory exposure of discretionary auto-execution and of coordinated multi-user signals is high in the UK, EU and US. Every incumbent with distribution (Robinhood, eToro, SoFi/Composer, Bitget) is already shipping agents that trade. What no major product does is put a disciplined, evidence-grounded "no" in front of a *human* trader's own decisions, remember that trader's specific mistakes, and keep an honest record that counts the trades they didn't take. The single strongest product is therefore **Veto**: a pre-trade check and personal decision ledger for self-directed active traders. It challenges each trade against the trader's own rules and own verified history, enforces a "stand down" state when they are most likely to self-sabotage, and scores process separately from P&L. It reuses most of Adaptive Quant (the Devil's Advocate, the deterministic risk engine, experience memory, the lessons ledger, "NO TRADE" as a first-class outcome). It drops the parts with no evidence behind them (the Scout as an idea generator, the "superhuman trader" claim, live execution). Even this is a modest, copyable SaaS. Its core gate is a weekend clone, journals like TradeZella already hold the data, and the biggest unknown is whether people will pay to be told "no". Treat it as a 30-day validation with pre-registered kill criteria, not a company thesis. If it fails, the better fallbacks are B2B evaluation and verification infrastructure for the wave of retail AI agents, not a better bot.

**Evidence labels.** **[Verified]** means a primary source (regulator, statute, peer-reviewed or arXiv paper, official repo or company release) or several credible outlets agree. **[Strong]** means strong evidence: one credible outlet, several consistent secondary sources, or a large published survey. **[Anecdotal]** means a single blog, vendor, review or forum source. **[Speculative]** means my inference, scoring or calculation from stated assumptions. **[Unknown]** means the research could not establish it. Most web pages could not be fetched directly during research, so many figures come from search-result extracts of the cited pages. Research date: **25 October 2026**. Nothing here is legal advice.

---

## 1. Executive verdict: the founder's two new ideas fail; the founder's discipline survives

**Autonomous real-money trading for users: don't build it.** The best live evidence is Nof1's Alpha Arena. In Season 1 (18 Oct–3 Nov 2025), six frontier LLMs each got $10k of real capital on Hyperliquid perps. Four lost money: GPT-5 about −62.7%, Gemini 2.5 Pro −56.7%, Grok 4 −45.3%, and Claude Sonnet 4.5 between −30.8% and −42% depending on the outlet. The winner, Qwen3 Max (+22.3%), made only 43 trades at a 30.2% win rate [Strong] ([ForkLog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/); [RootData](https://www.rootdata.com/news/412456)). The more careful benchmarks agree. StockBench found most LLM agents failed to beat buy-and-hold on post-cutoff 2025 data [Strong] ([arXiv 2510.02209](https://arxiv.org/abs/2510.02209v1)). LiveTradeBench found general LLM leaderboard ability uncorrelated, or negatively correlated, with live trading outcomes (Spearman ρ ≈ 0.05 on stocks, −0.38 on Polymarket) [Strong] ([Emergent Mind](https://www.emergentmind.com/papers/2511.03628)). A 2026 survey audited the agentic-trading literature: **only 1 of 19 empirical studies reported an explicit transaction-cost model, and none reached the top reproducibility tier** [Strong, via secondary summary] ([arXiv 2605.19337](https://arxiv.org/abs/2605.19337)). On regulation, an AI that decides and executes on a user's account is "managing" plus "dealing" for UK shares. For crypto it is likely "arranging" under the new PERG 18 once the regime goes live on 25 Oct 2027. In the EU it is portfolio management, and in the US it means investment adviser or CTA registration [Strong for the rules, Speculative for the application] ([FCA PS26/18](https://www.fca.org.uk/publications/policy-statements/ps26-18-cryptoasset-perimeter-guidance); [ESMA35-42-1428](https://www.esma.europa.eu/sites/default/files/2023-03/ESMA35-42-1428_Supervisory_Briefing_on_Copy_Trading.pdf)). There is no evidential or regulatory case for it.

**Real money for the founder's own account: only as a plumbing test.** A tiny, capped personal live account has one honest use: checking whether the order-book slippage and fee model matches real fills. That converges in dozens of orders, not years [Speculative]. It cannot prove edge (see Section 9), and publicising its returns to UK audiences is a crypto financial promotion, which is a criminal offence if unapproved [Strong] ([A&O Shearman](https://www.aoshearman.com/en/insights/ao-shearman-on-investigations/the-reel-cost-fca-cracks-down-on-finfluencers)). The research notes do not cover whether trading one's own money with one's own software is regulated; it is probably not "by way of business", but confirm with counsel [Unknown].

**The real-time "shared learning network": don't build it as designed.** Many users' bots receiving the same "win / trap / bubble warning" and acting at once is the textbook pattern that market abuse regimes target. UK MAR Art. 12 covers persons "acting in collaboration" and false or misleading signals now. MiCA Arts. 91–92 apply now to EU-admitted crypto. The UK's crypto market abuse regime (MARC) applies from 25 Oct 2027 [Verified for the statutes] ([UK MAR Art. 12](https://www.legislation.gov.uk/eur/2014/596/article/12); [MiCA Art. 91](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-91-prohibition-market-manipulation); [Stephenson Harwood](https://www.stephensonharwood.com/insights/the-uk-market-abuse-regime-for-cryptoassets-marc-the-fca-s-final-rules/)). The research also rated "shared bot network with simultaneous execution" **High** risk in every jurisdiction [Speculative, synthesis]. The behavioural case is weak too. In LiveTradeBench, the average cash ratio across all 21 models fell together from 17% to 7.5% during a rally, a sign of correlated behaviour [Strong for the observation, Speculative as systemic risk] ([Emergent Mind](https://www.emergentmind.com/papers/2511.03628)). Multi-agent research shows that agents conform to the majority and collapse into sycophantic consensus [Strong] ([arXiv 2506.01332](https://arxiv.org/html/2506.01332v1); [arXiv 2509.23055](https://arxiv.org/abs/2509.23055v1)). A network that pools outcome-lessons from users trading the same regime gains fewer independent observations than its headcount suggests, and it amplifies whatever error is popular [Speculative]. A safe descendant exists: delayed, anonymised, aggregated *process* base rates with no asset calls and no execution (Section 25).

**The founder's central thesis needs one surgical correction.** "Day 1 loses on a weak trade; Day 2 recognises the same setup and stays flat" is learning from a sample of one, which is exactly the "resulting" error the founder's own ≥10-case lessons rule exists to prevent [Speculative, logical]. The honest version is a different system. It learns *process errors* immediately: the Day 1 trade broke a stated rule, or entered a low-evidence setup after two losses. It learns *outcome patterns* slowly, under statistical gates. Reframed that way, decision quality is the right thesis. "Superhuman trader" is not. It has no evidential support, and it resembles the claims the SEC fined Delphia and Global Predictions for in 2024 [Verified] ([Harvard Law Forum](https://corpgov.law.harvard.edu/2024/04/18/decoding-the-secs-first-ai-washing-enforcement-actions)).

**Decision quality: a real gap, but a thin one.** No major commercial product is positioned around abstention, calibration or mistake-learning. The closest are long-tail journals with pre-trade Go/No-Go gates and "confidence miscalibration" analytics (ChartyTool, TradeDoctor AI, StonkJournal), and their traction is probably tiny [Anecdotal] ([AlternativeTo ChartyTool](https://alternativeto.net/software/chartytool); [StonkJournal](https://stonkjournal.com/)). The gap exists partly for an incentive reason: fee- and order-flow-funded businesses earn from activity, not restraint [Speculative]. It may also exist because restraint is hard to sell [Speculative]. The core "AI critic + rule gate" is easy to copy. What is not easy to copy is (a) a trader's own months-long, timestamped history of decisions including skips, (b) calibration earned on that history, and (c) a trust brand built on records that cannot be edited after the fact [Speculative].

**Recommendation and scale.** Build Veto for self-directed active crypto-spot traders first (the founder's data stack already covers it), with prop-firm challengers as the second wedge. Price it as a flat subscription of roughly £15–£39 a month, never as a performance fee. Expect a niche business: 10,000 paying users at about £25 a month is about £3m ARR [Speculative, arithmetic]. It becomes venture-scale only if it turns into a B2B2C layer inside brokers, exchanges or journals, which is unproven [Speculative].

---

## 2. Market map: distribution has moved to the brokers, and "AI" mostly means rules

The market splits into seven commercial clusters plus an open-source layer. Momentum in 2026 sits with brokers and exchanges that own both the agent and the execution [Strong] ([TechCrunch](https://techcrunch.com/2026/05/27/robinhood-now-lets-your-ai-agents-trade-stocks/); [GlobeNewswire](https://www.globenewswire.com/news-release/2026/07/07/3323457/0/en/etoro-launches-new-app-ai-first-smart-and-social.html)).

| Cluster | Examples | How it makes money | What "AI" actually is | Label |
|---|---|---|---|---|
| Broker/exchange-native agents | Robinhood Agents & agentic API, eToro Tori + MCP, Composer by SoFi, Bitget GetAgent, Bybit AI, Pionex | Order flow, spreads, trading fees (Pionex 0.05%), subscriptions | Frontier LLMs (Robinhood: OpenAI/Anthropic) or undisclosed | Strong/Verified |
| Crypto bot SaaS | 3Commas ($20–$140/mo), Cryptohopper, Coinrule, Bitsgap, Cornix, WunderTrading | Tiered SaaS | Rule engines (DCA/grid/signal) with an "AI assistant" bolted on | Anecdotal |
| AI research/scoring | Fiscal.ai ($10M Series A), Perplexity Finance, Danelfin, Tickeron, Kavout, TrendSpider, Magnifi | SaaS | LLM summarisation; opaque scores; backtested marketing | Strong/Anecdotal |
| Copy/follow | eToro CopyTrader, Bitget copy trading, Autopilot (~$1.3B AUM) | Spreads, profit share, subscriptions | Little or none; story-driven | Strong |
| On-chain intelligence | Nansen ($49–$69/mo Pro; pay-per-call for agents), Arkham | SaaS, per-call, trading fees | Data products repositioning as "tools for agents" | Anecdotal |
| Journals/coaches | TradeZella ($29–$99), TraderSync ($29.95–$79.95), Edgewonk ($169–$197/yr), long-tail decision journals | SaaS | LLM coaches over logged trades | Anecdotal |
| Agent-token ecosystems | ElizaOS/ai16z (down ~97%, foundation closing), Virtuals (revenue down ~97% in 2025) | Tokens | Agent shells | Strong |
| Prediction-market tooling | PolyTrack ($29/mo), Polywhaler, copy-bots, ~662 "polymarket agents" repos, official agent-skills | Freemium, per-call, affiliate | API wrappers, whale alerts | Anecdotal/Verified |

Sources: [crypto.news](https://crypto.news/10-ai-bot-trading-in-2026-features-and-pricing/); [Amassed Insights](https://blog.amassinsights.com/amassed-insights-5-ai-in-investing/); [Benzinga](https://www.benzinga.com/news/politics/26/03/51248325/exclusive-pelosi-tracker-creator-reveals-top-3-lawmakers-to-watch-new-trump-white-house-stock-strategy); [CoinDesk](https://www.coindesk.com/markets/2026/08/05/ai-agent-token-once-worth-usd2-4-billion-ends-with-founder-calling-it-dead); [Cointelegraph](https://cointelegraph.com/news/new-ai-agent-launches-virtuals-plummet-token-drawdowns); [GitHub: Polymarket/agent-skills](https://github.com/Polymarket/agent-skills).

Three structural facts follow. First, model intelligence is commoditised: Robinhood, eToro, Bybit and Nansen all expose bring-your-own-LLM access (agent APIs, MCP connectors). Differentiation therefore shifts to risk controls, explanation and trust [Speculative] ([eToro press release](https://www.etoro.com/news-and-analysis/press-releases/your-ai-already-runs-your-day-now-it-knows-your-portfolio/)). Second, incumbents push responsibility for decision quality onto users. Robinhood says it does not "control, supervise, monitor, recommend or audit" third-party agents, and customers assume all risk [Strong] ([Finder](https://www.finder.com/investments/ai-trading-agent-liability)). Third, market sizes for the plausible niches are small and poorly measured. About 8% of UK adults held crypto in 2025, roughly 4.5m people, though a different FCA survey implies about 2.3m [Strong] ([FCA research note](https://www.fca.org.uk/publications/research-notes/cryptoassets-consumer-research-2025)). About 0.7% of UK adults trade CFDs, roughly 370k people [Strong for the share, Speculative for the headcount] ([The Citizen on FCA Financial Lives](https://thecitizen.co.tz/tanzania/business/britain-s-high-risk-investors-were-not-mostly-beginners-fca-based-study-found-5405006)). The count of UK *active* crypto traders or prop-firm challengers is **[Unknown]**.

---

## 3. Competitor deep dive: everyone sells activity, nobody sells restraint

Reverse-engineering why each important player exists shows the same pattern. The defensible ones own distribution, regulation, custody or data, and none of them publishes audited evidence of AI-driven outperformance [Strong for the absence of evidence] ([commercial review summary, Fortune](https://fortune.com/2026/09/29/robinhood-trading-agents-hood-openai-anthropic/)).

| Product | Why it exists (reverse-engineered) | Autonomy and controls | Evidence it works | Lesson for Veto |
|---|---|---|---|---|
| **Robinhood Agents / agentic API** (US) | Agents are new order flow; isolated sub-accounts cap liability. 15k+ agentic accounts and ~30M tool calls/day (company-reported) [Strong/claim] | Approvals on by default but can be switched off; "Loops" standing automation planned [Strong] | None on performance [Unknown] | Incumbents move *toward* autonomy, and disclaim decision quality. Owning the "should this trade happen?" question is open. |
| **eToro** (Tori, agent portfolios, MCP; UK-available) | Fuses "AI agent as copyable trader" with CopyTrader network effects under an FCA-regulated entity [Verified launch; Speculative on moat] | Tori executes with user approval; agents trade 24/7 in sub-accounts [Verified] | None independent; a review questions value [Anecdotal] | eToro is the most direct UK incumbent. It could ship a pre-trade check, but its revenue comes from activity. |
| **Composer by SoFi** | "AI drafts, user approves, rules execute": the LLM is used at authoring time, with deterministic execution. Acquired by SoFi in June 2026 [Verified] | Live only after user review and funding [Verified] | None published [Unknown] | Validates human-in-the-loop plus deterministic execution, the template the founder already has. |
| **Bitget GetAgent** | Exchange engagement: research → playbooks → trades; claims 1M+ AI-trade users and $1.2B volume [Anecdotal/company] | Playbooks for Plus/Pro tiers | None [Unknown] | Exchange agents are free and optimise for volume. Don't compete on research. |
| **Pionex** | Free bots monetised through a 0.05% fee [Anecdotal] | Built-in bots; Trustpilot ~2.3–2.6, mostly over withdrawals [Strong] | None | Fee-funded models are structurally anti-abstention. |
| **3Commas** | Rule-engine bot SaaS on user API keys [Anecdotal] | 2022 API-key leak: about 100k keys published, losses estimated at $14.8M–$27.3M [Verified] | Reviewers: grid bots "never made money" [Anecdotal] | Holding trading keys is a permanent liability. Veto should never hold trade or withdrawal permissions. |
| **Autopilot** | Story ("trade like Pelosi") plus an SEC-RIA trust wrapper; ~$1.3B AUM, Pelosi Tracker ~$464M [Strong] | Automated mirroring | Unknown; disclosure lags undermine the premise [Speculative] | **A story plus a trust wrapper beats "AI" for retail growth.** |
| **Nansen** | Data vendor turning into "tools for agents" plus execution [Anecdotal] | Pay-per-call ($0.01–$0.05) for agents | n/a | Data and execution converge; Veto should stay off the execution side. |
| **Fiscal.ai** | Research-only equity AI; $10M Series A [Strong] | No execution | n/a | Research copilots are funded and crowded. |
| **TradeZella / TraderSync / Edgewonk** | Journals with data lock-in; AI credits on all TradeZella plans [Anecdotal] | Post-trade only | Retention rests on support; churn from broken sync [Anecdotal] | **The most dangerous fast follower**: they already hold the trade data. |
| **ChartyTool / TradeDoctor / StonkJournal / TraderShape** | Long-tail decision-quality journals: Go/No-Go gate, no-trade conditions, miscalibration [Anecdotal] | Advisory | Traction unknown, probably tiny [Unknown] | Proves the gate is easy to build. The opportunity is in doing it with data and trust, not in the gate itself. |
| **Danelfin / Tickeron / Kavout** | Opaque AI scores sold with backtested returns (Danelfin claims +376% vs +166%) [Anecdotal; treat as marketing] | Signals | One tester found win rates "close to random" [Anecdotal] | The trust gap in the category is the opening. |
| **Nof1 Alpha Arena** | A spectator benchmark that made LLM trading legible and dramatic [Strong] | Fully autonomous | Statistically meaningless samples [Strong] | Transparent losses are as viral as wins. |

Sources: [TechCrunch](https://techcrunch.com/2026/05/27/robinhood-now-lets-your-ai-agents-trade-stocks/); [Fortune](https://fortune.com/2026/09/29/robinhood-trading-agents-hood-openai-anthropic/); [Finance Magnates](https://www.financemagnates.com/fintech/etoro-lets-investors-delegate-trades-to-ai-agents-as-automation-usage-nearly-doubles/); [SoFi IR](https://investors.sofi.com/news/news-details/2026/Introducing-Composer-by-SoFi-AI-Powered-Investing-From-Idea-to-Execution/default.aspx); [CCN](https://www.ccn.com/bitget-getagent-review/); [Coin Bureau](https://coinbureau.com/review/pionex/); [BleepingComputer](https://www.bleepingcomputer.com/news/security/crypto-platform-3commas-admits-hackers-stole-api-keys); [Forklog/HAPI](https://forklog.com/en/news/api-key-leaks-and-exchange-inaction-a-hapi-analysis-of-the-3commas-incident); [Pump Parade](https://blog.pumpparade.com/reviews/nansen-review-2026-smart-money-features-verdict/); [Memeburn](https://memeburn.com/best-ai-trading-journals/); [ChartingLens](https://chartinglens.com/blog/best-ai-stock-screener); [TradeDoctor](https://tradedoctorai.com.growthradarhq.com/features/).

Revenue figures were found for none of these products, and Trustpilot and App Store distributions could not be read directly [Unknown]. The incident record matters as much as the products. Every major 2026 agent failure involved an agent with too much authority and no independent policy layer. The Lobstar Wilde/OpenClaw agent mis-parsed a quantity and sent its entire 52.43M-token holding instead of a tip [Anecdotal–Strong] ([KuCoin News](https://www.kucoin.com/news/flash/openclaw-ai-agent-incident-causes-millions-in-user-losses)). Bankrbot treated Grok's decoded Morse-code reply as a payment order and moved about $150–200k [Anecdotal/Strong] ([Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/responsible-ai-agent-loses-money-210732192.html)).

---

## 4. GitHub and open source: huge stars, zero production execution foundations

Every popular LLM trading repo simulates execution and disclaims real trading. Their reusable value is patterns, not runtime code [Verified for the disclaimers, Speculative for the verdicts] ([TradingAgents README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md); [ai-hedge-fund README](https://raw.githubusercontent.com/virattt/ai-hedge-fund/main/README.md)).

| Repo (stars, 25 Oct 2026) | What it is | Verdict |
|---|---|---|
| TauricResearch/TradingAgents (113,860) | Analyst team → bull/bear debate → trader → risk team/PM; simulated exchange; "settle past decisions then reflect" memory; repeated look-ahead fixes in v0.3–v0.5 [Verified] | Read for patterns (point-in-time data contracts, settle-then-reflect). Don't depend on it. Its own changelog implies earlier backtests were contaminated [Strong]. |
| virattt/ai-hedge-fund (64,239) | Investor-persona agents; "the system does not actually make any trades" [Verified] | Educational demo. |
| HKUDS/Vibe-Trading (36,613, created Apr 2026) | Research agent with backtests and an MCP; "Shadow Accounts" infer rules from a broker journal [Verified stars; Anecdotal features] | Internal research sandbox. The **shadow-account idea is a useful onboarding hook for Veto**. |
| FinRL family, TradeMaster, qlib | RL/ML quant research | Irrelevant to an LLM decision product. |
| FinMem (966; dormant since Aug 2024) | Layered memory with decay | Borrow the decay idea. Under leakage controls, FinMem's total return decayed by up to 71.85% [Strong] ([Profit Mirage](https://arxiv.org/abs/2510.07920)). |
| elizaOS (19,650), NoFx (13,148; 514 open issues+PRs), AutoHedge (no push since May 2026) | Agent shells | Not foundations. |
| Polymarket/agents (3,803) | Official agent repo, **archived**; replaced by agent-skills [Verified] | "Connect an LLM to Polymarket" is commoditised. |
| freqtrade (55,908), CCXT (44,565), NautilusTrader (30,782), Hummingbot, LEAN | Mature engines and connectivity [Verified] | **Adopt CCXT now.** NautilusTrader only if live execution ever happens. Freqtrade is GPL. |
| anthropics/financial-services (40,769) | Banking/ER/PE agents; "do not make investment recommendations, execute transactions" [Verified] | Wrong vertical; useful only as a plugin packaging template. |

Sources: [GitHub repos via API, as listed](https://github.com/TauricResearch/TradingAgents); [Vibe-Trading](https://github.com/HKUDS/Vibe-Trading); [aiidelist](https://aiidelist.com/blog/vibe-trading-ai-quant-research-agent.md); [Polymarket/agents](https://github.com/Polymarket/agents); [CCXT](https://github.com/ccxt/ccxt); [anthropics/financial-services README](https://raw.githubusercontent.com/anthropics/financial-services/main/README.md).

The most useful open-source signal comes from Freqtrade's issue tracker, not its stars. Its issue template now pre-emptively warns that if "your strategy or configuration [was] generated by an AI model, and is now not working… This is almost certainly NOT a bug… We'll close such issues" [Verified] ([freqtrade#12893](https://github.com/freqtrade/freqtrade/issues/12893)). One issue found that 85.7% of 54,988 backtest exit prices did not match 1-minute ground truth [Verified] ([freqtrade#13269](https://github.com/freqtrade/freqtrade/issues/13269)). Hobbyists are producing AI-written strategies at scale, and they fail live often enough that maintainers have built a filter for them. The star-to-maturity mismatch is extreme: Vibe-Trading reached 36k stars in seven months, and stars track hype, not production use [Speculative]. Adaptive Quant's design, with structured outputs, a deterministic gate, point-in-time memory and benchmarks, is already more disciplined than the most-starred open-source agents, which only adopted these patterns during 2026 [Speculative, from changelogs] ([TradingAgents README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md)).

---

## 5. Does any of this actually work? Nothing published clears a skeptical quant's bar

Each rung of the evidence ladder proves less than its marketing implies, and the higher rungs are nearly empty.

| Rung | What it can show | What it cannot show | Best public example | Verdict |
|---|---|---|---|---|
| **Demo** | The software runs; the UI is legible | Anything about edge | ai-hedge-fund, Vibe-Trading | Ubiquitous, uninformative [Speculative] |
| **Backtest** | Rule logic on history | LLM skill on any pre-cutoff period. LLMs recall pre-cutoff prices and headlines, and **masking does not fix it**; skill is provably non-identifiable [Strong] | TradingAgents (~3 months, 11 LLM + 20 tool calls per prediction, Sharpe "exceeds our expected empirical range") [Strong] | Invalid for LLMs; valid only for deterministic rules with realistic fills |
| **Paper (forward)** | Post-cutoff decision behaviour, process adherence, cost-model sanity | Real fills, slippage under stress, psychological pressure | Adaptive Quant's £10k fund (not yet run live, per its own docs) | The right test for LLM decisions, but needs years for P&L claims |
| **Live (small)** | Execution reality | Skill, given tiny samples. Identical Claude runs ranged from −35.9% to +55.6% on the same data [Strong] | Alpha Arena S1/S1.5 | Spectacle, not evidence |
| **Verified** | Pre-registered, post-cutoff, cost-inclusive, multiple seeds, Deflated Sharpe, t>3 | — | **None found** [Strong, high confidence for prominent results] | Empty rung |

Sources: [The Memorization Problem, arXiv 2504.14765](https://arxiv.org/html/2504.14765v2); [TradingAgents arXiv 2412.20138](https://arxiv.org/html/2412.20138); [GitHub: llm_trading_arena replication](https://github.com/Eug-Chua/llm_trading_arena); [Harvey, Liu & Zhu](https://nber.org/papers/w20592); [Bailey & López de Prado DSR](https://papers.ssrn.com/abstract=2460551).

The academic "LLM alpha" with the most weight is news-sentiment prediction (Lopez-Lira & Tang). It was reported gross of costs, and its returns **decline as LLM adoption rises**, which is classic alpha decay [Strong] ([arXiv 2304.07619v6](https://arxiv.org/pdf/2304.07619v6)). One live multi-market study found that agent *framework* (risk rules, sizing, cash discipline) explains more outcome variance than the model backbone [Strong] ([arXiv 2510.11695](https://arxiv.org/pdf/2510.11695)). That is the most decision-relevant finding in the whole review: **risk architecture is the lever, not model choice** [Speculative inference].

Prediction markets are no better. About 70–84% of Polymarket wallets lose money [Strong] ([The Defiant](https://thedefiant.io/news/research-and-opinion/polymarket-profitability-report-april-2026)). Platform-wide arbitrage profits were about $40M over a year, and secondary sources say about 80% went to roughly 10 wallets [Verified for $40M, Strong for concentration] ([arXiv 2508.03474](https://arxiv.org/html/2508.03474v1)). The viral "$313 → $438k" wallet was latency arbitrage, not prediction, and Polymarket then added dynamic taker fees to curb it [Strong] ([Finbold](https://finbold.com/trading-bot-turns-313-into-438000-on-polymarket-in-a-month/); [Finance Magnates](https://www.financemagnates.com/cryptocurrency/polymarket-introduces-dynamic-fees-to-curb-latency-arbitrage-in-short-term-crypto-markets/)). In Prophet Arena, GPT-5's Brier score (0.184) barely beat the market's (0.187), and both had average simulated returns below 1.0, meaning both lost money [Anecdotal, secondary summary] ([Liner review](https://liner.com/ko/review/llmasaprophet-understanding-predictive-intelligence-with-prophet-arena)). LLM forecasters are near but still behind superforecasters, with projected parity around late 2026 [Verified] ([FRI](https://forecastingresearch.substack.com/p/llms-are-closing-the-gap-on-human)). Even if parity arrives, it makes AI forecasting a commodity, not a moat [Speculative].

**What would convince a skeptical quant** [Speculative, synthesised from the cited methods]:

1. A test period that starts after every model's training cutoff, including the embedding model's, since memorisation extends to embeddings [Strong] ([arXiv 2504.14765](https://arxiv.org/html/2504.14765v2)).
2. Decisions hash-committed before outcomes are known.
3. Pre-registered strategy, universe, prompts, model versions, sizing, metrics and stopping rule, with every variant counted for the Deflated Sharpe.
4. Realistic costs, including LLM inference cost per decision.
5. Benchmarks: buy-and-hold, a simple trend rule, and a single-LLM baseline at equal compute.
6. Multiple seeds, and t>3 for new claims.
7. Counterfactual-perturbation leakage tests in the style of Profit Mirage.

None of the prominent public results meets this bar [Strong]. Adaptive Quant's paper fund can meet items 1–5 and 7. It cannot meet item 6 for P&L within any commercially relevant timeframe (Section 9).

---

## 6. Customer intelligence: traders pay for hope, distrust claims, and lose to themselves

### Segments, and who has acute pain plus money

| Segment | Size (UK unless stated) | Pain | WTP | Incumbent strength | Fit |
|---|---|---|---|---|---|
| Beginner/casual crypto holder | ~2.3–4.5m adults [Strong] | High (scams, FOMO), often unrecognised | Low | Moderate | Worst first market: scam adjacency, harm risk |
| Intermediate active retail (day/swing, CFD/spread bet) | ~370k CFD traders [Speculative headcount] | Very high: 74–89% of CFD accounts lose [Verified] | Medium–high | Weak–moderate | Strong |
| Semi-pro incl. prop-firm challengers | [Unknown] | Very high: ~70% of failures are loss-limit breaches [Anecdotal, vendor] | High (repeat challenge fees) | Weak | Strong |
| Crypto bot users | [Unknown] | High: regime losses, black boxes, key security | Medium; fragile trust | Weak–moderate | Strong if explainable |
| Polymarket traders | 242k–478k global MAU [Strong]; UK blocked | Very high (70–84% lose) | Medium | Weak | Blocked for a UK founder |
| Quant hobbyists | [Unknown] | High (backtest/live parity) | Medium (QuantConnect $84/mo) [Verified] | Moderate | Adjacent (Concept H) |
| Long-term ISA/SIPP investors | Large | Low–medium | Low–medium | Strong | Poor |

Sources: [FCA crypto research](https://www.fca.org.uk/publications/research-notes/cryptoassets-consumer-research-2025); [ESMA](https://www.esma.europa.eu/node/84933); [HackerNoon](https://hackernoon.com/the-real-reason-traders-blow-prop-firm-evaluations); [The Block](https://www.theblock.co/post/377214/polymarket-rebounds-kalshi-leads); [QuantConnect pricing](https://www.quantconnect.com/pricing.md).

### What they use, pay, hate, distrust and wish for

The typical active-trader stack is TradingView (roughly $15–$70+ a month), a journal (TradeZella $29–$49 a month, Edgewonk $169 a year), crypto bot platforms (3Commas, Cryptohopper, Pionex), paid Discord or Telegram signal groups, and general LLMs used on existing subscriptions [Strong/Anecdotal] ([DayTradingz](https://daytradingz.com/best-trading-journal); [ChartingLens](https://chartinglens.com/blog/tradingview-price-increase-2026)). Willingness to pay of about £15–£60 a month per tool is proven among active traders, and many stack two to four tools [Speculative, inferred from pricing]. What they **hate**:

- bots that don't make money (a 3Commas reviewer said grid bots "never made money");
- broken broker sync, the most common TradeZella complaint and a stated reason to cancel;
- paywalled or delayed data and price rises;
- billing and refund friction, including 3Commas cancellation killing active deals "deep in the red";
- withdrawal delays (Pionex).

All of these are [Anecdotal] ([3Commas Trustpilot](https://uk.trustpilot.com/review/3commas.io?page=4); [TradeZella Trustpilot](https://uk.trustpilot.com/review/tradezella.com?page=7); [G2](https://www.g2.com/products/3commas/pricing)). What they **distrust** is performance claims of every kind. The scam backdrop is enormous: the FBI's IC3 recorded $7.2bn of US crypto investment fraud in 2025, and UK Finance recorded £221.5m in UK investment scams [Strong] ([Fox Business](https://www.foxbusiness.com/lifestyle/crypto-fraud-tops-fbis-annual-crime-report-americans-lose-billions-scams); [Crypto Times](https://www.cryptotimes.io/2026/06/15/uk-investment-scam-losses-hit-221m-as-ai-fuels-crypto-fraud/)). The FCA has named sites like "Ai Trader Bot" and "AI Trading Hub" on its warning list, and "Quantum AI" ran deepfakes of Martin Lewis [Verified] ([FCA warning](https://www.fca.org.uk/news/warnings/ai-trader-bot); [Which?](https://www.which.co.uk/news/article/what-is-the-quantum-ai-scam-acsiK7o1b7qr)). Surveys show a usage–trust gap. 53% of investors use generative AI for finance monthly but only about 30–31% trust it for advice (Betterment) [Strong] ([Betterment 2025](https://www.betterment.com/hubfs/PDFs/b4c/Betterment%20Retail%20Survey%202025.pdf)). 62% have used AI for investment decisions, but 54% "trust only somewhat and typically verify" and 39% fear wrong recommendations (Investing.com, n=938) [Strong] ([Hedge Fund Alpha](https://hedgefundalpha.com/news/retail-investors-now-use-ai-to-inform-investment-decisions/)). What they **wish** for, inferred from complaints, is a regime-aware stand-down, a hard kill switch, enforced rather than advisory loss gates, and AI as a judge rather than a predictor. One r/algotrading commenter said LLMs "are better as judges (evaluating a setup you already found) than predictors", and a NinjaTrader user gave up "developing discipline" and hard-coded loss gates instead [Anecdotal] ([r/algotrading mirror](https://reddit.sentinel-team.org/posts/1rrnizz/snapshots/2026-03-12T22%3A51%3A16.46177Z); [NinjaTrader Discourse](https://discourse.ninjatrader.com/t/how-do-you-guys-deal-with-overtrading/6334?page=2)).

### Switching barriers, and recommend/cancel triggers

The barriers to switching are accumulated journal history and tags, broker-sync setup, and habit [Speculative]. People **recommend** after responsive human support (several TradeZella reviewers say support stopped them cancelling), education and community, and honest "no profit guarantee" framing [Anecdotal] ([TradeZella Trustpilot](https://uk.trustpilot.com/review/tradezella.com?page=7); [Trader Signals Trustpilot](https://nl-be.trustpilot.com/review/tradersignals.io)). People **cancel** over disappointing results, sync failures, time cost and billing friction [Anecdotal]. No churn or retention figures exist publicly for any journal or bot platform [Unknown].

### The uncomfortable background fact

Most active traders lose, and they do not obviously learn. Barber & Odean found the most active US households earned 11.4% a year against a 17.9% market return [Verified] ([Berkeley](https://faculty.haas.berkeley.edu/odean/papers/returns/returns.html)). In Brazil, 97% of people who day traded for 300+ days lost money, with "no evidence of learning" [Verified] ([FGV](https://repositorio.fgv.br/items/e87d04fc-4b4c-4a56-ab5a-1c84c1afde1b/full)). This cuts both ways for Veto. The pain is enormous, but it suggests self-improvement tools may not change behaviour unless they impose friction or enforcement [Speculative].

### Ranked pain points and the best initial niche

| Rank | Pain | Score (F×S×WTP×Weakness, max 625) | Label |
|---|---|---|---|
| 1 | Unverifiable performance claims and scams | 300 | Verified + Anecdotal |
| 2 | Backtest-to-live gap; regime blindness | 256 | Verified (GitHub) + Anecdotal |
| 3 | No "do nothing" logic, kill switch or regime gate | 240 | Anecdotal + Strong |
| 4 | Behavioural self-sabotage with no enforced guardrails | 180 | Verified loss data + Anecdotal |
| 5= | Black-box opacity; low trust in automation | 144 | Strong (surveys) |
| 5= | Want AI as second opinion, not autonomy | 144 | Strong (surveys) |
| 7 | Security and custody of keys | 90 | Verified (3Commas) |
| 8 | Journaling friction and broken sync | 72 | Anecdotal |

All scores are [Speculative] analyst judgements built on the evidence above.

**Best initial niche** [Speculative]: self-directed, discretionary crypto-spot active traders on Binance, Coinbase or Kraken who already pay for TradingView or a journal and trade 5–50 times a week. The founder's data stack serves them on day one. Read-only API sync removes most journaling friction. In the UK, signals or views on unbacked crypto sit outside the advice perimeter (Section 27). Prop-firm challengers are the second wedge. They have the sharpest and most measurable pain (rule breaches), but they mostly trade futures, forex and CFDs on platforms the notes did not cover, and prop firms are not natural partners: only about 7% of challenge buyers are ever paid out, so firms profit from failure [Anecdotal] ([Track360](https://track360.io/blog/prop-trading-industry-statistics-2026)).

---

## 7. Viral content intelligence: spectator races spread, and so do losses

| Example | Hook and mechanics | Credibility device | Main objection | Reusable under FG24/1? |
|---|---|---|---|---|
| **Alpha Arena S1** (Oct–Nov 2025) | Brand-name AIs, real money, live leaderboard, fixed end date; schadenfreude ("ChatGPT lost 63%"); China-vs-West tribalism [Strong] | Public wallets, trade logs, "ModelChat" reasoning | Tiny sample, leverage, one regime | Yes as a **paper** race against a benchmark with all entrants shown; risky with real money and returns |
| **"I gave ChatGPT $100"** (mid-2025) | Underdog teen, tiny stakes, beat the S&P (+29% vs +4%) [Strong it happened; Anecdotal results] | Public repo, weekly posts | Short horizon, micro-cap volatility | Format reusable only as a pre-registered forward audit with losses equally prominent |
| **virattt/ai-hedge-fund** | "AI hedge fund team" of famous-investor personas; free code; #1 GitHub Trending (Mar 2025) [Verified] | Open source, not P&L | Personas imply expertise they don't have | Open-source launch mechanics are reusable; avoid persona authority theatre |
| **Polymarket "bot made $X"** | Extreme multiples, P&L screenshots, "copy it" [Strong that real and fake coexist] | On-chain wallets (winners only) | Survivorship; fake dashboards as funnels | No: survivorship and inducement, and Polymarket is unavailable to UK users |
| **YouTube "I gave [model] $10,000"** | A curiosity gap the content didn't resolve honestly ($9,900 vs $9,980 S&P after 7 days, with interventions) [Anecdotal] | Screen recordings | Clickbait | No |

Sources: [SCMP](https://www.scmp.com/tech/tech-trends/article/3329784/deepseek-outperforms-ai-rivals-real-money-real-market-crypto-showdown); [Benzinga](https://fr.benzinga.com/quote/cryptocurrency/25/11/48651974/chatgpt-lost-63-trying-to-trade-crypto-but-one-china-ai-made-a-healthy-profit); [Futurism](https://www.futurism.com/chatgpt-stocks-100-dollars); [Trendshift](https://trendshift.io/repositories/13080); [Phemex](https://phemex.com/news/article/viral-polymarket-arbitrage-bot-fails-to-deliver-promised-profits-48547); [YouTube](https://www.youtube.com/watch?v=eg_1NXDcoPk).

The shared levers are a named AI protagonist, money at stake, a race with an end date, a checkable scoreboard and a surprising result [Speculative]. The UK constraint is concrete. Under FG24/1 (26 Mar 2024), each social post must comply on its own, balance benefits and risks, and keep key information prominent. Unauthorised promotion is a criminal offence under s21/s25 FSMA, and three finfluencers appeared in court in September 2025 [Verified] ([CMS on FG24/1](https://cms.law/en/gbr/legal-updates/fca-publishes-finalised-guidance-on-financial-promotions-on-social-media); [FCA press release](https://www.fca.org.uk/news/press-releases/first-court-appearance-three-finfluencers-charged-fca-led-global-crackdown-illegal-promotions)). Crypto is a Restricted Mass Market Investment, which brings risk warnings, a 24-hour cooling-off period and a ban on incentives [Strong] ([Elliptic](https://www.elliptic.co/blog/analysis/fca-introduces-tough-new-rules-for-marketing-cryptoassets)). Ethical mechanics, ranked from safest to riskiest, are: (1) "why it didn't trade" decision logs, which are process and education content; (2) paper AI-vs-benchmark races with all entrants and drawdowns shown; (3) real-money challenges with full ledgers and pre-registered rules, which carry the most promotion risk [Speculative]. Deceptive mechanics to avoid are wins-only cards, "$1 → $X" compression, unstated leverage and affiliate funnels.

---

## 8. Market gaps: six gaps, two of them traps

| Gap | Real or illusory? | Why it exists | Label |
|---|---|---|---|
| Decision-quality scoring that **includes skipped trades** | Real | Journals only see trades taken; brokers earn from activity | Speculative, well-supported |
| Verifiable, hash-committed, cost-inclusive decision records | Real, and the top pain | No one is incentivised to publish losses | Speculative |
| Independent deterministic policy layer between retail AI agents and brokers | Real and growing (15k Robinhood agentic accounts; incidents) | Brokers disclaim agent quality | Strong for the incidents, Speculative for demand |
| Calibrated confidence with a track record ("said 70%, right 64%, n=212") | Real; no product publishes calibration curves | Raw LLM confidence is overconfident [Strong] ([Xiong et al.](https://arxiv.org/abs/2306.13063v2)) | Speculative |
| Regime-aware "stand down" for bot users | Real but hard to monetise without execution access | Bots are sold on activity | Anecdotal |
| Better AI trade-*idea* generation | **Trap**: crowded, no evidence of edge, regulated advice for shares | Everyone is doing it | Strong |
| LLM-picked prediction-market bets | **Trap** for a UK founder: UK closed, edge unproven | Legal and evidential | Strong |

The gaps with no incumbent are also the ones where willingness to pay is unproven. No survey measured WTP for explainability, regime gates or verified records [Unknown] (customer research gaps). That is the central risk, and the reason the 30-day plan is a validation sprint.

---

## 9. Is "learning" real? Process learns in weeks; P&L learns in years

Reflection and memory reliably improve agents only where feedback is fast and unambiguous. Reflexion lifted HumanEval pass@1 from 80% to 91% with reference tests, and weaker models showed no gain [Verified via secondary] ([Beancount research log](https://beancount.io/bean-labs/research-logs/2026/04/25/reflexion-language-agents-verbal-reinforcement-learning)). Trading feedback is slow, noisy and confounded with luck. The finance-specific memory agents (FinMem, FinAgent) lost most of their reported gains under leakage controls [Strong] ([Profit Mirage](https://arxiv.org/html/2510.07920v1)). LLM self-critique without external feedback does not reliably improve reasoning and can degrade it [Strong] ([Huang et al.](https://arxiv.org/pdf/2310.01798)). Humans *can* be trained toward calibration: about an hour of training improved Good Judgment Project Brier accuracy by about 10% [Strong, secondary] ([AI Impacts](https://aiimpacts.org/evidence-on-good-forecasting-practices-from-the-good-judgment-project/)). LLM verbalised confidence is systematically overconfident [Strong] ([Xiong et al.](https://arxiv.org/abs/2306.13063v2)).

**What can genuinely improve, and be shown to:** rule-adherence and breach rates, which are deterministic and observable per decision; the frequency of repeat mistakes from a fixed taxonomy; Brier or log score and reliability curves on explicit, resolvable forecasts (for example "P(price > X at T)"); and abstention quality via coverage-versus-error curves [Speculative, from the cited methods]. **What is dangerous or impossible to claim:** "the AI learned and now earns X%" from less than several years of live data; "reflection improved returns" without an equal-compute no-reflection control on post-cutoff data; any improvement shown on a pre-cutoff backtest; and win rate as proof of skill from fewer than many hundreds of independent trades [Strong for the limits].

**The sample-size arithmetic** [Speculative, my calculation from standard formulas; it assumes independent trades and iid normal returns, both optimistic]:

| Claim to establish | Required sample | Implication |
|---|---|---|
| Win rate 55% vs 50% (two-sided α=0.05, 80% power) | **~783 independent trades** | A user doing 20 trades a week needs ~9 months |
| Win rate 52% vs 50% | **~4,903 trades** | Effectively unprovable per user |
| A setup bucket wins 35% vs 50% base (one-sided) | **~67 cases** | Needed before a "this setup is bad for you" rule carries statistical weight |
| What ≥10 cases buys you: 3 wins in 10 | 95% Wilson CI **≈ 11%–60%** | Cannot distinguish a bad setup from a coin flip |
| Annual Sharpe 1.0 at t=2 / t=3 (Lo-style SE ≈ √((1+SR²/2)/T)) | **~6 / ~13.5 years** | P&L-based "learning" claims are commercially unprovable |
| Annual Sharpe 2.0 at t=2 / t=3 | **~3 / ~6.8 years** | Even a strong edge takes years |
| Alpha Arena S1 winner | 43 trades | Uninformative [Strong] |

The research notes put Sharpe 1.0 at about 4 years for t≈2. Including the (1+SR²/2) term gives about 6; either way the conclusion holds. Two consequences for the founder's engine follow. First, the existing `lesson_min_evidence = 10` threshold should be relabelled as "eligible for review", not "evidence". A rule change should need either a pre-specified test (for example a one-sided binomial at the ~60–70-case scale) or a *process* justification that needs no outcome statistics [Speculative]. Second, `memory_min_similar = 5` for informational retrieval is fine as context but must never be shown as a probability [Speculative]. The founder's own STRATEGY.md already forbids presenting "Research Confidence" as a probability, which is correct (local file `/home/user/apex-ai/docs/STRATEGY.md`).

**The two-speed learning model** is the honest core of "decision quality over time" [Speculative]. *Fast loop:* a decision that broke a stated rule, ignored an invalidation level, upsized after losses or traded during a self-declared stand-down is a process error the moment it happens, whatever the outcome. The system can "learn" from it on Day 2 without any statistics. *Slow loop:* outcome patterns, such as a setup that loses for this user, only become rules after pre-specified sample thresholds. Calibration sits in between. With an assumed per-question SD of 0.1 in paired Brier differences, detecting a 0.01 Brier improvement needs roughly 800 resolved forecasts [Speculative, assumption-dependent]. That is achievable when pooled across users and slow per user.

One last caution: memory built with a pre-cutoff embedding model can itself leak future information into replays [Strong] ([arXiv 2504.14765](https://arxiv.org/html/2504.14765v2)). Retrieval must be strictly point-in-time on the user's own timestamped records.

---

## 10. "Do nothing" metrics: measure vetoes against a random-veto baseline

No study shows that abstention improves trading Sharpe [Unknown] ([chatpaper listing](https://chatpaper.com/paper/314591)). Conformal and selective-prediction methods do give principled abstention for LLMs on other tasks [Strong] ([arXiv 2405.01563](https://arxiv.org/html/2405.01563v1); [arXiv 2502.06884](https://arxiv.org/abs/2502.06884v1)). The overtrading evidence makes the case for measuring abstention: in Alpha Arena, Gemini 2.5 Pro made 238 trades in 17 days and paid about $1,331 in fees, roughly 13% of capital [Anecdotal] ([iWeaver](https://iweaver.ai/es/blog/alpha-arena-ai-trading-season-1-results)).

| Metric | Definition | Pitfall and guard |
|---|---|---|
| Abstention rate | Share of candidate decisions ending NO TRADE / STAND DOWN | High is not good per se; pair it with lift |
| **Veto lift** | Loss rate (or mean R) of vetoed-but-shadow-tracked trades minus that of approved trades | **Compare against a random-veto baseline at the same rate.** Otherwise "vetoed trades lost" can just be base-rate losers |
| Skip precision / regret | Share of vetoed trades that would have lost / would have won, net of costs | Needs pre-defined shadow exits (entry/stop/target/horizon, which the risk engine already produces) |
| Coverage–risk curve | Error or loss rate as a function of the share of decisions acted on | Standard in selective prediction; shows whether stricter gates buy quality |
| Costs avoided | Fees, spread and slippage not paid on skipped trades | Defensible and simple; still label "simulated" |
| Overtrading index | Trades per unit of regime volatility, or per day after N losses | Behavioural, user-specific |
| Stand-down compliance | Share of user-declared stand-down periods with zero trades | The purest "do nothing" success metric |
| Rule-breach rate | Breaches per 100 decisions | The headline Veto outcome metric |

"The AI saved you £X" is a counterfactual and a promotional claim. Show it only as a labelled simulation, with regret (missed winners) given equal prominence [Speculative, consistent with FG24/1 balance] ([CMS](https://cms.law/en/gbr/legal-updates/fca-publishes-finalised-guidance-on-financial-promotions-on-social-media)).

---

## 11. Multi-agent: one strong agent plus rules beats a committee of twelve

Multi-agent gains are task-dependent, small at equal compute, and often negative for sequential reasoning. Huang et al. found that at an equal number of responses, debate significantly underperforms self-consistency with majority voting [Strong] ([arXiv 2310.01798](https://arxiv.org/pdf/2310.01798)). A 2026 equal-compute study found debate ahead by only +1.3 points [Strong] ([arXiv 2605.01566](https://arxiv.org/html/2605.01566)). Google/MIT's sweep of 180–260 configurations found that **every multi-agent variant degraded sequential reasoning by 39–70%**, while centralised coordination improved parallelisable tasks, including financial reasoning, by 80.9% [Strong] ([Google Research](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)). Homogeneous agents conform, and the consensus step can cost accuracy [Strong] ([arXiv 2605.00914](https://arxiv.org/html/2605.00914v1)). No study sweeps 1/3/7/12 agents in trading with costs [Unknown].

| Agents | Evidence | Cost per decision (from README estimates: Scout $0.05–$0.11, DA $0.05–$0.10 at Opus list prices) | Verdict |
|---|---|---|---|
| **1** + deterministic gate | Baseline; framework matters more than model [Strong] | ~$0.05–$0.10 | **Default** |
| **2–3** heterogeneous (different information or model) | Benefit concentrates here; independence beats headcount [Strong for principle] | ~$0.10–$0.30 | Use only where each agent sees different data |
| **7** | No evidence of benefit; conformity and coordination failures (MAST: 14 failure modes, mostly design) [Strong] | ~$0.35–$0.75 | Theatre |
| **12** | None | ~$0.60–$1.20 | Kills unit economics: at 100 checks a month, $60–$120 per user against a ~£29 price |

Cost figures are [Speculative], scaled from the founder's own README estimates (`/home/user/apex-ai/README.md`). Unit economics settle the question independently of the science. At £29 a month with 100 checks, the LLM budget is roughly $0.10 a check for about 30% cost of goods, so the design must be one LLM call plus deterministic checks, with a cheaper model for routine checks [Speculative]. Trading decisions are sequential (state → position → next state), the task class where multi-agent setups degraded most. Use parallel agents only for genuinely parallel work, such as offline research across separate assets [Speculative, from the Google/MIT result]. MAST source: [arXiv 2503.13657](https://arxiv.org/html/2503.13657v2).

---

## 12. Is the adversarial gate a USP? It is a feature, until it argues with your own data

As built, no. An LLM "Devil's Advocate" is role-played dissent. Nemeth's work found role-played devil's advocacy tended to produce "cognitive bolstering" of the original view, while authentic dissent changed minds [Strong, mostly one lab] ([Behavioral Scientist](https://behavioralscientist.org/stop-playing-devils-advocate-and-other-advice-for-better-decision-making/)). LLM sycophancy compounds the problem [Strong] ([arXiv 2509.23055](https://arxiv.org/abs/2509.23055v1)). The deterministic gate is the part with real protective value: Knight Capital lost more than $460M in 45 minutes for lack of pre-trade controls [Verified] ([SEC 2013-222](https://www.sec.gov/news/press-release/2013-222)). But it is trivially copyable. Robinhood has approvals, Composer has a review step, and ChartyTool has a Go/No-Go [Strong/Anecdotal]. Pre-mortems modestly increase identified failure reasons and reduce overconfidence in humans, from a thin literature [Anecdotal/Moderate] ([Jason Collins](https://corporate.jasoncollins.blog/premortem)).

It becomes differentiating only if the challenger is given **different information than the proposer** [Speculative]. In Veto the proposer is the human. The challenger sees only the user's own rules, their rule budget for the day, their timestamped decision history (for example "you have taken this setup 23 times after two losses in a day; 17 lost; −4.1R total"), the regime, liquidity and costs. It is never asked to predict price. That is the closest software gets to "authentic dissent": evidence from the user's own past that the user cannot argue away. It also keeps the product on the user-parameter side of PERG 8.30 rather than generating its own buy/sell signals [Speculative] ([PERG 8.30](https://handbook.fca.org.uk/handbook/PERG/8/30.html)). A cognitive-forcing step, where the user commits a view and a confidence before seeing the challenge, is the one interface intervention with strong evidence for reducing overreliance. Users like it least [Strong] ([Buçinca et al.](https://arxiv.org/pdf/2102.09692)).

---

## 13. Eight concepts, scored and then destroyed

Each dimension is scored 1–5, where **5 is always favourable**: for competition, 5 means least crowded; for regulation, 5 means simplest. All scores are [Speculative].

| # | Concept | Diff | Pain | WTP | Feas | Defens | Viral | Retain | Comp | Reg | Scale | Speed | Market | **Total /60** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | Autonomous real-money AI trading bot (founder's idea a) | 1 | 3 | 3 | 3 | 1 | 4 | 2 | 1 | 1 | 2 | 3 | 4 | **28** |
| B | Real-time shared learning network of bots (founder's idea b) | 3 | 2 | 2 | 1 | 3 | 3 | 3 | 3 | 1 | 3 | 1 | 3 | **28** |
| C | **Veto**: pre-trade check + personal decision ledger for human traders | 3 | 4 | 3 | 5 | 2 | 3 | 3 | 3 | 4 | 4 | 5 | 3 | **42** |
| D | Agent firewall: deterministic policy layer between retail AI agents and broker APIs | 4 | 3 | 2 | 4 | 2 | 3 | 4 | 4 | 2 | 4 | 4 | 2 | **38** |
| E | Verified decision ledger: hash-committed, cost-inclusive track records for AI agents and bot sellers | 4 | 5 | 2 | 4 | 3 | 3 | 3 | 3 | 3 | 4 | 3 | 2 | **39** |
| F | Public AI paper fund as a media/education brand ("the AI that mostly says no") | 3 | 2 | 2 | 5 | 2 | 5 | 2 | 2 | 2 | 3 | 5 | 3 | **36** |
| G | Prediction-market forecasting copilot / calibration trainer | 2 | 3 | 2 | 4 | 1 | 4 | 2 | 2 | 1 | 3 | 4 | 2 | **30** |
| H | Strategy validation lab for AI-generated strategies (leakage tests, DSR, backtest/live parity) | 3 | 4 | 3 | 4 | 2 | 3 | 2 | 3 | 5 | 4 | 4 | 2 | **39** |

### Adversarial destruction

**A, the autonomous bot.** There is no evidence of edge (Section 5). The incumbents are free and hold the execution. Regulation is high to very high everywhere. Retention collapses on the first drawdown. Users lose real money in a black swan like the 10 Oct 2025 cascade, when about $19B was liquidated and BTC top-of-book depth shrank by more than 90% [Strong] ([CoinShares](https://coinshares.com/insights/knowledge/billions-in-liquidations-what-happened/)). Then the founder owns that loss reputationally. **Dead.**

**B, the shared network.** It is dead on arrival through cold start (no users means no network). It carries collaboration and manipulation exposure (UK MAR Art. 12, MiCA 91, MARC from 2027), correlated errors, and poisoning: fake "wins" injected to pump thin tokens, and prompt-injection risk shown by Bankrbot [Speculative, grounded in the cited cases]. **Dead as designed**; it survives only as delayed, aggregated process base rates inside C.

**C, Veto.** Here is the strongest case against it. (1) Friction: traders won't type every trade in before taking it, and journaling already dies from time cost ("nobody does that for more than a few days") [Anecdotal] ([Traders Second Brain](https://traderssecondbrain.com/guides/trading-journal-for-day-trading)). (2) Advisory tools may not change behaviour (Brazil found "no evidence of learning"), and real enforcement needs execution-path access that brings back regulatory risk. (3) TradeZella and TraderSync hold the data and could ship a pre-trade check in a quarter. (4) People pay for hope, not restraint [Speculative]. (5) It is a weekend clone at the prompt level. **It survives because** read-only auto-sync addresses (1), commitment devices plus a measurable breach-rate outcome test (2), a hash-committed ledger and point-in-time personal memory are harder to retrofit onto journals that edit records freely (3), and the cost of a blown prop challenge or account is concrete (4) [all Speculative]. If (2) proves true in validation, C dies.

**D, the agent firewall.** The pain is real (incidents, Robinhood's disclaimers), but the buyers are developers who expect open source. The market is small: 15k Robinhood agentic accounts, US-only [Strong/claim]. Sitting in the order path risks "arranging" or "reception and transmission of orders" [Speculative] ([ESMA Q&A](https://www.esma.europa.eu/print/pdf/node/221381)). Brokers will build their own policy layers. **Wounded:** worth keeping as an open-source side project and developer funnel, not a company.

**E, the verified ledger.** It hits the top pain, but the people who most need verification (scammers) won't buy it, honest sellers are few, and verifying performance edges into approving promotions [Speculative]. **Wounded:** it becomes a *feature* of C (every decision hash-committed) and a credibility layer for F.

**F, the media brand.** Viral potential is high, but monetisation is weak and the finfluencer regime bites: every UK post that induces crypto trading is a promotion [Verified] ([FCA FG24/1](https://fca.org.uk/publications/finalised-guidance/fg24-1-finalised-guidance-financial-promotions-social-media)). **Wounded:** it becomes C's acquisition engine (the "house agent"), framed as decision logs, not returns.

**G, the prediction-market copilot.** The UK is closed for trading. The UK Gambling Commission says current products look like "Betting Intermediary" activity, and Polymarket is close-only or geoblocked for UK users [Strong] ([Sigma](https://sigma.world/news/ukgc-prediction-markets-gambling-regulation/); [Datawallet](https://www.datawallet.com/crypto/polymarket-restricted-countries)). AI forecasting is converging on parity, which commoditises it, and Polymarket itself ships agent skills. **Dead** for a UK founder, except as non-trading calibration training, which has low WTP.

**H, the validation lab.** The pain is real and verified (Freqtrade's AI-strategy filter) and regulation is the simplest of all, but use is episodic, open-source tools can replicate it, and QuantConnect already serves quants. **Wounded but viable as the pivot** if C fails, because it targets the same "claims you can't verify" pain for builders rather than traders.

---

## 14. Opportunity matrix: one viable product, three useful parts, three dead ends

| | **Lower regulatory and execution risk** | **Higher regulatory and execution risk** |
|---|---|---|
| **Higher pain × WTP** | **C Veto (build)**; H Validation lab (pivot option); E Verified ledger (fold into C) | A Autonomous bot (dead) |
| **Lower pain × WTP** | F Media brand (use as acquisition); G Calibration trainer (dead for trading) | B Shared bot network (dead); D Agent firewall (open-source side project) |

The pattern is clear [Speculative]. Value concentrates where the product *judges and records* decisions and never *makes or executes* them. That is also where the founder's existing assets are strongest.

---

## 15. Final product: Veto, a breathalyser for your trades

**Name and concept.** **Veto**: a pre-trade check and personal decision ledger. Before you place a trade, Veto checks it against your rules, your remaining risk budget for the day, and your own verified history of similar decisions. It returns **CLEAR**, **CAUTION** or **STAND DOWN** with the evidence. Afterwards it records the decision, including trades you skipped, and scores your *process* separately from your P&L. It never suggests trades and never places orders.

**Exact customer.** A self-directed, discretionary crypto-spot trader in the UK or another English-speaking market. Two or more years in, 5–50 trades a week on Binance, Coinbase or Kraken, already paying £20–£60 a month for TradingView and/or a journal, and has blown at least one account or challenge through rule breaches, revenge trades or overtrading. Second wedge: prop-firm challengers [Speculative persona, built on Section 6 evidence].

**Core problem.** They know their rules and break them anyway, usually after losses, in chop, or when bored. Their tools either encourage activity (exchanges, bots, signals) or record damage after the fact (journals) [Strong for the loss data, Anecdotal for the mechanism].

**Why current products fail.** Exchanges and bots earn from activity. Journals see only trades taken, reviewed too late, and depend on manual logging. AI agents now *add* autonomy while their providers disclaim decision quality [Strong] ([Finder](https://www.finder.com/investments/ai-trading-agent-liability)). No major product counts skipped trades or publishes calibration [Speculative, from the competitor review].

**Solution.** Read-only auto-sync of fills, plus a 10-second pre-trade check by quick entry (web, mobile PWA or Telegram). The user commits a thesis, stop and confidence; Veto then shows the challenge grounded in their own data, a deterministic rule verdict, a daily "should I trade today?" state, a hash-committed ledger, and weekly post-mortems that separate good process from good outcomes.

**USP in one sentence.** Veto is the only trading tool that checks each trade against *your own* verified mistake history before you place it, and counts the trades you didn't take.

**5-second positioning.** "A breathalyser for your trades."

**Category.** Pre-trade decision assurance, also describable as trading discipline software. It is not an AI trader, not a signal service, not a journal.

**Why users pay and stay.** They pay because one prevented blow-up or one passed challenge outweighs a year of subscription [Speculative]. They stay because the ledger, the personal base rates and the calibration curve get more valuable each month and cannot be rebuilt elsewhere without the timestamped history [Speculative].

**Why it is hard to copy.** The gate is easy to copy; three other things are not. (1) A tamper-evident decision history that includes skips and pre-commitments, which journals don't capture. (2) Point-in-time personal memory with statistical gates, which is a discipline incumbents with activity-based revenue have little incentive to build. (3) A trust brand built on never claiming returns [Speculative].

**Moat over time.** Pooled, anonymised, delayed process base rates. For example: "traders who took a third trade after two losses in a day: n=4,312, mean −0.4R." That is the lawful descendant of the founder's "shared learning network": a data network effect without asset calls or execution [Speculative].

**Why now.** Agentic trading went mainstream in 2026: Robinhood's agent API (May), eToro's AI-first relaunch (July) and MCP connectors (8 Oct), and Robinhood Agents (Sept) [Strong/Verified] ([CNBC](https://www.cnbc.com/2026/05/27/your-ai-agent-can-now-trade-for-you-on-robinhood-and-buy-stuff-with-your-credit-card-too.html)). The FCA and Treasury Committee have flagged agentic finance [Verified] ([UK Parliament](https://committees.parliament.uk/committee/158/treasury-committee/news/213162/bank-of-england-and-fca-commit-to-action-on-ai-following-warnings-from-mps/)). The UK crypto regime goes live on 25 Oct 2027 without regulating advice on unbacked crypto, while reading "arranging" broadly, which makes non-executing decision tools the clear lane [Strong]. Alpha Arena made "AI overtrades" a public fact [Strong].

---

## 16. Product architecture: the LLM only argues; everything that matters is deterministic

| Stage | Veto implementation | Type |
|---|---|---|
| **User** | Trader with stated rules, risk budget, prop-firm template (optional) | Human |
| **Interface** | Web app + PWA quick-check; optional Telegram bot; share-card generator | Deterministic UI |
| **Orchestrator** | Explicit Python state machine per check (no agent framework); APScheduler for syncs and post-mortems | Deterministic |
| **Agents** | Intent Parser, Challenger, Post-Mortem Analyst (Section 17) | LLM, schema-validated |
| **Data** | Read-only fills via CCXT/exchange OAuth; public OHLCV and order books; user rules; the user's own decision ledger | Deterministic |
| **Decision** | **The human** commits thesis, stop, size and confidence *before* seeing the challenge (cognitive forcing) | Human |
| **Risk gate** | Rule engine: user rules + hard limits (daily loss, max trades, cooldown after N losses, R:R floor, exposure), regime filters, liquidity/cost checks → CLEAR / CAUTION / STAND DOWN | **Deterministic; the LLM cannot override it** |
| **Execution / paper** | **User executes at their own broker.** Skipped or vetoed trades go to a shadow tracker on real prices. The house agent runs the existing £10k paper fund | Human / deterministic simulation |
| **Outcome** | Fills matched to decisions; shadow outcomes resolved by pre-set stop/target/horizon | Deterministic |
| **Post-mortem** | Process score (rules followed?), outcome (R), four-quadrant classification, mistake taxonomy tags | Deterministic stats + LLM wording |
| **Memory** | Point-in-time store of decisions, features, tags and outcomes; recency/importance decay | Deterministic retrieval |
| **Future decisions** | Process-error lessons applied immediately; outcome-based rule proposals only after statistical gates and **explicit user approval** | Quant tests + human approval |

There is **no quant prediction model** in the MVP. A regime classifier is the only model-like component, and it is the existing deterministic `features.py` regime logic [Speculative design; existing code verified in `/home/user/apex-ai/README.md`]. Hash-commit each decision record (thesis, confidence, verdict, timestamp) before its outcome exists, to make the ledger tamper-evident [Speculative, consistent with the evidence standard in Section 5].

---

## 17. Agent architecture: three narrow agents, none of which predicts price

| Agent | Responsibility | Inputs it may see | Output schema | Guardrails |
|---|---|---|---|---|
| **Intent Parser** (small/cheap model) | Turn quick-entry text or a screenshot into a structured TradeIntent | User text/image only | instrument, side, entry, stop, target, size, thesis, confidence | Deterministic validation; quantity sanity checks against account size (the Lobstar Wilde lesson); reject on ambiguity |
| **Challenger** (the evolved Devil's Advocate; can be a different model family) | Strongest *evidence-based* case against **this user** taking **this trade now**, as a pre-mortem ("assume this lost; why?") | User rules and rule budget, similar past decisions from the ledger (point-in-time), regime/liquidity/cost features | objections[] with evidence keys, process flags, a "would change my mind" condition | Invented evidence keys stripped (existing code); no price prediction; no new trade ideas; a veto without evidence is downgraded (existing behaviour) |
| **Post-Mortem Analyst** | Explain outcome vs process, tag mistakes from a fixed taxonomy, draft the weekly review | Resolved decisions and stats | quadrant, tags[], narrative | Stats computed deterministically; LLM only words them; sample-size meters mandatory |
| *Retired from the user path:* **Market Intelligence Scout** | Kept only for the house agent's public paper fund | — | — | Idea generation is the regulated (shares) and evidence-free part [Strong] |

The **Lesson Curator** is deterministic code, not an agent. It proposes rule changes when pre-specified tests pass, and the user approves [Speculative design].

---

## 18. Learning system: fast on process, slow on outcomes, never on one loss

There are three loops [Speculative design, grounded in Section 9]. The **process loop** is immediate. Any rule breach, missing stop, oversize or stand-down violation is tagged at once and raises the Challenger's weighting for that pattern from the next decision; no outcome is needed. The **calibration loop** is continuous. Every check stores the user's stated probability that the trade hits target before stop. Brier score and reliability curves are shown with n, and the user's stated confidence is recalibrated on the screen as data accrues (for example "when you say 70%, you hit 52%, n=64"). The **outcome loop** is gated. Setup buckets (defined by user tags plus deterministic features) accumulate shadow and real outcomes. At n≥10 a bucket is "eligible for review"; a rule proposal requires a pre-registered one-sided test, around 60–70 cases for a 15-point win-rate gap, or a dominant cost argument. The user accepts or rejects the proposal, and the ledger records which. Pooled cross-user base rates (opt-in, anonymised, delayed by at least a week, process-level only, no asset-specific calls) come later, once enough users exist. They are the only "shared learning" component and carry none of the real-time-signal risk [Speculative]. Lessons decay with recency and importance, borrowing FinMem's idea, so a regime-specific lesson from 2026 does not dominate 2027 [Speculative] ([FinMem repo](https://github.com/pipiku915/FinMem-LLM-StockTrading)).

---

## 19. MVP: reuse 70% of Adaptive Quant, delete the trading terminal from the hero path

**Screens** (seven):

1. **Connect & Rules**: read-only exchange connection (Coinbase OAuth or read-only keys via CCXT; never trade or withdrawal scopes), CSV import, rule templates (daily loss %, max trades/day, cooldown after N losses, min R:R, max exposure, prop-firm presets).
2. **Today**: the "should I trade today?" state, remaining risk budget, regime, personal danger flags ("2 losses today; your historical next-trade mean is −0.6R, n=31").
3. **Check**: quick entry. The user commits thesis, stop and confidence; then the Challenge card (for/against side by side), the deterministic verdict, and Proceed / Skip / Stand down for the day.
4. **Ledger**: every decision including skips, with hash, timestamps and shadow outcomes.
5. **Weekly Review**: process score, repeat mistakes, calibration chart with n, costs avoided (labelled simulated), regret.
6. **Lessons**: proposed rule changes with sample-size meters and accept/reject.
7. **Share**: process-only cards with embedded risk text.

The public **House Agent** page (the existing paper fund) is the eighth surface, used for acquisition.

| Adaptive Quant component | Fate in Veto |
|---|---|
| `risk.py` deterministic engine | **Reuse** as the per-user Rule Gate; parametrise per user; add cooldowns and stand-down |
| `agents/devils_advocate.py` | **Reuse → Challenger**; swap market-thesis inputs for user-history inputs |
| `memory.py` (no-lookahead similar trades) | **Reuse** for personal similar-decision retrieval |
| `learning.py` + `lesson_min_evidence=10` | **Reuse**, relabel 10 as "eligible for review", add statistical tests |
| `analytics.py` sample-size gating, BTC and SMA baselines | **Reuse** for house agent and weekly review |
| `portfolio.py` / `execution.py` cost model | **Reuse** as shadow tracker for skipped trades |
| `features.py` regime | **Reuse** for "Today" and the Challenger's context |
| `agents/scout.py` | **Remove from user path**; keep for house agent only |
| Binance-style Trade UI, CMC-style portfolio | **Demote** to the house-agent page; a trading terminal signals "trading app" and scam adjacency |
| SQLite (WAL) | **Migrate** to Postgres + pgvector (Supabase) for multi-user |

**Data sources:** Binance and Coinbase public market data (existing), CCXT for read-only user fills across venues, and the CoinGecko Demo tier for metadata. No X or Reddit APIs, because of cost and terms risk [Anecdotal pricing] ([MediaNama](https://www.medianama.com/2026/02/223-x-developer-api-pricing-pay-per-use-model/)).

**Database:** users, rulesets, decisions (hash, pre-commit fields, verdict), fills, shadow_outcomes, tags, lessons, base_rates.

**APIs:** the existing FastAPI app plus auth (Supabase Auth or Clerk) and Stripe Billing [Speculative choice].

**Evaluation:** promptfoo regression suite of about 50 curated "must CAUTION / must STAND DOWN / must CLEAR" cases, plus schema-validity and evidence-key-stripping tests. Langfuse tracing of cost and latency per check. The existing 62 offline tests stay green [Speculative plan; tools verified in [promptfoo](https://github.com/promptfoo/promptfoo) and [Langfuse](https://github.com/langfuse/langfuse)].

---

## 20. UI/UX direction: design for calibration, not "AI thinking" theatre

The HCI evidence is consistent: **explanations alone often fail to reduce overreliance and can increase it, and longer explanations raise confidence without raising accuracy** [Strong] ([Vasconcelos et al.](https://arxiv.org/pdf/2212.06823); [Steyvers et al.](https://arxiv.org/html/2401.13835v2)). Confidence displays help calibrate trust only when the confidence is itself calibrated, and even then joint accuracy may not improve [Strong] ([Zhang, Liao & Bellamy](https://arxiv.org/pdf/2001.02114)). Explanations help when they lower the cost of *verifying* the AI [Strong] ([Vasconcelos et al.](https://arxiv.org/pdf/2212.06823)).

**Useful patterns:**

- commit-first flow (cognitive forcing);
- for and against shown side by side, with the strongest counter-argument always visible;
- evidence chips that link to the actual past decisions in the ledger, so verification is one tap;
- sample-size meters on every statistic;
- a calibration chart with n;
- a "why no trade" log;
- a process score kept visually separate from P&L.

**Gimmicks to cut:** streaming "thinking" text with no verifiable link to the decision; animated agent avatars debating (including a "watch the AI think" replay that is not an audit trail); uncalibrated percentages; decorative decision trees reconstructed after the fact; persona authority ("Buffett agent") [Speculative, from the cited research]. Alpha Arena had a full "ModelChat" reasoning log and commentators still called the systems black boxes [Strong] ([Yahoo Finance/Decrypt](https://finance.yahoo.com/news/ai-crypto-trading-showdown-deepseek-202512124.html)). Narration is not explainability. For tone, a calm, dense, monochrome-plus-one-accent style signals "serious tool" rather than "casino" [Anecdotal, background knowledge]. Users will rate the commit-first step lower than a frictionless flow [Strong] ([Buçinca et al.](https://arxiv.org/pdf/2102.09692)). Make it skippable but tracked, and show users their own accuracy when they skipped it.

---

## 21. Viral product experience: share the trades you didn't take

Product data can generate shareable content at scale. Spotify Wrapped 2025 drew more than 500M shares on day one [Verified] ([TechCrunch](https://techcrunch.com/2025/12/04/spotify-says-wrapped-2025-is-its-biggest-yet-with-200m-users-in-its-first-day)). Veto's auto-generated moments, ordered from lowest to highest FCA risk [Speculative]:

1. **"The trade I didn't take"**: the setup, the Challenger's best objection, the shadow outcome (win or loss, shown either way).
2. **Weekly discipline card**: rule adherence %, stand-downs honoured, calibration hit-rate with n.
3. **House-agent season**: AI paper fund vs BTC buy-and-hold vs SMA bot, all entrants, drawdowns, fixed end date, "simulated" stamped inside the image.
4. **"Trading Wrapped"**: a personal year of patience score, most common mistake, best-kept rule.
5. Personal P&L cards: **not offered**.

Every card carries a verification hash ("decision committed before outcome"), which separates it from faked screenshots, the exact trust gap that Polymarket scam funnels exploit [Speculative] ([Phemex](https://phemex.com/news/article/viral-polymarket-arbitrage-bot-fails-to-deliver-promised-profits-48547)). Under FG24/1 each card must stand alone. Process cards are designed to avoid inducing a crypto trade. Any card showing returns, including simulated ones, should be treated as a potential promotion that needs a risk warning inside the image and legal review [Speculative] ([CMS](https://cms.law/en/gbr/legal-updates/fca-publishes-finalised-guidance-on-financial-promotions-on-social-media)). There are no referral bonuses tied to trading, given the crypto incentive ban [Strong for the ban; Speculative for whether it reaches a software referral] ([Elliptic](https://www.elliptic.co/blog/analysis/fca-introduces-tough-new-rules-for-marketing-cryptoassets)).

---

## 22. Pricing: flat subscription, metered depth, never a cut of profits

| Tier | Price (GBP, inc. VAT, test range) | What's included | Rationale |
|---|---|---|---|
| **Free** | £0 | 1 exchange sync, 10 checks/month, weekly review, house-agent page | Lead magnet; Tradervue and TradesViz set the free-journal norm [Strong] ([Tradervue](https://tradervue.com/blog/best-trading-journal)) |
| **Trial** | 14 days of Core | Full features | Activation requires about 2 weeks of decisions |
| **Entry** | £12–£15/mo | 50 checks, 2 syncs, calibration | Under the TradeZella floor ($29) |
| **Core** | £25–£29/mo (£240–£279/yr) | Unlimited fair-use checks, personal memory, lessons, stand-down mode | Mainstream band £15–£40 [Speculative] |
| **Pro** | £49–£59/mo | Multi-account, prop-firm templates, deep post-mortems (metered), API/agent-firewall mode | Pro above £100 is justified only by execution or data, which Veto doesn't do [Speculative] |

**Subscription vs usage vs performance-linked.** A flat subscription is the most defensible "software vendor" posture. Performance-linked fees tie the firm's pay to outcomes on the user's account, which strengthens the argument that it is managing or acting as agent. They also reward the very risk-taking the product exists to curb [Speculative] ([regulatory synthesis, Freshfields](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/drawing-the-line-navigating-the-fcas-new-cryptoasset-perimeter-guidance-102mvlt)). Metered credits for LLM-heavy deep reviews follow the emerging norm (TraderSync meters coach messages; TradeZella sells credits) and protect margins [Anecdotal] ([TradeZella vs TraderSync](https://www.tradezella.com/vs/tradersync)). Consumer Duty fair-value rules apply only to authorised firms. Behaving as though they apply (clear cancellation, prorated refunds) directly addresses the billing complaints in Section 6 [Speculative].

---

## 23. Acquisition: 10 → 50 → 500 → 1,000 → 10,000+

**First 10** [Speculative throughout]: hand-recruited from the founder's network and trader communities. Concierge onboarding: import their CSV, run a free "rule-breach audit" of their last 90 days (Vibe-Trading's shadow-account idea), and set their rules with them.

**To 50:** the public House Agent page and a "why it didn't trade" decision log posted on a fixed schedule, plus founder-written teardown content ("what Alpha Arena actually proved"). Contrarian honesty is the positioning, set against a category where scam warnings are the backdrop.

**To 500:** the free audit as a lead magnet; process-only share cards (Section 21); integrations people search for ("Binance trade journal", "prop firm rule tracker"); a Telegram quick-check bot. Chat-app distribution is a proven incumbent channel, with eToro Tori on WhatsApp and Telegram [Verified] ([FinTech Global](https://fintech.global/2026/07/08/etoro-unveils-ai-first-app-with-proactive-agent-tori/)).

**To 1,000:** educator and community partnerships, with explicit FG24/1 guardrails. Affiliates who induce crypto investment are in scope, and firms are liable for affiliates they cause to communicate [Strong] ([Bratby Law](https://bratby.law/finfluencer-financial-promotions-section-21-fsma/)). Add the prop-firm wedge via rule templates and comparison SEO, and an open-source "agent firewall" (Concept D) as a developer funnel.

**To 10,000+:** B2B2C. Embed Veto's check and ledger in a journal, broker or exchange that wants a Consumer Duty-friendly "harm reduction" feature, or white-label to trading educators. Whether any broker would pay for a tool that reduces trading activity is **[Unknown]**, and it is the crux of venture-scale ambitions [Speculative].

---

## 24. Retention: the ledger becomes valuable only after about 100 decisions

**Week 1:** the first "catch". Veto flags a repeat pattern from the imported history, and the user skips a trade. The daily "Today" state creates a habit even on no-trade days [Speculative]. **Month 1:** the first weekly reviews separating process from outcome, and a rule-adherence streak. **Month 3:** personal base rates start crossing meaningful sample sizes (about 50–100 decisions for coarse buckets), and the calibration curve becomes personal. **Year 1:** Trading Wrapped, a year of tamper-evident decisions, and accepted lessons that encode the user's own rules [Speculative].

**Is the personal mistake database a switching cost?** Only moderately. UK GDPR data portability means raw records can leave [Speculative; not researched]. What doesn't transfer is the hash chain's credibility, the calibrated model of the user, and the habit. Expect churn triggers to be losing streaks (users blame the tool), quiet markets, nagging ("it always says no"), and feeling judged. Mitigations: tune CAUTION frequency to the user's chosen strictness, celebrate "good process, bad outcome", and pause billing in quiet months [Speculative]. No retention benchmarks exist for journals or bots [Unknown].

---

## 25. Moat: none on day one; three that might compound

The honest position is that Veto has **no moat at launch**. Prompts, the gate and multi-agent structure are copyable in days [Speculative]. Three candidate moats could compound [Speculative]. (1) **Per-user decision histories** with pre-commitments and skips. This data does not exist in any journal, because journals only see executed trades. (2) **Pooled process base rates**, the lawful "shared learning network": opt-in, anonymised, delayed and process-level ("third trade after two losses"), never asset-level and never real-time. This is a genuine data network effect if adoption reaches thousands. (3) **A trust brand** built on hash-committed records and never claiming returns, in a category where the FCA warning list is full of "AI trading bots". The things that are **not** moats: model choice (LiveTradeBench shows leaderboard ability doesn't predict trading), agent count, the Devil's Advocate prompt, the trading-terminal UI, and the house agent's P&L.

---

## 26. Risks: the product fails quietly if nobody changes behaviour

**Technical** [Speculative unless cited]:

- hallucinated or non-specific objections, mitigated by evidence-key stripping (existing) and promptfoo cases;
- prompt injection through text inputs or screenshots; the Bankrbot case shows agent-chaining danger [Anecdotal/Strong] ([Finder](https://www.finder.com/investments/ai-trading-agent-liability));
- look-ahead in memory or embeddings [Strong] ([arXiv 2504.14765](https://arxiv.org/html/2504.14765v2));
- exchange API outages and sync errors, which are a churn driver for journals [Anecdotal];
- key security: never hold trade or withdrawal scopes, given the 3Commas lesson [Verified].

**Financial:**

- LLM cost per check exceeding about 30% of ARPU at Opus pricing;
- low ARPU with high churn;
- exchange data redistribution licensing in a paid product [Unknown].

**Regulatory (UK/EU/US):**

- marketing drift into return claims (s21);
- scope creep into execution (PERG 18 arranging);
- EU personalised crypto views needing a MiCA CASP licence;
- US "AI-washing" enforcement.

Section 27 covers each.

**Commercial:**

- a fast follower (TradeZella, TraderSync, eToro) ships a pre-trade check;
- WTP for restraint proves low;
- prop firms have no incentive to partner (only about 7% of challenge buyers are paid out) [Anecdotal].

**Black swans:** a 10 Oct 2025-style cascade, with about $19B liquidated and top-of-book depth down more than 90% [Strong] ([FTI Consulting](https://fticonsulting.com/insights/articles/crypto-crash-october-2025-leverage-met-liquidity)). Stops fill far through their levels, so Veto's R-based stats and shadow outcomes must model gap fills. Its "Today" state should go to STAND DOWN on liquidity collapse, not just volatility [Speculative].

**Catastrophic autonomous trades:** Veto structurally cannot cause one, because it never executes. That is the point. If the founder ever runs real money in the house agent, the minimum controls from Knight Capital and the 2026 agent incidents apply [Verified for the cases] ([SEC](https://www.sec.gov/news/press-release/2013-222)):

- hard notional and quantity limits outside the LLM;
- allow-listed instruments;
- price-limited orders only;
- order-rate throttles;
- a kill switch;
- trade-only keys with withdrawals disabled;
- staged deployment that retests all code paths;
- real alerts rather than emails.

**The strongest reason it could fail:** advisory checks do not change trader behaviour at the point of temptation. Users ignore CAUTION, stop running checks after a few days, and churn [Speculative, supported by the Brazil "no learning" finding and journaling attrition]. The 30-day plan tests exactly this.

---

## 27. Legal and regulatory summary (research, not legal advice; as of 25 Oct 2026)

**UK cryptoassets.** SI 2026/102 was made on 4 Feb 2026. The FCA's final rules (PS26/9–13) were published on 30 June 2026. The authorisation gateway is open from 30 Sep 2026 to 28 Feb 2027, and the regime goes live on **25 Oct 2027**. **Advising on and managing unbacked "qualifying cryptoassets" were not made regulated activities.** Arranging, dealing, safeguarding and staking were [Verified/Strong] ([Regulation Tomorrow](https://www.regulationtomorrow.com/2026/02/financial-services-and-markets-act-2000-cryptoassets-regulations-2026-published/); [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/drawing-the-line-navigating-the-fcas-new-cryptoasset-perimeter-guidance-102mvlt)). PERG 18 (PS26/18, 16 Sep 2026) says that giving users a way to place orders is likely to be arranging, with no general technical-services exclusion. A narrow Art. 9Z2A exclusion for "merely technical", non-discretionary interfaces is out for consultation in CP26/36 until **18 Nov 2026**, with final guidance expected in early or spring 2027 [Strong] ([FCA CP26/36](https://www.fca.org.uk/publications/consultation-papers/cp26-36-cryptoasset-perimeter-guidance)). MLR registration remains the operating requirement until go-live, aimed at exchanges and custodians [Verified] ([FCA](https://www.fca.org.uk/firms/new-regime-cryptoasset-regulation/registration-under-mlrs-ahead-new-fsma-regime/printable/print)). The retail ban on crypto derivatives remains; crypto ETNs have been retail-accessible since 8 Oct 2025 [Strong] ([FCA](https://www.fca.org.uk/news/press-releases/fca-opens-retail-access-crypto-etns)).

**UK shares, ETFs and CFDs.** Under PERG 8.30, software generating buy/sell/hold signals on particular investments is generally regulated advice, unless the user controls enough of the parameters [Strong] ([PERG 8.30](https://handbook.fca.org.uk/handbook/PERG/8/30.html)). Veto's design, where the user proposes the trade and the checks are the user's own rules, is built around that exception. Whether it qualifies is a question for counsel [Speculative].

**UK promotions.** s21 FSMA applies, with criminal penalties of up to 2 years. Crypto is a Restricted Mass Market Investment (risk warnings, cooling-off, incentive ban). FG24/1 covers influencers and affiliates. HMT proposes repealing the route that let MLR-registered crypto firms approve their own promotions [Verified/Strong] ([FCA FG24/1](https://fca.org.uk/publications/finalised-guidance/fg24-1-finalised-guidance-financial-promotions-social-media); [Regulation Tomorrow](https://www.regulationtomorrow.com/2026/04/hmt-issues-policy-note-and-draft-si-on-amendments-to-the-financial-services-and-markets-act-2000-cryptoassets-regulations-2026/)).

**UK prediction markets.** The Gambling Commission says products look like "Betting Intermediary" activity. Financial event contracts are binary options, banned for retail. Polymarket and Kalshi do not serve UK users [Strong] ([Gambling.com](https://www.gambling.com/uk/news/are-prediction-markets-legal-in-the-uk); [Cointelegraph](https://cointelegraph.com/news/uk-financial-watchdog-prediction-markets-ban)).

**Market abuse.** UK MAR applies now to financial instruments. MiCA Arts. 91–92 apply now in the EU. UK MARC applies to crypto from 25 Oct 2027 [Verified/Strong] (sources in Section 1).

**EU.** The MiCA transition ended on 1 July 2026. Advice on crypto-assets, portfolio management and reception and transmission of orders are all CASP services. Reverse solicitation is narrow. ESMA treats automatic copy trading as portfolio management. The AI Act does not list investment advice as high-risk, and the Annex III obligations were deferred to 2 Dec 2027 [Verified/Strong] ([Elvinger Hoss](https://elvingerhoss.lu/insights/publications/mica-end-transitional-period-1-july-2026); [ESMA](https://www.esma.europa.eu/press-news/esma-news/esma-releases-last-policy-documents-get-ready-mica); [European Parliament](https://data.europarl.europa.eu/distribution/doc/TA-10-2025-0286_en.pdf)). Lowest-risk EU posture: generic, non-personalised content, or geo-block the personalised features [Speculative].

**US.** The Lowe publisher's exclusion covers impersonal, regular publications. Personalised advice or account direction means investment adviser registration. CTA Rule 4.14(a)(9) covers standardised, non-directing software. The PDA conflicts rule was withdrawn in June 2025. AI-washing is enforced: Delphia ($225k) and Global Predictions ($175k). CLARITY had not been enacted as of the latest status found [Verified/Strong] ([Lowe v. SEC](https://case-law.vlex.com/vid/472-u-s-181-604990426); [Paul Hastings](https://www.paulhastings.com/insights/client-alerts/sec-withdraws-14-pending-rule-proposals); [Decrypt](https://decrypt.co/372316/galaxy-slashes-clarity-acts-2026-odds-to-50-as-senate-time-runs-short)).

**App stores.** Execution-facilitating crypto apps risk Apple guideline 3.1.5 [Anecdotal]. Google Play exempts non-custodial wallets [Strong]. Ship as a web app or PWA first [Speculative] ([Google Play Help](https://support.google.com/googleplay/android-developer/answer/16329703)).

Veto sits at the lowest rung of the risk ladder (research/journal tool, user-proposed trades, no execution) [Speculative]. Revisit when final PERG 18 Art. 9Z2A guidance lands, and before 25 Oct 2027.

---

## 28. Build stack: keep the spine, adopt five tools, ignore the agent-framework hype

| Layer | Choice | Status |
|---|---|---|
| LLM calls | Anthropic SDK with structured outputs (existing); a cheaper model for routine checks | **Keep**, production-ready |
| Decision spine | `risk.py`, `memory.py`, `learning.py`, `analytics.py`, FastAPI, APScheduler (existing) | **Keep** |
| Exchange connectivity | CCXT (MIT, 44.6k stars, daily pushes) for read-only fills and market data; keep the browser WebSocket ticker | **Adopt** [Verified repo] ([CCXT](https://github.com/ccxt/ccxt)) |
| Metadata | CoinGecko API (Demo: 10k credits/month, 30 calls/min) | **Adopt** [Verified] ([CoinGecko MCP docs](https://docs.coingecko.com/docs/mcp-server)) |
| DB + auth | Postgres + pgvector via Supabase (or Clerk + Neon); Stripe Billing | **Adopt at multi-user**; buy, don't build |
| Observability/evals | Langfuse (tracing, cost, prompt versions) + promptfoo in CI | **Adopt** |
| Orchestration | Plain Python state machines; LangGraph only if resumable human-approval graphs emerge | LangGraph **experimental** |
| Offline research | Claude Agent SDK nightly research agent; Vibe-Trading MCP as an internal sandbox | **Experimental**, never in the per-decision path |
| Claude Code dev loop | GitHub MCP; CoinGecko MCP for exploration; Alpaca MCP only if US paper equities are tested; custom project skills (e.g. `/postmortem-eval`, `/leakage-check`, `/challenger-regression`) packaged on the anthropics/financial-services plugin pattern | **Adopt** for development only |
| Unnecessary | TradingAgents, ai-hedge-fund, AutoHedge, ElizaOS, NoFx as dependencies; CrewAI/AutoGen/OpenAI Agents SDK; mem0/Letta/Qdrant; FinRL/qlib; X and Reddit APIs; Kaiko/CCData; freqtrade/Nautilus/Hummingbot (no execution) | **Don't** |

Sources: [open-source stack review, GitHub API metrics as listed](https://github.com/langfuse/langfuse); [promptfoo](https://github.com/promptfoo/promptfoo); [pgvector](https://github.com/pgvector/pgvector); [Alpaca MCP](https://github.com/alpacahq/alpaca-mcp-server); [Claude connectors docs](https://claude.com/docs/connectors). MCP belongs in the development loop, not the production runtime. The backend should fetch data deterministically with caching rather than route it through MCP latency and non-determinism [Speculative, from the stack review]. Pricing for Supabase, Clerk, Stripe and Langfuse Cloud was not verified [Unknown].

---

## 29. Success metrics: prove the system is getting better without ever citing P&L

| Level | What it proves | Metrics | Threshold before any claim |
|---|---|---|---|
| **0. Integrity** | The record can be trusted | % of decisions hash-committed pre-outcome; leakage tests pass; pre-registered metric list published | 100%; a public methodology page |
| **1. Process** | Users follow their own rules more | Rule-breach rate per 100 decisions; stand-down compliance; overtrading index; within-user before/after with a staggered-rollout control | Pre-registered effect size; report n and CI |
| **2. Calibration** | Stated confidence means something | Brier, log score, reliability diagram, ECE for users and for the Challenger's flags | ~800 resolved forecasts for a 0.01 Brier claim (assumption-dependent, Section 9) |
| **3. Abstention quality** | Vetoes are better than random | Veto lift vs random-veto baseline; coverage–risk curve; regret | Bootstrapped CI excluding zero |
| **4. Outcomes** (house agent only) | Edge (eventually) | Expectancy in R, max drawdown, vs BTC buy-and-hold and SMA; PSR/Deflated Sharpe; minimum track record length | Never claimed publicly before MinTRL is reached; always labelled simulated |
| **5. Product** | It's a business | Activation (first prevented trade within 7 days), checks/user/week, W4 and M3 retention, free→paid conversion, NPS, LLM cost/check | Pre-registered in the 30-day plan |

All [Speculative] design, using the methods in Sections 5 and 9 ([Bailey & López de Prado](https://papers.ssrn.com/abstract=2460551); [Portfolio Optimizer on MinTRL](https://portfoliooptimizer.io/blog/the-probabilistic-sharpe-ratio-bias-adjustment-confidence-intervals-hypothesis-testing-and-minimum-track-record-length/)). The single most persuasive proof would be a randomised or staggered rollout showing users with the gate active break fewer rules than users without it. That is measurable in weeks, because breaches are frequent and resolve instantly [Speculative].

---

## 30. Adversarial final review: hard questions, then the revision

**Is it actually different?** Partly. The gate is not new (ChartyTool, Composer review steps, Robinhood approvals). What is new is challenging trades with the user's *own* point-in-time history and counting skips in a tamper-evident ledger [Speculative]. The difference is real but narrow.

**Could someone clone it in a weekend?** The prompt, gate and UI, yes. The months of per-user pre-commitment data, the calibration, and a brand that has never made a return claim, no [Speculative]. The clone threat comes from journals with existing data, not hobbyists.

**Is the USP just marketing?** It is marketing if the Challenger's objections are generic. It is not if every objection cites specific past decisions from the ledger. Make "objections without ledger evidence are suppressed" a hard rule, extending the existing evidence-key stripping [Speculative].

**Does multi-agent help?** Not here. One Challenger with different information plus deterministic rules is what the evidence supports, and twelve agents would destroy margins (Section 11) [Strong for the science, Speculative for the cost].

**Does the learning system actually learn?** For process and calibration, demonstrably, within weeks to months. For outcomes, only slowly, and per-user P&L "learning" cannot be proven on commercial timescales (Section 9) [Strong for the limits].

**Why would users trust it?** Because it never asks for trust in a prediction. It shows their own history, timestamps everything before outcomes, and shows its misses (regret) alongside its catches [Speculative]. Surveys show users want AI they can verify (54% verify) [Strong].

**Is the market saturated?** AI trading, yes. Pre-trade decision assurance, no, but the reason may be weak demand [Speculative].

**Is the pain strong enough?** The losses are severe and documented (74–89% of CFD accounts lose; about 70% of prop failures are limit breaches). Whether traders *feel* the problem as "I need a check" rather than "I need a better strategy" is untested [Verified for losses, Unknown for felt need].

**Will they pay?** They pay £15–£60 a month for journals and charts today [Strong]. Paying for restraint is unproven [Unknown].

**Will they stay?** Only if the ledger's value outpaces the annoyance of checks. The month-3 base-rate threshold is the retention cliff [Speculative].

**Is it a defensible company?** As a niche SaaS, plausibly. As a venture-scale company, only with B2B2C distribution or the pooled base-rate network effect, both unproven [Speculative].

**What happens when users lose money?** Veto made no prediction, so the ledger shows whether the loss was good process (a rule-compliant trade that lost) or bad process. That turns losing weeks into the product's most valuable moments rather than its churn trigger [Speculative]. Users will still blame the tool on bad weeks.

**What happens in a black swan?** Veto goes to STAND DOWN on a liquidity collapse, models gap-through stops in shadow outcomes, and cannot liquidate anyone, because it holds no execution [Speculative].

**What prevents catastrophic trades?** No execution, no trade or withdrawal scopes, deterministic quantity sanity checks on parsed intents, and an LLM with no authority [Speculative].

**What is the strongest reason it could fail?** Behaviour doesn't change at the moment of temptation, and users stop running checks [Speculative].

**Revision after review.** Three changes. (1) **Lead with automatic, zero-friction value** (read-only sync, the daily "Today" state, weekly process review) and treat the manual pre-trade check as the power feature, not the onboarding requirement. (2) **Add opt-in commitment devices that stop short of execution**: a self-imposed stand-down with an accountability partner or public pledge, prompts to enable the broker's or exchange's own native loss limits, and a "cool-off timer" before a check can return CLEAR after two losses. These test enforcement without entering the order path; any real lockout via exchange APIs waits for Art. 9Z2A clarity and legal advice. (3) **Make the prop-firm wedge a parallel landing-page test from day one**, since its pain is the most measurable. If validation shows advisory checks don't reduce breaches, pivot to Concept H (validation lab for AI-generated strategies) or E/D as B2B infrastructure for the agentic-broker wave, all of which reuse the same deterministic spine [Speculative].

---

## 31. 30-day execution plan

| Days | Product and engineering | Customer and market | Legal and ops | Exit gate |
|---|---|---|---|---|
| **1–7** | Freeze real-money execution and network work. Hash-commit every house-agent decision. Shadow-track NO TRADE decisions on real prices. Deploy the house agent live per GO_LIVE.md with process-only framing. | 15 interviews (10 crypto-spot active traders, 5 prop challengers): last blow-up, current stack, would they run a pre-trade check? Two landing pages (crypto, prop) with price anchors £15/£29, waitlist and a "free 90-day rule-breach audit" CTA. | Book a UK regulatory lawyer: PERG 8.30 user-parameter design, PERG 18 / Art. 9Z2A (consultation closes 18 Nov 2026), FG24/1 review of card formats. | ≥8 of 15 interviewees describe a rule-breach blow-up in the last 6 months |
| **8–14** | Supabase Postgres + auth. Per-user ruleset model on `risk.py`. CCXT read-only sync (Binance, Coinbase, Kraken) + CSV import. Intent Parser + Challenger (refactored DA, user-history inputs only). Langfuse tracing. | Run 5 manual "rule-breach audits" on volunteers' CSVs; record which findings surprise them. | Draft ToS, privacy notice, risk wording; no return claims anywhere. | Audits produce ≥3 "I didn't know that" moments |
| **15–21** | Ledger, Today, Check, Weekly Review, Lessons screens. Forecast elicitation + Brier. Mistake taxonomy. Process-only share card with embedded warning and hash. promptfoo suite (≥50 must-CLEAR/CAUTION/STAND-DOWN cases). Relabel `lesson_min_evidence` as "eligible for review". | Concierge-onboard the first 10 users. Daily check-ins. | Lawyer review of the share-card templates and landing copy. | 10 activated users (≥1 sync + ≥3 checks) |
| **22–30** | Stripe test (Entry/Core). Cost-per-check dashboard. Cooldown timer and voluntary stand-down pledge. Fix top 5 friction points. | Grow to 25–40 users from waitlists and the house-agent page. Measure checks/user/week, CAUTION override rate, self-reported prevented trades, breach rate before/after. | Log every marketing post against an FG24/1 checklist. | **Pre-registered go/no-go on Day 30** (below) |

**Pre-registered Day-30 criteria** [Speculative thresholds, set by the founder before seeing data]. Continue if: at least 40% of activated users run 3 or more checks a week in their second week; at least 30% report one or more prevented trades; at least 5 users pay; the median LLM cost per check is below $0.10; and within-user breach rate falls in weeks 2–3 versus each user's imported baseline. Fail two or more of these and pivot to Concept H. Fail all five and stop building trading tools.

---

## Conclusion

The research changes the founder's question. The useful frontier is no longer "can an AI trade better than a human". The evidence says not reliably: incumbents now give away AI agents that trade, and their providers disclaim the results. The open question is who is accountable for the quality of a decision before it happens. Brokers have walked away from that role on purpose, because their revenue rises with activity. A product that is paid to *reduce* bad activity, proves it with records that cannot be edited after the fact, and learns fast only from what can be learned fast (process errors, calibration) occupies a position the incumbents are structurally unwilling to take. That position is real but unproven commercially.

Adaptive Quant's best ideas were never the agents. They were the deterministic gate the LLM cannot override, "NO TRADE" as a first-class outcome, and the refusal to trust small samples. Pointing those at the human trader's decisions turns them from an unprovable claim about AI skill into a measurable claim about behaviour change, one that can be confirmed or killed in 30 days. If it is killed, the same spine serves the next best opportunity: verification and evaluation infrastructure for the flood of retail AI agents, which need an honest "no" even more than human traders do.

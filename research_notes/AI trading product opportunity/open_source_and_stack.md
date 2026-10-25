# Open-source AI trading projects and build stack (as of 2026-10-25)

Method note: GitHub numbers (stars, forks, open issues, last push, licence, archived flag) were pulled on 2026-10-25 from the GitHub search API for each repo and are **Verified** at that date. GitHub's `open_issues_count` **includes open pull requests**, so it overstates real issues. Contributor counts, commit frequency and specific unresolved issues could **not** be pulled: direct `gh api repos/...` calls were blocked in this session (HTTP 403, "GitHub access to this repository is not enabled"). Those gaps are listed per section. Facts marked "(prior knowledge)" come from the researcher's training data (cutoff June 2026). They are labelled **Strong evidence** but were not re-fetched in this session.

Evidence labels: **Verified** (checked against a primary source today), **Strong evidence** (primary source but older, or several consistent secondary sources), **Anecdotal** (one secondary source or a blog), **Speculative** (inference), **Unknown**.

## 1. Open-source AI and agentic trading projects: foundation or demo?

### Takeaway
None of the LLM trading agent repos is a production execution foundation. All of them simulate execution or call themselves research or education only, whatever their star counts (TradingAgents ~114k, ai-hedge-fund ~64k, Vibe-Trading ~37k). Their reusable value is prompt and role patterns, point-in-time data hygiene and decision logging. They are not something to build on as a runtime dependency. The most reusable ideas are TradingAgents' point-in-time data contracts and "settle past decisions, then reflect" memory loop, and FinMem's layered memory. The existing app already has its own versions of both.

### Cited Findings

**Repo metrics snapshot (Verified, GitHub API, 2026-10-25)**

| Repo | Stars | Forks | Open issues+PRs | Last push | Licence | Created |
|---|---|---|---|---|---|---|
| [TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents) | 113,860 | 22,055 | 123 | 2026-10-16 | Apache-2.0 | 2024-12-28 |
| [virattt/ai-hedge-fund](https://github.com/virattt/ai-hedge-fund) | 64,239 | 11,269 | 183 | 2026-10-24 | MIT | 2024-11-29 |
| [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | 36,613 | 5,914 | 22 | 2026-10-25 | MIT | 2026-04-01 |
| [Fincept-Corporation/FinceptTerminal](https://github.com/Fincept-Corporation/FinceptTerminal) | 33,073 | 4,712 | 15 | 2026-10-13 | NOASSERTION (custom; see Gaps) | 2024-08-29 |
| [AI4Finance-Foundation/FinGPT](https://github.com/AI4Finance-Foundation/FinGPT) | 21,465 | 3,037 | 55 | 2026-09-23 | MIT | 2023-02-11 |
| [elizaOS/eliza](https://github.com/elizaOS/eliza) | 19,650 | 5,823 | 360 | 2026-10-25 | MIT | 2024-07-09 |
| [AI4Finance-Foundation/FinRL](https://github.com/AI4Finance-Foundation/FinRL) | 16,809 | 3,585 | 312 | 2026-10-23 | MIT | 2020-07-26 |
| [NoFxAiOS/nofx](https://github.com/NoFxAiOS/nofx) (discovered) | 13,148 | 3,064 | 514 | updated 2026-10-25 | not retrieved | 2025-10-28 |
| [AI4Finance-Foundation/FinRobot](https://github.com/AI4Finance-Foundation/FinRobot) | 8,303 | 1,399 | 77 | 2026-10-24 | Apache-2.0 | 2024-02-27 |
| [The-Swarm-Corporation/AutoHedge](https://github.com/The-Swarm-Corporation/AutoHedge) | 6,521 | 952 | 27 | **2026-05-11** | MIT | 2024-12-10 |
| [AI4Finance-Foundation/FinRL-Trading](https://github.com/AI4Finance-Foundation/FinRL-Trading) (FinRL-X) | 3,854 | 1,125 | 53 | 2026-09-18 | Apache-2.0 | 2020-07-26 |
| [Polymarket/agents](https://github.com/Polymarket/agents) | 3,803 | 826 | 44 | — | — | 2024-07-03, **archived** |
| [TradeMaster-NTU/TradeMaster](https://github.com/TradeMaster-NTU/TradeMaster) (discovered) | 3,110 | 566 | 28 | updated 2026-10-25 | not retrieved | 2022-08-23 |
| [chrisworsey55/atlas-gic](https://github.com/chrisworsey55/atlas-gic) (discovered) | 2,331 | 419 | 4 | updated 2026-10-25 | not retrieved | 2026-03-11 |
| [AI4Finance-Foundation/FinRL-Meta](https://github.com/AI4Finance-Foundation/FinRL-Meta) | 1,953 | 749 | 80 | updated 2026-10-25 | not retrieved | 2021-02-16 |
| [pipiku915/FinMem-LLM-StockTrading](https://github.com/pipiku915/FinMem-LLM-StockTrading) | 966 | 195 | 8 | **2024-08-18** | MIT | 2023-12-01 |
| [Open-Finance-Lab/AgenticTrading](https://github.com/Open-Finance-Lab/AgenticTrading) (discovered) | 785 | 160 | 128 | updated 2026-10-24 | not retrieved | 2025-05-21 |
| [moss-site/moss-trade-bot-skills](https://github.com/moss-site/moss-trade-bot-skills) (discovered, Hyperliquid) | 390 | 35 | 2 | updated 2026-10-24 | not retrieved | 2026-04-15 |
| [effective-p/FinAgent](https://github.com/effective-p/FinAgent) | 4 | 0 | 0 | updated 2026-08-18 | not retrieved | 2026-05-06 |
| [microsoft/qlib](https://github.com/microsoft/qlib) (adjacent: ML quant platform) | 49,685 | 7,846 | 506 | updated 2026-10-25 | not retrieved | 2020-08-14 |

("updated" means GitHub `updated_at`, which also changes when someone stars the repo, so it is a weaker signal of activity than `pushed_at`.)

**TradingAgents (TauricResearch)**
- Architecture: analyst team (fundamentals, sentiment, news, technical) working in parallel, then bull and bear researchers debate, then a trader decides timing and size, then risk reviewers and a Portfolio Manager approve or reject — **Verified** — [README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md)
- Models: OpenAI, Google, Anthropic, xAI, DeepSeek, Qwen, GLM, MiniMax, OpenRouter, Mistral, Kimi, Groq, NVIDIA NIM, Ollama, Azure OpenAI, Bedrock, and any OpenAI-compatible endpoint — **Verified** — [README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md)
- Data: SEC EDGAR dated by filing date ("so past runs don't see later figures or restatements"), Yahoo Finance, FRED, Alpha Vantage, Polymarket, StockTwits and Reddit — **Verified** — [README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md)
- Memory and learning: each run appends to a decision log. Later runs "settle" decisions whose holding period has ended: they compute realized return and alpha against a benchmark and write a one-paragraph reflection, which the Portfolio Manager reads. Opt-in LangGraph checkpoint resume is available — **Verified** — [README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md)
- Backtesting: `run_backtest` runs over a grid of tickers and dates, scored by realized alpha, with entry at the first close after each decision and its own memory log — **Verified** — [README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md)
- Execution: approved orders go to "the simulated exchange". There is no live brokerage. The README says it is "designed for research purposes" and "not intended as financial, investment, or trading advice" — **Verified** — [README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md)
- Release cadence is fast: v0.2.0 (Feb 2026, multi-provider), v0.2.4 (Apr 2026, structured outputs, SQLite decision log, Docker), v0.3.1 (Jul 2026, fixed an Alpha Vantage look-ahead filter that let future-dated reports into historical runs), v0.4.0 (point-in-time FRED pinning), v0.5.2 (Sep 2026, backtests see only data published by the analysis date), v0.6.0 and v0.7.0 (Oct 2026) — **Verified** for v0.5.2 to v0.7.0 ([README news](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md)). **Anecdotal** for earlier versions ([apidog](https://apidog.com/de/blog/tradingagents-multi-agent-llm-trading/), [dev.co](https://dev.co/ai/frameworks/tradingagents), [newreleases.io](https://newreleases.io/project/github/TauricResearch/TradingAgents/release/v0.4.0))
- Repeated look-ahead fixes as late as v0.3 to v0.5 show that earlier published backtests from this framework were contaminated by future data — **Strong evidence** (inferred from the changelog items above)

**virattt/ai-hedge-fund**
- "Investor agents" with Anthropic, OpenAI, DeepSeek, Google, xAI and Kimi models. Data comes from the paid Financial Datasets API (prices, fundamentals, earnings) — **Verified** — [README](https://raw.githubusercontent.com/virattt/ai-hedge-fund/main/README.md)
- Backtester replays a fund against a benchmark. Paper mode uses simulated funds with an approval step. README: "the system does not actually make any trades"; "for educational and research purposes only" — **Verified** — [README](https://raw.githubusercontent.com/virattt/ai-hedge-fund/main/README.md)
- The persona agents (Buffett, Munger and others) plus risk manager and portfolio manager design comes from earlier versions. The current README did not list them — **Strong evidence (prior knowledge)** — [repo](https://github.com/virattt/ai-hedge-fund)

**HKUDS/Vibe-Trading**
- Created 2026-04-01 and already 36.6k stars: fastest growth in this group — **Verified** — [repo](https://github.com/HKUDS/Vibe-Trading)
- FastAPI and React, MCP-compatible. Staged plan → ground → execute → validate → deliver workflow. "Swarm" presets (investment committee, quant desk). Generates strategy code and runs a vectorised backtest with charts and a report. Optional live execution through authorized brokers. "Shadow Accounts" infer rules from a broker journal and backtest them — **Anecdotal** — [jimmysong landscape](https://landscape.jimmysong.io/projects/vibe-trading/), [dev.to (Claude Code drives it via MCP)](https://dev.to/creeta/claude-code-can-drive-a-quant-backtester-via-vibe-trading-mcp-3701), [aiidelist](https://aiidelist.com/blog/vibe-trading-ai-quant-research-agent.md)
- Claims of "90 finance skills, 462 alphas, 11 backtesting engines, 18 broker connectors, 74 MCP tools" come from one blog's reading of the docs — **Anecdotal** — [aiidelist](https://aiidelist.com/blog/vibe-trading-ai-quant-research-agent.md)
- Docker Hub listing warns that an X account, token contract and memecoin are not official Vibe-Trading assets (scam risk) — **Anecdotal** — [Docker Hub](https://hub.docker.com/r/birdxs/vibe-trading)

**FinRL / FinRL-X / FinRL-Meta / FinGPT / FinRobot (AI4Finance Foundation)**
- FinRL (deep RL for trading) is active (pushed 2026-10-23) but has 312 open issues+PRs. FinRL-X ("AI-Native Modular Infrastructure for Quantitative Trading") lives in the renamed FinRL-Trading repo, last pushed 2026-09-18 — **Verified** — [FinRL](https://github.com/AI4Finance-Foundation/FinRL), [FinRL-Trading](https://github.com/AI4Finance-Foundation/FinRL-Trading)
- FinGPT is fine-tuned financial LLMs (LoRA on open models) for sentiment and other tasks. Last pushed 2026-09-23 — **Verified (metrics)**; **Strong evidence (prior knowledge, purpose)** — [FinGPT](https://github.com/AI4Finance-Foundation/FinGPT)
- FinRobot is an agent platform for financial analysis (report writing, equity research) built on AutoGen-style multi-agent patterns, pushed 2026-10-24 — **Verified (metrics)**; **Strong evidence (prior knowledge, architecture)** — [FinRobot](https://github.com/AI4Finance-Foundation/FinRobot)

**FinMem and FinAgent (academic)**
- FinMem: layered memory (short, mid and long term with decay) plus character profiling for an LLM stock agent. The repo was last pushed 2024-08-18 and is dormant — **Verified (metrics)**; **Strong evidence (prior knowledge, design; arXiv 2311.13743)** — [repo](https://github.com/pipiku915/FinMem-LLM-StockTrading)
- FinAgent ("A Multimodal Foundation Agent for Financial Trading: Tool-Augmented, Diversified, and Generalist", arXiv 2402.18485, KDD 2024): the only GitHub match is a 4-star repo created 2026-05-06, so no maintained official implementation was found — **Verified (search result)** — [effective-p/FinAgent](https://github.com/effective-p/FinAgent)

**Fincept Terminal**
- An open "Bloomberg-like" terminal app (analytics and data), not an agent framework. 33k stars, pushed 2026-10-13, licence reported as NOASSERTION — **Verified** — [repo](https://github.com/Fincept-Corporation/FinceptTerminal)

**ElizaOS and Hyperliquid agents**
- elizaOS/eliza calls itself an "agentic operating system". It has 360 open issues+PRs and is pushed daily. Trading capability comes from plugins (crypto and DeFi), not the core — **Verified (metrics)**; **Strong evidence (prior knowledge, plugin model)** — [repo](https://github.com/elizaOS/eliza)
- The Hyperliquid official Python SDK has 1,862 stars and 112 open issues+PRs. No Hyperliquid LLM agent with more than 150 stars appeared besides moss-trade-bot-skills (390 stars, "simulated Hyperliquid perpetuals") — **Verified** — [hyperliquid-python-sdk](https://github.com/hyperliquid-dex/hyperliquid-python-sdk), [moss-trade-bot-skills](https://github.com/moss-site/moss-trade-bot-skills)
- NoFx is a Go "AI trading terminal" with Binance and Hyperliquid perp-DEX support and x402 topics. Created 2025-10-28, it has 13.1k stars but 514 open issues+PRs, a high backlog — **Verified** — [repo](https://github.com/NoFxAiOS/nofx)

**AutoHedge**
- "Build your autonomous hedge fund in minutes" (Swarms framework). Last push 2026-05-11, so it has been quiet for 5+ months — **Verified** — [repo](https://github.com/The-Swarm-Corporation/AutoHedge)

**Polymarket/agents**
- The official Polymarket agent repo is **archived** (read-only) — **Verified** — [repo](https://github.com/Polymarket/agents)

**Real-money evidence on LLM trading (Alpha Arena, nof1)**
- Season 1 (Oct to Nov 2025): six frontier models each got $10k of real capital on crypto perps. Qwen3-Max finished first (~+22%) and DeepSeek second. Most models lost money. Reported losses: Grok 4 −45.3%, Gemini 2.5 Pro −56.7%, GPT-5 −62.7%. nof1 warned the short duration and lack of statistical controls make it no definitive ranking — **Anecdotal** (secondary coverage, figures differ between outlets) — [Forklog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/), [Decrypt](https://decrypt.co/345006/ai-crypto-trading-showdown-deepseek-grok-winning-gemini-implodes)

### Inferences
- **Foundation or demo verdicts (Speculative to Strong, based on the evidence above):**
  - TradingAgents: a research reference, not a foundation. Good patterns: role debate, point-in-time data, decision settling and reflection. It has no live execution, a heavy LangGraph and multi-provider surface, and changes at weekly cadence, so it is a poor runtime dependency. Read it and borrow patterns; do not vendor it.
  - ai-hedge-fund: an educational demo with persona prompts. It depends on a paid equities data API and does no crypto execution.
  - Vibe-Trading: the most capable "research agent" demo, and it can be driven over MCP from Claude Code. It is useful as an internal research tool or for inspiration. It is too new (7 months) and too broad to build a product on.
  - FinRL, FinRL-X and TradeMaster: RL research. Of little relevance to an LLM decision product with a deterministic risk engine.
  - FinGPT: only relevant if you need a cheap self-hosted sentiment model. Claude already covers this.
  - FinMem and FinAgent: paper artifacts. FinMem's memory-decay idea is worth borrowing; the code is not.
  - FinRobot: equity-research report agents. Interesting but unnecessary.
  - ElizaOS, NoFx, AutoHedge and Hyperliquid bots: crypto-twitter-adjacent agent shells with large issue backlogs or stalled pushes. Not foundations.
  - Fincept Terminal: a UI/terminal product and potential competitor or inspiration, not a dependency.
- The star-to-maturity mismatch is extreme: Vibe-Trading reached 36k stars in 7 months, but stars track hype, not production use.
- Alpha Arena results suggest that frontier LLMs acting as autonomous traders mostly lose money. That supports the existing app's design: the LLM proposes and investigates, and a deterministic engine gates.

### Gaps
- Contributor counts, commits per week, and named unresolved issues for every repo: blocked by the GitHub API permission error in this session. Recommend a quick `gh api repos/{r}/contributors?per_page=1` (Link header) and `stats/commit_activity` pass from an unrestricted machine.
- Fincept Terminal's exact licence (GitHub reports NOASSERTION). The researcher believes it is AGPL-3.0 with a commercial option, but this was not verified.
- NoFx, atlas-gic, AgenticTrading and TradeMaster licences were not retrieved.
- No official FinAgent code repo was located.
- ElizaOS's current trading plugin names and maintenance status were not verified.
- No Alpha Arena Season 2 results, or primary nof1 leaderboard, were fetched.

## 2. Traditional trading engines worth building on

### Takeaway
Freqtrade (crypto, GPL-3.0), NautilusTrader (multi-asset, Rust core, LGPL-3.0), Hummingbot (market making, Apache-2.0), LEAN (multi-asset, Apache-2.0) and CCXT (exchange connectivity, MIT) are all mature and actively pushed in October 2026. Backtrader is dormant (no push since August 2024). Vectorbt's open-source version is maintained but has a non-standard licence. For a crypto decision product, CCXT is the only one worth adopting now, to replace hand-rolled exchange adapters. Freqtrade or NautilusTrader become relevant only if the product moves to live automated execution, and freqtrade's GPL licence matters if you ship it.

### Cited Findings

| Repo | Stars | Forks | Open issues+PRs | Last push | Licence | Since |
|---|---|---|---|---|---|---|
| [freqtrade/freqtrade](https://github.com/freqtrade/freqtrade) | 55,908 | 11,565 | 26 | 2026-10-25 | GPL-3.0 | 2017 |
| [ccxt/ccxt](https://github.com/ccxt/ccxt) | 44,565 | 8,923 | 701 | 2026-10-25 | MIT | 2017 |
| [nautechsystems/nautilus_trader](https://github.com/nautechsystems/nautilus_trader) | 30,782 | 4,148 | 139 | 2026-10-25 | LGPL-3.0 | 2018 |
| [mementum/backtrader](https://github.com/mementum/backtrader) | 23,567 | 5,310 | 64 | **2024-08-19** | GPL-3.0 | 2015 |
| [QuantConnect/Lean](https://github.com/QuantConnect/Lean) | 22,212 | 5,342 | 286 | 2026-10-23 | Apache-2.0 | 2014 |
| [hummingbot/hummingbot](https://github.com/hummingbot/hummingbot) | 20,692 | 5,049 | 180 | 2026-10-20 | Apache-2.0 | 2019 |
| [polakowo/vectorbt](https://github.com/polakowo/vectorbt) | 9,525 | 1,228 | 133 | 2026-10-23 | NOASSERTION | 2017 |
| [kernc/backtesting.py](https://github.com/kernc/backtesting.py) | 9,129 | 1,565 | 102 | updated 2026-10-25 | not retrieved | 2019 |
| [jesse-ai/jesse](https://github.com/jesse-ai/jesse) | 8,700 | 1,269 | 12 | 2026-10-22 | MIT | 2018 |
| [freqtrade/freqtrade-strategies](https://github.com/freqtrade/freqtrade-strategies) | 5,590 | 1,453 | 12 | updated 2026-10-25 | — | 2018 |

All rows: **Verified**, GitHub API, 2026-10-25.

- CCXT describes itself as "a unified trading API with more than 100 crypto exchanges and prediction markets" — **Verified** — [repo](https://github.com/ccxt/ccxt)
- NautilusTrader describes itself as a "production-grade Rust-native trading engine with deterministic event-driven architecture" — **Verified** — [repo](https://github.com/nautechsystems/nautilus_trader)
- Freqtrade includes backtesting, hyperopt, dry-run (paper) mode, Telegram and web UI control, and FreqAI (ML-based adaptive strategies), built on CCXT — **Strong evidence (prior knowledge)** — [repo](https://github.com/freqtrade/freqtrade)
- Hummingbot targets market making and arbitrage, with CEX and DEX connectors and a Hummingbot API/Dashboard. Its official MCP server repo `hummingbot/mcp` is now **archived** (59 stars) — **Verified (archived flag)** — [hummingbot/mcp](https://github.com/hummingbot/mcp)
- LEAN is a C# engine with Python strategies, multi-asset, and powers QuantConnect cloud — **Strong evidence (prior knowledge)** — [repo](https://github.com/QuantConnect/Lean)
- Vectorbt's open-source licence is Apache-2.0 with a Commons Clause (no selling the software itself). Active development of new features moved to the paid VectorBT PRO — **Strong evidence (prior knowledge)**; GitHub reports NOASSERTION — [repo](https://github.com/polakowo/vectorbt)
- The official exchange SDKs are maintained: binance-connector-python (2,955 stars, updated 2026-10-23), coinbase-advanced-py (364 stars, updated 2026-10-22), alpaca-py (1,568 stars) — **Verified** — [binance](https://github.com/binance/binance-connector-python), [coinbase](https://github.com/coinbase/coinbase-advanced-py), [alpaca-py](https://github.com/alpacahq/alpaca-py)
- The existing app calls Coinbase and Binance public endpoints directly with `requests` (`api.exchange.coinbase.com`, `data-api.binance.vision`) and frankfurter for FX. It is paper only with no exchange keys — **Verified** — [/home/user/apex-ai/README.md](file:///home/user/apex-ai/README.md), [/home/user/apex-ai/requirements.txt](file:///home/user/apex-ai/requirements.txt)

### Inferences
- **CCXT: adopt (Strong).** It replaces bespoke Binance and Coinbase adapters, adds about 100 venues, and normalises OHLCV, order book and trades data. It is MIT-licensed. The 701 open issues+PRs reflect a huge surface area, not abandonment. Keep the direct public REST and WebSocket code for the browser live ticker if latency matters.
- **Freqtrade: don't embed now (Speculative).** It is the most mature crypto bot, but GPL-3.0 means distributing a modified version obliges you to open-source it. That probably doesn't apply to hosted SaaS use, but get legal review. Consider it as an optional "export strategy to freqtrade" target, or as a dry-run benchmark.
- **NautilusTrader: experimental option for a future live-execution layer (Speculative).** It has the strongest engineering (deterministic, event-driven, backtest and live parity), but a steep learning curve. Not needed for a decision or paper product.
- **Hummingbot: unnecessary** unless market making becomes a goal.
- **LEAN/QuantConnect: unnecessary** for a crypto-first Python app. It is a heavy C# runtime.
- **Backtrader: avoid** (dormant). **Jesse: niche** (MIT, small team, low backlog).
- **Vectorbt or backtesting.py: optional** for fast parameter research. Check licence terms before shipping vectorbt in a commercial product.
- The existing app's custom deterministic risk engine and paper ledger should be kept. None of these engines enforces an LLM-gating policy, which is the product's differentiator.

### Gaps
- Contributor counts and release cadence (for example freqtrade's monthly releases, Nautilus's frequent releases) were not fetched.
- The vectorbt and backtesting.py licence texts were not re-verified this session.
- Whether GPL obligations apply to the planned deployment model needs legal review.

## 3. Claude Code skills and plugins, and MCP servers for finance, crypto and market data

### Takeaway
Anthropic's official `anthropics/financial-services` repo (40.8k stars, Apache-2.0, created February 2026) is real and well maintained, but it targets banking, equity research, PE and fund admin with paid institutional data (FactSet, S&P, LSEG, Morningstar and others). It explicitly does not make investment recommendations or execute trades, so it is mostly irrelevant to a crypto decision product, apart from its plugin and skill packaging patterns. The useful MCPs for a crypto product are CoinGecko's official remote MCP (production-ready, keyless free tier) and Alpaca's official MCP (paper and live, US equities, options, crypto). The CCXT MCPs are tiny community projects.

### Cited Findings
- `anthropics/financial-services`: 40,769 stars, 5,691 forks, 235 open issues+PRs, created 2026-02-23 — **Verified** — [GitHub search](https://github.com/anthropics/financial-services)
- Contents: 10 agents (Pitch, Meeting Prep, Market Researcher, Earnings Reviewer, Model Builder, Valuation Reviewer, GL Reconciler, Month-End Closer, Statement Auditor, KYC Screener). Vertical plugins: financial-analysis, investment-banking, equity-research, private-equity, fund-admin, operations, financial-advisors, plus partner-built plugins from LSEG and S&P Global. Twelve MCP connectors: Daloopa, Morningstar, S&P Global, FactSet, Moody's, MT Newswires, Aiera, LSEG, PitchBook, Chronograph, Egnyte, Box. Most require a provider subscription. Installed in Claude Code with `claude plugin marketplace add anthropics/financial-services`. Quote: agents "do not make investment recommendations, execute transactions, bind risk, post to a ledger" — **Verified** — [README](https://raw.githubusercontent.com/anthropics/financial-services/main/README.md)
- `anthropics/claude-for-financial-advisors` is a Cowork plugin created 2026-09-14 (114 stars) — **Verified** — [repo](https://github.com/anthropics/claude-for-financial-advisors)
- Anthropic's connector model: most partners ship a remote MCP server plus a plugin wrapping it with skills. Local MCP servers must be packaged as MCPB or bundled in a plugin `.mcp.json` — **Verified** — [Claude connectors docs](https://claude.com/docs/connectors)
- CoinGecko official MCP: keyless public remote at `https://mcp.api.coingecko.com/mcp` with shared rate limits, an authenticated remote at `https://mcp.pro-api.coingecko.com/mcp`, and a local `@coingecko/coingecko-mcp` package. Demo plan: 30 calls/min, 10,000 credits/month, 1 year of history, limited tools. Pro: from 500 calls/min and 500k credits/month, history from 2013. Each MCP tool call consumes API credits — **Verified** — [CoinGecko MCP docs](https://docs.coingecko.com/docs/mcp-server)
- Alpaca official MCP server: 1,041 stars, pushed 2026-10-23, MIT. It trades stocks, ETFs, crypto and options — **Verified** — [repo](https://github.com/alpacahq/alpaca-mcp-server)
- financial-datasets/mcp-server: 2,312 stars, but last pushed 2025-06-05 (stale). Wraps the paid Financial Datasets equities API — **Verified** — [repo](https://github.com/financial-datasets/mcp-server)
- lazy-dinosaur/ccxt-mcp: 95 stars, last push 2026-04-23. hummingbot/mcp is archived — **Verified** — [ccxt-mcp](https://github.com/lazy-dinosaur/ccxt-mcp), [hummingbot/mcp](https://github.com/hummingbot/mcp)
- Vibe-Trading exposes an MCP that Claude Code can drive to run backtests — **Anecdotal** — [dev.to](https://dev.to/creeta/claude-code-can-drive-a-quant-backtester-via-vibe-trading-mcp-3701)
- Third-party catalogues list many finance and trading connectors with "Anthropic", "Verified" and "Community" badges. They are not authoritative — **Anecdotal** — [claudemarket.ai](https://claudemarket.ai/connectors/category/finance-and-trading)

### Inferences
- **MCP matters more for Claude Code and dev-time research than for the product runtime (Strong).** The production app calls Claude through the Anthropic SDK with structured outputs, so it can call data APIs directly from Python with deterministic code and caching. Routing through an MCP adds latency, cost per call and non-determinism. Use MCP servers in Claude Code to explore data, prototype skills and do research. Keep data fetching in the backend as plain code.
- **Production-ready:** CoinGecko official MCP and API, Alpaca official MCP (if US equities or paper broker are in scope).
- **Experimental:** community CCXT MCPs, Vibe-Trading MCP (useful for internal research only).
- **Interesting but unnecessary:** `anthropics/financial-services` (wrong vertical, expensive institutional connectors). Its plugin structure is a good template if you want to ship your own "apex-ai" Claude Code plugin with skills like `/investigate BTC`.
- Polymarket: the official agents repo is archived, so prediction-market support would come through CCXT (which now advertises prediction markets) or Polymarket's own API.

### Gaps
- No official CoinPaprika or "CoinLobster" MCP was verified. CoinLobster could not be found at all.
- No official Polymarket MCP server was verified.
- CoinGecko paid plan prices (USD/month) were not retrieved, only limits.
- The Claude Agent SDK's skills and plugin loading in headless mode was not re-verified this session.

## 4. Agent frameworks, memory/vector stores, and evaluation/observability

### Takeaway
For an app that already makes single-shot structured-output calls with a deterministic gate, a heavy orchestration framework is not needed. The Anthropic SDK (already in use), plus optional LangGraph only if durable multi-step graphs with checkpoints become necessary, is the right level. The Claude Agent SDK fits autonomous tool-using research agents, not the decision path. For memory, pgvector on Postgres beats adding Qdrant, mem0 or Letta. For evals and observability, Langfuse (self-hostable) plus promptfoo (CI evals) is the pragmatic pair.

### Cited Findings

| Repo | Stars | Forks | Open issues+PRs | Last push | Licence |
|---|---|---|---|---|---|
| [mem0ai/mem0](https://github.com/mem0ai/mem0) | 67,773 | 8,011 | 872 | 2026-10-23 | Apache-2.0 |
| [microsoft/autogen](https://github.com/microsoft/autogen) | 61,554 | 9,313 | 1,121 | 2026-10-16 | CC-BY-4.0 (as reported; see Gaps) |
| [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | 60,082 | 8,870 | 907 | 2026-10-24 | MIT |
| [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) | 43,864 | 7,537 | 515 | 2026-10-25 | MIT |
| [langfuse/langfuse](https://github.com/langfuse/langfuse) | 36,425 | 4,070 | 1,129 | 2026-10-25 | NOASSERTION |
| [qdrant/qdrant](https://github.com/qdrant/qdrant) | 35,239 | 2,774 | 799 | 2026-10-23 | Apache-2.0 |
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | 30,271 | 4,937 | 22 | 2026-10-22 | MIT |
| [promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) | 26,401 | 2,574 | 848 | 2026-10-25 | MIT |
| [letta-ai/letta](https://github.com/letta-ai/letta) | 25,251 | 2,658 | 0 (issues likely disabled) | 2026-10-18 | Apache-2.0 |
| [pgvector/pgvector](https://github.com/pgvector/pgvector) | 23,473 | 1,365 | 15 | 2026-10-24 | NOASSERTION (PostgreSQL licence) |
| [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) | 8,347 | 1,376 | 589 | 2026-10-24 | MIT |

All rows: **Verified**, GitHub API, 2026-10-25.

- TradingAgents itself uses LangGraph (checkpoint resume) and moved to structured outputs for research manager, trader and portfolio manager. This mirrors the existing app's approach — **Verified (checkpointing)** [README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md); **Anecdotal (structured outputs)** [apidog](https://apidog.com/de/blog/tradingagents-multi-agent-llm-trading/)
- Microsoft put AutoGen into maintenance mode in favour of the Microsoft Agent Framework (announced around October 2025) — **Strong evidence (prior knowledge)** — [repo](https://github.com/microsoft/autogen)
- Langfuse: MIT core with an `ee` folder under a commercial licence, self-hostable, with tracing, prompt management and evals — **Strong evidence (prior knowledge)** — [repo](https://github.com/langfuse/langfuse)
- The existing app already has `aq/memory.py`, `aq/learning.py` (post-trade lessons), `aq/risk.py` (deterministic gate) and `aq/execution.py` (simulated). It uses SQLite with WAL — **Verified** — local tree `/home/user/apex-ai/aq/`, `/home/user/apex-ai/data/adaptive_quant.db-wal`

### Inferences
- **Keep the Anthropic SDK with structured outputs (production-ready).** It is the leanest, most auditable path. Pydantic schemas plus a deterministic risk gate are what TradingAgents only adopted in 2026.
- **LangGraph: experimental, adopt only if needed.** Use it if investigations grow into multi-step, resumable workflows with human approval nodes. Otherwise APScheduler plus explicit Python state machines are simpler.
- **Claude Agent SDK: experimental, for an offline "research agent"** (for example a nightly deep-dive that browses, reads filings and writes evidence). It should not be in the per-decision path.
- **CrewAI, AutoGen, OpenAI Agents SDK: unnecessary.** CrewAI and AutoGen carry large backlogs, and AutoGen is in maintenance. The OpenAI Agents SDK is provider-centric.
- **Memory:** keep SQLite-based memory and lessons. When migrating to Postgres for multi-user SaaS, add pgvector for semantic retrieval of past investigations. Qdrant, mem0 and Letta are unnecessary at this scale. Mem0's 872 open issues+PRs and Letta's platform lock-in add risk for little gain.
- **Evaluation and observability (production-ready):** Langfuse (self-host, or cloud free tier) for tracing every Claude call with cost, latency and prompt version. promptfoo in CI for regression tests on investigation prompts (schema validity, refusal-to-trade cases, Devil's Advocate quality). Braintrust is a paid alternative. The most important "eval" is the existing paper P&L versus BTC buy-and-hold and SMA baselines, which the app already computes.

### Gaps
- Langfuse, Braintrust and promptfoo pricing tiers were not retrieved this session.
- The Microsoft Agent Framework's current status was not re-verified. The AutoGen licence shows CC-BY-4.0, which covers docs; the code licence (MIT) was not confirmed.
- Claude Agent SDK feature specifics (skills, hooks, subagents in headless mode) were not re-verified.

## 5. Data APIs, social/news APIs, auth/payments, and deployment

### Takeaway
Free exchange public APIs plus CoinGecko are enough for an MVP. Social data has become expensive or gated. X is now pay-per-use (about $0.005 per post read), and its terms may still require Enterprise for commercial use. Reddit's commercial access needs a negotiated agreement and pre-approval under the November 2025 Responsible Builder Policy. On-chain data (Glassnode, Santiment) costs about $49 to $999+ per month. Kaiko and CCData are enterprise-priced and unverified here.

### Cited Findings
- **X API:** moved to pay-per-use in February 2026, with credits bought upfront in the Developer Console. Reported rates: about $0.005 per post read, $0.010 per user lookup, $0.010 per post created. Legacy Basic ($200/mo) and Pro ($5,000/mo) are closed to new signups. Enterprise is about $42k/mo. Free access is limited to public-utility apps — **Anecdotal** (consistent secondary reports) — [Gigazine](https://www.gigazine.net/gsc_news/en/20260209-x-api-pay-per-use/), [MediaNama](https://www.medianama.com/2026/02/223-x-developer-api-pricing-pay-per-use-model/), [postproxy](https://www.postproxy.dev/blog/x-api-pricing-2026/)
- An Open Terms Archive memo says X's developer terms still require commercial uses to subscribe to Enterprise. This conflicts with the pay-per-use framing in other sources — **Anecdotal (conflict)** — [Open Terms Archive](https://opentermsarchive.org/en/memos/x-replaces-its-dollar200-entry-level-api-plan-with-a-pay-per-use-model/)
- **Reddit:** commercial use requires a separate agreement. Data API Terms §3.1 reserves the right to charge fees at Reddit's discretion. The Responsible Builder Policy (announced on r/redditdev in November 2025) closed self-service access, so new access needs approval. Circulating prices ($12k/mo for 50M calls, $0.24 per 1k calls) are unverified — **Anecdotal** — [techloy](https://www.techloy.com/reddit-api-pricing-in-2026-complete-guide-for-developers-and-businesses/), [socialcrawl](https://www.socialcrawl.dev/blog/reddit-data-api-2026), [r/redditdev mirror](https://r.datuan.dev/r/redditdev/comments/1oug31u/introducing_the_responsible_builder_policy_new/nocca6t)
- **Glassnode:** sources conflict. API plans are reported at $49 to $749 per month with no free API, or the platform Professional plan at $999 per month. The free tier is web only — **Anecdotal (conflicting)** — [CostBench API](https://costbench.com/software/blockchain-data-api/glassnode-api/), [CostBench platform](https://costbench.com/software/onchain-analytics/glassnode), [Spark](https://www.spark.money/tools/crypto-api-pricing-comparison)
- **Santiment:** about $49 to $349 per month. Free tier of about 1,000 calls per month with a 30-day lag on historical data — **Anecdotal** — [DEV Community](https://dev.to/gunnarthorderson/best-crypto-market-data-api-in-2026-intelligence-vs-raw-data-56eh), [Spark](https://www.spark.money/tools/crypto-api-pricing-comparison)
- **CoinGecko:** Demo plan is free with 10k credits per month and 30 calls per minute. Pro starts at 500k credits per month — **Verified** — [CoinGecko MCP docs](https://docs.coingecko.com/docs/mcp-server)
- **TradingAgents** already pulls StockTwits and Reddit posts and Polymarket as sentiment inputs, which signals the "standard" OSS sentiment stack — **Verified** — [README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md)
- **Existing app deploy:** Dockerfile plus `render.yaml` and `railway.json`, with a persistent disk for the SQLite ledger, `/healthz`, a dashboard password via `AQ_DASHBOARD_PASSWORD`, and a daily Claude spend cap — **Verified** — [/home/user/apex-ai/README.md](file:///home/user/apex-ai/README.md)

### Inferences
- **Production-ready now:** Binance and Coinbase public market data (already in use) and CoinGecko Demo, then Pro, for breadth and metadata.
- **Experimental or paid later:** CryptoPanic (news aggregation; cheap tiers reported historically), Santiment (sentiment and social at the low tier), and Glassnode (on-chain; expensive). Add one only after it shows predictive value in the paper fund.
- **Interesting but unnecessary at MVP:** Kaiko and CCData (institutional pricing), the X API (cost and terms risk), Reddit (gated), and LunarCrush (unverified).
- **Auth and payments (Speculative, not researched in depth this session):** for a UK consumer SaaS, Supabase (Postgres + auth + pgvector in one) or Clerk + Neon/Supabase, with Stripe Billing for subscriptions. Supabase also solves the SQLite-to-Postgres migration and gives pgvector. Moving from paper to "signals" to anything resembling advice raises FCA questions, which `docs/STRATEGY.md` covers.
- **Deployment:** keep the Render or Railway Docker deploy. Move to managed Postgres before multi-user. SQLite on a single persistent disk is fine for one paper fund.

### Gaps
- Kaiko, CCData (CryptoCompare), CryptoPanic and LunarCrush 2026 pricing was not found this session.
- Official X pricing page (docs.x.com) and Reddit's own terms pages were not fetched directly.
- Stripe, Clerk and Supabase pricing was not fetched this session.
- Binance and Coinbase public API rate limits and terms on commercial redistribution of market data were not checked. Redistribution of exchange data in a paid product may require licences.

## 6. Recommended build stack, and what the existing app should adopt versus keep

### Takeaway
Keep the core architecture: FastAPI, Anthropic SDK structured outputs, the deterministic risk engine, the paper ledger and post-trade lessons. It is already more disciplined than the most-starred OSS agents, which only added structured outputs, point-in-time data guards and decision settling during 2026. Adopt CCXT for venue breadth, Langfuse plus promptfoo for traceability and regression evals, and Postgres with pgvector (for example via Supabase) when going multi-user. Borrow ideas from TradingAgents (point-in-time contracts, bull/bear debate, settle-then-reflect), FinMem (memory decay) and Vibe-Trading (shadow accounts) rather than taking them as dependencies.

### Cited Findings
- The existing app runs two agents (Market Intelligence Scout, Devil's Advocate), a deterministic risk gate, simulated positions closed on real subsequent prices, post-trade lessons, baselines against BTC buy-and-hold and an SMA bot, and 62 offline tests. Dependencies: fastapi, uvicorn, requests, pydantic, apscheduler, anthropic — **Verified** — [/home/user/apex-ai/README.md](file:///home/user/apex-ai/README.md), [/home/user/apex-ai/requirements.txt](file:///home/user/apex-ai/requirements.txt)
- TradingAgents' 2026 changes (structured outputs, SQLite decision log, look-ahead fixes, settle-and-reflect memory) converge on the same design — **Verified/Anecdotal**, as in §1 — [README](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md)
- Every major OSS LLM trading agent disclaims real trading: TradingAgents ("research purposes"), ai-hedge-fund ("does not actually make any trades"), and Anthropic's own financial-services agents ("do not make investment recommendations, execute transactions") — **Verified** — [TradingAgents](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/README.md), [ai-hedge-fund](https://raw.githubusercontent.com/virattt/ai-hedge-fund/main/README.md), [anthropics/financial-services](https://raw.githubusercontent.com/anthropics/financial-services/main/README.md)

### Inferences (stack table; labels reflect confidence in the recommendation)

**Production-ready (adopt or keep)**

| Component | What it does | Maturity and activity | Limitations and cost | Decision |
|---|---|---|---|---|
| Anthropic SDK + structured outputs (keep) | LLM calls with schema-validated JSON | Core of app | Token cost (spend cap already exists) | Keep |
| Deterministic risk engine (keep) | Gates every idea | Custom, tested | Must be maintained in-house | Keep, since it is the differentiator |
| FastAPI + APScheduler (keep) | API and scheduling | Mature | APScheduler is single-process | Keep. Move to a worker/queue only when multi-tenant |
| CCXT (adopt) | Unified exchange data and orders, 100+ venues | 44.6k stars, daily pushes, MIT | Large surface and per-exchange quirks | Adopt for REST market data. Keep the browser WebSocket ticker |
| CoinGecko API, with MCP for dev (adopt) | Coin universe, metadata, market caps | Official, documented | Demo plan 10k credits/mo | Adopt the free tier now |
| Langfuse (adopt) | LLM tracing, cost, prompt versions | 36k stars, daily pushes | Self-host ops, or cloud fee | Adopt |
| promptfoo (adopt) | Prompt and agent regression tests in CI | 26k stars, MIT | Needs curated cases | Adopt alongside pytest |
| Postgres + pgvector, e.g. Supabase (adopt at multi-user) | Durable multi-user DB plus semantic memory | pgvector 23k stars, low backlog | Migration effort | Adopt when leaving single-fund SQLite |
| Stripe, plus Supabase Auth or Clerk (adopt at monetisation) | Billing and auth | Industry standard | Fees, unverified this session | Buy, don't build |

**Experimental (pilot behind a flag, or for internal research)**
- LangGraph for resumable multi-step investigations with human-approval nodes.
- Claude Agent SDK for an offline deep-research agent that writes evidence packs.
- Vibe-Trading, via its MCP in Claude Code, as an internal strategy-research sandbox.
- NautilusTrader or freqtrade (dry-run) if and when moving towards live execution. Check freqtrade's GPL implications.
- Santiment, CryptoPanic or Glassnode as added evidence sources, only after they show value in the paper fund.
- Alpaca MCP/API if US equities or a regulated paper broker is wanted.

**Interesting but unnecessary**
- TradingAgents, ai-hedge-fund, AutoHedge, FinRobot, ElizaOS, NoFx (read for patterns, don't depend on them).
- FinRL, FinRL-X, TradeMaster, FinGPT, qlib (RL and ML research stacks).
- FinMem and FinAgent code (dormant or absent; borrow the memory-decay idea).
- `anthropics/financial-services` plugins (wrong vertical; useful only as a packaging template).
- CrewAI, AutoGen, OpenAI Agents SDK, mem0, Letta, Qdrant (redundant at this scale).
- X API and Reddit API (cost and terms risk), Kaiko and CCData (enterprise pricing).
- Hummingbot, LEAN, backtrader (wrong focus, too heavy, or dormant).

**Ideas worth porting into the existing app (Speculative but low-risk)**
1. Point-in-time data contracts. Every evidence item carries a `published_at`, and the engine refuses evidence published after the decision timestamp in replays. TradingAgents needed three releases to fix leakage.
2. A structured bull/bear debate before the Devil's Advocate verdict. TradingAgents' researcher-team pattern maps cleanly to Scout versus Devil's Advocate.
3. Settle-then-reflect. Lessons computed from realized alpha versus a benchmark, not raw P&L. The app already writes post-trade lessons, so add benchmark-relative scoring.
4. Memory with recency and importance decay (FinMem), so old lessons don't dominate retrieval.
5. "Shadow account" analysis (Vibe-Trading). Users upload their own trade history, and the system infers their rules and backtests them. This is a plausible product hook.

### Gaps
- No benchmark comparison of these OSS agents' live performance exists. Alpha Arena is the only real-money evidence, and it is short-horizon and secondary-sourced.
- Costs for Langfuse Cloud, Supabase, Clerk and Stripe were not verified this session.
- Licensing and regulatory implications of redistributing exchange data, and of FCA perimeter for a "decision product", are out of scope here and need separate review.

# Strategy: positioning, business model, content and launch

This document keeps the business plan next to the code. Its corrections reflect what the system actually does
today; check competitor figures and every regulatory point with primary sources and qualified advice before relying on
them.

## Positioning

Adaptive Quant is an **explainable AI trading desk that is allowed to say "no trade"** and keeps an honest,
inspectable record of every decision and its outcome.

| Category | Examples (unverified figures) | How Adaptive Quant differs |
|---|---|---|
| AI analysis/signal apps | TradeGPT (education-only disclaimers, subscriptions) | Decisions are challenged, sized by fixed rules, and their outcomes are recorded. |
| Rule-based bot platforms | Cornix (grid/DCA bots), Coinrule ("if-this-then-that" bots) | LLM reasoning with a documented rationale per trade; no promise of automation profits. |
| Hobbyist "AI desk" builds | Social-media XAU/USD dashboards; "Tradie" paper-trading futures | Same instincts (AI proposes, risk engine validates, permission to do nothing), plus a learning ledger and benchmarks. |

Few products document every trade's rationale, its challenge and what was learned. That record is the
differentiator, and the asset for content.

## Strengths and gaps (as of v0.3)

**Strengths:**
- a Scout justification and a Devil's Advocate challenge before any trade;
- deterministic risk limits that the LLM cannot override;
- realistic costs, from order-book slippage and funding;
- small samples flagged instead of hidden, and invented evidence stripped from LLM output;
- benchmarks against BTC buy-and-hold and an SMA bot;
- tests that guard against lookahead.

**Gaps, stated precisely:**
- **Not backtested at all.** Synthetic data was used only to test that the software works, not the strategy.
  Backtesting the LLM on history is biased (the model's training data contains that history); only the deterministic
  `rules:v1` engine can be backtested fairly. **The forward paper fund is the real test.**
- **No live run yet.** Live feeds, real-time streams and the Claude path are each tested offline, not together live.
- **No order execution, by design.** The system is paper-only. Real execution would be a separate decision requiring
  legal advice and a new risk review; it is not part of any phase below.
- No news or social inputs yet; the fallback `rules:v1` strategy is a baseline, not an edge.
- The UI is functional, not yet built for sharing (see Content).

## Regulatory guardrails (UK)

Treat these as questions for a qualified adviser, not settled answers.

- **Financial promotions:** crypto content aimed at UK audiences falls under the FCA's cryptoasset financial promotion
  rules (since October 2023), and its social-media guidance (FG24/1) applies to posts by individuals and influencers.
  Content must be fair, clear and not misleading.
- **Never present Research Confidence as a probability**, an emoji or a "signal strength". It is an ordinal
  evidence-agreement score. Show the recorded track record instead.
- **Highest-risk monetisation:**
  - exchange affiliate links: an affiliate post is itself a promotion, and unauthorised finfluencers are an
    enforcement focus;
  - paid trade signals, "priority Q&A with the AI", or API access to trade calls: these are likely to need
    authorisation under the incoming UK cryptoasset regime.
- **Every public surface keeps** "Paper trading · not financial advice · past performance does not predict future
  results".

## Business model (lowest regulatory risk first)

1. **Content and audience:**
   - the public read-only dashboard (`AQ_PUBLIC_READ_ONLY=true`);
   - trade story posts, newsletter and video;
   - sponsorships unrelated to trading.
2. **Education:** courses or workshops on building an evidence-driven AI research desk, taught from the open record.
3. **Software, not calls:** sell or license the tooling (the desk kit, a hosted research workspace) where the user's
   own decisions remain theirs.
4. **Only with authorisation/advice:** anything that charges for trade ideas or manages money.

## Content: making it shareable without making it misleading

Planned features, all generated from real recorded events:

1. **Trade story cards (9:16):** idea → evidence → Devil's Advocate objection → risk decision → outcome → lesson,
   exportable as an image or a short video.
2. **"Watch the AI think" replay:** an animated playback of a real investigation.
3. **Daily race:** AI fund vs BTC buy-and-hold, from the fixed start date, losses included.
4. **Prediction check-ins:** "the system says X within 24h", then the recorded result the next day.

Design: one unified theme across trade and portfolio views, mobile-first. A React rebuild (for example via Lovable)
can sit on the existing API (`/openapi.json`, `AQ_CORS_ORIGINS`) without touching the backend. The no-placeholder-data
rule applies to any new frontend.

## Phased launch and metrics

| Phase | Scope | Exit criteria |
|---|---|---|
| 1. Live system | Deploy (see `GO_LIVE.md`), Claude key, UK-realistic settings, clean £10k start | 7 days with no failed monitor runs; live data and LLM engine confirmed |
| 2. Track record | Run unchanged; review every trade; lessons accumulate | ≥ 20 closed trades (preliminary) → ≥ 50 (moderate); compare against BTC and the SMA bot |
| 3. Public beta | Read-only public dashboard, trade story content, disclaimers everywhere | Legal review of content format completed |
| 4. Growth | Content cadence, education product, frontend rebuild | Audience and engagement targets; no promotional claims beyond the record |

**Metrics:**
- **Trading:**
  - closed trades and evidence quality;
  - expectancy in R;
  - max drawdown;
  - return vs BTC buy-and-hold (information ratio once there are ≥ 30 daily returns);
  - how often the Devil's Advocate anticipated the failure.
- **Product:** dashboard visits, content reach and saves, follower growth, returning viewers.
- **Cost:** Claude spend per investigation and per closed trade.

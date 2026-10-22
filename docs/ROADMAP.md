# Adaptive Quant — Roadmap & Future Architecture

Built tonight: **Market Intelligence Scout**, **Devil's Advocate**, a deterministic **Risk Engine**, the paper
**Portfolio**, the **Experience Ledger** and the **Learning Loop**. Everything below is *not implemented*. The
interfaces that exist so these components can be added are listed for each layer.

## Agent layers

### 1. Discovery
| Agent | Purpose | Integration point |
|---|---|---|
| Viral Scout | Detect topics and assets gaining attention abnormally fast | `SocialSignalProvider` (`aq/signals/base.py`) |
| News Scout | Timestamped catalyst detection | `NewsProvider` |
| Social Velocity | Rate of change of mentions and engagement, vs. baseline | `SocialSignal.engagement` + provenance |
| Narrative Mapper | Cluster posts and news into narratives; map narratives to assets | consumes the two above |

### 2. Verification
| Agent | Purpose |
|---|---|
| Source Credibility | Score sources by track record recorded in the ledger (not by follower count) |
| Manipulation Detector | Coordinated posting, bot patterns, wash volume, pump signatures |
| Token Security | Contract risks (mint/blacklist/proxy), holder concentration, honeypots |
| Liquidity | Order-book depth and expected slippage for the intended size; replaces the fixed bps assumption |

### 3. Intelligence
| Agent | Purpose |
|---|---|
| On-chain Analyst | Exchange flows, large-holder movement, stablecoin supply |
| Market Structure | Funding, open interest, basis, liquidation clusters |
| Macro | Rates, USD, risk-asset correlation regime |
| Strategy Researcher | Proposes *new* hypotheses as testable rules; never deploys them |

### 4. Challenge
| Agent | Purpose |
|---|---|
| Devil's Advocate (exists) | Will gain access to Verification outputs and to historical lessons for similar setups |

### 5. Decision
| Agent | Purpose |
|---|---|
| Strategy Selector | Picks which validated strategy applies to the current regime, based on the ledger's evidence |
| Probability Engine | Calibrates Research Confidence into empirical hit rates once there are enough samples (reliability curves) |
| Portfolio Manager | Correlation-aware sizing across positions; replaces per-trade caps alone |

### 6. Learning
| Agent | Purpose |
|---|---|
| Experience Memory | Retrieval of similar past situations, given to the Scout and Devil's Advocate at decision time |
| Failure Diagnosis | Extends `aq/learning.py` diagnosis with richer causes (liquidity, news shocks) |
| Hypothesis Generator | Turns repeated lesson groups into candidate rule changes |
| Strategy Evaluator | Out-of-sample / walk-forward tests of candidate changes before any human approval |

## Principles for every future agent
1. Deterministic data first; LLMs interpret, they do not invent.
2. Every claim cites stored evidence; uncited claims are removed by validation.
3. No agent gets execution rights, OS access or keys.
4. A strategy changes only after ≥ N similar observations, an out-of-sample test **and** human approval.

## Phased roadmap
| Phase | Scope |
|---|---|
| 0 (tonight) | Scout, Devil's Advocate, risk engine, paper fund, ledger, learning loop, dashboard |
| 1 | Run the live paper fund for 4–8 weeks unchanged; collect ≥ 50 investigations; add PostgreSQL; daily reports |
| 2 | Experience Memory retrieval; Liquidity agent (order-book slippage); Research Confidence calibration curves |
| 3 | News Scout on a licensed feed; YouTube-based Viral Scout; Source Credibility from ledger history |
| 4 | Market Structure (funding/OI), On-chain Analyst; walk-forward Strategy Evaluator |
| 5 | Prediction-market module (research only; see white paper §20) |
| 6 | Only with legal advice: any discussion of moving beyond paper trading |

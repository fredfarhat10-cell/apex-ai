"""Typed outputs for the agents. LLM outputs are parsed into these, then validated deterministically."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

ExplanationCategory = Literal["momentum", "macro_news_catalyst", "market_wide_move", "sector_rotation",
                              "volatility_breakout", "mean_reversion", "unclear"]
Action = Literal["LONG", "SHORT", "NO_TRADE"]
Operator = Literal[">", "<", ">=", "<="]

RESEARCH_CONFIDENCE_SCALE = {
    1: "Very weak — evidence is thin or contradictory",
    2: "Weak — one supporting factor, notable contradictions",
    3: "Moderate — several supporting factors, some contradictions",
    4: "Strong — most factors agree, few contradictions",
    5: "Very strong — all observed factors agree",
}
RESEARCH_CONFIDENCE_NOTE = ("Research Confidence is an ordinal 1–5 rating of how well the observed evidence agrees. "
                            "It is NOT a calibrated probability of profit; no empirical calibration exists yet.")

DA_CATEGORIES = Literal["thesis_flaw", "alternative_explanation", "already_moved", "regime", "liquidity_volume",
                        "reward_risk", "historical_unreliability", "invalidation", "specific_no_trade_reason",
                        "data_quality"]


class Explanation(BaseModel):
    category: ExplanationCategory
    explanation: str
    evidence_keys: list[str]
    plausibility: Literal["low", "medium", "high"]


class Condition(BaseModel):
    description: str
    metric: str = Field(description="A feature key from the provided features, or 'price'")
    operator: Operator
    threshold: float


class ScoutLLMOutput(BaseModel):
    what_is_happening: str
    possible_explanations: list[Explanation]
    confirmation_conditions: list[Condition]
    invalidation_conditions: list[Condition]
    proposed_action: Action
    horizon_hours: int = Field(description="One of 6, 12, 24, 48, 72")
    stop_atr_multiple: float = Field(description="Stop distance in ATR(14,1h) multiples, 0.75–3.0")
    target_atr_multiple: float = Field(description="Target distance in ATR(14,1h) multiples, 1.0–8.0")
    research_confidence: int = Field(description="Ordinal 1–5 per the provided scale")
    thesis: str
    rationale: str
    rejected_alternatives: list[str]
    data_limitations: list[str]


class EvidenceItem(BaseModel):
    key: str
    value: float | str | None
    description: str


class ScoutReport(ScoutLLMOutput):
    engine: str
    situation_tags: list[str] = []
    evidence: list[EvidenceItem] = []
    validation_notes: list[str] = []


class DAFinding(BaseModel):
    check: str
    category: DA_CATEGORIES
    severity: Literal["blocking", "major", "minor", "info"]
    claim: str
    evidence_keys: list[str]


class DALLMOutput(BaseModel):
    verdict: Literal["APPROVE", "VETO", "MONITOR"]
    findings: list[DAFinding]
    alternative_explanations: list[str]
    what_would_change_verdict: str
    summary: str


class DAReport(BaseModel):
    engine: str
    verdict: Literal["APPROVE", "VETO", "MONITOR", "NOT_REQUIRED"]
    findings: list[DAFinding] = []
    alternative_explanations: list[str] = []
    what_would_change_verdict: str = ""
    summary: str = ""
    validation_notes: list[str] = []
    rule_verdict: str | None = None
    llm_verdict: str | None = None


class PostTradeLLMNarrative(BaseModel):
    narrative: str
    was_win_caused_by_thesis: Literal["yes", "no", "unclear", "not_applicable"]
    additional_hypotheses: list[str]

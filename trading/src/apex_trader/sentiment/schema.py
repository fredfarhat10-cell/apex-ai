from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal

Stage = Literal["early", "mid", "hype", "decline"]
Platform = Literal["reddit", "x"]


@dataclass(frozen=True)
class Post:
    """A social post the feed emits — platform-agnostic."""
    platform: Platform
    post_id: str
    author: str
    text: str
    ts: datetime
    engagement: int = 0          # upvotes / likes
    symbol: str | None = None    # inferred or explicit


@dataclass(frozen=True)
class TrendScore:
    """0-100 trend score for one symbol at one moment.

    ``score`` is the operator-facing number.  ``breakdown`` exposes the
    components for debugging / UI — none of them is authoritative alone.
    Score is advisory; no downstream code should size orders from it without
    also passing the existing RiskManager + signal gate.
    """
    symbol: str
    ts: datetime
    score: float
    stage: Stage
    sentiment_mean: float
    velocity_per_hour: float
    post_count: int
    breakdown: dict[str, float] = field(default_factory=dict)

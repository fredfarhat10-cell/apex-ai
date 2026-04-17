from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class SmartMoneySignal(BaseModel):
    """A single detected smart-money movement from one data source."""

    source: Literal["polymarket", "onchain", "stocks"]
    signal_type: Literal[
        "sudden_position_increase",
        "rapid_odds_shift",
        "unusual_volume",
        "large_wallet_transfer",
        "price_divergence",
    ]
    asset: str
    market: Literal["crypto", "stock", "prediction_market"]
    magnitude: float = Field(description="Relative size of movement (e.g. 0.15 = 15% shift)")
    direction: Literal["bullish", "bearish", "neutral"] = "neutral"
    timestamp: datetime
    freshness_minutes: float = Field(description="Age of signal in minutes — lower is fresher")
    raw_detail: str = Field(default="", description="Human-readable description of the raw signal")

    @property
    def is_fresh(self) -> bool:
        return self.freshness_minutes <= 60.0


class ValidationResult(BaseModel):
    asset: str
    signals: list[SmartMoneySignal]
    news_catalyst: bool = False
    social_sentiment: bool = False
    market_reaction: bool = False
    confirmation_count: int = 0

    @property
    def confirmed(self) -> bool:
        return self.confirmation_count >= 2

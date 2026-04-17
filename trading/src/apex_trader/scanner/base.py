from __future__ import annotations

from typing import Literal, Protocol

import pandas as pd
from pydantic import BaseModel, Field


class Opportunity(BaseModel):
    asset: str
    market: Literal["crypto", "stock", "prediction_market"]
    strategy_type: Literal["trend", "mean_reversion", "news", "arbitrage", "volatility_breakout"]
    catalyst: str = Field(description="What makes this actionable now")
    entry_hint: float | None = None
    stop_hint: float | None = None
    target_hint: float | None = None
    risk_reward: float | None = None
    expected_value: float = Field(description="Coarse EV score used for ranking")
    confidence: float = Field(ge=0.0, le=100.0)


class OpportunityList(BaseModel):
    opportunities: list[Opportunity] = Field(default_factory=list)

    def top(self, n: int = 5) -> list[Opportunity]:
        return sorted(self.opportunities, key=lambda o: o.expected_value, reverse=True)[:n]


class Scanner(Protocol):
    def scan(self, candidates: dict[str, pd.DataFrame]) -> OpportunityList:
        """Given {symbol: OHLCV DataFrame}, return ranked opportunities."""
        ...

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

from ..agent.llm import LLMClient
from ..agent.prompts import POST_TRADE_PROMPT, SYSTEM_PROMPT


@dataclass
class ClosedTrade:
    asset: str
    entry_price: float
    exit_price: float
    stop_loss: float | None
    take_profit: float | None
    quantity: float
    pnl: float
    thesis: str
    duration_bars: int
    opened_at: datetime
    closed_at: datetime


class TradeReview(BaseModel):
    """Structured post-mortem output."""
    decision_quality: Literal["good", "bad", "neutral"] = Field(
        description="Evaluated independent of P&L outcome"
    )
    signals_correct: list[str] = Field(default_factory=list)
    signals_failed: list[str] = Field(default_factory=list)
    sizing_optimal: bool
    sizing_commentary: str
    pattern: str = Field(description="Generalizable lesson — what to look for next time")
    rule_adjustment: str | None = Field(
        default=None, description="Optional concrete rule tweak to adopt going forward"
    )


@dataclass
class PostMortem:
    """Runs a review on every closed trade and appends it to a JSONL learning log."""
    llm: LLMClient
    log_path: str | Path
    system_prompt: str = SYSTEM_PROMPT

    def __post_init__(self) -> None:
        self.log_path = Path(self.log_path)
        self.log_path.parent.mkdir(parents=True, exist_ok=True)

    def review(self, trade: ClosedTrade) -> TradeReview:
        user = POST_TRADE_PROMPT.format(
            asset=trade.asset,
            entry=trade.entry_price,
            exit=trade.exit_price,
            stop_loss=trade.stop_loss,
            take_profit=trade.take_profit,
            quantity=trade.quantity,
            pnl=trade.pnl,
            thesis=trade.thesis,
            duration_bars=trade.duration_bars,
        )
        review = self.llm.structured(
            system=self.system_prompt,
            user=user,
            schema=TradeReview,
        )
        self._append_log(trade, review)
        return review

    def _append_log(self, trade: ClosedTrade, review: TradeReview) -> None:
        record = {
            "closed_at": trade.closed_at.isoformat(),
            "asset": trade.asset,
            "pnl": trade.pnl,
            "thesis": trade.thesis,
            "review": review.model_dump(),
        }
        with open(self.log_path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record) + "\n")

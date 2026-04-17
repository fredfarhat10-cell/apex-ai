from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

from pydantic import BaseModel, Field

from ..allocation.allocator import Sleeve
from ..indicators import atr, bollinger, ema, rsi
from ..strategy.base import Signal, StrategyContext
from .llm import LLMClient
from .prompts import SYSTEM_PROMPT


class TradeProposal(BaseModel):
    """Structured output from the Decision Agent. Fields mirror the system prompt."""
    action: Literal["BUY", "SELL", "HOLD"] = Field(
        description="BUY to open long, SELL to close long, HOLD to do nothing"
    )
    asset: str
    strategy_type: Literal["trend", "mean_reversion", "news", "arbitrage", "none"]
    entry_price: float | None = Field(default=None)
    stop_loss: float | None = Field(default=None)
    take_profit: float | None = Field(default=None)
    risk_reward: float | None = Field(default=None, description="Target R:R, >= 2.0 to be actionable")
    confidence: float = Field(ge=0.0, le=100.0)
    thesis: str = Field(description="One-paragraph reasoning — drives post-mortem later")


def _indicator_snapshot(history) -> dict[str, float | None]:
    close = history["close"]
    high = history["high"]
    low = history["low"]
    if len(close) < 60:
        return {"note": "insufficient history for full indicators"}
    ema20 = float(ema(close, 20).iloc[-1])
    ema50 = float(ema(close, 50).iloc[-1])
    rsi14 = float(rsi(close, 14).iloc[-1])
    bb_lo, bb_mid, bb_up = bollinger(close, 20, 2.0)
    atr14 = float(atr(high, low, close, 14).iloc[-1])
    last = float(close.iloc[-1])
    return {
        "price": last,
        "ema20": ema20,
        "ema50": ema50,
        "rsi14": rsi14,
        "bb_lower": float(bb_lo.iloc[-1]),
        "bb_mid": float(bb_mid.iloc[-1]),
        "bb_upper": float(bb_up.iloc[-1]),
        "atr14": atr14,
        "trend": "up" if ema20 > ema50 else "down",
    }


@dataclass
class DecisionAgent:
    """Strategy implementation that delegates to an LLMClient.

    Plug into the Backtest runner like any other Strategy. The Backtest engine
    still enforces risk gates via RiskManager — the agent only proposes.
    """
    name: str
    llm: LLMClient
    sleeve: Sleeve = Sleeve.CORE
    min_confidence: float = 55.0
    extra_context: str = ""
    system_prompt: str = field(default=SYSTEM_PROMPT)

    def decide(self, ctx: StrategyContext) -> tuple[Signal, str]:
        history = ctx.history
        if len(history) < 60:
            return Signal.FLAT, "insufficient history"

        snapshot = _indicator_snapshot(history)
        pos = ctx.portfolio.position(ctx.symbol)
        user_msg = (
            f"Asset: {ctx.symbol}\n"
            f"Sleeve: {self.sleeve.value}\n"
            f"As of: {ctx.now.isoformat()}\n"
            f"Last price: {ctx.last_price:.6f}\n"
            f"Current position: qty={pos.quantity} avg_px={pos.avg_price}\n"
            f"Indicator snapshot: {snapshot}\n"
            f"{self.extra_context}\n\n"
            "Decide: BUY to open long, SELL to close, HOLD if no clear edge.\n"
            "Only BUY if risk/reward >= 2.0 and confidence >= "
            f"{self.min_confidence}.\n"
            "Return a TradeProposal with your thesis."
        )

        proposal = self.llm.structured(
            system=self.system_prompt,
            user=user_msg,
            schema=TradeProposal,
        )

        # Attach the last proposal to the context for the runner to log.
        # Strategies shouldn't mutate the portfolio but may record reasoning.
        reason = (
            f"{proposal.strategy_type}: {proposal.thesis} "
            f"(conf={proposal.confidence:.0f}, rr={proposal.risk_reward})"
        )

        if proposal.action == "HOLD":
            return Signal.FLAT, reason
        if proposal.action == "BUY":
            if proposal.confidence < self.min_confidence:
                return Signal.FLAT, f"below confidence floor: {reason}"
            if proposal.risk_reward is not None and proposal.risk_reward < 2.0:
                return Signal.FLAT, f"rr below 2.0: {reason}"
            if pos.quantity > 0:
                return Signal.FLAT, "already long"
            return Signal.LONG, reason
        if proposal.action == "SELL":
            if pos.quantity <= 0:
                return Signal.FLAT, "no position to close"
            return Signal.EXIT, reason
        return Signal.FLAT, "unknown action"

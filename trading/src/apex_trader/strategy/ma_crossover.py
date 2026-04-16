from __future__ import annotations

from dataclasses import dataclass

from ..indicators import ema
from .base import Signal, Strategy, StrategyContext


@dataclass
class MACrossover:
    fast: int = 20
    slow: int = 50
    name: str = "ma_crossover"

    def decide(self, ctx: StrategyContext) -> tuple[Signal, str]:
        close = ctx.history["close"]
        if len(close) < self.slow + 2:
            return Signal.FLAT, "insufficient history"

        f = ema(close, self.fast)
        s = ema(close, self.slow)

        prev_diff = f.iloc[-2] - s.iloc[-2]
        cur_diff = f.iloc[-1] - s.iloc[-1]

        pos_qty = ctx.portfolio.position(ctx.symbol).quantity

        if prev_diff <= 0 and cur_diff > 0 and pos_qty == 0:
            return Signal.LONG, f"golden cross: ema{self.fast}>{self.slow}"
        if prev_diff >= 0 and cur_diff < 0 and pos_qty > 0:
            return Signal.EXIT, f"death cross: ema{self.fast}<{self.slow}"
        return Signal.FLAT, "no crossover"

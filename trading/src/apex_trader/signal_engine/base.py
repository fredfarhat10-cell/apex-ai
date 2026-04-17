from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal, Protocol

import pandas as pd

# Direction a strategy proposes — strategies are LONG-only by default;
# "short" is reserved for future use and ignored by the long-only risk gate.
Direction = Literal["long", "short", "flat"]


@dataclass
class SignalResult:
    """Output of a single strategy's signal generation."""

    direction: Direction
    confidence: float  # 0.0–1.0
    risk_reward: float | None  # None when direction is "flat"
    strategy: str
    rationale: str = ""
    # Regimes in which this signal is considered valid.
    # Empty frozenset = valid in all regimes.
    active_regimes: frozenset[str] = field(default_factory=frozenset)

    def is_valid_for_regime(self, regime_label: str) -> bool:
        if not self.active_regimes:
            return True
        return regime_label in self.active_regimes


class SignalStrategy(Protocol):
    """Protocol every signal strategy must satisfy."""

    name: str
    weight: float  # starting weight; adjusted by MetaLearner

    def generate(self, bars: pd.DataFrame, regime: str) -> SignalResult:
        """Generate a signal from OHLCV `bars` given the current `regime` label."""
        ...

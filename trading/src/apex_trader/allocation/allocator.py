from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Sleeve(str, Enum):
    CORE = "core"                  # 80-90% — capital preservation, proven strategies
    EXPERIMENTAL = "experimental"  # 10-20% — aggressive bets, bounded downside


@dataclass
class AllocationConfig:
    core_fraction: float = 0.85
    experimental_fraction: float = 0.15

    def __post_init__(self) -> None:
        total = self.core_fraction + self.experimental_fraction
        if abs(total - 1.0) > 1e-9:
            raise ValueError(f"sleeve fractions must sum to 1.0, got {total}")


@dataclass
class CapitalAllocator:
    """Enforces the core/experimental split on top of a single portfolio.

    Strategy-level tag decides which sleeve a proposed order belongs to.
    Experimental orders may consume at most `experimental_fraction * equity`
    of gross notional; core orders use the remainder. This is a policy layer,
    not a book split — positions live in one Portfolio for simplicity.
    """
    config: AllocationConfig = None

    def __post_init__(self) -> None:
        if self.config is None:
            self.config = AllocationConfig()

    def budget(self, sleeve: Sleeve, equity: float) -> float:
        if equity <= 0:
            return 0.0
        frac = (
            self.config.core_fraction if sleeve is Sleeve.CORE
            else self.config.experimental_fraction
        )
        return equity * frac

    def max_new_notional(
        self,
        sleeve: Sleeve,
        equity: float,
        current_notional_in_sleeve: float,
    ) -> float:
        return max(0.0, self.budget(sleeve, equity) - current_notional_in_sleeve)

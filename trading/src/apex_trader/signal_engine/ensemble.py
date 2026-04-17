from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

import pandas as pd

from .base import Direction, SignalResult, SignalStrategy

if TYPE_CHECKING:
    pass


@dataclass
class EnsembleResult:
    """Aggregated output from all active strategies."""

    direction: Direction
    confidence: float          # weighted-average confidence across contributing strategies
    risk_reward: float | None  # weighted-average R:R (None if flat)
    regime: str
    contributing: list[tuple[str, float]] = field(default_factory=list)  # (name, confidence)
    rationale: str = ""


class EnsembleCombiner:
    """Weighted ensemble of `SignalStrategy` instances.

    Workflow for each bar:
    1. Call each strategy's `.generate(bars, regime)`.
    2. Keep only signals valid for the current regime.
    3. Aggregate using per-strategy weights (from `weights` override or
       `strategy.weight`).
    4. Emit LONG if net confidence >= `min_confidence`, else FLAT.
    5. R:R is the weight-averaged R:R of contributing strategies.

    The weights are normally supplied by `MetaLearner.get_weights()` so the
    ensemble automatically adapts as strategy performance evolves.
    """

    def __init__(
        self,
        strategies: list[SignalStrategy],
        min_confidence: float = 0.45,
    ) -> None:
        self.strategies = strategies
        self.min_confidence = min_confidence

    def combine(
        self,
        bars: pd.DataFrame,
        regime: str,
        weights: dict[str, float] | None = None,
    ) -> EnsembleResult:
        """Run all strategies and return weighted aggregate signal.

        Parameters
        ----------
        bars:    Full OHLCV history up to and including the current bar.
        regime:  Current regime label from `RegimeDetector`.
        weights: Optional weight override keyed by strategy name.  If None,
                 uses each strategy's `.weight` attribute.
        """
        signals: list[tuple[SignalResult, float]] = []  # (result, weight)

        for strat in self.strategies:
            w = (weights or {}).get(strat.name, strat.weight)
            if w <= 0:
                continue
            result = strat.generate(bars, regime)
            if result.direction != "flat" and result.is_valid_for_regime(regime):
                signals.append((result, w))

        if not signals:
            return EnsembleResult(
                direction="flat",
                confidence=0.0,
                risk_reward=None,
                regime=regime,
                rationale="no active strategy generated a directional signal",
            )

        # Separate by direction — only combine same-direction signals.
        # (In this long-only system all non-flat signals are "long"; keep
        # the logic here for future short-side support.)
        by_dir: dict[Direction, list[tuple[SignalResult, float]]] = {}
        for res, w in signals:
            by_dir.setdefault(res.direction, []).append((res, w))

        # Winning direction = highest total weight
        winning_dir: Direction = max(by_dir, key=lambda d: sum(w for _, w in by_dir[d]))
        group = by_dir[winning_dir]

        total_weight = sum(w for _, w in group)
        weighted_conf = sum(r.confidence * w for r, w in group) / total_weight
        rr_values = [(r.risk_reward, w) for r, w in group if r.risk_reward is not None]
        weighted_rr = (
            sum(rr * w for rr, w in rr_values) / sum(w for _, w in rr_values)
            if rr_values else None
        )

        contributing = [(r.strategy, r.confidence) for r, _ in group]

        if weighted_conf < self.min_confidence:
            return EnsembleResult(
                direction="flat",
                confidence=weighted_conf,
                risk_reward=None,
                regime=regime,
                contributing=contributing,
                rationale=f"confidence {weighted_conf:.2f} below threshold {self.min_confidence}",
            )

        return EnsembleResult(
            direction=winning_dir,
            confidence=weighted_conf,
            risk_reward=weighted_rr,
            regime=regime,
            contributing=contributing,
            rationale=f"ensemble {winning_dir}: conf={weighted_conf:.2f}, rr={weighted_rr}",
        )

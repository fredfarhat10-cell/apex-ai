from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any

from .signals import SmartMoneySignal, ValidationResult

log = logging.getLogger(__name__)


def _group_by_asset(signals: list[SmartMoneySignal]) -> dict[str, list[SmartMoneySignal]]:
    groups: dict[str, list[SmartMoneySignal]] = defaultdict(list)
    for sig in signals:
        groups[sig.asset].append(sig)
    return dict(groups)


class MultiSourceValidator:
    """Validates smart-money signals by checking cross-source confirmation.

    An opportunity passes validation when:
      1. Its signals are fresh (< max_age_minutes).
      2. At least `min_confirmations` of the three validation axes are positive:
         - news_catalyst  (injected externally or derived from signal metadata)
         - social_sentiment (same)
         - market_reaction  (same)
      3. At least 2 distinct sources provided signals.

    In practice the three axes are set by callers who may query a news API or
    social-sentiment service; the validator itself is source-agnostic.
    """

    def __init__(
        self,
        max_age_minutes: float = 60.0,
        min_confirmations: int = 2,
        min_sources: int = 2,
    ) -> None:
        self.max_age_minutes = max_age_minutes
        self.min_confirmations = min_confirmations
        self.min_sources = min_sources

    def validate(
        self,
        signals: list[SmartMoneySignal],
        news_hits: set[str] | None = None,
        sentiment_hits: set[str] | None = None,
        reaction_hits: set[str] | None = None,
    ) -> list[ValidationResult]:
        """Return `ValidationResult` for each asset that meets confirmation criteria.

        Parameters
        ----------
        signals:        All raw signals collected this cycle.
        news_hits:      Asset names confirmed by a news catalyst.
        sentiment_hits: Asset names confirmed by social sentiment.
        reaction_hits:  Asset names confirmed by related market reaction.
        """
        news_hits = news_hits or set()
        sentiment_hits = sentiment_hits or set()
        reaction_hits = reaction_hits or set()

        groups = _group_by_asset(signals)
        results: list[ValidationResult] = []

        for asset, asset_signals in groups.items():
            # Freshness filter
            fresh = [s for s in asset_signals if s.freshness_minutes <= self.max_age_minutes]
            if not fresh:
                continue

            # Source diversity
            sources = {s.source for s in fresh}
            if len(sources) < self.min_sources:
                # Accept single-source if signal is very large (magnitude > 0.5)
                max_mag = max(s.magnitude for s in fresh)
                if max_mag < 0.5:
                    continue

            news_ok = asset in news_hits
            social_ok = asset in sentiment_hits
            reaction_ok = asset in reaction_hits
            count = sum([news_ok, social_ok, reaction_ok])

            result = ValidationResult(
                asset=asset,
                signals=fresh,
                news_catalyst=news_ok,
                social_sentiment=social_ok,
                market_reaction=reaction_ok,
                confirmation_count=count,
            )
            if result.confirmed:
                results.append(result)

        return results

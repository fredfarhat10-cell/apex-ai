"""Advisory-only tracker — produces TrendScores, never orders.

Wire it into a dashboard or use its output as a *bias* passed to the ensemble's
confidence calculation.  It is deliberately NOT a ``SignalStrategy``: the
strategy protocol emits trade directions and plugging sentiment there would
violate the operator-facing contract that "social never triggers trades".
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from .feed import SocialFeed
from .schema import Post, TrendScore
from .scoring import trend_score


class SentimentTracker:
    ADVISORY_ONLY = True  # trip-wire — importers grep for this

    def __init__(self, feed: SocialFeed, lookback_hours: int = 6) -> None:
        self._feed = feed
        self._lookback = timedelta(hours=lookback_hours)
        self._buffer: list[Post] = []
        self._last_fetch: datetime | None = None

    def refresh(self, now: datetime | None = None) -> None:
        now = now or datetime.now(timezone.utc)
        since = self._last_fetch or (now - self._lookback)
        new = self._feed.fetch(since)
        self._buffer.extend(new)
        cutoff = now - self._lookback
        self._buffer = [p for p in self._buffer if p.ts >= cutoff]
        self._last_fetch = now

    def score(self, symbol: str, now: datetime | None = None) -> TrendScore:
        now = now or datetime.now(timezone.utc)
        return trend_score(symbol, list(self._buffer), now)

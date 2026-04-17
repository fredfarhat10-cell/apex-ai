"""Pluggable social feed.

Production use: bring a Reddit or X client, wrap it in a class implementing
``fetch(since)`` → list[Post].  Tests use StubFeed to drive deterministic
scenarios.  Only one platform is wired at a time — more platforms come after
profitability is proven.
"""
from __future__ import annotations

from datetime import datetime
from typing import Protocol

from .schema import Post


class SocialFeed(Protocol):
    """Implementations must be idempotent w.r.t. ``since``: no duplicates."""

    def fetch(self, since: datetime) -> list[Post]:
        ...


class StubFeed:
    """Replay a pre-built list of posts — used by tests and for replay."""

    def __init__(self, posts: list[Post]) -> None:
        self._posts = sorted(posts, key=lambda p: p.ts)

    def fetch(self, since: datetime) -> list[Post]:
        return [p for p in self._posts if p.ts > since]

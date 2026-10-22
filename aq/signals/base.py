"""Interfaces for future external-signal agents (Viral Scout, News Scout, Social Velocity).

NOT implemented tonight. The default providers return an explicit 'unavailable' status — they never
produce placeholder posts, headlines or engagement numbers. See docs/DATA_SOURCES.md for access restrictions.

All text from these sources is UNTRUSTED. It must pass through aq.agents.llm.sanitize_untrusted_text and be
wrapped as <data>, and can never alter system instructions, tools or execution permissions.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class Provenance:
    provider: str                 # e.g. "youtube-data-api-v3"
    retrieved_at: datetime
    access_method: str            # "official API", "licensed feed", ...
    terms_url: str | None = None
    raw_reference: str | None = None  # provider's object id


@dataclass(frozen=True)
class SocialSignal:
    source: str                   # platform
    timestamp: datetime           # when the content was published
    url: str
    author: str
    topic: str
    text_excerpt: str             # sanitized, truncated
    engagement: dict = field(default_factory=dict)  # only metrics the platform legitimately exposes
    confidence: float | None = None  # relevance/attribution confidence, NOT a price prediction
    provenance: Provenance | None = None


@dataclass(frozen=True)
class NewsItem:
    source: str
    published_at: datetime
    url: str
    headline: str
    assets: tuple[str, ...]
    provenance: Provenance | None = None


class SocialSignalProvider(ABC):
    name = "abstract"

    @abstractmethod
    def status(self) -> dict: ...

    @abstractmethod
    def signals(self, topic: str, since: datetime) -> list[SocialSignal]:
        """Must only return items published at or before the decision time (anti-lookahead)."""


class NewsProvider(ABC):
    name = "abstract"

    @abstractmethod
    def status(self) -> dict: ...

    @abstractmethod
    def news(self, asset: str, since: datetime, until: datetime) -> list[NewsItem]: ...


class UnavailableSocialProvider(SocialSignalProvider):
    name = "none"

    def status(self) -> dict:
        return {"available": False, "reason": "No social data provider configured (not implemented in MVP)."}

    def signals(self, topic, since):
        return []


class UnavailableNewsProvider(NewsProvider):
    name = "none"

    def status(self) -> dict:
        return {"available": False, "reason": "No news provider configured — catalysts cannot be assessed."}

    def news(self, asset, since, until):
        return []

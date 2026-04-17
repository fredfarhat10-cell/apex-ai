"""Lightweight social sentiment layer.

Design constraints (deliberate, from the operator):
  - Advisory only — never triggers trades directly.
  - One platform at a time (Reddit OR X).  Adding more comes after P&L.
  - No heavy NLP dependencies — simple keyword/polarity scoring is enough
    to power a 0-100 trend score and an early/mid/hype/decline stage label.
  - Every function is testable without the network.
"""
from .schema import Post, TrendScore, Stage
from .feed import SocialFeed, StubFeed
from .scoring import score_post, trend_score, classify_stage
from .tracker import SentimentTracker

__all__ = [
    "Post", "TrendScore", "Stage",
    "SocialFeed", "StubFeed",
    "score_post", "trend_score", "classify_stage",
    "SentimentTracker",
]

"""Sentiment + velocity + stage + trend score.

Simple polarity scoring — intentionally no ML dependency.  When a better
sentiment model is available later, swap ``score_post`` for it and everything
downstream keeps working.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Iterable

from .schema import Post, Stage, TrendScore


_POS = {
    "moon", "bullish", "pump", "breakout", "long", "buy", "strong", "up",
    "rally", "accumulate", "overweight", "beat", "beats", "soaring", "ath",
    "green", "love", "gem", "alpha",
}
_NEG = {
    "dump", "bearish", "short", "sell", "weak", "down", "crash", "rug",
    "scam", "exit", "red", "capitulate", "bleed", "drop", "liquidated",
    "dead", "rekt",
}
_WORD_RE = re.compile(r"[A-Za-z]+")


def score_post(text: str) -> float:
    """Return sentiment in [-1, 1].

    A plain polarity count normalised by total polarity hits.  Neutral text
    scores 0.  Intentionally symmetric so 50/50 mixed posts don't pretend to
    be signal.
    """
    words = [w.lower() for w in _WORD_RE.findall(text)]
    pos = sum(1 for w in words if w in _POS)
    neg = sum(1 for w in words if w in _NEG)
    total = pos + neg
    if total == 0:
        return 0.0
    return (pos - neg) / total


def _velocity_per_hour(posts: Iterable[Post], window_end: datetime, window_hours: float) -> float:
    cutoff = window_end - timedelta(hours=window_hours)
    n = sum(1 for p in posts if cutoff <= p.ts <= window_end)
    return n / max(window_hours, 1e-9)


def classify_stage(
    velocity_recent: float,
    velocity_prior: float,
    sentiment: float,
) -> Stage:
    """Map a velocity trajectory + sentiment to a lifecycle stage.

    ``recent`` is the last 1h, ``prior`` the preceding 3h average.  Thresholds
    deliberately wide — stage is coarse by design; trying to be precise here
    over-fits noise.
    """
    if velocity_recent < 1.0 and velocity_prior < 1.0:
        return "early"
    ratio = velocity_recent / max(velocity_prior, 0.1)
    if ratio >= 2.5 and sentiment > 0.3:
        return "hype"
    if ratio <= 0.5:
        return "decline"
    return "mid"


def trend_score(
    symbol: str,
    posts: list[Post],
    now: datetime,
) -> TrendScore:
    """Compute a 0-100 trend score for one symbol from a batch of posts.

    Components (each normalised to [0, 1]):
      - sentiment magnitude (neutral centre = 0)
      - recent velocity (saturates at 10 posts/hour)
      - cross-author diversity (1 − dominance of single author)
      - freshness (share of posts within last 30 min)
    """
    posts = [p for p in posts if p.symbol == symbol]
    if not posts:
        return TrendScore(
            symbol=symbol, ts=now, score=0.0, stage="early",
            sentiment_mean=0.0, velocity_per_hour=0.0, post_count=0,
        )

    sentiments = [score_post(p.text) for p in posts]
    sentiment_mean = sum(sentiments) / len(sentiments)

    v_recent = _velocity_per_hour(posts, now, 1.0)
    v_prior = _velocity_per_hour(posts, now - timedelta(hours=1), 3.0)

    authors = {p.author for p in posts}
    top_author_share = max(
        (sum(1 for p in posts if p.author == a) / len(posts) for a in authors),
        default=1.0,
    )
    diversity = 1.0 - top_author_share

    fresh_cutoff = now - timedelta(minutes=30)
    freshness = sum(1 for p in posts if p.ts >= fresh_cutoff) / len(posts)

    sentiment_component = min(abs(sentiment_mean), 1.0)
    velocity_component = min(v_recent / 10.0, 1.0)

    breakdown = {
        "sentiment": round(sentiment_component, 3),
        "velocity": round(velocity_component, 3),
        "diversity": round(diversity, 3),
        "freshness": round(freshness, 3),
    }
    raw = (
        0.35 * sentiment_component
        + 0.30 * velocity_component
        + 0.20 * diversity
        + 0.15 * freshness
    )
    score = round(100.0 * raw, 2)
    stage = classify_stage(v_recent, v_prior, sentiment_mean)

    return TrendScore(
        symbol=symbol,
        ts=now,
        score=score,
        stage=stage,
        sentiment_mean=round(sentiment_mean, 4),
        velocity_per_hour=round(v_recent, 3),
        post_count=len(posts),
        breakdown=breakdown,
    )

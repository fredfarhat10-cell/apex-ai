from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from apex_trader.sentiment import (
    Post, SentimentTracker, StubFeed, TrendScore,
    classify_stage, score_post, trend_score,
)


def _ts(minutes_ago: float, base: datetime | None = None) -> datetime:
    base = base or datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc)
    return base - timedelta(minutes=minutes_ago)


# ── score_post ───────────────────────────────────────────────────────────────

def test_polarity_positive():
    assert score_post("Super bullish breakout, time to long!") > 0.5


def test_polarity_negative():
    assert score_post("Rug dump, sell sell sell this crash") < -0.5


def test_polarity_neutral():
    assert score_post("The chart goes sideways today with no obvious levels") == 0.0


def test_polarity_balanced():
    assert abs(score_post("bullish pump but also dump crash")) < 0.5


# ── classify_stage ───────────────────────────────────────────────────────────

def test_stage_early_on_low_velocity():
    assert classify_stage(velocity_recent=0.3, velocity_prior=0.2, sentiment=0.4) == "early"


def test_stage_hype_on_acceleration_plus_positive():
    assert classify_stage(velocity_recent=10.0, velocity_prior=2.0, sentiment=0.7) == "hype"


def test_stage_decline_on_velocity_collapse():
    assert classify_stage(velocity_recent=1.0, velocity_prior=5.0, sentiment=0.2) == "decline"


def test_stage_mid_default():
    assert classify_stage(velocity_recent=3.0, velocity_prior=2.5, sentiment=0.1) == "mid"


# ── trend_score ──────────────────────────────────────────────────────────────

def test_empty_posts_returns_zero_score():
    now = datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc)
    ts = trend_score("BTCUSDT", [], now)
    assert ts.score == 0.0
    assert ts.stage == "early"


def test_bullish_hype_produces_high_score():
    now = datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc)
    posts = [
        Post("reddit", f"p{i}", f"user_{i % 6}", "Bullish breakout pump, long!", _ts(i, now), 10, "BTCUSDT")
        for i in range(15)
    ]
    # Prior period mostly empty to create velocity acceleration
    ts = trend_score("BTCUSDT", posts, now)
    assert ts.score > 30.0
    assert ts.sentiment_mean > 0.5
    assert ts.velocity_per_hour > 1.0


def test_single_author_kills_diversity_component():
    now = datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc)
    solo = [Post("reddit", f"p{i}", "whale", "bullish", _ts(i, now), 10, "ETHUSDT") for i in range(10)]
    crowd = [Post("reddit", f"q{i}", f"u{i}", "bullish", _ts(i, now), 10, "ETHUSDT") for i in range(10)]
    ts_solo = trend_score("ETHUSDT", solo, now)
    ts_crowd = trend_score("ETHUSDT", crowd, now)
    assert ts_crowd.score > ts_solo.score


def test_trend_score_is_zero_for_other_symbols():
    now = datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc)
    posts = [Post("reddit", "p1", "u", "bullish pump", _ts(5, now), 10, "BTCUSDT")]
    ts = trend_score("ETHUSDT", posts, now)
    assert ts.score == 0.0
    assert ts.post_count == 0


# ── Tracker (advisory-only) ──────────────────────────────────────────────────

def test_tracker_is_advisory_only():
    # Compile-time trip-wire for future contributors: sentiment never triggers trades.
    assert SentimentTracker.ADVISORY_ONLY is True


def test_tracker_refresh_dedupes_and_expires():
    now = datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc)
    p_old = Post("reddit", "old", "u", "bullish", now - timedelta(hours=10), 10, "BTCUSDT")
    p_recent = Post("reddit", "new", "u", "pump", now - timedelta(minutes=10), 10, "BTCUSDT")
    feed = StubFeed([p_old, p_recent])
    tracker = SentimentTracker(feed, lookback_hours=6)
    tracker.refresh(now=now)
    score = tracker.score("BTCUSDT", now=now)
    # Only the recent post should survive the 6-hour lookback window
    assert score.post_count == 1


def test_tracker_score_type_is_trend_score():
    now = datetime(2024, 6, 1, 12, 0, tzinfo=timezone.utc)
    feed = StubFeed([])
    tracker = SentimentTracker(feed)
    result = tracker.score("BTCUSDT", now=now)
    assert isinstance(result, TrendScore)

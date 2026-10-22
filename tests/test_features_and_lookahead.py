from datetime import timedelta

import pytest

from aq.data.base import Candle, closed_only
from aq.features import FEATURE_DOCS, InsufficientData, compute_features, detect_triggers, market_regime
from synthetic import ANCHOR, SyntheticPath


def _candles(n=300, end=ANCHOR, seed=1, segs=((-400, 0.0, 1.0),)):
    p = SyntheticPath(100.0, seed, list(segs))
    return closed_only(p.candles("1h", end - timedelta(hours=n), end), end)


def test_partial_candle_excluded():
    p = SyntheticPath(100.0, 1, [(-400, 0.0, 1.0)])
    now = ANCHOR + timedelta(minutes=30)
    raw = p.candles("1h", now - timedelta(hours=5), now)
    assert raw[-1].open_time == ANCHOR and not raw[-1].is_closed(now)  # forming bar is present in raw data
    closed = closed_only(raw, now)
    assert all(c.close_time <= now for c in closed)
    assert closed[-1].open_time == ANCHOR - timedelta(hours=1)


def test_features_do_not_depend_on_future_candles():
    """Same decision time => identical features, regardless of what happens afterwards."""
    a = SyntheticPath(100.0, 5, [(-400, 0.0, 1.0), (0, 0.05, 3.0)])
    b = SyntheticPath(100.0, 5, [(-400, 0.0, 1.0), (0, -0.05, 3.0)])
    now = ANCHOR + timedelta(minutes=10)
    fa = compute_features(closed_only(a.candles("1h", now - timedelta(hours=300), now + timedelta(hours=48)), now))
    fb = compute_features(closed_only(b.candles("1h", now - timedelta(hours=300), now + timedelta(hours=48)), now))
    assert fa == fb


def test_feature_keys_documented_and_values_sane():
    f = compute_features(_candles())
    assert set(f) <= set(FEATURE_DOCS)
    assert 0 <= f["rsi_14"] <= 100
    assert f["atr_14"] > 0 and f["candles_used"] == 300
    assert f["trend"] in ("uptrend", "downtrend", "mixed")


def test_insufficient_history_raises():
    with pytest.raises(InsufficientData):
        compute_features(_candles(n=100))


def test_rsi_extremes():
    up = [Candle(ANCHOR + timedelta(hours=i), 100 + i, 101 + i, 99 + i, 100 + i + 0.5, 1.0, "1h") for i in range(260)]
    assert compute_features(up)["rsi_14"] == 100.0


def test_regime_and_triggers(settings):
    f = compute_features(_candles(segs=((-400, 0.0, 1.0), (-4, 0.03, 4.0))))
    tr = {t["signal"] for t in detect_triggers(f, settings)}
    assert "price_move" in tr and "volume_anomaly" in tr
    flat = compute_features(_candles(seed=3))
    assert detect_triggers(flat, settings) == [] or all(t["signal"] != "price_move"
                                                        for t in detect_triggers(flat, settings))
    reg = market_regime({"BTC": f, "ETH": flat})
    assert reg["assets_observed"] == 2 and "label" in reg
    assert market_regime({"ETH": flat})["label"].startswith("unknown")

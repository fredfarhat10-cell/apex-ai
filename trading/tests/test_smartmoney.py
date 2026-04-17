from __future__ import annotations

from datetime import datetime, timezone

import pytest

from apex_trader.smartmoney.collectors.polymarket import PolymarketCollector
from apex_trader.smartmoney.collectors.onchain import OnChainCollector
from apex_trader.smartmoney.collectors.stocks import StockVolumeCollector
from apex_trader.smartmoney.signals import SmartMoneySignal
from apex_trader.smartmoney.tracker import SmartMoneyTracker
from apex_trader.smartmoney.validator import MultiSourceValidator


# ── helpers ───────────────────────────────────────────────────────────────────

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _signal(
    source="polymarket",
    signal_type="rapid_odds_shift",
    asset="BTC_will_hit_100k",
    market="prediction_market",
    magnitude=0.12,
    direction="bullish",
    freshness_minutes=10.0,
) -> SmartMoneySignal:
    return SmartMoneySignal(
        source=source,
        signal_type=signal_type,
        asset=asset,
        market=market,
        magnitude=magnitude,
        direction=direction,
        timestamp=_now(),
        freshness_minutes=freshness_minutes,
        raw_detail=f"{source} signal on {asset}",
    )


# ── SmartMoneySignal ──────────────────────────────────────────────────────────

def test_signal_freshness():
    fresh = _signal(freshness_minutes=30.0)
    stale = _signal(freshness_minutes=90.0)
    assert fresh.is_fresh
    assert not stale.is_fresh


# ── MultiSourceValidator ──────────────────────────────────────────────────────

def test_validator_requires_two_confirmations():
    validator = MultiSourceValidator(min_confirmations=2, min_sources=1)
    sigs = [_signal(asset="ASSET_A")]
    # Zero confirmations → not validated
    results = validator.validate(sigs)
    assert results == []

    # One confirmation → still not enough
    results = validator.validate(sigs, news_hits={"ASSET_A"})
    assert results == []

    # Two confirmations → passes
    results = validator.validate(sigs, news_hits={"ASSET_A"}, sentiment_hits={"ASSET_A"})
    assert len(results) == 1
    assert results[0].confirmed


def test_validator_rejects_stale_signals():
    validator = MultiSourceValidator(max_age_minutes=30.0, min_confirmations=2, min_sources=1)
    stale = _signal(asset="OLD_MARKET", freshness_minutes=90.0)
    results = validator.validate(
        [stale], news_hits={"OLD_MARKET"}, sentiment_hits={"OLD_MARKET"}
    )
    assert results == []


def test_validator_requires_two_distinct_sources_or_high_magnitude():
    validator = MultiSourceValidator(min_confirmations=2, min_sources=2)
    # Single source, low magnitude → rejected
    sigs = [_signal(source="polymarket", asset="X", magnitude=0.1)]
    results = validator.validate(sigs, news_hits={"X"}, sentiment_hits={"X"})
    assert results == []

    # Single source, high magnitude → accepted despite one source
    sigs_big = [_signal(source="polymarket", asset="X", magnitude=0.8)]
    results = validator.validate(sigs_big, news_hits={"X"}, sentiment_hits={"X"})
    assert len(results) == 1


def test_validator_groups_signals_by_asset():
    validator = MultiSourceValidator(min_confirmations=2, min_sources=1)
    sigs = [
        _signal(source="polymarket", asset="A", freshness_minutes=5.0),
        _signal(source="onchain", asset="A", freshness_minutes=10.0),
        _signal(source="stocks", asset="B", freshness_minutes=5.0),
    ]
    results = validator.validate(sigs, news_hits={"A", "B"}, sentiment_hits={"A"})
    assets = {r.asset for r in results}
    assert "A" in assets  # 2 confirmations (news + sentiment)
    assert "B" not in assets  # only 1 confirmation (news only)


# ── PolymarketCollector ───────────────────────────────────────────────────────

def _poly_response():
    return [
        {
            "question": "Will BTC hit $100k by end of year?",
            "slug": "btc-100k",
            "outcomes": [
                {
                    "priceHistory": [
                        {"price": "0.40", "t": "1700000000"},
                        {"price": "0.55", "t": "1700001000"},  # +15pp shift
                    ]
                }
            ],
        }
    ]


def test_polymarket_collector_detects_odds_shift():
    def mock_get(url, params=None):
        return _poly_response()

    collector = PolymarketCollector(http_get=mock_get, min_shift_pct=5.0)
    signals = collector.collect()
    assert len(signals) == 1
    sig = signals[0]
    assert sig.source == "polymarket"
    assert sig.signal_type == "rapid_odds_shift"
    assert sig.magnitude == pytest.approx(0.15, abs=0.01)
    assert sig.direction == "bullish"


def test_polymarket_collector_skips_small_shifts():
    def mock_get(url, params=None):
        return [
            {
                "question": "Small shift market",
                "outcomes": [
                    {
                        "priceHistory": [
                            {"price": "0.50"},
                            {"price": "0.51"},  # only 1pp
                        ]
                    }
                ],
            }
        ]

    collector = PolymarketCollector(http_get=mock_get, min_shift_pct=5.0)
    assert collector.collect() == []


def test_polymarket_collector_handles_api_error():
    def mock_get(url, params=None):
        raise ConnectionError("network down")

    collector = PolymarketCollector(http_get=mock_get)
    assert collector.collect() == []


# ── OnChainCollector ──────────────────────────────────────────────────────────

def _etherscan_response():
    return {
        "result": [
            {
                "value": str(int(2e24)),  # 2e6 tokens with 18 decimals = 2 million
                "tokenDecimal": "18",
                "timeStamp": "1700000000",
                "tokenSymbol": "USDC",
            }
        ]
    }


def test_onchain_collector_detects_whale_transfer():
    def mock_get(url, params=None):
        return _etherscan_response()

    collector = OnChainCollector(
        http_get=mock_get, whale_threshold_usd=500_000
    )
    signals = collector.collect(["0xcontract"])
    assert len(signals) >= 1
    assert signals[0].source == "onchain"
    assert signals[0].signal_type == "large_wallet_transfer"


def test_onchain_collector_skips_small_transfer():
    def mock_get(url, params=None):
        return {
            "result": [
                {
                    "value": str(int(1e18)),  # 1 token
                    "tokenDecimal": "18",
                    "timeStamp": "1700000000",
                }
            ]
        }

    collector = OnChainCollector(http_get=mock_get, whale_threshold_usd=1_000_000)
    signals = collector.collect(["0xcontract"])
    assert signals == []


# ── StockVolumeCollector ──────────────────────────────────────────────────────

def _av_response(symbol: str = "NVDA", vol_ratio: float = 5.0):
    import datetime as dt

    base_vol = 10_000_000
    today = dt.date.today().isoformat()
    time_series: dict = {
        today: {
            "4. close": "500.00",
            "5. volume": str(int(base_vol * vol_ratio)),
        }
    }
    for i in range(1, 21):
        d = (dt.date.today() - dt.timedelta(days=i)).isoformat()
        time_series[d] = {"4. close": "490.00", "5. volume": str(base_vol)}
    return {"Time Series (Daily)": time_series}


def test_stock_collector_detects_unusual_volume():
    def mock_get(url, params=None):
        return _av_response("NVDA", vol_ratio=5.0)

    collector = StockVolumeCollector(http_get=mock_get, min_volume_ratio=3.0)
    signals = collector.collect(["NVDA"])
    assert len(signals) == 1
    assert signals[0].source == "stocks"
    assert signals[0].signal_type == "unusual_volume"
    assert signals[0].asset == "NVDA"


def test_stock_collector_ignores_normal_volume():
    def mock_get(url, params=None):
        return _av_response("AAPL", vol_ratio=1.2)

    collector = StockVolumeCollector(http_get=mock_get, min_volume_ratio=3.0)
    signals = collector.collect(["AAPL"])
    assert signals == []


# ── SmartMoneyTracker (integration) ───────────────────────────────────────────

def _make_tracker(signals: list[SmartMoneySignal]) -> SmartMoneyTracker:
    """Tracker with all collectors replaced by mocks that return `signals`."""
    from apex_trader.smartmoney.collectors.polymarket import PolymarketCollector
    from apex_trader.smartmoney.collectors.onchain import OnChainCollector
    from apex_trader.smartmoney.collectors.stocks import StockVolumeCollector

    class _MockCollector:
        def __init__(self, sigs):
            self._sigs = sigs

        def collect(self, *args, **kwargs):
            return self._sigs

    poly = PolymarketCollector.__new__(PolymarketCollector)
    poly.collect = lambda limit=50: [s for s in signals if s.source == "polymarket"]
    onchain = OnChainCollector.__new__(OnChainCollector)
    onchain.collect = lambda contracts=None: [s for s in signals if s.source == "onchain"]
    stocks = StockVolumeCollector.__new__(StockVolumeCollector)
    stocks.collect = lambda syms: [s for s in signals if s.source == "stocks"]

    return SmartMoneyTracker(
        polymarket=poly,
        onchain=onchain,
        stocks=stocks,
        validator=MultiSourceValidator(min_confirmations=2, min_sources=1),
        min_rr=2.0,
    )


def test_tracker_returns_opportunity_with_enough_confirmations():
    sigs = [
        _signal(source="polymarket", asset="BTC_100k", market="prediction_market",
                magnitude=0.20, freshness_minutes=5.0),
    ]
    tracker = _make_tracker(sigs)
    result = tracker.scan(
        news_hits={"BTC_100k"},
        sentiment_hits={"BTC_100k"},
    )
    assert len(result.opportunities) == 1
    opp = result.opportunities[0]
    assert opp.asset == "BTC_100k"
    assert opp.confidence > 0


def test_tracker_filters_stale_signals():
    sigs = [
        _signal(asset="OLD_SIGNAL", magnitude=0.30, freshness_minutes=120.0),
    ]
    tracker = _make_tracker(sigs)
    result = tracker.scan(
        news_hits={"OLD_SIGNAL"},
        sentiment_hits={"OLD_SIGNAL"},
    )
    assert result.opportunities == []


def test_tracker_returns_empty_when_no_signals():
    tracker = _make_tracker([])
    result = tracker.scan()
    assert result.opportunities == []


def test_tracker_top_sorts_by_ev():
    sigs = [
        _signal(asset="HIGH_EV", magnitude=0.8, freshness_minutes=5.0),
        _signal(asset="LOW_EV", magnitude=0.1, freshness_minutes=5.0),
    ]
    tracker = _make_tracker(sigs)
    result = tracker.scan(
        news_hits={"HIGH_EV", "LOW_EV"},
        sentiment_hits={"HIGH_EV", "LOW_EV"},
    )
    top = result.top(2)
    if len(top) >= 2:
        assert top[0].expected_value >= top[1].expected_value

import sys
from dataclasses import replace
from datetime import timedelta
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from aq.clock import FixedClock  # noqa: E402
from aq.config import Settings  # noqa: E402
from aq.data.service import MarketDataService  # noqa: E402
from aq.db import Database  # noqa: E402
from aq.engine import Engine  # noqa: E402
from synthetic import ANCHOR, SyntheticPath, SyntheticProvider  # noqa: E402


@pytest.fixture
def settings():
    return replace(Settings(), db_path=":memory:", universe=("BTC", "ETH", "SOL"), anthropic_api_key_present=False)


def make_paths(after_drift: float):
    """ETH: clean momentum setup at ANCHOR (seed 9); after ANCHOR, drift `after_drift` per hour."""
    return {
        "BTC": SyntheticPath(50_000.0, 101, [(-400, 0.0002, 1.0), (0, 0.0, 1.0)]),
        "ETH": SyntheticPath(3_000.0, 9, [(-400, 0.0002, 1.0), (-120, 0.0012, 1.0), (-24, 0.0012, 1.6),
                                          (0, after_drift, 1.0)]),
        "SOL": SyntheticPath(150.0, 3, [(-400, 0.0, 1.0)]),
    }


@pytest.fixture
def make_engine(settings):
    def _make(after_drift=0.004, fail=False, **overrides):
        s = replace(settings, **overrides)
        clock = FixedClock(ANCHOR + timedelta(minutes=2))
        provider = SyntheticProvider(make_paths(after_drift), clock, fail=fail)
        market = MarketDataService([provider], s.universe, cache_ttl_s=0)
        return Engine(s, Database(":memory:"), market, clock=clock), clock, provider
    return _make

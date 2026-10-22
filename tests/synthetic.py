"""TEST-ONLY deterministic synthetic market data.

This module exists solely so unit/integration tests can exercise the pipeline offline with a known price
path. It is never imported by the application and is never registered as a provider. The application only
uses real providers (aq/data/coinbase.py, aq/data/binance.py).
"""
from __future__ import annotations

import math
import random
from datetime import datetime, timedelta, timezone

from aq.data.base import INTERVAL_SECONDS, Candle, DataUnavailable, FxQuote, MarketDataProvider, PriceQuote

ANCHOR = datetime(2026, 1, 10, 12, 0, tzinfo=timezone.utc)


class SyntheticPath:
    """5-minute log-price path. segments: list of (start_offset_hours_from_anchor, drift_per_hour, vol_mult)."""

    def __init__(self, base: float, seed: int, segments, sigma_per_hour=0.005, start_hours=-400, end_hours=200):
        rng = random.Random(seed)
        self.t0 = ANCHOR + timedelta(hours=start_hours)
        n = (end_hours - start_hours) * 12
        self.prices = []
        lp = math.log(base)
        segs = sorted(segments)
        for k in range(n):
            h = start_hours + k / 12
            drift, vm = 0.0, 1.0
            for s0, d, v in segs:
                if h >= s0:
                    drift, vm = d, v
            o = lp
            lp += drift / 12 + rng.gauss(0, sigma_per_hour / math.sqrt(12))
            hi = max(o, lp) + abs(rng.gauss(0, sigma_per_hour / 30))
            lo = min(o, lp) - abs(rng.gauss(0, sigma_per_hour / 30))
            self.prices.append((math.exp(o), math.exp(hi), math.exp(lo), math.exp(lp), 10.0 * vm))

    def candles(self, interval: str, start: datetime, end: datetime) -> list[Candle]:
        step = INTERVAL_SECONDS[interval] // 300
        out = []
        k0 = max(0, int((start - self.t0).total_seconds() // 300) // step * step)
        k1 = min(len(self.prices), int((end - self.t0).total_seconds() // 300) + 1)
        for k in range(k0, k1, step):
            chunk = self.prices[k:k + step]
            if not chunk:
                break
            t = self.t0 + timedelta(seconds=300 * k)
            if t > end:
                break
            # Include only 5m sub-bars that have started by `end` (mimics a forming bar).
            n_started = min(len(chunk), int((end - t).total_seconds() // 300) + 1)
            chunk = chunk[:n_started]
            out.append(Candle(t, chunk[0][0], max(c[1] for c in chunk), min(c[2] for c in chunk), chunk[-1][3],
                              sum(c[4] for c in chunk), interval))
        return out

    def price_at(self, t: datetime) -> float:
        k = int((t - self.t0).total_seconds() // 300)
        return self.prices[min(max(k, 0), len(self.prices) - 1)][0]


class SyntheticProvider(MarketDataProvider):
    name = "synthetic-test"

    def __init__(self, paths: dict[str, SyntheticPath], clock, fx: float = 1.25, fail: bool = False):
        self.paths, self.clock, self.fx, self.fail = paths, clock, fx, fail

    def supported_assets(self, assets):
        if self.fail:
            raise DataUnavailable("synthetic outage")
        return {a: a for a in assets if a in self.paths}

    def get_candles(self, asset, interval, start=None, end=None, limit=300):
        if self.fail:
            raise DataUnavailable("synthetic outage")
        end = min(end or self.clock.now(), self.clock.now())
        start = start or end - timedelta(seconds=INTERVAL_SECONDS[interval] * limit)
        return self.paths[asset].candles(interval, start, end)

    def get_spot_price(self, asset):
        if self.fail:
            raise DataUnavailable("synthetic outage")
        return PriceQuote(asset, self.paths[asset].price_at(self.clock.now()), self.clock.now(), self.name)

    def get_fx_usd_per_gbp(self):
        if self.fail:
            raise DataUnavailable("synthetic outage")
        return FxQuote(self.fx, self.clock.now(), self.name)

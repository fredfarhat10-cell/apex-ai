from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from ..signals import SmartMoneySignal

log = logging.getLogger(__name__)

# Polymarket Gamma API base — public, no auth required
_GAMMA_BASE = "https://gamma-api.polymarket.com"
_CLOB_BASE = "https://clob.polymarket.com"

# Minimum absolute odds shift (percentage points) to qualify as a signal
_MIN_SHIFT_PCT = 5.0
# Minimum volume surge multiplier vs rolling average
_MIN_VOL_RATIO = 2.0


def _get(url: str, params: dict | None = None) -> Any:
    import urllib.request
    import urllib.parse
    import json as _json

    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=10) as resp:
        return _json.loads(resp.read())


class PolymarketCollector:
    """Polls Polymarket Gamma + CLOB APIs for sudden odds shifts.

    In test/offline mode inject `_http_get` to avoid real network calls.
    """

    def __init__(self, http_get: Any = None, min_shift_pct: float = _MIN_SHIFT_PCT) -> None:
        self._get = http_get or _get
        self.min_shift_pct = min_shift_pct

    def collect(self, limit: int = 50) -> list[SmartMoneySignal]:
        """Return signals for markets with recent odds shifts > min_shift_pct."""
        signals: list[SmartMoneySignal] = []
        try:
            markets = self._get(f"{_GAMMA_BASE}/markets", {"limit": limit, "active": "true"})
        except Exception as exc:
            log.warning("Polymarket Gamma fetch failed: %s", exc)
            return signals

        now = datetime.now(timezone.utc)
        for mkt in markets if isinstance(markets, list) else markets.get("markets", []):
            try:
                signals.extend(self._analyse_market(mkt, now))
            except Exception as exc:
                log.debug("Market analysis error: %s", exc)

        return signals

    def _analyse_market(self, mkt: dict, now: datetime) -> list[SmartMoneySignal]:
        outcomes: list[dict] = mkt.get("outcomes", [])
        if not outcomes:
            return []

        signals: list[SmartMoneySignal] = []
        question = mkt.get("question", mkt.get("slug", "unknown"))

        for outcome in outcomes:
            price_history: list[dict] = outcome.get("priceHistory", [])
            if len(price_history) < 2:
                continue

            # Most recent and prior price
            latest = price_history[-1]
            prior = price_history[-2]
            p_now = float(latest.get("price", 0))
            p_prev = float(prior.get("price", 0))
            shift = abs(p_now - p_prev) * 100  # to percentage points

            if shift < self.min_shift_pct:
                continue

            # Estimate freshness from timestamp field if present
            ts_raw = latest.get("t") or latest.get("timestamp")
            if ts_raw:
                try:
                    event_ts = datetime.fromtimestamp(float(ts_raw), tz=timezone.utc)
                    freshness = (now - event_ts).total_seconds() / 60
                except Exception:
                    freshness = 0.0
            else:
                freshness = 0.0

            direction = "bullish" if p_now > p_prev else "bearish"
            signals.append(
                SmartMoneySignal(
                    source="polymarket",
                    signal_type="rapid_odds_shift",
                    asset=question,
                    market="prediction_market",
                    magnitude=shift / 100,
                    direction=direction,
                    timestamp=now,
                    freshness_minutes=freshness,
                    raw_detail=f"{question} shifted {shift:.1f}pp → {p_now:.2f}",
                )
            )
        return signals

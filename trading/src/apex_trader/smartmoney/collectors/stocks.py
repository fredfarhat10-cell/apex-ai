from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from ..signals import SmartMoneySignal

log = logging.getLogger(__name__)

# Volume ratio threshold: today's volume / 20-day average
_MIN_VOLUME_RATIO = 3.0
# Alpha Vantage endpoint (free tier: 25 req/day)
_AV_BASE = "https://www.alphavantage.co/query"


def _get(url: str, params: dict | None = None) -> Any:
    import json as _json
    import urllib.parse
    import urllib.request

    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=10) as resp:
        return _json.loads(resp.read())


class StockVolumeCollector:
    """Flags unusual stock volume (volume > N× 20-day average).

    Uses Alpha Vantage TIME_SERIES_DAILY (free, no auth for demo).
    Inject `http_get` in tests to avoid real network calls.
    """

    def __init__(
        self,
        http_get: Any = None,
        api_key: str = "demo",
        min_volume_ratio: float = _MIN_VOLUME_RATIO,
    ) -> None:
        self._get = http_get or _get
        self._api_key = api_key
        self.min_volume_ratio = min_volume_ratio

    def collect(self, symbols: list[str]) -> list[SmartMoneySignal]:
        signals: list[SmartMoneySignal] = []
        for sym in symbols:
            try:
                signals.extend(self._check_symbol(sym))
            except Exception as exc:
                log.warning("Stock volume check failed for %s: %s", sym, exc)
        return signals

    def _check_symbol(self, symbol: str) -> list[SmartMoneySignal]:
        data = self._get(
            _AV_BASE,
            {
                "function": "TIME_SERIES_DAILY",
                "symbol": symbol,
                "outputsize": "compact",
                "apikey": self._api_key,
            },
        )
        ts_data: dict = data.get("Time Series (Daily)", {})
        if not ts_data:
            return []

        dates = sorted(ts_data.keys(), reverse=True)
        if len(dates) < 21:
            return []

        today_date = dates[0]
        today = ts_data[today_date]
        today_vol = float(today.get("5. volume", 0))
        avg_vol = sum(float(ts_data[d].get("5. volume", 0)) for d in dates[1:21]) / 20

        if avg_vol <= 0 or today_vol / avg_vol < self.min_volume_ratio:
            return []

        close = float(today.get("4. close", 0))
        prev_close = float(ts_data[dates[1]].get("4. close", close))
        direction = "bullish" if close >= prev_close else "bearish"
        ratio = today_vol / avg_vol
        now = datetime.now(timezone.utc)

        return [
            SmartMoneySignal(
                source="stocks",
                signal_type="unusual_volume",
                asset=symbol,
                market="stock",
                magnitude=min((ratio - 1.0) / 9.0, 1.0),  # normalise 10× → 1.0
                direction=direction,
                timestamp=now,
                freshness_minutes=0.0,  # daily data — always "today"
                raw_detail=f"{symbol} volume {ratio:.1f}× average, close={close:.2f}",
            )
        ]

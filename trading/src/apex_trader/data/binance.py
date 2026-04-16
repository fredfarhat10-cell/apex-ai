from __future__ import annotations

import time
from dataclasses import dataclass

import pandas as pd
import requests

_BINANCE_BASE = "https://api.binance.com"
_MAX_LIMIT = 1000

_INTERVAL_MS = {
    "1m": 60_000, "3m": 180_000, "5m": 300_000, "15m": 900_000, "30m": 1_800_000,
    "1h": 3_600_000, "2h": 7_200_000, "4h": 14_400_000, "6h": 21_600_000,
    "8h": 28_800_000, "12h": 43_200_000, "1d": 86_400_000, "3d": 259_200_000,
    "1w": 604_800_000,
}


@dataclass
class BinanceClient:
    base_url: str = _BINANCE_BASE
    timeout: float = 10.0
    session: requests.Session | None = None

    def _get(self, path: str, params: dict) -> list | dict:
        s = self.session or requests
        r = s.get(f"{self.base_url}{path}", params=params, timeout=self.timeout)
        r.raise_for_status()
        return r.json()

    def klines(self, symbol: str, interval: str, start_ms: int, end_ms: int) -> list[list]:
        if interval not in _INTERVAL_MS:
            raise ValueError(f"Unsupported interval: {interval}")
        step = _INTERVAL_MS[interval] * _MAX_LIMIT
        out: list[list] = []
        cursor = start_ms
        while cursor < end_ms:
            chunk = self._get(
                "/api/v3/klines",
                {
                    "symbol": symbol,
                    "interval": interval,
                    "startTime": cursor,
                    "endTime": min(cursor + step, end_ms),
                    "limit": _MAX_LIMIT,
                },
            )
            if not chunk:
                break
            out.extend(chunk)
            last_open = chunk[-1][0]
            next_cursor = last_open + _INTERVAL_MS[interval]
            if next_cursor <= cursor:
                break
            cursor = next_cursor
            time.sleep(0.05)
        return out


def fetch_klines(
    symbol: str,
    interval: str,
    days: int,
    client: BinanceClient | None = None,
    end_ms: int | None = None,
) -> pd.DataFrame:
    """Fetch historical klines as a DataFrame indexed by UTC timestamp."""
    c = client or BinanceClient()
    end = end_ms if end_ms is not None else int(time.time() * 1000)
    start = end - days * 86_400_000
    raw = c.klines(symbol, interval, start, end)
    cols = [
        "open_time", "open", "high", "low", "close", "volume",
        "close_time", "quote_volume", "trades",
        "taker_buy_base", "taker_buy_quote", "ignore",
    ]
    df = pd.DataFrame(raw, columns=cols)
    if df.empty:
        return df
    df["timestamp"] = pd.to_datetime(df["open_time"], unit="ms", utc=True)
    for c_ in ("open", "high", "low", "close", "volume"):
        df[c_] = df[c_].astype(float)
    df = df[["timestamp", "open", "high", "low", "close", "volume"]].set_index("timestamp")
    df = df[~df.index.duplicated(keep="first")].sort_index()
    return df

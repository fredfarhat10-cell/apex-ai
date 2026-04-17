from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd

from config import TRADING


@dataclass
class MarketSnapshot:
    symbol: str
    timeframe: str
    ohlcv: pd.DataFrame  # columns: open, high, low, close, volume; DatetimeIndex UTC
    regime: str = "unknown"

    @property
    def closes(self) -> list[float]:
        return self.ohlcv["close"].tolist()

    @property
    def last_price(self) -> float:
        return float(self.ohlcv["close"].iloc[-1])

    @property
    def last_volume(self) -> float:
        return float(self.ohlcv["volume"].iloc[-1])

    @property
    def avg_volume(self) -> float:
        return float(self.ohlcv["volume"].tail(20).mean())


def _ccxt_to_df(raw: list[list[Any]]) -> pd.DataFrame:
    df = pd.DataFrame(raw, columns=["ts", "open", "high", "low", "close", "volume"])
    df.index = pd.to_datetime(df["ts"], unit="ms", utc=True)
    return df.drop(columns=["ts"]).astype(float)


class LiveDataFeed:
    """Thin wrapper around ccxt for live data. Skipped in paper/test mode."""

    def __init__(self, exchange_id: str = "binance") -> None:
        import ccxt  # optional — only needed for live operation
        cls = getattr(ccxt, exchange_id)
        self._exchange = cls({
            "apiKey": "",
            "secret": "",
            "enableRateLimit": True,
        })

    def fetch(self, symbol: str, timeframe: str = "1h", limit: int = 200) -> pd.DataFrame:
        raw = self._exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
        return _ccxt_to_df(raw)

    def fetch_snapshot(self, symbol: str) -> MarketSnapshot:
        from risk import detect_regime
        df = self.fetch(symbol, TRADING["timeframe"], TRADING["lookback_bars"])
        regime = detect_regime(df["close"].tolist())
        return MarketSnapshot(symbol=symbol, timeframe=TRADING["timeframe"], ohlcv=df, regime=regime)


class SyntheticDataFeed:
    """Deterministic synthetic data for offline testing."""

    def __init__(self, seed: int = 42) -> None:
        self._rng = np.random.default_rng(seed)

    def fetch_snapshot(self, symbol: str, n: int = 200) -> MarketSnapshot:
        from risk import detect_regime
        drift = self._rng.choice([-0.0002, 0.0, 0.0003])
        sigma = 0.012
        log_ret = self._rng.normal(drift, sigma, n)
        closes = np.exp(np.cumsum(log_ret) + np.log(100.0))
        idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
        df = pd.DataFrame({
            "open": closes * (1 - 0.001),
            "high": closes * (1 + 0.005),
            "low": closes * (1 - 0.005),
            "close": closes,
            "volume": self._rng.uniform(500, 2000, n),
        }, index=idx)
        regime = detect_regime(df["close"].tolist())
        return MarketSnapshot(symbol=symbol, timeframe="1h", ohlcv=df, regime=regime)

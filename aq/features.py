"""Deterministic quantitative features. The LLM interprets these; it never computes or invents them.

All features are computed from *closed* 1h candles only (anti-lookahead).
Every feature key is documented in FEATURE_DOCS so evidence citations can be validated.
"""
from __future__ import annotations

import math
import statistics
from datetime import datetime

from aq.data.base import Candle

FEATURE_DOCS = {
    "last_close": "Close of the most recent fully closed 1h candle (USD)",
    "ret_1h_pct": "Return over the last 1 closed hour (%)",
    "ret_4h_pct": "Return over the last 4 closed hours (%)",
    "ret_24h_pct": "Return over the last 24 closed hours (%)",
    "ret_72h_pct": "Return over the last 72 closed hours (%)",
    "z_4h": "4h return divided by (7d hourly return stdev x sqrt(4)) — momentum significance",
    "z_24h": "24h return divided by (7d hourly return stdev x sqrt(24))",
    "volume_24h": "Base-asset volume over the last 24 closed hours",
    "volume_ratio_24h": "Last-24h volume / mean daily volume over the prior 7 days",
    "volume_ratio_4h": "Last-4h volume / median 4h-block volume over the prior 7 days",
    "hourly_vol_24h_pct": "Stdev of hourly log returns over the last 24h (%)",
    "hourly_vol_7d_pct": "Stdev of hourly log returns over the last 7 days (%)",
    "vol_regime_ratio": "hourly_vol_24h / hourly_vol_7d (>1 = volatility expanding)",
    "atr_14": "Average true range, 14 x 1h (USD)",
    "atr_pct": "ATR(14) as % of last close",
    "sma_20": "Simple moving average of last 20 hourly closes",
    "sma_50": "Simple moving average of last 50 hourly closes",
    "sma_200": "Simple moving average of last 200 hourly closes",
    "dist_sma20_atr": "(close - SMA20) / ATR — extension from short-term mean",
    "pct_vs_sma50": "Close vs SMA50 (%)",
    "pct_vs_sma200": "Close vs SMA200 (%)",
    "trend": "uptrend (close>SMA50>SMA200) / downtrend (close<SMA50<SMA200) / mixed",
    "rsi_14": "Wilder RSI(14) on hourly closes",
    "high_72h_prior": "Highest high of the 72 hours before the last closed candle",
    "low_72h_prior": "Lowest low of the 72 hours before the last closed candle",
    "range_breakout": "up if last close > prior 72h high, down if < prior 72h low, else none",
    "rel_perf_vs_btc_24h_pct": "Asset 24h return minus BTC 24h return (percentage points)",
    "rel_perf_vs_btc_72h_pct": "Asset 72h return minus BTC 72h return (percentage points)",
    "candles_used": "Number of closed 1h candles used",
    "last_closed_candle_at": "Open time of the last closed 1h candle (UTC)",
}

MIN_CANDLES = 200 + 1


class InsufficientData(Exception):
    pass


def _ret(closes: list[float], n: int) -> float:
    return (closes[-1] / closes[-1 - n] - 1) * 100


def _sma(xs: list[float], n: int) -> float:
    return sum(xs[-n:]) / n


def _rsi(closes: list[float], n: int = 14) -> float:
    gains, losses = [], []
    for a, b in zip(closes[:-1], closes[1:]):
        d = b - a
        gains.append(max(d, 0.0))
        losses.append(max(-d, 0.0))
    avg_g = sum(gains[:n]) / n
    avg_l = sum(losses[:n]) / n
    for g, l in zip(gains[n:], losses[n:]):
        avg_g = (avg_g * (n - 1) + g) / n
        avg_l = (avg_l * (n - 1) + l) / n
    if avg_l == 0:
        return 100.0
    rs = avg_g / avg_l
    return 100 - 100 / (1 + rs)


def _atr(candles: list[Candle], n: int = 14) -> float:
    trs = []
    for prev, c in zip(candles[:-1], candles[1:]):
        trs.append(max(c.high - c.low, abs(c.high - prev.close), abs(c.low - prev.close)))
    atr = sum(trs[:n]) / n
    for tr in trs[n:]:
        atr = (atr * (n - 1) + tr) / n
    return atr


def _stdev_logret(closes: list[float]) -> float:
    rets = [math.log(b / a) for a, b in zip(closes[:-1], closes[1:]) if a > 0 and b > 0]
    return statistics.pstdev(rets) * 100 if len(rets) > 1 else 0.0


def compute_features(candles: list[Candle], btc_candles: list[Candle] | None = None) -> dict:
    """candles: closed 1h candles, ascending. Raises InsufficientData if history is too short."""
    if len(candles) < MIN_CANDLES:
        raise InsufficientData(f"need >= {MIN_CANDLES} closed 1h candles, have {len(candles)}")
    closes = [c.close for c in candles]
    vols = [c.volume for c in candles]
    last = candles[-1]

    hv7 = _stdev_logret(closes[-169:])
    hv24 = _stdev_logret(closes[-25:])
    r4, r24, r72 = _ret(closes, 4), _ret(closes, 24), _ret(closes, 72)
    z4 = r4 / (hv7 * math.sqrt(4)) if hv7 > 0 else 0.0
    z24 = r24 / (hv7 * math.sqrt(24)) if hv7 > 0 else 0.0

    vol24 = sum(vols[-24:])
    prior = vols[-24 - 168:-24]
    base_daily = (sum(prior) / len(prior) * 24) if prior else 0.0
    blocks = [sum(vols[i:i + 4]) for i in range(len(vols) - 4 - 168, len(vols) - 4, 4)]
    blocks = [b for b in blocks if b >= 0]
    med4 = statistics.median(blocks) if blocks else 0.0

    atr = _atr(candles[-100:])
    sma20, sma50, sma200 = _sma(closes, 20), _sma(closes, 50), _sma(closes, 200)
    if last.close > sma50 > sma200:
        trend = "uptrend"
    elif last.close < sma50 < sma200:
        trend = "downtrend"
    else:
        trend = "mixed"

    window = candles[-73:-1]
    hi72, lo72 = max(c.high for c in window), min(c.low for c in window)
    breakout = "up" if last.close > hi72 else "down" if last.close < lo72 else "none"

    f = {
        "last_close": last.close,
        "ret_1h_pct": _ret(closes, 1), "ret_4h_pct": r4, "ret_24h_pct": r24, "ret_72h_pct": r72,
        "z_4h": z4, "z_24h": z24,
        "volume_24h": vol24,
        "volume_ratio_24h": vol24 / base_daily if base_daily > 0 else None,
        "volume_ratio_4h": sum(vols[-4:]) / med4 if med4 > 0 else None,
        "hourly_vol_24h_pct": hv24, "hourly_vol_7d_pct": hv7,
        "vol_regime_ratio": hv24 / hv7 if hv7 > 0 else None,
        "atr_14": atr, "atr_pct": atr / last.close * 100,
        "sma_20": sma20, "sma_50": sma50, "sma_200": sma200,
        "dist_sma20_atr": (last.close - sma20) / atr if atr > 0 else 0.0,
        "pct_vs_sma50": (last.close / sma50 - 1) * 100, "pct_vs_sma200": (last.close / sma200 - 1) * 100,
        "trend": trend,
        "rsi_14": _rsi(closes[-150:]),
        "high_72h_prior": hi72, "low_72h_prior": lo72, "range_breakout": breakout,
        "rel_perf_vs_btc_24h_pct": None, "rel_perf_vs_btc_72h_pct": None,
        "candles_used": len(candles),
        "last_closed_candle_at": last.open_time.isoformat(),
    }
    if btc_candles and len(btc_candles) > 73:
        bc = {c.open_time: c.close for c in btc_candles}
        # Align on identical timestamps to avoid comparing different windows.
        if last.open_time in bc:
            times = [c.open_time for c in candles]
            try:
                b_now = bc[times[-1]]
                f["rel_perf_vs_btc_24h_pct"] = r24 - (b_now / bc[times[-25]] - 1) * 100
                f["rel_perf_vs_btc_72h_pct"] = r72 - (b_now / bc[times[-73]] - 1) * 100
            except KeyError:
                pass
    return {k: (round(v, 6) if isinstance(v, float) else v) for k, v in f.items()}


def market_regime(features_by_asset: dict[str, dict]) -> dict:
    """Deterministic market-regime label from BTC features + cross-asset breadth."""
    btc = features_by_asset.get("BTC")
    n = len(features_by_asset)
    up = sum(1 for f in features_by_asset.values() if (f.get("ret_24h_pct") or 0) > 0)
    out = {"assets_observed": n, "breadth_up_24h": up,
           "breadth_up_24h_pct": round(up / n * 100, 1) if n else None,
           "btc_trend": btc.get("trend") if btc else None,
           "btc_ret_24h_pct": btc.get("ret_24h_pct") if btc else None,
           "btc_vol_regime_ratio": btc.get("vol_regime_ratio") if btc else None}
    if not btc:
        out["label"] = "unknown (BTC data unavailable)"
    elif (btc.get("vol_regime_ratio") or 0) >= 2.0:
        out["label"] = "high-volatility"
    elif btc["trend"] == "uptrend" and up >= n / 2:
        out["label"] = "risk-on trend"
    elif btc["trend"] == "downtrend" and up <= n / 2:
        out["label"] = "risk-off trend"
    else:
        out["label"] = "range / mixed"
    return out


def detect_triggers(f: dict, s) -> list[dict]:
    """Cheap deterministic filters deciding whether an (LLM-costing) investigation is warranted."""
    trig = []
    if abs(f.get("z_4h") or 0) >= s.trigger_abs_z_4h:
        trig.append({"signal": "price_move", "detail": f"|z_4h| = {abs(f['z_4h']):.2f} >= {s.trigger_abs_z_4h}"})
    if (f.get("volume_ratio_4h") or 0) >= s.trigger_volume_ratio_4h:
        trig.append({"signal": "volume_anomaly",
                     "detail": f"volume_ratio_4h = {f['volume_ratio_4h']:.2f} >= {s.trigger_volume_ratio_4h}"})
    if (f.get("vol_regime_ratio") or 0) >= s.trigger_vol_regime_ratio:
        trig.append({"signal": "volatility_regime_change",
                     "detail": f"vol_regime_ratio = {f['vol_regime_ratio']:.2f} >= {s.trigger_vol_regime_ratio}"})
    if s.trigger_range_breakout and f.get("range_breakout") in ("up", "down"):
        trig.append({"signal": "range_breakout", "detail": f"72h range breakout {f['range_breakout']}"})
    return trig


def last_closed_time(candles: list[Candle]) -> datetime | None:
    return candles[-1].open_time if candles else None

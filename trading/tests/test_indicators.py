import numpy as np
import pandas as pd

from apex_trader.indicators import atr, bollinger, ema, macd, rsi, sma


def _series(vals):
    idx = pd.date_range("2024-01-01", periods=len(vals), freq="h", tz="UTC")
    return pd.Series(vals, index=idx, dtype=float)


def test_sma_matches_manual():
    s = _series(range(1, 11))
    result = sma(s, 3)
    assert result.iloc[2] == (1 + 2 + 3) / 3
    assert result.iloc[-1] == (8 + 9 + 10) / 3
    assert np.isnan(result.iloc[1])


def test_ema_finite_after_window():
    s = _series(range(1, 51))
    result = ema(s, 10)
    assert np.isnan(result.iloc[8])
    assert not np.isnan(result.iloc[9])


def test_rsi_bounded_0_100():
    s = _series(np.linspace(1, 100, 100))
    r = rsi(s, 14).dropna()
    assert (r >= 0).all() and (r <= 100).all()


def test_rsi_strong_uptrend_high():
    s = _series(np.linspace(1, 200, 100))
    assert rsi(s, 14).iloc[-1] > 70


def test_macd_hist_sign_consistency():
    s = _series(np.concatenate([np.linspace(100, 50, 50), np.linspace(50, 200, 50)]))
    line, sig, hist = macd(s)
    assert np.allclose(hist.dropna(), (line - sig).dropna())


def test_bollinger_mid_is_sma():
    s = _series(np.sin(np.linspace(0, 10, 100)) * 10 + 100)
    lo, mid, up = bollinger(s, 20, 2.0)
    assert np.allclose(mid.dropna(), sma(s, 20).dropna())
    valid = lo.dropna().index
    assert (up.loc[valid] >= lo.loc[valid]).all()


def test_atr_positive():
    n = 60
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    high = pd.Series(np.linspace(100, 110, n), index=idx)
    low = high - 1.0
    close = (high + low) / 2
    a = atr(high, low, close, 14).dropna()
    assert (a > 0).all()

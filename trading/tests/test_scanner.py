import numpy as np
import pandas as pd

from apex_trader.scanner.rule_based import RuleBasedScanner


def _uptrend_bars(n: int = 120):
    # Strong uptrend, then a pullback that closes back above EMA50.
    rng = np.random.default_rng(7)
    trend = np.linspace(100.0, 140.0, n) + rng.normal(0.0, 0.3, n)
    # Force a rising recent slice
    trend[-1] = trend[-5] + 2.0
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    return pd.DataFrame(
        {
            "open": trend,
            "high": trend * 1.005,
            "low": trend * 0.995,
            "close": trend,
            "volume": 1.0,
        },
        index=idx,
    )


def test_scanner_returns_structured_opportunities_or_none():
    scanner = RuleBasedScanner()
    result = scanner.scan({"SIM1": _uptrend_bars(), "SIM2": _uptrend_bars(200)})
    # Either empty or all meet min_rr
    for opp in result.opportunities:
        assert opp.risk_reward is not None and opp.risk_reward >= 2.0
        assert opp.expected_value is not None


def test_top_n_sorts_by_ev():
    scanner = RuleBasedScanner()
    result = scanner.scan({"A": _uptrend_bars(), "B": _uptrend_bars(150)})
    top = result.top(2)
    assert top == sorted(top, key=lambda o: o.expected_value, reverse=True)


def test_scanner_skips_short_history():
    scanner = RuleBasedScanner(min_bars=60)
    short = _uptrend_bars(30)
    result = scanner.scan({"SHORT": short})
    assert result.opportunities == []

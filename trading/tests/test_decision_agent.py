from datetime import datetime, timezone

import numpy as np
import pandas as pd

from apex_trader.agent.decision_agent import DecisionAgent, TradeProposal
from apex_trader.agent.llm import MockLLM
from apex_trader.models import Portfolio
from apex_trader.strategy.base import Signal, StrategyContext


def _bars(n: int = 120):
    rng = np.random.default_rng(0)
    close = np.exp(np.cumsum(rng.normal(0.001, 0.01, n)) + np.log(100.0))
    idx = pd.date_range("2024-01-01", periods=n, freq="h", tz="UTC")
    df = pd.DataFrame(
        {
            "open": close,
            "high": close * 1.005,
            "low": close * 0.995,
            "close": close,
            "volume": 1.0,
        },
        index=idx,
    )
    return df


def _ctx(portfolio: Portfolio | None = None):
    bars = _bars()
    pf = portfolio or Portfolio(cash=10_000.0)
    return StrategyContext(
        symbol="SIM",
        history=bars,
        now=bars.index[-1].to_pydatetime(),
        last_price=float(bars["close"].iloc[-1]),
        portfolio=pf,
    )


def test_agent_returns_long_on_confident_buy():
    llm = MockLLM()
    llm.register(
        TradeProposal,
        TradeProposal(
            action="BUY",
            asset="SIM",
            strategy_type="trend",
            entry_price=100.0,
            stop_loss=97.0,
            take_profit=106.0,
            risk_reward=2.0,
            confidence=70.0,
            thesis="EMA20 crossed EMA50 with volume",
        ),
    )
    agent = DecisionAgent(name="mock_agent", llm=llm)
    sig, reason = agent.decide(_ctx())
    assert sig is Signal.LONG
    assert "trend" in reason


def test_agent_holds_below_confidence_floor():
    llm = MockLLM()
    llm.register(
        TradeProposal,
        TradeProposal(
            action="BUY",
            asset="SIM",
            strategy_type="trend",
            risk_reward=2.5,
            confidence=40.0,  # below the default 55 floor
            thesis="weak",
        ),
    )
    agent = DecisionAgent(name="a", llm=llm, min_confidence=55.0)
    sig, _ = agent.decide(_ctx())
    assert sig is Signal.FLAT


def test_agent_rejects_low_rr_buy():
    llm = MockLLM()
    llm.register(
        TradeProposal,
        TradeProposal(
            action="BUY",
            asset="SIM",
            strategy_type="trend",
            risk_reward=1.2,
            confidence=80.0,
            thesis="ignored because rr too low",
        ),
    )
    agent = DecisionAgent(name="a", llm=llm)
    sig, reason = agent.decide(_ctx())
    assert sig is Signal.FLAT
    assert "rr" in reason


def test_agent_exits_only_with_position():
    llm = MockLLM()
    llm.register(
        TradeProposal,
        TradeProposal(
            action="SELL",
            asset="SIM",
            strategy_type="trend",
            confidence=80.0,
            thesis="exit",
        ),
    )
    agent = DecisionAgent(name="a", llm=llm)
    # No position -> FLAT
    assert agent.decide(_ctx())[0] is Signal.FLAT
    # With position -> EXIT
    pf = Portfolio(cash=9_000.0)
    pf.position("SIM").quantity = 1.0
    pf.position("SIM").avg_price = 99.0
    assert agent.decide(_ctx(pf))[0] is Signal.EXIT

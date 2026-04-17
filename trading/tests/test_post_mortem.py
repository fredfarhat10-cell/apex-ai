import json
from datetime import datetime, timezone

from apex_trader.agent.llm import MockLLM
from apex_trader.postmortem.reviewer import ClosedTrade, PostMortem, TradeReview


def _trade():
    ts = datetime(2024, 3, 1, tzinfo=timezone.utc)
    return ClosedTrade(
        asset="BTCUSDT",
        entry_price=60_000.0,
        exit_price=58_200.0,
        stop_loss=58_200.0,
        take_profit=66_000.0,
        quantity=0.02,
        pnl=-36.0,
        thesis="momentum breakout above prior high",
        duration_bars=12,
        opened_at=ts,
        closed_at=ts,
    )


def test_review_appends_jsonl(tmp_path):
    llm = MockLLM()
    llm.register(
        TradeReview,
        TradeReview(
            decision_quality="good",
            signals_correct=["volume confirmation"],
            signals_failed=["ignored overall market weakness"],
            sizing_optimal=True,
            sizing_commentary="0.5% risk, within limit",
            pattern="breakouts in weak-market conditions fail more often",
            rule_adjustment="skip breakouts when SPY < 20DMA",
        ),
    )
    log = tmp_path / "learning.jsonl"
    pm = PostMortem(llm=llm, log_path=log)
    review = pm.review(_trade())

    assert review.decision_quality == "good"
    assert review.pattern
    lines = log.read_text().strip().splitlines()
    assert len(lines) == 1
    record = json.loads(lines[0])
    assert record["asset"] == "BTCUSDT"
    assert record["review"]["rule_adjustment"] == "skip breakouts when SPY < 20DMA"


def test_review_is_called_with_formatted_user_prompt(tmp_path):
    captured = {}

    def builder(system, user):
        captured["system"] = system
        captured["user"] = user
        return TradeReview(
            decision_quality="bad",
            sizing_optimal=False,
            sizing_commentary="too large",
            pattern="revenge trade",
        )

    llm = MockLLM()
    llm.register(TradeReview, builder)
    pm = PostMortem(llm=llm, log_path=tmp_path / "log.jsonl")
    pm.review(_trade())

    assert "BTCUSDT" in captured["user"]
    assert "momentum breakout" in captured["user"]
    assert "-36.0" in captured["user"]
    assert "adaptive trading intelligence" in captured["system"]

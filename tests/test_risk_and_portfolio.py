from datetime import timedelta

from aq.data.base import Candle
from aq.portfolio import compute_pnl, evaluate_path
from aq.risk import PortfolioState, build_trade_plan, evaluate
from synthetic import ANCHOR

STATE = PortfolioState(equity_gbp=10_000, exposure_gbp=0, open_positions=0, open_assets=[], daily_pnl_gbp=0,
                       day_start_equity_gbp=10_000)


def _eval(s, plan, **kw):
    args = dict(asset="ETH", proposed_action=plan.direction if plan else "NO_TRADE", da_verdict="APPROVE", plan=plan,
                fx_usd_per_gbp=1.25, data_fresh=True, data_detail="fresh", state=STATE)
    args.update(kw)
    return evaluate(s, **args)


def test_position_size_respects_risk_budget_including_costs(settings):
    plan = build_trade_plan("LONG", 3000.0, 30.0, 2.0, 5.0, settings)
    d = _eval(settings, plan)
    assert d.approved, [c for c in d.failed]
    assert abs(d.position["risk_gbp"] - 50.0) < 1e-6  # 0.5% of £10,000
    assert d.position["notional_gbp"] <= 3000.0 + 1e-6  # 30% exposure cap


def test_exposure_cap_shrinks_position(settings):
    plan = build_trade_plan("LONG", 3000.0, 3.0, 2.0, 5.0, settings)  # tiny stop => huge size uncapped
    d = _eval(settings, plan)
    assert d.position["capped_by_exposure"]
    assert d.position["notional_gbp"] <= 3000.0 + 1e-6
    assert d.position["risk_gbp"] < 50.0


def test_net_reward_risk_after_costs(settings):
    plan = build_trade_plan("LONG", 100.0, 0.2, 1.0, 1.6, settings)  # gross 1.6 but costs 0.4% of price
    assert plan.gross_reward_risk == 1.6
    assert plan.net_reward_risk < settings.min_reward_risk
    d = _eval(settings, plan)
    assert not d.approved and "min_reward_risk" in [c.name for c in d.failed]


def test_veto_monitor_and_limits_block(settings):
    plan = build_trade_plan("LONG", 3000.0, 30.0, 2.0, 5.0, settings)
    assert not _eval(settings, plan, da_verdict="VETO").approved
    assert not _eval(settings, plan, da_verdict="MONITOR").approved
    full = PortfolioState(10_000, 0, 3, ["BTC", "SOL", "XRP"], 0, 10_000)
    assert "max_open_positions" in [c.name for c in _eval(settings, plan, state=full).failed]
    loss = PortfolioState(10_000, 0, 0, [], -250, 10_250)
    assert "daily_loss_limit" in [c.name for c in _eval(settings, plan, state=loss).failed]
    assert "market_data_available" in [c.name for c in _eval(settings, plan, fx_usd_per_gbp=None).failed]
    assert "market_data_available" in [c.name for c in _eval(settings, plan, data_fresh=False).failed]


def test_short_plan_and_disabled_shorts(settings):
    from dataclasses import replace
    plan = build_trade_plan("SHORT", 3000.0, 30.0, 2.0, 5.0, settings)
    assert plan.stop_price_usd > 3000 > plan.target_price_usd
    assert _eval(settings, plan).approved
    assert "short_allowed" in [c.name for c in _eval(replace(settings, allow_short=False), plan).failed]


def _bar(h, o, hi, lo, c):
    return Candle(ANCHOR + timedelta(minutes=5 * h), o, hi, lo, c, 1.0, "5m")


def test_stop_assumed_before_target_in_same_bar():
    bars = [_bar(1, 100, 112, 89, 100)]
    r = evaluate_path("LONG", 100, ANCHOR, 90, 110, ANCHOR + timedelta(hours=24), bars, ANCHOR + timedelta(hours=1))
    assert r.exit_reason == "STOP" and r.exit_price == 90


def test_gap_through_stop_fills_at_open():
    bars = [_bar(1, 100, 101, 99, 100), _bar(2, 85, 86, 80, 82)]
    r = evaluate_path("LONG", 100, ANCHOR, 90, 110, ANCHOR + timedelta(hours=24), bars, ANCHOR + timedelta(hours=1))
    assert r.exit_reason == "STOP" and r.exit_price == 85


def test_pre_entry_and_unclosed_bars_ignored():
    pre = Candle(ANCHOR - timedelta(minutes=5), 100, 200, 1, 100, 1, "5m")  # would hit both
    forming = _bar(1, 100, 200, 100, 150)
    r = evaluate_path("LONG", 100, ANCHOR, 90, 110, ANCHOR + timedelta(hours=24), [pre, forming],
                      ANCHOR + timedelta(minutes=7))
    assert r.exit_reason is None


def test_target_and_time_exit_and_excursions():
    bars = [_bar(1, 100, 104, 97, 103), _bar(2, 103, 111, 102, 110)]
    r = evaluate_path("LONG", 100, ANCHOR, 90, 110, ANCHOR + timedelta(hours=24), bars, ANCHOR + timedelta(hours=1))
    assert r.exit_reason == "TARGET" and r.exit_price == 110 and r.mae_price == 97
    exp = ANCHOR + timedelta(minutes=10)
    r2 = evaluate_path("SHORT", 100, ANCHOR, 110, 90, exp, bars, ANCHOR + timedelta(hours=1))
    assert r2.exit_reason == "TIME" and r2.exit_price == 103 and r2.mae_price == 104


def test_pnl_decomposition(settings):
    t = {"direction": "LONG", "units": 1.0, "entry_price_usd": 125.0, "fx_entry_usd_per_gbp": 1.25,
         "risk_gbp": 10.0}
    p = compute_pnl(t, 137.5, 1.25, settings)
    assert abs(p["gross_pnl_gbp"] - 10.0) < 1e-9
    assert abs(p["fees_gbp"] - (100 + 110) * 0.001) < 1e-9
    assert abs(p["net_pnl_gbp"] - (p["gross_pnl_gbp"] - p["fees_gbp"] - p["estimated_slippage_gbp"])) < 1e-12

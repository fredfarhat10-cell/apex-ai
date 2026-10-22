from dataclasses import replace
from datetime import timedelta

from aq.agents.devils_advocate import rule_checks
from aq.agents.scout import finalize, rule_based_scout
from aq.data.base import OrderBook
from aq.execution import estimate_costs, flat_costs, walk_book
from aq.memory import recall
from aq.portfolio import compute_pnl
from aq.risk import build_trade_plan
from synthetic import ANCHOR
from test_agents import _features

BOOK = OrderBook("ETH", bids=[(99.9, 10), (99.5, 50), (99.0, 1000)], asks=[(100.1, 10), (100.5, 50), (101.0, 1000)],
                 timestamp=ANCHOR, source="test")


def test_walk_book_small_and_large_orders():
    small = walk_book(BOOK, "buy", 500)  # fits in the first level: vwap 100.1 vs mid 100 -> 10 bps
    assert abs(small - 10.0) < 1e-6
    assert walk_book(BOOK, "buy", 5000) > small  # walking deeper costs more
    assert walk_book(BOOK, "buy", 10_000_000) is None  # book too thin


def test_estimate_costs_uses_book_with_floor_and_fallback(settings):
    cm = estimate_costs(settings, "LONG", 500, BOOK, None, None)
    assert abs(cm.slippage_bps_per_side - 10.0) < 1e-6 and "book walk" in cm.slippage_source
    tight = OrderBook("BTC", [(99.999, 1e6)], [(100.001, 1e6)], ANCHOR, "test")
    assert estimate_costs(settings, "LONG", 500, tight, None, None).slippage_bps_per_side == \
        settings.min_slippage_bps_per_side
    fb = estimate_costs(settings, "LONG", 500, None, None, None)
    assert fb.slippage_bps_per_side == settings.slippage_bps_per_side and "flat" in fb.slippage_source


def test_short_funding_is_conservative(settings):
    pays = estimate_costs(settings, "SHORT", 500, None, -0.0002, "test-perp")  # shorts pay 2 bps / 8h
    assert abs(pays.funding_bps_per_day - 6.0) < 1e-9
    assert estimate_costs(settings, "SHORT", 500, None, 0.0003, "x").funding_bps_per_day == 0.0  # income ignored
    assert estimate_costs(settings, "SHORT", 500, None, None, None).funding_bps_per_day == \
        settings.short_borrow_bps_per_day
    assert estimate_costs(settings, "LONG", 500, None, -0.01, "x").funding_bps_per_day == 0.0
    no_fund = build_trade_plan("SHORT", 100, 1, 2, 5, settings,
                               costs=flat_costs(replace(settings, short_borrow_bps_per_day=0), "SHORT"),
                               horizon_hours=72)
    fund = build_trade_plan("SHORT", 100, 1, 2, 5, settings, costs=pays, horizon_hours=72)
    assert fund.net_reward_risk < no_fund.net_reward_risk


def test_pnl_charges_funding_for_held_time(settings):
    t = {"direction": "SHORT", "units": 1.0, "entry_price_usd": 125.0, "fx_entry_usd_per_gbp": 1.25, "risk_gbp": 10,
         "costs_json": {"fee_bps_per_side": 10, "slippage_bps_per_side": 4, "funding_bps_per_day": 10}}
    p = compute_pnl(t, 125.0, 1.25, settings, held_hours=48)
    assert abs(p["funding_gbp"] - 100 * 0.002) < 1e-12
    assert abs(p["estimated_slippage_gbp"] - 200 * 0.0004) < 1e-12
    assert abs(p["net_pnl_gbp"] + p["fees_gbp"] + p["estimated_slippage_gbp"] + p["funding_gbp"]) < 1e-12


def test_memory_only_uses_known_outcomes(make_engine):
    eng, clock, _ = make_engine(after_drift=-0.01)
    inv = eng.run_investigation("ETH")
    assert inv["memory_json"]["LONG"]["summary"]["similar_trades"] == 0
    f = inv["observation"]["features_json"]
    # While the trade is open its outcome is unknown, so memory must not see it.
    assert recall(eng.db, "LONG", f, None, clock.now(), eng.s)["summary"]["similar_trades"] == 0
    clock.advance(hours=6)
    assert eng.update_open_positions()
    m = recall(eng.db, "LONG", f, None, clock.now(), eng.s)
    assert m["summary"]["similar_trades"] == 1 and m["summary"]["losses"] == 1
    assert not m["summary"]["sufficient"]
    # As of a time before the exit, the trade is excluded: no lookahead.
    assert recall(eng.db, "LONG", f, None, clock.now() - timedelta(hours=5), eng.s)["summary"]["similar_trades"] == 0
    assert recall(eng.db, "SHORT", f, None, clock.now(), eng.s)["summary"]["similar_trades"] == 0


def test_memory_challenge_weight_requires_min_sample(settings):
    f, _ = _features("ETH")
    scout = finalize(rule_based_scout("ETH", f, {}, False), "rules:v1", f)
    plan = build_trade_plan("LONG", f["last_close"], f["atr_14"], 2.0, 5.0, settings)
    small = {"summary": {"similar_trades": 2, "sufficient": False, "expectancy_r": -1.0, "note": "2 trades",
                         "direction": "LONG", "wins": 0, "losses": 2, "most_common_failure": "incorrect_direction"}}
    big = {"summary": {**small["summary"], "similar_trades": 8, "sufficient": True, "losses": 7, "wins": 1}}
    assert {x.check: x.severity for x in rule_checks(f, scout, plan, {}, settings, small)}["history_note"] == "info"
    assert {x.check: x.severity for x in rule_checks(f, scout, plan, {}, settings, big)}["history_negative"] == "major"

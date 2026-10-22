"""End-to-end: data -> investigation -> challenge -> risk -> paper trade -> outcome -> lesson -> dashboard."""
from datetime import timedelta


def test_full_loop_target_hit(make_engine):
    eng, clock, _ = make_engine(after_drift=0.006)
    inv = eng.run_investigation("ETH")
    assert inv["status"] == "complete"
    assert inv["proposed_action"] == "LONG", inv["final_reason"]
    assert inv["challenge"]["decision"] == "APPROVE", inv["challenge"]["devils_advocate_output_json"]
    assert inv["risk"]["approved"] == 1
    assert inv["final_decision"] == "TRADE"
    t = inv["trade"]
    # Planned loss (incl. costs) is at most 0.5% of £10,000.
    assert t["risk_gbp"] <= 50.0 + 1e-6
    assert t["stop_price_usd"] < t["entry_price_usd"] < t["target_price_usd"]

    # Nothing closes before time passes (no lookahead: no closed candles after entry yet).
    assert eng.update_open_positions() == []
    clock.advance(hours=30)
    closed = eng.update_open_positions()
    assert len(closed) == 1
    out = closed[0]
    assert out["exit_reason"] in ("TARGET", "TIME")
    full = eng.get_trade(t["id"])
    assert full["status"] == "CLOSED"
    assert full["outcome"]["fees_gbp"] > 0 and full["outcome"]["estimated_slippage_gbp"] > 0
    assert abs(full["outcome"]["net_pnl_gbp"] - (full["outcome"]["gross_pnl_gbp"] - full["outcome"]["fees_gbp"]
                                                  - full["outcome"]["estimated_slippage_gbp"])) < 1e-9
    assert len(full["lessons"]) == 1
    lesson = full["lessons"][0]
    assert lesson["validation_status"] == "UNVALIDATED"
    assert lesson["confidence"] == "low"

    ov = eng.overview()
    assert ov["disclaimer"].startswith("Experimental paper performance")
    assert ov["trade_metrics"]["number_of_trades"] == 1
    assert ov["trade_metrics"]["evidence_quality"]["level"] == "insufficient"
    assert ov["benchmarks"]["btc_buy_and_hold"]["available"]
    types = [e["type"] for e in eng.db.all("SELECT type FROM events")]
    for needed in ("INVESTIGATION", "CHALLENGE", "PAPER_TRADE", "TRADE_CLOSED", "LESSON"):
        assert needed in types


def test_stop_loss_and_followup(make_engine):
    eng, clock, _ = make_engine(after_drift=-0.01)
    inv = eng.run_investigation("ETH")
    assert inv["final_decision"] == "TRADE"
    clock.advance(hours=6)
    closed = eng.update_open_positions()
    assert closed and closed[0]["exit_reason"] == "STOP"
    assert closed[0]["net_pnl_gbp"] < 0
    lesson = eng.db.one("SELECT * FROM lessons")
    assert lesson["failure_category"] is not None
    assert lesson["followup_due_at"] is not None
    assert eng.run_followups() == 0  # horizon not reached yet
    clock.advance(hours=24)
    assert eng.run_followups() == 1
    lesson = eng.db.one("SELECT * FROM lessons")
    assert lesson["followup_json"]["status"] == "done"
    assert "Direction wrong" in lesson["timing_assessment"]


def test_duplicate_position_blocked(make_engine):
    eng, clock, _ = make_engine()
    assert eng.run_investigation("ETH")["final_decision"] == "TRADE"
    inv2 = eng.run_investigation("ETH")
    assert inv2["final_decision"] == "NO_TRADE"
    assert "no_duplicate_asset_position" in inv2["final_reason"]


def test_data_unavailable_is_reported_not_faked(make_engine):
    eng, _, _ = make_engine(fail=True)
    inv = eng.run_investigation("ETH")
    assert inv["status"] == "data_unavailable"
    assert inv["final_decision"] == "NO_TRADE"
    assert "Data unavailable" in inv["final_reason"]
    assert eng.db.one("SELECT COUNT(*) n FROM paper_trades")["n"] == 0
    prices = eng.prices()
    assert prices["assets"] == []
    assert prices["error"]


def test_no_trade_path_flat_asset(make_engine):
    eng, _, _ = make_engine()
    inv = eng.run_investigation("SOL")
    assert inv["proposed_action"] == "NO_TRADE"
    assert inv["challenge"]["decision"] == "NOT_REQUIRED"
    assert inv["final_decision"] == "NO_TRADE"
    assert eng.db.one("SELECT COUNT(*) n FROM paper_trades")["n"] == 0


def test_unsupported_asset_removed(make_engine):
    eng, _, _ = make_engine(universe=("BTC", "ETH", "SOL", "BNB"))
    res = eng.market.resolve_universe(force=True)
    assert "BNB" in res.removed
    assert eng.run_investigation("BNB")["status"] == "data_unavailable"


def test_monitor_default_thresholds_do_not_fire_on_moderate_moves(make_engine):
    eng, _, _ = make_engine()
    run = eng.monitor_cycle()
    assert run["triggers_json"] == {}
    assert eng.db.one("SELECT COUNT(*) n FROM investigations")["n"] == 0  # no LLM-costing work done


def test_monitor_cycle_uses_filters_and_cooldown(make_engine):
    eng, clock, _ = make_engine(trigger_volume_ratio_4h=1.5)
    run = eng.monitor_cycle()
    assert run["status"] in ("ok", "partial")
    assert "ETH" in run["triggers_json"]  # ETH volume is 1.6x its 4h baseline
    assert "SOL" not in run["triggers_json"]  # flat asset: no LLM-costing investigation
    n1 = eng.db.one("SELECT COUNT(*) n FROM investigations")["n"]
    clock.advance(minutes=15)
    eng.monitor_cycle()
    n2 = eng.db.one("SELECT COUNT(*) n FROM investigations")["n"]
    # Cooldown prevents re-investigating the same asset within the window.
    assert {r["asset"] for r in eng.db.all("SELECT asset FROM investigations")} <= set(run["triggers_json"])
    assert n2 == n1
    assert eng.db.one("SELECT COUNT(*) n FROM equity_snapshots")["n"] >= 2  # monitor runs + trade open


def test_manual_close_uses_real_price(make_engine):
    eng, clock, provider = make_engine(after_drift=0.0)
    t = eng.run_investigation("ETH")["trade"]
    clock.advance(hours=1)
    res = eng.close_manually(t["id"])
    assert res["outcome"]["exit_reason"] == "MANUAL"
    assert abs(res["outcome"]["exit_price_usd"] - provider.paths["ETH"].price_at(clock.now())) < 1e-9
    assert res["outcome"]["thesis_correct"] == "UNDETERMINED"


def test_monitor_skips_assets_with_open_positions(make_engine):
    eng, clock, _ = make_engine(after_drift=0.0, trigger_volume_ratio_4h=1.5)
    assert eng.run_investigation("ETH")["final_decision"] == "TRADE"
    run = eng.monitor_cycle()
    assert "ETH" in run["triggers_json"]
    assert all(i["asset"] != "ETH" for i in run["investigations_json"])


def test_arena_read_model(make_engine):
    eng, clock, _ = make_engine(after_drift=0.006)
    eng.monitor_cycle()
    eng.run_investigation("ETH")
    for _ in range(6):
        clock.advance(hours=1)
        eng.monitor_cycle()
    a = eng.arena()
    ids = {s["id"] for s in a["series"]}
    assert {"ai", "hodl", "sma"} <= ids
    assert len(next(s for s in a["series"] if s["id"] == "ai")["points"]) >= 3
    assert {r["id"] for r in a["leaderboard"]} == {"ai", "hodl", "sma"}
    returns = [r["return_pct"] for r in a["leaderboard"] if r["return_pct"] is not None]
    assert returns == sorted(returns, reverse=True)

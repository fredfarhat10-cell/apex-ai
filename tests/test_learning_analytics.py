from datetime import timedelta

from aq.analytics import btc_buy_and_hold, equity_metrics, evidence_quality, sma_baseline, trade_metrics
from aq.clock import iso
from aq.data.base import Candle
from aq.learning import compose_lesson, diagnose
from synthetic import ANCHOR

TRADE = {"asset": "ETH", "direction": "LONG", "entry_price_usd": 100.0, "stop_price_usd": 96.0,
         "target_price_usd": 110.0, "risk_gbp": 50.0, "horizon_hours": 24, "entry_time": iso(ANCHOR)}


def _out(reason, exit_, net, gross, mfe=1.0, mae=-1.0, r=None):
    return {"exit_reason": reason, "exit_price_usd": exit_, "net_pnl_gbp": net, "gross_pnl_gbp": gross,
            "mfe_pct": mfe, "mae_pct": mae, "r_multiple": r if r is not None else net / 50,
            "exit_time": iso(ANCHOR + timedelta(hours=5))}


def test_win_explained_by_beta_is_not_credited_to_thesis():
    d = diagnose(TRADE, _out("TARGET", 110, 120, 125, mfe=10), None,
                 {"asset_ret_hold_pct": 10.0, "btc_ret_hold_pct": 9.0})
    assert d["thesis_correct"] == "YES"
    assert d["reason_matched_thesis"].startswith("NO")
    _, _, lesson = compose_lesson(TRADE, d)
    assert "does NOT support" in lesson


def test_fragile_win_flagged():
    d = diagnose(TRADE, _out("TARGET", 110, 120, 125, mfe=10, mae=-3.5), None,
                 {"asset_ret_hold_pct": 10.0, "btc_ret_hold_pct": 0.5})
    assert d["reason_matched_thesis"].startswith("UNCERTAIN")


def test_loss_categories_and_da_anticipation():
    challenge = {"devils_advocate_output_json": {"findings": [
        {"check": "regime_mismatch", "severity": "major"}, {"check": "no_news", "severity": "info"}]}}
    d = diagnose(TRADE, _out("STOP", 96, -55, -50), challenge, {"asset_ret_hold_pct": -4, "btc_ret_hold_pct": -3})
    assert d["failure_category"] == "incorrect_market_regime"
    assert d["devils_advocate_anticipated"]
    assert d["timing_assessment"].startswith("PENDING")
    assert diagnose(TRADE, _out("TIME", 100.1, -0.5, 0.4), None, {})["failure_category"] == "execution_assumption"
    assert diagnose(TRADE, _out("TIME", 99.5, -10, -9), None, {})["failure_category"] == "normal_variance"
    assert diagnose(TRADE, _out("STOP", 96, -50, -45), None,
                    {"max_bar_move_atr": 5})["failure_category"] == "unexpected_event"
    d2 = diagnose(TRADE, _out("STOP", 96, -50, -45), None, {"asset_ret_hold_pct": -4, "btc_ret_hold_pct": 0.2})
    assert d2["failure_category"] == "incorrect_direction"
    assert "loss within planned risk" in d2["risk_assessment"].lower()


def test_metrics_refuse_to_impress_on_small_samples(settings):
    closed = [{"net_pnl_gbp": 30, "r_multiple": 0.6, "reward_risk": 2, "fees_gbp": 1, "estimated_slippage_gbp": 1,
               "entry_time": iso(ANCHOR), "exit_time": iso(ANCHOR + timedelta(hours=3)),
               "evaluation_json": {"x": 1}, "price_path_json": [1]}] * 3
    m = trade_metrics(closed, settings)
    assert m["evidence_quality"]["level"] == "insufficient"
    assert "Insufficient sample size" in m["evidence_quality"]["label"]
    assert m["profit_factor"] is None and "undefined" in m["profit_factor_note"]
    assert evidence_quality(0, settings)["level"] == "none"


def test_equity_metrics_gates(settings):
    snaps = [{"taken_at": iso(ANCHOR + timedelta(hours=i)), "equity_gbp": e, "exposure_gbp": 0}
             for i, e in enumerate([10_000, 10_100, 9_800, 9_900])]
    em = equity_metrics(snaps, 10_000, 9_900, ANCHOR, ANCHOR + timedelta(hours=4), settings)
    assert abs(em["max_drawdown_pct"] - (10_100 - 9_800) / 10_100 * 100) < 1e-9
    assert em["sharpe"] is None and "Insufficient" in em["sharpe_note"]
    assert em["return_7d_pct"] is None and em["annualised_return_pct"] is None


def test_benchmarks():
    fund = {"benchmark_start_at": iso(ANCHOR), "benchmark_btc_price_usd": 50_000, "benchmark_fx_usd_per_gbp": 1.25,
            "starting_capital": 10_000}
    b = btc_buy_and_hold(fund, 55_000, 1.25)
    assert abs(b["return_pct_gbp"] - 10.0) < 1e-9
    assert not btc_buy_and_hold(fund, None, 1.25)["available"]
    assert not btc_buy_and_hold({}, 1, 1)["available"]


def test_sma_baseline_no_lookahead(settings):
    # Monotonic rise: baseline enters after the first bar above SMA and earns subsequent bars only.
    candles = [Candle(ANCHOR + timedelta(hours=i), 100 + i, 100 + i, 100 + i, 100 + i, 1, "1h") for i in range(120)]
    r = sma_baseline(candles, ANCHOR + timedelta(hours=60), settings)
    assert r["available"]
    expected = (1 - 0.002) * (219 / 160) - 1
    assert abs(r["return_pct_usd"] / 100 - expected) < 1e-9

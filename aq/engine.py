"""Orchestration: OBSERVATION -> INTERPRETATION -> PREDICTION -> DECISION -> OUTCOME -> LEARNING.

Pipeline (the Scout can never create a trade directly):
    SCOUT -> DEVIL'S ADVOCATE -> RISK ENGINE -> PAPER TRADE (or NO TRADE)
Every step is persisted with the information available at that moment, and every feed event corresponds
to a real database record.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta

from aq import risk as risk_engine
from aq.agents.devils_advocate import DevilsAdvocate
from aq.agents.llm import LLMClient
from aq.agents.scout import Scout
from aq.analytics import (DISCLAIMER, btc_buy_and_hold, drawdown_warnings, equity_metrics, sma_baseline,
                          trade_metrics)
from aq.clock import Clock, iso, parse_iso
from aq.data.base import DataUnavailable, closed_only
from aq.features import InsufficientData, compute_features, detect_triggers, market_regime
from aq.execution import estimate_costs
from aq.learning import LearningLoop
from aq.memory import recall
from aq.logging_setup import log
from aq.portfolio import Portfolio, evaluate_path
from aq.signals.base import UnavailableNewsProvider, UnavailableSocialProvider

logger = logging.getLogger("aq.engine")
HISTORY_HOURS = 300


class Engine:
    def __init__(self, settings, db, market, clock: Clock | None = None, llm: LLMClient | None = None,
                 news=None, social=None):
        self.s, self.db, self.market = settings, db, market
        self.clock = clock or Clock()
        self.llm = llm or LLMClient(settings)
        self.news = news or UnavailableNewsProvider()
        self.social = social or UnavailableSocialProvider()
        self.portfolio = Portfolio(db, settings, self.clock)
        self.learning = LearningLoop(db, settings, self.clock, self.llm)
        self.scout = Scout(self.llm)
        self.da = DevilsAdvocate(self.llm, settings)
        self.portfolio.ensure_fund()

    # -- events -----------------------------------------------------------------
    def event(self, type_: str, title: str, asset: str | None = None, payload: dict | None = None,
              ref_type: str | None = None, ref_id: str | None = None) -> None:
        self.db.insert("events", {"created_at": iso(self.clock.now()), "type": type_, "asset": asset, "title": title,
                                  "payload_json": payload or {}, "ref_type": ref_type, "ref_id": ref_id})

    # -- observation ------------------------------------------------------------
    def _closed_1h(self, asset: str):
        now = self.clock.now()
        end = now.replace(second=0, microsecond=0)  # minute-aligned so the short TTL cache can hit
        candles, src = self.market.get_candles(asset, "1h", start=end - timedelta(hours=HISTORY_HOURS), end=end)
        return closed_only(candles, now), src

    def features_for(self, asset: str, btc_candles=None) -> tuple[dict, list, str]:
        candles, src = self._closed_1h(asset)
        return compute_features(candles, btc_candles), candles, src

    def universe_features(self) -> tuple[dict[str, dict], dict[str, str]]:
        """Features for every active asset (used for regime/breadth). Failures are reported, not hidden."""
        feats, errors = {}, {}
        try:
            btc, _ = self._closed_1h("BTC")
        except DataUnavailable as e:
            btc, errors["BTC"] = None, str(e)
        for a in self.market.active_assets():
            try:
                feats[a], _, _ = self.features_for(a, btc)
            except (DataUnavailable, InsufficientData) as e:
                errors[a] = str(e)
        return feats, errors

    def _fx(self):
        try:
            return self.market.get_fx_usd_per_gbp()
        except DataUnavailable as e:
            log(logger, logging.WARNING, "fx_unavailable", error=str(e))
            return None

    def ensure_benchmark(self) -> None:
        if self.portfolio.ensure_fund().get("benchmark_start_at"):
            return
        try:
            q = self.market.get_spot_price("BTC")
        except DataUnavailable:
            return
        fx = self._fx()
        if fx:
            self.portfolio.set_benchmark_start(q.price_usd, fx.usd_per_gbp, q.source)
            self.event("BENCHMARK_START", f"Benchmark period started: BTC ${q.price_usd:,.2f}", "BTC",
                       {"price_usd": q.price_usd, "fx_usd_per_gbp": fx.usd_per_gbp, "source": q.source})

    # -- research pipeline ------------------------------------------------------
    def run_investigation(self, asset: str, trigger: str = "manual", trigger_reason: list | None = None) -> dict:
        asset = asset.upper()
        inv_id = str(uuid.uuid4())
        now = self.clock.now()
        base = {"id": inv_id, "created_at": iso(now), "asset": asset, "trigger": trigger,
                "trigger_reason_json": trigger_reason or []}
        try:
            if asset not in self.market.active_assets():
                raise DataUnavailable(f"{asset} is not in the active universe "
                                      f"({self.market.universe.removed.get(asset, 'not configured')})")
            self.ensure_benchmark()
            btc_candles = None
            if asset != "BTC":
                try:
                    btc_candles, _ = self._closed_1h("BTC")
                except DataUnavailable:
                    btc_candles = None
            features, candles, src = self.features_for(asset, btc_candles)
            spot = self.market.get_spot_price(asset)
        except (DataUnavailable, InsufficientData) as e:
            self.db.insert("investigations", {**base, "status": "data_unavailable", "final_decision": "NO_TRADE",
                                              "final_reason": f"Data unavailable: {e}"})
            self.event("DATA_UNAVAILABLE", f"{asset}: data unavailable — no investigation possible", asset,
                       {"error": str(e)}, "investigation", inv_id)
            return self.get_investigation(inv_id)

        fx = self._fx()
        last_closed = candles[-1]
        staleness_min = (now - last_closed.close_time).total_seconds() / 60
        fresh = staleness_min <= self.s.max_data_staleness_minutes
        data_detail = (f"Last closed 1h candle closed {staleness_min:.0f} min ago (max "
                       f"{self.s.max_data_staleness_minutes}); spot ${spot.price_usd:,.6g} from {spot.source}")
        obs_id = self.db.insert("market_observations", {
            "observed_at": iso(now), "asset": asset, "price_usd": spot.price_usd, "price_timestamp": iso(spot.timestamp),
            "volume_24h": features["volume_24h"], "features_json": features,
            "context_candles_json": [c.to_dict() for c in candles[-72:]],
            "last_closed_candle_at": iso(last_closed.open_time), "fx_usd_per_gbp": fx.usd_per_gbp if fx else None,
            "fx_source": fx.source if fx else None, "data_source": src})

        universe, uni_err = self.universe_features()
        universe[asset] = features
        regime = market_regime(universe)
        regime["unavailable_assets"] = uni_err
        news_status = self.news.status()

        memory = {d: recall(self.db, d, features, regime.get("label"), now, self.s) for d in ("LONG", "SHORT")}
        scout, scout_meta = self.scout.investigate(asset, features, regime, news_status, memory)

        prices = self._open_position_prices()
        state = self.portfolio.state(prices, fx.usd_per_gbp if fx else None)
        plan, cost_notes = None, None
        if scout.proposed_action in ("LONG", "SHORT"):
            plan, cost_notes = self._plan_with_costs(asset, scout, spot.price_usd, features["atr_14"],
                                                     state["equity_gbp"], fx.usd_per_gbp if fx else None)
        da, da_meta = self.da.challenge(asset, features, scout, plan, regime, memory.get(scout.proposed_action))
        st = risk_engine.PortfolioState(state["equity_gbp"], state["exposure_gbp"], state["open_positions"],
                                        state["open_assets"], state["daily_pnl_gbp"], state["day_start_equity_gbp"])
        decision = risk_engine.evaluate(self.s, asset=asset, proposed_action=scout.proposed_action,
                                        da_verdict=da.verdict, plan=plan, fx_usd_per_gbp=fx.usd_per_gbp if fx else None,
                                        data_fresh=fresh, data_detail=data_detail, state=st)

        trade = None
        if decision.approved:
            final, reason = "TRADE", "All conditions met: Scout proposal, no veto, risk engine approval."
        elif scout.proposed_action == "NO_TRADE":
            final, reason = "NO_TRADE", f"Scout: {scout.thesis}"
        else:
            final = "NO_TRADE"
            reason = "Blocked by: " + "; ".join(f"{c.name} ({c.detail})" for c in decision.failed)

        with self.db.transaction() as db:
            db.insert("investigations", {
                **base, "observation_id": obs_id, "scout_engine": scout.engine,
                "scout_output_json": {**scout.model_dump(), "market_regime": regime, "news_status": news_status,
                                      "llm_meta": scout_meta},
                "situation_summary": scout.what_is_happening,
                "evidence_json": [e.model_dump() for e in scout.evidence], "thesis": scout.thesis,
                "confirmation_conditions_json": [c.model_dump() for c in scout.confirmation_conditions],
                "invalidation_conditions_json": [c.model_dump() for c in scout.invalidation_conditions],
                "proposed_action": scout.proposed_action, "horizon_hours": scout.horizon_hours,
                "research_confidence": scout.research_confidence, "final_decision": final, "final_reason": reason,
                "memory_json": {**memory, "cost_estimation": cost_notes}, "status": "complete"})
            db.insert("challenges", {"investigation_id": inv_id, "created_at": iso(self.clock.now()),
                                     "engine": da.engine, "devils_advocate_output_json": {**da.model_dump(),
                                                                                         "llm_meta": da_meta},
                                     "decision": da.verdict,
                                     "reasons_json": [f.model_dump() for f in da.findings]})
            db.insert("risk_evaluations", {"investigation_id": inv_id, "created_at": iso(self.clock.now()),
                                           "approved": decision.approved,
                                           "checks_json": decision.to_dict()["checks"],
                                           "position_json": decision.position})
            if decision.approved:
                trade = self.portfolio.open_trade(investigation_id=inv_id, asset=asset,
                                                  position=decision.position, scout=scout, da=da, entry_time=now,
                                                  data_source=spot.source)

        self.event("INVESTIGATION", f"{asset}: {self._headline(scout)}", asset,
                   {"scout_engine": scout.engine, "proposed_action": scout.proposed_action,
                    "summary": scout.what_is_happening, "thesis": scout.thesis,
                    "research_confidence": scout.research_confidence, "trigger": trigger,
                    "evidence": [e.model_dump() for e in scout.evidence[:6]]}, "investigation", inv_id)
        if da.verdict != "NOT_REQUIRED":
            self.event("CHALLENGE", f"{asset}: Devil's Advocate {da.verdict}", asset,
                       {"verdict": da.verdict, "summary": da.summary, "engine": da.engine,
                        "reasons": [f.claim for f in da.findings if f.severity in ("blocking", "major")]},
                       "investigation", inv_id)
        if trade:
            self._snapshot()
            self.event("PAPER_TRADE", f"{asset} {trade['direction']} opened", asset, {
                "direction": trade["direction"], "entry": trade["entry_price_usd"], "stop": trade["stop_price_usd"],
                "target": trade["target_price_usd"], "risk_gbp": trade["risk_gbp"], "thesis": trade["thesis"],
                "notional_gbp": trade["notional_gbp"]}, "trade", trade["id"])
        elif scout.proposed_action != "NO_TRADE":  # a proposed trade was blocked downstream
            self.event("NO_TRADE", f"{asset}: proposed {scout.proposed_action} blocked — NO TRADE", asset,
                       {"reason": reason}, "investigation", inv_id)
        return self.get_investigation(inv_id)

    def _plan_with_costs(self, asset, scout, entry, atr, equity_gbp, fx):
        """Size a provisional position with flat costs, then re-price costs from the live order book (and
        funding for shorts) for that size, and rebuild the plan. Falls back to flat assumptions, labelled."""
        d = scout.proposed_action
        prelim = risk_engine.build_trade_plan(d, entry, atr, scout.stop_atr_multiple, scout.target_atr_multiple,
                                              self.s, horizon_hours=scout.horizon_hours)
        stop_frac = abs(entry - prelim.stop_price_usd) / entry + prelim.round_trip_fraction
        notional_gbp = min(equity_gbp * self.s.max_risk_per_trade_pct / 100 / stop_frac,
                           equity_gbp * self.s.max_portfolio_exposure_pct / 100)
        notional_usd = notional_gbp * (fx or 1.0)
        notes = {"provisional_notional_usd": notional_usd}
        book = funding = fsrc = None
        if self.s.use_order_book:
            try:
                book = self.market.get_order_book(asset)
            except DataUnavailable as e:
                notes["order_book_error"] = str(e)
        if d == "SHORT":
            try:
                funding, fsrc = self.market.get_funding_rate(asset)
            except DataUnavailable as e:
                notes["funding_error"] = str(e)
        costs = estimate_costs(self.s, d, notional_usd, book, funding, fsrc)
        notes["costs"] = costs.to_dict()
        plan = risk_engine.build_trade_plan(d, entry, atr, scout.stop_atr_multiple, scout.target_atr_multiple,
                                            self.s, costs=costs, horizon_hours=scout.horizon_hours)
        return plan, notes

    @staticmethod
    def _headline(scout) -> str:
        if scout.proposed_action == "NO_TRADE":
            return "No qualifying opportunity detected"
        tags = ", ".join(t.replace("_", " ") for t in scout.situation_tags if t != "macro_news_catalyst")
        return f"potential {scout.proposed_action} ({tags or 'unclassified'})"

    def get_investigation(self, inv_id: str) -> dict | None:
        inv = self.db.one("SELECT * FROM investigations WHERE id = ?", (inv_id,))
        if not inv:
            return None
        inv["observation"] = (self.db.one("SELECT * FROM market_observations WHERE id = ?", (inv["observation_id"],))
                              if inv.get("observation_id") else None)
        inv["challenge"] = self.db.one("SELECT * FROM challenges WHERE investigation_id = ?", (inv_id,))
        inv["risk"] = self.db.one("SELECT * FROM risk_evaluations WHERE investigation_id = ?", (inv_id,))
        inv["trade"] = self.db.one("SELECT * FROM paper_trades WHERE investigation_id = ?", (inv_id,))
        return inv

    # -- positions --------------------------------------------------------------
    def _open_position_prices(self) -> dict[str, float]:
        prices = {}
        for t in self.portfolio.open_trades():
            try:
                prices[t["asset"]] = self.market.get_spot_price(t["asset"]).price_usd
            except DataUnavailable:
                pass
        return prices

    def _hold_return(self, asset: str, start: datetime, end: datetime) -> float | None:
        try:
            candles, _ = self.market.get_candles(asset, "5m", start=start, end=end)
        except DataUnavailable:
            return None
        c = [x for x in candles if start <= x.open_time and x.close_time <= end]
        return (c[-1].close / c[0].open - 1) * 100 if c else None

    def update_open_positions(self) -> list[dict]:
        closed = []
        now = self.clock.now()
        for t in self.portfolio.open_trades():
            entry_time, expires = parse_iso(t["entry_time"]), parse_iso(t["expires_at"])
            try:
                candles, src = self.market.get_candles(t["asset"], "5m", start=entry_time, end=now)
            except DataUnavailable as e:
                log(logger, logging.WARNING, "position_update_unavailable", trade=t["id"], error=str(e))
                continue
            res = evaluate_path(t["direction"], t["entry_price_usd"], entry_time, t["stop_price_usd"],
                                t["target_price_usd"], expires, candles, now)
            if not res.exit_reason:
                self.portfolio.record_progress(t, res)
                continue
            out = self._close(t, res.exit_reason, res.exit_price, res.exit_time, res.mfe_price, res.mae_price,
                              res.candles_used, src)
            if out:
                closed.append(out)
        return closed

    def close_manually(self, trade_id: str) -> dict:
        t = self.db.one("SELECT * FROM paper_trades WHERE id = ? AND status = 'OPEN'", (trade_id,))
        if not t:
            raise ValueError("No open trade with that id")
        self.update_open_positions()  # a stop/target may already have been hit
        t = self.db.one("SELECT * FROM paper_trades WHERE id = ?", (trade_id,))
        if t["status"] != "OPEN":
            return self.get_trade(trade_id)
        q = self.market.get_spot_price(t["asset"])
        now = self.clock.now()
        candles, src = self.market.get_candles(t["asset"], "5m", start=parse_iso(t["entry_time"]), end=now)
        res = evaluate_path(t["direction"], t["entry_price_usd"], parse_iso(t["entry_time"]), t["stop_price_usd"],
                            t["target_price_usd"], parse_iso(t["expires_at"]), candles, now)
        sign = 1 if t["direction"] == "LONG" else -1
        mfe = max(res.mfe_price, q.price_usd) if sign > 0 else min(res.mfe_price, q.price_usd)
        mae = min(res.mae_price, q.price_usd) if sign > 0 else max(res.mae_price, q.price_usd)
        if not self._close(t, "MANUAL", q.price_usd, now, mfe, mae, res.candles_used, q.source):
            raise DataUnavailable("Cannot close: GBP/USD FX unavailable")
        return self.get_trade(trade_id)

    def _close(self, t, reason, price, when, mfe, mae, path, src) -> dict | None:
        fx = self._fx()
        if not fx:
            log(logger, logging.WARNING, "close_deferred_no_fx", trade=t["id"])
            return None
        out = self.portfolio.close_trade(t, exit_reason=reason, exit_price=price, exit_time=when,
                                         fx_exit=fx.usd_per_gbp, mfe_price=mfe, mae_price=mae, path=path,
                                         data_source=src)
        entry_time = parse_iso(t["entry_time"])
        atr = next((e["value"] for e in (t.get("evidence_json") or []) if e["key"] == "atr_14"), None)
        max_bar = max((abs(c.close - c.open) for c in path), default=0.0)
        ctx = {"asset_ret_hold_pct": (price / t["entry_price_usd"] - 1) * 100,
               "btc_ret_hold_pct": (self._hold_return("BTC", entry_time, when) if t["asset"] != "BTC"
                                    else (price / t["entry_price_usd"] - 1) * 100),
               "max_bar_move_atr": max_bar / atr if atr else None}
        lesson = self.learning.review(t, out, ctx)
        self._snapshot()
        out = self.db.one("SELECT * FROM trade_outcomes WHERE trade_id = ?", (t["id"],))
        self.event("TRADE_CLOSED", f"{t['asset']} {t['direction']} closed ({reason}) "
                                   f"{'+' if out['net_pnl_gbp'] >= 0 else '−'}£{abs(out['net_pnl_gbp']):.2f}",
                   t["asset"], {"net_pnl_gbp": out["net_pnl_gbp"], "exit_reason": reason,
                                "exit_price": price, "thesis_correct": out["thesis_correct"],
                                "lesson": lesson["lesson"]}, "trade", t["id"])
        self.event("LESSON", f"{t['asset']}: lesson recorded ({lesson['validation_status']})", t["asset"],
                   {"lesson": lesson["lesson"], "failure_category": lesson["failure_category"]}, "trade", t["id"])
        return out

    def _snapshot(self) -> None:
        fx = self._fx()
        st = self.portfolio.state(self._open_position_prices(), fx.usd_per_gbp if fx else None)
        if not st["unpriced_positions"]:
            self.portfolio.snapshot(st, fx.usd_per_gbp if fx else None)

    def run_followups(self) -> int:
        n = 0
        due = self.db.all("SELECT * FROM lessons WHERE followup_due_at IS NOT NULL AND followup_json IS NULL "
                          "AND followup_due_at <= ?", (iso(self.clock.now()),))
        for lesson in due:
            t = self.db.one("SELECT * FROM paper_trades WHERE id = ?", (lesson["trade_id"],))
            due_at = parse_iso(lesson["followup_due_at"])
            try:
                candles, _ = self.market.get_candles(t["asset"], "5m", start=due_at, end=due_at + timedelta(hours=1))
                after = [c for c in candles if c.open_time >= due_at]
                price = after[0].open if after else None
            except DataUnavailable:
                price = None
            updated = self.learning.complete_followup(lesson, t, price)
            if updated.get("followup_json"):
                n += 1
                self.event("FOLLOWUP", f"{t['asset']}: horizon-end timing check completed", t["asset"],
                           {"timing_assessment": updated["timing_assessment"]}, "trade", t["id"])
        return n

    # -- automated monitor ------------------------------------------------------
    def monitor_cycle(self) -> dict:
        started = self.clock.now()
        run_id = self.db.insert("monitor_runs", {"started_at": iso(started), "status": "running"})
        errors, triggers, investigations = [], {}, []
        closed = []
        try:
            closed = [c["trade_id"] for c in self.update_open_positions()]
            self.run_followups()
            self.ensure_benchmark()
            feats, errs = self.universe_features()
            errors += [f"{a}: {e}" for a, e in errs.items()]
            for asset, f in feats.items():
                tr = detect_triggers(f, self.s)
                if tr:
                    triggers[asset] = tr
            cutoff = iso(self.clock.now() - timedelta(minutes=self.s.investigation_cooldown_minutes))
            held = {t["asset"] for t in self.portfolio.open_trades()}
            for asset, tr in sorted(triggers.items(), key=lambda kv: -len(kv[1])):
                if len(investigations) >= self.s.max_investigations_per_run:
                    break
                if asset in held:  # the risk engine would block a duplicate anyway: don't spend an agent call
                    continue
                recent = self.db.one("SELECT id FROM investigations WHERE asset = ? AND created_at >= ? "
                                     "AND status = 'complete'", (asset, cutoff))
                if recent:
                    continue
                inv = self.run_investigation(asset, "monitor", tr)
                investigations.append({"id": inv["id"], "asset": asset, "decision": inv["final_decision"]})
            fx = self._fx()
            st = self.portfolio.state(self._open_position_prices(), fx.usd_per_gbp if fx else None)
            if not st["unpriced_positions"]:
                self.portfolio.snapshot(st, fx.usd_per_gbp if fx else None)
            status = "ok" if not errors else "partial"
        except Exception as e:  # never let the scheduler die silently
            log(logger, logging.ERROR, "monitor_failed", error=str(e))
            errors.append(f"{type(e).__name__}: {e}")
            status = "error"
        scanned = self.market.active_assets() if status != "error" else []
        if not scanned or status == "error":
            title = "Monitor scan: market data unavailable — nothing evaluated"
        elif triggers:
            title = f"Monitor scan: {len(triggers)} triggered, {len(investigations)} investigated"
        else:
            title = "Monitor scan: no qualifying signal (no LLM calls made)"
        self.db.update("monitor_runs", "id", run_id, {
            "finished_at": iso(self.clock.now()), "status": status,
            "assets_scanned_json": scanned,
            "triggers_json": triggers, "investigations_json": investigations,
            "positions_closed_json": closed, "errors_json": errors})
        self.event("MONITOR_RUN", title, None, {"status": status, "triggers": triggers, "errors": errors[:5]},
                   "monitor_run", str(run_id))
        return self.db.one("SELECT * FROM monitor_runs WHERE id = ?", (run_id,))

    # -- read models for the UI -------------------------------------------------
    def prices(self) -> dict:
        res = self.market.resolve_universe()
        out = {"assets": [], "removed": res.removed, "error": res.error}
        for a in self.s.universe:
            if a not in res.active:
                continue
            try:
                q = self.market.get_spot_price(a)
                chg = None
                try:
                    c, _ = self._closed_1h(a)
                    if len(c) >= 25:
                        chg = (q.price_usd / c[-25].close - 1) * 100
                except DataUnavailable:
                    pass
                out["assets"].append({"asset": a, "price_usd": q.price_usd, "timestamp": iso(q.timestamp),
                                      "source": q.source, "available": True, "change_24h_pct": chg})
            except DataUnavailable as e:
                out["assets"].append({"asset": a, "available": False, "error": str(e)})
        return out

    def overview(self) -> dict:
        fund = self.portfolio.ensure_fund()
        fx = self._fx()
        fxv = fx.usd_per_gbp if fx else None
        st = self.portfolio.state(self._open_position_prices(), fxv)
        closed = self.portfolio.closed_trades()
        snaps = self.db.all("SELECT * FROM equity_snapshots ORDER BY taken_at")
        now = self.clock.now()
        em = equity_metrics(snaps, fund["starting_capital"], st["equity_gbp"], parse_iso(fund["created_at"]), now, self.s)
        try:
            btc_now = self.market.get_spot_price("BTC").price_usd
        except DataUnavailable:
            btc_now = None
        bench = {"btc_buy_and_hold": btc_buy_and_hold(fund, btc_now, fxv)}
        if fund.get("benchmark_start_at"):
            start = parse_iso(fund["benchmark_start_at"])
            try:
                c, _ = self.market.get_candles("BTC", "1h", start=start - timedelta(hours=60), end=now)
                bench["sma_baseline"] = sma_baseline(closed_only(c, now), start, self.s)
            except DataUnavailable as e:
                bench["sma_baseline"] = {"available": False, "reason": f"Data unavailable: {e}"}
            fund_ret = (st["equity_gbp"] / fund["starting_capital"] - 1) * 100
            bench["ai_strategy_return_pct_gbp"] = fund_ret
            bench["period_start"] = fund["benchmark_start_at"]
            bench["period_days"] = (now - start).total_seconds() / 86400
        else:
            bench["sma_baseline"] = {"available": False, "reason": "Benchmark period not started (no BTC data yet)"}
        return {"disclaimer": DISCLAIMER, "fund": fund, "state": st, "fx": fx.__dict__ if fx else None,
                "equity_metrics": em, "trade_metrics": trade_metrics(closed, self.s), "benchmarks": bench,
                "warnings": drawdown_warnings(em["current_drawdown_pct"], em["max_drawdown_pct"], self.s)
                + ([f"Open positions without a current price (valued at entry): {st['unpriced_positions']}"]
                   if st["unpriced_positions"] else [])
                + (["GBP/USD FX unavailable — fund marked at entry values"] if not fx else []),
                "llm": {"available": self.llm.available, "engine": self.llm.engine_name if self.llm.available
                        else "rules:v1 (LLM not configured)"},
                "risk_config": {k: getattr(self.s, k) for k in (
                    "max_risk_per_trade_pct", "max_open_positions", "max_portfolio_exposure_pct", "min_reward_risk",
                    "daily_loss_limit_pct", "fee_bps_per_side", "slippage_bps_per_side", "allow_short")}}

    def arena(self) -> dict:
        """Race view: AI fund vs baselines on one % axis, from the same fixed start, plus a leaderboard."""
        ov = self.overview()
        fund, b = ov["fund"], ov["benchmarks"]
        start_cap = fund["starting_capital"]
        snaps = self.db.all("SELECT taken_at, equity_gbp FROM equity_snapshots ORDER BY taken_at")
        ai = [(fund["created_at"], 0.0)] + [(x["taken_at"], (x["equity_gbp"] / start_cap - 1) * 100) for x in snaps]
        ai.append((iso(self.clock.now()), (ov["state"]["equity_gbp"] / start_cap - 1) * 100))
        series = [{"id": "ai", "name": "Adaptive Quant (AI)", "unit": "GBP, net of est. costs", "points": ai}]
        if fund.get("benchmark_start_at"):
            start = parse_iso(fund["benchmark_start_at"])
            try:
                now = self.clock.now()
                c, _ = self.market.get_candles("BTC", "1h", start=start - timedelta(hours=1), end=now)
                c = [x for x in closed_only(c, now) if x.open_time >= start]
                p0 = fund["benchmark_btc_price_usd"]
                pts = [(fund["benchmark_start_at"], 0.0)] + [(x.close_time.isoformat(), (x.close / p0 - 1) * 100)
                                                             for x in c]
                if b["btc_buy_and_hold"].get("available"):
                    pts.append((iso(now), b["btc_buy_and_hold"]["return_pct_usd"]))
                series.append({"id": "hodl", "name": "BTC buy & hold", "unit": "USD price return", "points": pts})
            except DataUnavailable:
                pass
            if b["sma_baseline"].get("available"):
                series.append({"id": "sma", "name": "SMA50 trend bot", "unit": "USD, costs incl.",
                               "points": b["sma_baseline"]["curve"]})
        tm = ov["trade_metrics"]
        board = [{"id": "ai", "name": "Adaptive Quant (AI)", "return_pct": b.get("ai_strategy_return_pct_gbp",
                                                                                  ov["equity_metrics"]["total_return_pct"]),
                  "trades": tm["number_of_trades"], "win_rate_pct": tm["win_rate_pct"],
                  "value_gbp": ov["state"]["equity_gbp"], "note": tm["evidence_quality"]["label"]}]
        bh = b["btc_buy_and_hold"]
        board.append({"id": "hodl", "name": "BTC buy & hold", "return_pct": bh.get("return_pct_gbp"),
                      "trades": 1 if bh.get("available") else 0, "win_rate_pct": None,
                      "value_gbp": bh.get("value_gbp"), "note": "GBP" if bh.get("available") else bh.get("reason")})
        sm = b["sma_baseline"]
        board.append({"id": "sma", "name": "SMA50 trend bot", "return_pct": sm.get("return_pct_usd"),
                      "trades": sm.get("switches"), "win_rate_pct": None,
                      "value_gbp": start_cap * (1 + sm["return_pct_usd"] / 100) if sm.get("available") else None,
                      "note": "USD price return" if sm.get("available") else sm.get("reason")})
        board.sort(key=lambda r: (r["return_pct"] is None, -(r["return_pct"] or 0)))
        return {"overview": ov, "series": series, "leaderboard": board}

    def investment_trend(self) -> dict:
        """Fund value per day since inception, from recorded equity snapshots only (no interpolation).
        Day 1 = the fund's creation date (UTC). Each day's value is its last snapshot; high/low are the
        extremes recorded that day. Days without any snapshot are reported as gaps, not filled in."""
        fund = self.portfolio.ensure_fund()
        start_cap = fund["starting_capital"]
        created = parse_iso(fund["created_at"])
        fx = self._fx()
        st = self.portfolio.state(self._open_position_prices(), fx.usd_per_gbp if fx else None)
        rows = [(parse_iso(x["taken_at"]), x["equity_gbp"])
                for x in self.db.all("SELECT taken_at, equity_gbp FROM equity_snapshots ORDER BY taken_at")]
        rows = [(created, start_cap)] + rows + [(self.clock.now(), st["equity_gbp"])]
        days: dict[int, dict] = {}
        for t, e in rows:
            n = (t.date() - created.date()).days + 1
            d = days.setdefault(n, {"day": n, "date": t.date().isoformat(), "high_gbp": e, "low_gbp": e,
                                    "snapshots": 0})
            d["value_gbp"] = e
            d["high_gbp"], d["low_gbp"] = max(d["high_gbp"], e), min(d["low_gbp"], e)
            d["snapshots"] += 1
        points = []
        for n in sorted(days):
            d = days[n]
            d["change_from_start_gbp"] = d["value_gbp"] - start_cap
            d["return_pct"] = (d["value_gbp"] / start_cap - 1) * 100
            points.append(d)
        last = points[-1]["day"]
        missing = [n for n in range(1, last + 1) if n not in days]
        return {"starting_capital_gbp": start_cap, "inception": fund["created_at"], "points": points,
                "days_elapsed": last, "missing_days": missing,
                "note": ("Values are the last recorded equity of each UTC day (realised + marked-to-market open "
                         "positions, net of estimated costs). Days with no recording are left as gaps.")}

    # -- trading terminal (Binance-style) ----------------------------------------
    BARS = {"5m": 288, "1h": 168, "1d": 120}

    def market_view(self, asset: str, interval: str = "1h") -> dict:
        """Candles (closed bars + the still-forming bar, flagged), 24h stats and paper-trade markers."""
        asset = asset.upper()
        if interval not in self.BARS:
            raise ValueError("interval must be one of " + ", ".join(self.BARS))
        now = self.clock.now()
        n = self.BARS[interval]
        step = {"5m": timedelta(minutes=5), "1h": timedelta(hours=1), "1d": timedelta(days=1)}[interval]
        end = now.replace(second=0, microsecond=0)
        candles, src = self.market_data_candles(asset, interval, end - step * n, end)
        out = [{"t": c.open_time.isoformat(), "o": c.open, "h": c.high, "l": c.low, "c": c.close, "v": c.volume,
                "closed": c.is_closed(now)} for c in candles]
        stats = {"asset": asset, "source": src}
        try:
            q = self.market.get_spot_price(asset)
            stats.update(price_usd=q.price_usd, price_time=iso(q.timestamp))
        except DataUnavailable:
            stats["price_usd"] = out[-1]["c"] if out else None
        try:
            h1, _ = self.market_data_candles(asset, "1h", end - timedelta(hours=25), end)
            day = [c for c in h1 if c.open_time >= now - timedelta(hours=24)]
            if day:
                stats.update(change_24h_pct=(stats["price_usd"] / day[0].open - 1) * 100 if stats["price_usd"] else None,
                             high_24h=max(c.high for c in day), low_24h=min(c.low for c in day),
                             volume_24h_base=sum(c.volume for c in day),
                             volume_24h_usd=sum(c.volume * c.close for c in day))
        except DataUnavailable:
            pass
        trades = self.db.all("SELECT t.id, t.direction, t.status, t.entry_time, t.entry_price_usd, t.stop_price_usd, "
                             "t.target_price_usd, o.exit_time, o.exit_price_usd, o.exit_reason, o.net_pnl_gbp "
                             "FROM paper_trades t LEFT JOIN trade_outcomes o ON o.trade_id = t.id WHERE t.asset = ? "
                             "ORDER BY t.entry_time", (asset,))
        return {"asset": asset, "interval": interval, "candles": out, "stats": stats, "trades": trades}

    def market_data_candles(self, asset, interval, start, end):
        return self.market.get_candles(asset, interval, start=start, end=end)

    def order_book(self, asset: str, depth: int = 14) -> dict:
        b = self.market.get_order_book(asset.upper())
        bids, asks = b.bids[:depth], b.asks[:depth]
        mid = (bids[0][0] + asks[0][0]) / 2 if bids and asks else None
        return {"asset": b.asset, "source": b.source, "timestamp": iso(b.timestamp), "bids": bids, "asks": asks,
                "mid": mid, "spread_bps": (asks[0][0] - bids[0][0]) / mid * 1e4 if mid else None}

    # -- portfolio (CoinMarketCap-style) -----------------------------------------
    def equity_series(self) -> dict:
        fund = self.portfolio.ensure_fund()
        fx = self._fx()
        st = self.portfolio.state(self._open_position_prices(), fx.usd_per_gbp if fx else None)
        pts = [(fund["created_at"], fund["starting_capital"])] + [
            (x["taken_at"], x["equity_gbp"]) for x in self.db.all("SELECT taken_at, equity_gbp FROM equity_snapshots "
                                                                    "ORDER BY taken_at")]
        pts.append((iso(self.clock.now()), st["equity_gbp"]))
        return {"starting_capital_gbp": fund["starting_capital"], "points": pts}

    def portfolio_view(self) -> dict:
        ov = self.overview()
        st, fund = ov["state"], ov["fund"]
        fx = (ov.get("fx") or {}).get("usd_per_gbp")
        prices = {a["asset"]: a for a in self.prices()["assets"] if a.get("available")}
        rows, invested = [], 0.0
        for t in self.portfolio.open_trades():
            p = prices.get(t["asset"], {})
            px = p.get("price_usd")
            sign = 1 if t["direction"] == "LONG" else -1
            value = t["units"] * px / fx if px and fx else None
            pnl = t["units"] * (px - t["entry_price_usd"]) * sign / fx if px and fx else None
            cost = t["units"] * t["entry_price_usd"] / t["fx_entry_usd_per_gbp"]
            invested += value if value is not None else cost
            rows.append({"trade_id": t["id"], "asset": t["asset"], "direction": t["direction"], "price_usd": px,
                         "change_24h_pct": p.get("change_24h_pct"), "units": t["units"], "value_gbp": value,
                         "avg_buy_usd": t["entry_price_usd"], "cost_gbp": cost, "pnl_gbp": pnl,
                         "pnl_pct": pnl / cost * 100 if pnl is not None and cost else None})
        realized = {r["asset"]: r for r in self.db.all(
            "SELECT t.asset, COUNT(*) AS trades, SUM(o.net_pnl_gbp) AS pnl FROM paper_trades t "
            "JOIN trade_outcomes o ON o.trade_id = t.id GROUP BY t.asset")}
        per_asset = {}
        for a, r in realized.items():
            per_asset[a] = r["pnl"]
        for r in rows:
            if r["pnl_gbp"] is not None:
                per_asset[r["asset"]] = per_asset.get(r["asset"], 0.0) + r["pnl_gbp"]
        best = max(per_asset.items(), key=lambda kv: kv[1]) if per_asset else None
        worst = min(per_asset.items(), key=lambda kv: kv[1]) if per_asset else None
        uninvested = st["equity_gbp"] - invested
        alloc = [{"label": r["asset"] + (" (short)" if r["direction"] == "SHORT" else ""),
                  "value_gbp": r["value_gbp"] if r["value_gbp"] is not None else r["cost_gbp"]} for r in rows]
        alloc.append({"label": "Uninvested (GBP)", "value_gbp": max(uninvested, 0.0)})
        snaps = self.db.all("SELECT taken_at, equity_gbp FROM equity_snapshots WHERE taken_at <= ? "
                            "ORDER BY taken_at DESC LIMIT 1", (iso(self.clock.now() - timedelta(hours=24)),))
        base24 = snaps[0]["equity_gbp"] if snaps else None
        txs = self.db.all("SELECT t.id, t.asset, t.direction, t.entry_time, t.entry_price_usd, t.units, t.notional_gbp, "
                          "t.status, o.exit_time, o.exit_price_usd, o.exit_reason, o.net_pnl_gbp FROM paper_trades t "
                          "LEFT JOIN trade_outcomes o ON o.trade_id = t.id ORDER BY t.entry_time DESC LIMIT 50")
        return {"disclaimer": ov["disclaimer"], "balance_gbp": st["equity_gbp"],
                "starting_capital_gbp": fund["starting_capital"],
                "change_24h_gbp": st["equity_gbp"] - base24 if base24 is not None else None,
                "change_24h_pct": (st["equity_gbp"] / base24 - 1) * 100 if base24 else None,
                "all_time_profit_gbp": st["equity_gbp"] - fund["starting_capital"],
                "all_time_profit_pct": (st["equity_gbp"] / fund["starting_capital"] - 1) * 100,
                "best_performer": {"asset": best[0], "pnl_gbp": best[1]} if best else None,
                "worst_performer": {"asset": worst[0], "pnl_gbp": worst[1]} if worst else None,
                "holdings": rows, "uninvested_gbp": uninvested, "allocation": alloc,
                "realized_by_asset": list(realized.values()), "transactions": txs,
                "evidence_quality": ov["trade_metrics"]["evidence_quality"], "benchmarks": ov["benchmarks"],
                "warnings": ov["warnings"]}

    def get_trade(self, trade_id: str) -> dict | None:
        t = self.db.one("SELECT * FROM paper_trades WHERE id = ?", (trade_id,))
        if not t:
            return None
        t["outcome"] = self.db.one("SELECT * FROM trade_outcomes WHERE trade_id = ?", (trade_id,))
        t["lessons"] = self.db.all("SELECT * FROM lessons WHERE trade_id = ?", (trade_id,))
        t["investigation"] = self.get_investigation(t["investigation_id"])
        return t

    def trade_chart(self, trade_id: str) -> dict:
        """Pre-entry context (stored at decision time) + post-entry path (stored at close, or live if open)."""
        t = self.db.one("SELECT * FROM paper_trades WHERE id = ?", (trade_id,))
        if not t:
            raise ValueError("unknown trade")
        inv = self.get_investigation(t["investigation_id"])
        before = (inv.get("observation") or {}).get("context_candles_json") or []
        out = self.db.one("SELECT * FROM trade_outcomes WHERE trade_id = ?", (trade_id,))
        after, live_error = [], None
        if out:
            after = out.get("price_path_json") or []
        else:
            now = self.clock.now()
            try:
                c, _ = self.market.get_candles(t["asset"], "5m", start=parse_iso(t["entry_time"]), end=now)
                after = [x.to_dict() for x in closed_only(c, now)]
            except DataUnavailable as e:
                live_error = f"Data unavailable: {e}"
        return {"before_1h": before, "after_5m": after, "entry_time": t["entry_time"],
                "entry": t["entry_price_usd"], "stop": t["stop_price_usd"], "target": t["target_price_usd"],
                "exit": out["exit_price_usd"] if out else None, "exit_time": out["exit_time"] if out else None,
                "live_error": live_error}

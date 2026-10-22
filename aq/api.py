"""HTTP API + static dashboard. Run: python -m aq (or uvicorn aq.api:app)."""
from __future__ import annotations

import logging
import threading
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from aq.agents.schemas import RESEARCH_CONFIDENCE_NOTE, RESEARCH_CONFIDENCE_SCALE
from aq.config import get_settings
from aq.data.base import DataUnavailable
from aq.data.service import build_default_service
from aq.db import Database
from aq.engine import Engine
from aq.features import FEATURE_DOCS
from aq.logging_setup import log, setup_logging

logger = logging.getLogger("aq.api")
WEB = Path(__file__).resolve().parent.parent / "web"


class InvestigateRequest(BaseModel):
    asset: str


def create_app(engine: Engine | None = None, start_scheduler: bool | None = None) -> FastAPI:
    setup_logging()
    if engine is None:
        s = get_settings()
        engine = Engine(s, Database(s.db_path), build_default_service(s))
    s = engine.s
    run_lock = threading.Lock()  # serialise investigations/monitor runs (single-writer ledger)
    scheduler_holder = {}

    @asynccontextmanager
    async def lifespan(app):
        if start_scheduler if start_scheduler is not None else s.monitor_enabled:
            from apscheduler.schedulers.background import BackgroundScheduler
            sched = BackgroundScheduler(timezone="UTC")

            def job():
                with run_lock:
                    engine.monitor_cycle()
            sched.add_job(job, "interval", minutes=s.monitor_interval_minutes, id="monitor", max_instances=1,
                          coalesce=True)
            sched.start()
            scheduler_holder["s"] = sched
            log(logger, logging.INFO, "scheduler_started", interval_min=s.monitor_interval_minutes)
        yield
        if "s" in scheduler_holder:
            scheduler_holder["s"].shutdown(wait=False)

    app = FastAPI(title="Adaptive Quant", version="0.1.0", lifespan=lifespan)
    app.state.engine = engine

    @app.exception_handler(DataUnavailable)
    async def _du(_, exc):
        return JSONResponse(status_code=503, content={"error": "Data unavailable", "detail": str(exc)})

    @app.get("/api/status")
    def status():
        res = engine.market.resolve_universe()
        sched = scheduler_holder.get("s")
        job = sched.get_job("monitor") if sched else None
        return {"providers": engine.market.health_report(), "universe": {"active": res.active, "removed": res.removed,
                                                                           "error": res.error},
                "llm": {"available": engine.llm.available,
                        "engine": engine.llm.engine_name if engine.llm.available else "rules:v1",
                        "note": None if engine.llm.available else
                        "ANTHROPIC_API_KEY not set — agents run the transparent rule engine (rules:v1)."},
                "news": engine.news.status(), "social": engine.social.status(),
                "monitor": {"enabled": bool(sched), "interval_minutes": s.monitor_interval_minutes,
                            "next_run": job.next_run_time.isoformat() if job and job.next_run_time else None}}

    @app.get("/api/config")
    def config():
        return {"settings": s.public_dict(), "feature_docs": FEATURE_DOCS,
                "research_confidence_scale": RESEARCH_CONFIDENCE_SCALE,
                "research_confidence_note": RESEARCH_CONFIDENCE_NOTE}

    @app.get("/api/prices")
    def prices():
        return engine.prices()

    @app.get("/api/overview")
    def overview():
        return engine.overview()

    @app.get("/api/arena")
    def arena():
        return engine.arena()

    @app.get("/api/market/{asset}")
    def market(asset: str, interval: str = "1h"):
        try:
            return engine.market_view(asset, interval)
        except ValueError as e:
            raise HTTPException(400, str(e))

    @app.get("/api/orderbook/{asset}")
    def orderbook(asset: str, depth: int = 14):
        return engine.order_book(asset, min(depth, 50))

    @app.get("/api/portfolio")
    def portfolio():
        return engine.portfolio_view()

    @app.get("/api/equity-series")
    def equity_series():
        return engine.equity_series()

    @app.get("/api/investment-trend")
    def investment_trend():
        return engine.investment_trend()

    @app.get("/api/feed")
    def feed(limit: int = 50, before_id: int | None = None):
        if before_id:
            return engine.db.all("SELECT * FROM events WHERE id < ? ORDER BY id DESC LIMIT ?", (before_id, limit))
        return engine.db.all("SELECT * FROM events ORDER BY id DESC LIMIT ?", (min(limit, 200),))

    @app.post("/api/investigations")
    def investigate(req: InvestigateRequest):
        if not run_lock.acquire(timeout=120):
            raise HTTPException(409, "Another investigation or monitor run is in progress")
        try:
            return engine.run_investigation(req.asset, "manual")
        finally:
            run_lock.release()

    @app.get("/api/investigations")
    def investigations(limit: int = 50):
        return engine.db.all("SELECT id, created_at, asset, trigger, proposed_action, research_confidence, "
                             "final_decision, final_reason, status, scout_engine, situation_summary FROM investigations "
                             "ORDER BY created_at DESC LIMIT ?", (limit,))

    @app.get("/api/investigations/{inv_id}")
    def investigation(inv_id: str):
        inv = engine.get_investigation(inv_id)
        if not inv:
            raise HTTPException(404, "not found")
        return inv

    @app.get("/api/trades")
    def trades():
        return engine.db.all("SELECT t.*, o.exit_price_usd, o.exit_time, o.exit_reason, o.net_pnl_gbp, o.thesis_correct "
                             "FROM paper_trades t LEFT JOIN trade_outcomes o ON o.trade_id = t.id "
                             "ORDER BY t.entry_time DESC")

    @app.get("/api/trades/{trade_id}")
    def trade(trade_id: str):
        t = engine.get_trade(trade_id)
        if not t:
            raise HTTPException(404, "not found")
        return t

    @app.get("/api/trades/{trade_id}/chart")
    def trade_chart(trade_id: str):
        try:
            return engine.trade_chart(trade_id)
        except ValueError:
            raise HTTPException(404, "not found")

    @app.post("/api/trades/{trade_id}/close")
    def close_trade(trade_id: str):
        with run_lock:
            try:
                return engine.close_manually(trade_id)
            except ValueError as e:
                raise HTTPException(404, str(e))

    @app.get("/api/lessons")
    def lessons():
        return engine.db.all("SELECT l.*, t.asset, t.direction FROM lessons l JOIN paper_trades t ON t.id = l.trade_id "
                             "ORDER BY l.created_at DESC")

    @app.get("/api/lessons/summary")
    def lessons_summary():
        return {"groups": engine.learning.summary(), "min_evidence": s.lesson_min_evidence,
                "policy": "Lessons never change strategy automatically. A group becomes a candidate for HUMAN review "
                          f"only after {s.lesson_min_evidence} similar observations."}

    @app.post("/api/monitor/run")
    def monitor_run():
        if not run_lock.acquire(timeout=120):
            raise HTTPException(409, "Another run is in progress")
        try:
            return engine.monitor_cycle()
        finally:
            run_lock.release()

    @app.get("/api/monitor/runs")
    def monitor_runs(limit: int = 20):
        return engine.db.all("SELECT * FROM monitor_runs ORDER BY id DESC LIMIT ?", (limit,))

    @app.get("/")
    def index():
        return FileResponse(WEB / "index.html")

    app.mount("/static", StaticFiles(directory=WEB), name="static")
    return app


def __getattr__(name):  # lazy `app` for `uvicorn aq.api:app`
    if name == "app":
        globals()["app"] = create_app()
        return globals()["app"]
    raise AttributeError(name)

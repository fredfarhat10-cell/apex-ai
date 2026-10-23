"""Deployment guards: dashboard password, public read-only mode, health endpoint, LLM spend cap."""
import base64
from dataclasses import replace

import pytest
from fastapi.testclient import TestClient

from aq.agents.llm import LLMClient, LLMUnavailable
from aq.api import create_app


def _auth(pw):
    return {"Authorization": "Basic " + base64.b64encode(f"admin:{pw}".encode()).decode()}


def test_password_protects_everything_but_health(make_engine):
    eng, _, _ = make_engine(dashboard_password="s3cret")
    c = TestClient(create_app(eng, start_scheduler=False))
    assert c.get("/healthz").status_code == 200
    r = c.get("/api/overview")
    assert r.status_code == 401 and "Basic" in r.headers["www-authenticate"]
    assert c.get("/api/overview", headers=_auth("wrong")).status_code == 401
    assert c.get("/api/overview", headers=_auth("s3cret")).status_code == 200
    assert c.post("/api/investigations", json={"asset": "ETH"}).status_code == 401


def test_public_read_only_mode(make_engine):
    eng, _, _ = make_engine(dashboard_password="s3cret", public_read_only=True)
    c = TestClient(create_app(eng, start_scheduler=False))
    assert c.get("/api/overview").status_code == 200
    assert c.post("/api/investigations", json={"asset": "ETH"}).status_code == 401
    assert c.post("/api/investigations", json={"asset": "ETH"}, headers=_auth("s3cret")).status_code == 200


def test_health_reports_without_secrets(make_engine):
    eng, _, _ = make_engine(dashboard_password="s3cret")
    c = TestClient(create_app(eng, start_scheduler=False))
    body = c.get("/healthz").json()
    assert body["status"] == "ok" and "s3cret" not in str(body)
    cfg = c.get("/api/config", headers=_auth("s3cret")).json()["settings"]
    assert "dashboard_password" not in cfg and cfg["dashboard_password_set"] is True


def test_llm_daily_cap(settings):
    llm = LLMClient(replace(settings, max_llm_calls_per_day=2))
    llm._spend_budget()
    llm._spend_budget()
    with pytest.raises(LLMUnavailable, match="daily LLM budget"):
        llm._spend_budget()

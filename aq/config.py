"""Runtime configuration, read from environment variables (and an optional .env file).

Every risk/cost parameter here is an *experiment parameter*, not a claim of optimality.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_dotenv(path: Path = ROOT / ".env") -> None:
    """Minimal .env loader: KEY=VALUE lines, does not override variables already set."""
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def _f(name: str, default: float) -> float:
    return float(os.environ.get(name, default))


def _i(name: str, default: int) -> int:
    return int(os.environ.get(name, default))


def _b(name: str, default: bool) -> bool:
    return os.environ.get(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def _list(name: str, default: str) -> tuple[str, ...]:
    return tuple(x.strip().upper() if name == "AQ_UNIVERSE" else x.strip().lower()
                 for x in os.environ.get(name, default).split(",") if x.strip())


@dataclass(frozen=True)
class Settings:
    db_path: str = str(ROOT / "data" / "adaptive_quant.db")
    fund_name: str = "Adaptive Quant Paper Fund"
    base_currency: str = "GBP"
    starting_capital: float = 10_000.0
    universe: tuple[str, ...] = ("BTC", "ETH", "SOL", "BNB", "XRP", "DOGE")
    providers: tuple[str, ...] = ("binance", "coinbase")

    # Risk engine (deterministic; the LLM cannot override these)
    max_risk_per_trade_pct: float = 0.5
    max_open_positions: int = 3
    max_portfolio_exposure_pct: float = 30.0
    min_reward_risk: float = 1.5
    daily_loss_limit_pct: float = 2.0
    drawdown_warning_levels: tuple[float, ...] = (5.0, 10.0, 15.0)
    allow_short: bool = False  # UK retail cannot access crypto derivatives (FCA, 2021): buy-only by default
    trade_on_monitor_verdict: bool = False
    min_position_gbp: float = 25.0
    max_data_staleness_minutes: int = 120

    # Cost assumptions (per side, in basis points). Conservative retail-taker defaults.
    fee_bps_per_side: float = 10.0
    slippage_bps_per_side: float = 10.0          # fallback when no order book is available
    min_slippage_bps_per_side: float = 2.0       # floor applied to order-book estimates
    short_borrow_bps_per_day: float = 5.0        # fallback short cost when no funding data
    use_order_book: bool = True

    # Automated monitor
    monitor_enabled: bool = True
    monitor_interval_minutes: int = 15
    investigation_cooldown_minutes: int = 240
    max_investigations_per_run: int = 2
    trigger_abs_z_4h: float = 2.5
    trigger_volume_ratio_4h: float = 2.5
    trigger_vol_regime_ratio: float = 1.8
    trigger_range_breakout: bool = True

    # Experience memory (similar past trades shown to agents at decision time)
    memory_k: int = 5
    memory_min_similar: int = 5  # below this, memory is informational only (no challenge weight)

    # Learning loop
    lesson_min_evidence: int = 10
    min_trades_for_metrics: int = 20
    min_days_for_sharpe: int = 30

    # LLM
    anthropic_api_key_present: bool = False
    llm_model: str = "claude-opus-5-5"
    llm_effort: str = "medium"
    llm_fallbacks: bool = True
    llm_enabled: bool = True
    max_llm_calls_per_day: int = 60  # hard spend cap; beyond it agents fall back to rules:v1 (labelled)

    # Deployment
    dashboard_password: str = ""  # when set, HTTP Basic auth protects the app (user: admin)
    public_read_only: bool = False  # with a password: anyone may view, only the password holder may act
    cors_origins: tuple[str, ...] = ()

    extra: dict = field(default_factory=dict)

    @property
    def llm_available(self) -> bool:
        return self.llm_enabled and self.anthropic_api_key_present

    def public_dict(self) -> dict:
        """Config safe to expose to the UI (never includes secrets)."""
        d = {k: getattr(self, k) for k in self.__dataclass_fields__ if k not in ("extra", "dashboard_password")}
        d["dashboard_password_set"] = bool(self.dashboard_password)
        d["llm_available"] = self.llm_available
        return d


def get_settings() -> Settings:
    load_dotenv()
    return Settings(
        db_path=os.environ.get("AQ_DB_PATH", Settings.db_path),
        starting_capital=_f("AQ_STARTING_CAPITAL", 10_000.0),
        universe=_list("AQ_UNIVERSE", "BTC,ETH,SOL,BNB,XRP,DOGE"),
        providers=_list("AQ_PROVIDERS", "binance,coinbase"),
        max_risk_per_trade_pct=_f("AQ_MAX_RISK_PER_TRADE_PCT", 0.5),
        max_open_positions=_i("AQ_MAX_OPEN_POSITIONS", 3),
        max_portfolio_exposure_pct=_f("AQ_MAX_PORTFOLIO_EXPOSURE_PCT", 30.0),
        min_reward_risk=_f("AQ_MIN_REWARD_RISK", 1.5),
        daily_loss_limit_pct=_f("AQ_DAILY_LOSS_LIMIT_PCT", 2.0),
        allow_short=_b("AQ_ALLOW_SHORT", False),
        trade_on_monitor_verdict=_b("AQ_TRADE_ON_MONITOR_VERDICT", False),
        min_position_gbp=_f("AQ_MIN_POSITION_GBP", 25.0),
        max_data_staleness_minutes=_i("AQ_MAX_DATA_STALENESS_MINUTES", 120),
        fee_bps_per_side=_f("AQ_FEE_BPS_PER_SIDE", 10.0),
        slippage_bps_per_side=_f("AQ_SLIPPAGE_BPS_PER_SIDE", 10.0),
        min_slippage_bps_per_side=_f("AQ_MIN_SLIPPAGE_BPS_PER_SIDE", 2.0),
        short_borrow_bps_per_day=_f("AQ_SHORT_BORROW_BPS_PER_DAY", 5.0),
        use_order_book=_b("AQ_USE_ORDER_BOOK", True),
        memory_k=_i("AQ_MEMORY_K", 5),
        memory_min_similar=_i("AQ_MEMORY_MIN_SIMILAR", 5),
        monitor_enabled=_b("AQ_MONITOR_ENABLED", True),
        monitor_interval_minutes=_i("AQ_MONITOR_INTERVAL_MINUTES", 15),
        investigation_cooldown_minutes=_i("AQ_INVESTIGATION_COOLDOWN_MINUTES", 240),
        max_investigations_per_run=_i("AQ_MAX_INVESTIGATIONS_PER_RUN", 2),
        trigger_abs_z_4h=_f("AQ_TRIGGER_ABS_Z_4H", 2.5),
        trigger_volume_ratio_4h=_f("AQ_TRIGGER_VOLUME_RATIO_4H", 2.5),
        trigger_vol_regime_ratio=_f("AQ_TRIGGER_VOL_REGIME_RATIO", 1.8),
        trigger_range_breakout=_b("AQ_TRIGGER_RANGE_BREAKOUT", True),
        lesson_min_evidence=_i("AQ_LESSON_MIN_EVIDENCE", 10),
        min_trades_for_metrics=_i("AQ_MIN_TRADES_FOR_METRICS", 20),
        min_days_for_sharpe=_i("AQ_MIN_DAYS_FOR_SHARPE", 30),
        anthropic_api_key_present=bool(os.environ.get("ANTHROPIC_API_KEY")),
        llm_model=os.environ.get("AQ_LLM_MODEL", "claude-opus-5-5"),
        llm_effort=os.environ.get("AQ_LLM_EFFORT", "medium"),
        llm_fallbacks=_b("AQ_LLM_FALLBACKS", True),
        llm_enabled=_b("AQ_LLM_ENABLED", True),
        max_llm_calls_per_day=_i("AQ_MAX_LLM_CALLS_PER_DAY", 60),
        dashboard_password=os.environ.get("AQ_DASHBOARD_PASSWORD", ""),
        public_read_only=_b("AQ_PUBLIC_READ_ONLY", False),
        cors_origins=tuple(o.strip() for o in os.environ.get("AQ_CORS_ORIGINS", "").split(",") if o.strip()),
    )

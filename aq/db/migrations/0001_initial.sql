-- Adaptive Quant experience ledger — initial schema.
-- Portable SQL (TEXT ISO-8601 UTC timestamps, JSON stored as TEXT) to ease a later move to PostgreSQL
-- (TEXT JSON columns -> JSONB, INTEGER PRIMARY KEY AUTOINCREMENT -> BIGSERIAL).

CREATE TABLE fund (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    base_currency TEXT NOT NULL,
    starting_capital REAL NOT NULL,
    created_at TEXT NOT NULL,
    benchmark_start_at TEXT,
    benchmark_btc_price_usd REAL,
    benchmark_fx_usd_per_gbp REAL,
    benchmark_source TEXT
);

CREATE TABLE market_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    observed_at TEXT NOT NULL,
    asset TEXT NOT NULL,
    price_usd REAL,
    price_timestamp TEXT,
    volume_24h REAL,
    features_json TEXT NOT NULL,
    context_candles_json TEXT,
    last_closed_candle_at TEXT,
    fx_usd_per_gbp REAL,
    fx_source TEXT,
    data_source TEXT NOT NULL
);
CREATE INDEX ix_obs_asset_time ON market_observations(asset, observed_at);

CREATE TABLE investigations (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    asset TEXT NOT NULL,
    trigger TEXT NOT NULL,                 -- manual | monitor
    trigger_reason_json TEXT,
    observation_id INTEGER REFERENCES market_observations(id),
    scout_engine TEXT,
    scout_output_json TEXT,
    situation_summary TEXT,
    evidence_json TEXT,
    thesis TEXT,
    confirmation_conditions_json TEXT,
    invalidation_conditions_json TEXT,
    proposed_action TEXT,                  -- LONG | SHORT | NO_TRADE
    horizon_hours INTEGER,
    research_confidence INTEGER,           -- 1..5 ordinal, NOT a probability
    final_decision TEXT,                   -- TRADE | NO_TRADE | ERROR
    final_reason TEXT,
    status TEXT NOT NULL                   -- complete | data_unavailable | error
);
CREATE INDEX ix_inv_asset_time ON investigations(asset, created_at);

CREATE TABLE challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investigation_id TEXT NOT NULL REFERENCES investigations(id),
    created_at TEXT NOT NULL,
    engine TEXT,
    devils_advocate_output_json TEXT,
    decision TEXT NOT NULL,                -- APPROVE | VETO | MONITOR | NOT_REQUIRED
    reasons_json TEXT
);

CREATE TABLE risk_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investigation_id TEXT NOT NULL REFERENCES investigations(id),
    created_at TEXT NOT NULL,
    approved INTEGER NOT NULL,
    checks_json TEXT NOT NULL,
    position_json TEXT
);

CREATE TABLE paper_trades (
    id TEXT PRIMARY KEY,
    investigation_id TEXT NOT NULL REFERENCES investigations(id),
    asset TEXT NOT NULL,
    direction TEXT NOT NULL,               -- LONG | SHORT
    status TEXT NOT NULL,                  -- OPEN | CLOSED
    entry_time TEXT NOT NULL,
    entry_price_usd REAL NOT NULL,
    fx_entry_usd_per_gbp REAL NOT NULL,
    units REAL NOT NULL,
    notional_gbp REAL NOT NULL,
    stop_price_usd REAL NOT NULL,
    target_price_usd REAL NOT NULL,
    risk_gbp REAL NOT NULL,
    planned_reward_gbp REAL NOT NULL,
    reward_risk REAL NOT NULL,
    horizon_hours INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    thesis TEXT NOT NULL,
    research_confidence INTEGER,
    agents_json TEXT,
    evidence_json TEXT,
    devils_advocate_verdict TEXT,
    devils_advocate_summary TEXT,
    entry_reason TEXT,
    rejected_alternatives_json TEXT,
    data_source TEXT,
    last_checked_at TEXT,
    max_favourable_price_usd REAL,
    max_adverse_price_usd REAL
);
CREATE INDEX ix_trades_status ON paper_trades(status);

CREATE TABLE trade_outcomes (
    trade_id TEXT PRIMARY KEY REFERENCES paper_trades(id),
    exit_price_usd REAL NOT NULL,
    exit_time TEXT NOT NULL,
    exit_reason TEXT NOT NULL,             -- STOP | TARGET | TIME | MANUAL
    fx_exit_usd_per_gbp REAL NOT NULL,
    gross_pnl_gbp REAL NOT NULL,
    fees_gbp REAL NOT NULL,
    estimated_slippage_gbp REAL NOT NULL,
    net_pnl_gbp REAL NOT NULL,
    mfe_pct REAL,
    mae_pct REAL,
    r_multiple REAL,
    thesis_correct TEXT,                   -- YES | PARTIAL | NO | UNDETERMINED
    reason_matched_thesis TEXT,
    evaluation_json TEXT,
    price_path_json TEXT,
    data_source TEXT
);

CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id TEXT NOT NULL REFERENCES paper_trades(id),
    created_at TEXT NOT NULL,
    engine TEXT,
    prediction_correct INTEGER,
    thesis_correct TEXT,
    timing_assessment TEXT,
    risk_assessment TEXT,
    devils_advocate_anticipated INTEGER,
    failure_category TEXT,
    hypothesis_tag TEXT,
    observed_error TEXT,
    possible_cause TEXT,
    lesson TEXT NOT NULL,
    confidence TEXT NOT NULL,              -- low | medium | high (evidence strength for this lesson)
    validation_status TEXT NOT NULL,       -- UNVALIDATED | COLLECTING_EVIDENCE | CANDIDATE_FOR_HUMAN_REVIEW
    followup_due_at TEXT,
    followup_json TEXT,
    review_json TEXT
);

CREATE TABLE equity_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taken_at TEXT NOT NULL,
    equity_gbp REAL NOT NULL,
    realized_gbp REAL NOT NULL,
    unrealized_gbp REAL NOT NULL,
    exposure_gbp REAL NOT NULL,
    open_positions INTEGER NOT NULL,
    fx_usd_per_gbp REAL
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    type TEXT NOT NULL,
    asset TEXT,
    title TEXT NOT NULL,
    payload_json TEXT,
    ref_type TEXT,
    ref_id TEXT
);
CREATE INDEX ix_events_time ON events(created_at);

CREATE TABLE monitor_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL,
    assets_scanned_json TEXT,
    triggers_json TEXT,
    investigations_json TEXT,
    positions_closed_json TEXT,
    errors_json TEXT
);

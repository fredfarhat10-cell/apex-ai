from __future__ import annotations

import os

API_KEYS = {
    "binance_key": os.environ.get("BINANCE_API_KEY", ""),
    "binance_secret": os.environ.get("BINANCE_API_SECRET", ""),
    "anthropic": os.environ.get("ANTHROPIC_API_KEY", ""),
    "alpha_vantage": os.environ.get("ALPHA_VANTAGE_KEY", ""),
}

RISK = {
    "max_risk_per_trade": 0.01,       # 1% of equity per trade
    "max_open_trades": 5,
    "max_daily_drawdown": 0.03,        # 3% daily halt
    "max_total_drawdown": 0.10,        # 10% kill-switch
    "min_risk_reward": 2.0,
    "max_position_pct": 0.10,          # 10% cap per position
    "kelly_fraction": 0.25,            # fractional Kelly to reduce variance
}

TRADING = {
    "paper_mode": True,                # set False ONLY after successful backtest + 2w paper
    "symbols": ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
    "timeframe": "1h",
    "lookback_bars": 200,
    "llm_model": "claude-opus-4-7",
}

DB_PATH = "trades.db"
LOG_PATH = "trading_bot.log"
LEARNING_LOG = "learning.jsonl"

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

import pandas as pd
import streamlit as st

from config import DB_PATH, LEARNING_LOG

st.set_page_config(page_title="Apex Trading Bot", layout="wide")
st.title("Apex Trading Bot — Dashboard")

conn = sqlite3.connect(DB_PATH, check_same_thread=False)


# ── helpers ───────────────────────────────────────────────────────────────────

def _read(query: str) -> pd.DataFrame:
    try:
        return pd.read_sql(query, conn)
    except Exception:
        return pd.DataFrame()


# ── equity curve ──────────────────────────────────────────────────────────────

st.subheader("Equity Curve")
eq = _read("SELECT ts, equity FROM equity_curve ORDER BY ts")
if not eq.empty:
    eq["ts"] = pd.to_datetime(eq["ts"])
    st.line_chart(eq.set_index("ts")["equity"])
else:
    st.info("No equity data yet — run the bot to populate.")


# ── strategy performance ──────────────────────────────────────────────────────

st.subheader("Strategy Performance")
stats = _read("SELECT * FROM strategy_stats")
if not stats.empty:
    stats["win_rate"] = (stats["winning_trades"] / stats["total_trades"].clip(lower=1) * 100).round(1)
    stats["avg_pnl"] = (stats["total_pnl"] / stats["total_trades"].clip(lower=1)).round(2)
    stats["max_drawdown_pct"] = (stats["max_drawdown"] * 100).round(2)
    display_cols = ["strategy", "total_trades", "win_rate", "avg_pnl", "total_pnl", "max_drawdown_pct"]
    st.dataframe(stats[display_cols], use_container_width=True)

    col1, col2, col3 = st.columns(3)
    col1.metric("Total Strategies", len(stats))
    col2.metric("Best Win Rate", f"{stats['win_rate'].max():.1f}%")
    col3.metric("Total P&L", f"${stats['total_pnl'].sum():.2f}")
else:
    st.info("No strategy data yet.")


# ── open trades ───────────────────────────────────────────────────────────────

st.subheader("Open Trades")
open_trades = _read("SELECT id, ts, asset, strategy, entry, stop_loss, take_profit, quantity FROM trades WHERE status='open'")
if not open_trades.empty:
    st.dataframe(open_trades, use_container_width=True)
else:
    st.info("No open trades.")


# ── trade history ─────────────────────────────────────────────────────────────

st.subheader("Trade History")
history = _read("SELECT id, ts, asset, strategy, entry, exit, pnl, status FROM trades ORDER BY ts DESC LIMIT 100")
if not history.empty:
    def _color_pnl(val):
        if val is None or (isinstance(val, float) and pd.isna(val)):
            return ""
        return "color: green" if float(val) >= 0 else "color: red"

    styled = history.style.applymap(_color_pnl, subset=["pnl"])
    st.dataframe(styled, use_container_width=True)
else:
    st.info("No trade history yet.")


# ── drawdown monitor ──────────────────────────────────────────────────────────

st.subheader("Drawdown Monitor")
eq_data = _read("SELECT equity FROM equity_curve ORDER BY ts")
if len(eq_data) > 1:
    curve = eq_data["equity"].values
    peak = curve.cummax() if hasattr(pd.Series(curve), "cummax") else pd.Series(curve).cummax().values
    dd = (pd.Series(curve) - pd.Series(peak)) / pd.Series(peak).clip(lower=0.001) * 100
    max_dd = dd.min()
    current_dd = float(dd.iloc[-1])
    col1, col2 = st.columns(2)
    col1.metric("Max Drawdown", f"{max_dd:.2f}%", delta_color="inverse")
    col2.metric("Current Drawdown", f"{current_dd:.2f}%", delta_color="inverse")
    if current_dd <= -10.0:
        st.error("AUTO-STOP TRIGGERED: Drawdown exceeded 10% — trading halted.")
    elif current_dd <= -5.0:
        st.warning("Warning: Drawdown approaching 10% threshold.")
else:
    st.info("Not enough equity data for drawdown calculation.")


# ── learning log ──────────────────────────────────────────────────────────────

st.subheader("Learning Log (Last 5 Reviews)")
log_path = Path(LEARNING_LOG)
if log_path.exists():
    lines = log_path.read_text().strip().splitlines()
    for line in reversed(lines[-5:]):
        try:
            entry = json.loads(line)
            review = entry.get("review", {})
            asset = entry.get("trade", {}).get("asset", "?")
            quality = review.get("decision_quality", "?")
            pattern = review.get("pattern", "")
            adj = review.get("rule_adjustment", "")
            with st.expander(f"{asset} — {quality}"):
                if pattern:
                    st.write(f"**Pattern:** {pattern}")
                if adj:
                    st.write(f"**Adjustment:** {adj}")
        except Exception:
            pass
else:
    st.info("No learning log yet.")

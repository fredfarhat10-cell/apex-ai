from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from config import DB_PATH


def _init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS trades (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            ts          TEXT    NOT NULL,
            asset       TEXT    NOT NULL,
            strategy    TEXT    NOT NULL,
            entry       REAL    NOT NULL,
            exit        REAL,
            stop_loss   REAL    NOT NULL,
            take_profit REAL    NOT NULL,
            quantity    REAL    NOT NULL,
            pnl         REAL,
            status      TEXT    NOT NULL DEFAULT 'open',
            thesis      TEXT,
            review      TEXT
        );

        CREATE TABLE IF NOT EXISTS strategy_stats (
            strategy        TEXT  PRIMARY KEY,
            total_trades    INT   NOT NULL DEFAULT 0,
            winning_trades  INT   NOT NULL DEFAULT 0,
            total_pnl       REAL  NOT NULL DEFAULT 0.0,
            max_drawdown    REAL  NOT NULL DEFAULT 0.0,
            peak_equity     REAL  NOT NULL DEFAULT 0.0
        );

        CREATE TABLE IF NOT EXISTS equity_curve (
            ts      TEXT  NOT NULL,
            equity  REAL  NOT NULL
        );
    """)
    conn.commit()


@dataclass
class TradeRecord:
    asset: str
    strategy: str
    entry: float
    stop_loss: float
    take_profit: float
    quantity: float
    thesis: str = ""
    ts: str = ""

    def __post_init__(self) -> None:
        if not self.ts:
            self.ts = datetime.now(timezone.utc).isoformat()


class TradeLogger:
    def __init__(self, db_path: str = DB_PATH) -> None:
        self._conn = sqlite3.connect(db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        _init_db(self._conn)

    # ── trade lifecycle ────────────────────────────────────────────────────
    def open_trade(self, record: TradeRecord) -> int:
        cur = self._conn.execute(
            """INSERT INTO trades (ts, asset, strategy, entry, stop_loss, take_profit,
               quantity, thesis, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')""",
            (record.ts, record.asset, record.strategy, record.entry,
             record.stop_loss, record.take_profit, record.quantity, record.thesis),
        )
        self._conn.commit()
        return cur.lastrowid  # type: ignore[return-value]

    def close_trade(
        self,
        trade_id: int,
        exit_price: float,
        pnl: float,
        review: dict[str, Any] | None = None,
    ) -> None:
        self._conn.execute(
            "UPDATE trades SET exit=?, pnl=?, status='closed', review=? WHERE id=?",
            (exit_price, pnl, json.dumps(review) if review else None, trade_id),
        )
        self._conn.commit()
        row = self._conn.execute(
            "SELECT strategy FROM trades WHERE id=?", (trade_id,)
        ).fetchone()
        if row:
            self._update_strategy_stats(row["strategy"], pnl)

    # ── strategy performance tracking ─────────────────────────────────────
    def _update_strategy_stats(self, strategy: str, pnl: float) -> None:
        self._conn.execute(
            """INSERT INTO strategy_stats (strategy, total_trades, winning_trades, total_pnl)
               VALUES (?, 1, ?, ?)
               ON CONFLICT(strategy) DO UPDATE SET
                   total_trades   = total_trades + 1,
                   winning_trades = winning_trades + (CASE WHEN ? > 0 THEN 1 ELSE 0 END),
                   total_pnl      = total_pnl + ?""",
            (strategy, 1 if pnl > 0 else 0, pnl, pnl, pnl),
        )
        self._conn.commit()

    def update_drawdown(self, strategy: str, equity: float) -> None:
        row = self._conn.execute(
            "SELECT peak_equity, max_drawdown FROM strategy_stats WHERE strategy=?",
            (strategy,),
        ).fetchone()
        if row is None:
            return
        peak = max(row["peak_equity"], equity)
        dd = (peak - equity) / peak if peak > 0 else 0.0
        max_dd = max(row["max_drawdown"], dd)
        self._conn.execute(
            "UPDATE strategy_stats SET peak_equity=?, max_drawdown=? WHERE strategy=?",
            (peak, max_dd, strategy),
        )
        self._conn.commit()

    def strategy_stats(self, strategy: str | None = None) -> list[dict[str, Any]]:
        if strategy:
            rows = self._conn.execute(
                "SELECT * FROM strategy_stats WHERE strategy=?", (strategy,)
            ).fetchall()
        else:
            rows = self._conn.execute("SELECT * FROM strategy_stats").fetchall()
        return [dict(r) for r in rows]

    # ── equity curve ──────────────────────────────────────────────────────
    def record_equity(self, equity: float) -> None:
        self._conn.execute(
            "INSERT INTO equity_curve (ts, equity) VALUES (?, ?)",
            (datetime.now(timezone.utc).isoformat(), equity),
        )
        self._conn.commit()

    def equity_curve(self) -> list[dict[str, Any]]:
        rows = self._conn.execute(
            "SELECT ts, equity FROM equity_curve ORDER BY ts"
        ).fetchall()
        return [dict(r) for r in rows]

    # ── queries ───────────────────────────────────────────────────────────
    def open_trades(self) -> list[dict[str, Any]]:
        rows = self._conn.execute(
            "SELECT * FROM trades WHERE status='open'"
        ).fetchall()
        return [dict(r) for r in rows]

    def all_trades(self) -> list[dict[str, Any]]:
        rows = self._conn.execute(
            "SELECT * FROM trades ORDER BY ts DESC"
        ).fetchall()
        return [dict(r) for r in rows]

"""SQLite persistence with versioned SQL migrations (see migrations/)."""
from __future__ import annotations

import json
import sqlite3
import threading
from pathlib import Path

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


class Database:
    def __init__(self, path: str):
        self.path = path
        if path != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA foreign_keys = ON")
        if path != ":memory:":
            self._conn.execute("PRAGMA journal_mode = WAL")
        self.lock = threading.RLock()
        self.migrate()

    def migrate(self) -> list[str]:
        with self.lock:
            self._conn.execute("CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT "
                               "DEFAULT CURRENT_TIMESTAMP)")
            done = {r[0] for r in self._conn.execute("SELECT version FROM schema_migrations")}
            applied = []
            for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
                if f.stem in done:
                    continue
                self._conn.execute("BEGIN")
                try:
                    for stmt in f.read_text().split(";"):
                        if stmt.strip() and not all(l.strip().startswith("--") or not l.strip()
                                                    for l in stmt.splitlines()):
                            self._conn.execute(stmt)
                    self._conn.execute("INSERT INTO schema_migrations(version) VALUES (?)", (f.stem,))
                    self._conn.execute("COMMIT")
                except Exception:
                    self._conn.execute("ROLLBACK")
                    raise
                applied.append(f.stem)
            return applied

    def execute(self, sql: str, params: tuple | dict = ()) -> sqlite3.Cursor:
        with self.lock:
            return self._conn.execute(sql, params)

    def insert(self, table: str, row: dict) -> int:
        cols = ", ".join(row)
        qs = ", ".join("?" for _ in row)
        with self.lock:
            cur = self._conn.execute(f"INSERT INTO {table} ({cols}) VALUES ({qs})", tuple(_enc(v) for v in row.values()))
            return cur.lastrowid

    def update(self, table: str, key_col: str, key, fields: dict) -> None:
        sets = ", ".join(f"{k} = ?" for k in fields)
        with self.lock:
            self._conn.execute(f"UPDATE {table} SET {sets} WHERE {key_col} = ?",
                               (*[_enc(v) for v in fields.values()], key))

    def one(self, sql: str, params: tuple = ()) -> dict | None:
        with self.lock:
            r = self._conn.execute(sql, params).fetchone()
        return _row(r) if r else None

    def all(self, sql: str, params: tuple = ()) -> list[dict]:
        with self.lock:
            return [_row(r) for r in self._conn.execute(sql, params).fetchall()]

    def transaction(self):
        return _Tx(self)


class _Tx:
    def __init__(self, db: Database):
        self.db = db

    def __enter__(self):
        self.db.lock.acquire()
        self.db._conn.execute("BEGIN")
        return self.db

    def __exit__(self, exc_type, exc, tb):
        try:
            self.db._conn.execute("ROLLBACK" if exc_type else "COMMIT")
        finally:
            self.db.lock.release()


def _enc(v):
    if isinstance(v, (dict, list, tuple)):
        return json.dumps(v, default=str)
    if isinstance(v, bool):
        return int(v)
    return v


def _row(r: sqlite3.Row) -> dict:
    d = dict(r)
    for k, v in list(d.items()):
        if k.endswith("_json") and isinstance(v, str):
            try:
                d[k] = json.loads(v)
            except ValueError:
                pass
    return d

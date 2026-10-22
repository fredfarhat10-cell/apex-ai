"""Injectable clock so that tests can control time (and so 'now' is explicit everywhere)."""
from __future__ import annotations

from datetime import datetime, timezone


class Clock:
    def now(self) -> datetime:
        return datetime.now(timezone.utc)


class FixedClock(Clock):
    def __init__(self, t: datetime):
        self.t = t

    def now(self) -> datetime:
        return self.t

    def advance(self, **kwargs) -> None:
        from datetime import timedelta
        self.t = self.t + timedelta(**kwargs)


def iso(dt: datetime | None) -> str | None:
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds") if dt else None


def parse_iso(s: str | None) -> datetime | None:
    if not s:
        return None
    dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

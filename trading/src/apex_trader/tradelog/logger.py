from __future__ import annotations

import json
from dataclasses import asdict, is_dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


def _default(o: Any) -> Any:
    if isinstance(o, datetime):
        return o.isoformat()
    if is_dataclass(o):
        return asdict(o)
    if hasattr(o, "value"):
        return o.value
    raise TypeError(f"not serializable: {type(o).__name__}")


class TradeLogger:
    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._fh = self.path.open("a", buffering=1, encoding="utf-8")

    def write(self, event: str, payload: dict) -> None:
        record = {"event": event, **payload}
        self._fh.write(json.dumps(record, default=_default) + "\n")

    def close(self) -> None:
        self._fh.close()

    def __enter__(self) -> "TradeLogger":
        return self

    def __exit__(self, *_exc) -> None:
        self.close()

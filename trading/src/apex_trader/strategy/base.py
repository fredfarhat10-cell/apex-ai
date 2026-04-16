from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Protocol

import pandas as pd

from ..models import Portfolio


class Signal(str, Enum):
    LONG = "LONG"
    FLAT = "FLAT"
    EXIT = "EXIT"


@dataclass
class StrategyContext:
    symbol: str
    history: pd.DataFrame   # OHLCV bars up to and including bar t
    now: datetime
    last_price: float
    portfolio: Portfolio


class Strategy(Protocol):
    name: str

    def decide(self, ctx: StrategyContext) -> tuple[Signal, str]:
        """Return (signal, reason). Strategies only read ctx; they never act on the portfolio."""
        ...

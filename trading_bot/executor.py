from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from config import API_KEYS, TRADING

log = logging.getLogger(__name__)


@dataclass
class FillResult:
    symbol: str
    side: str            # "buy" | "sell"
    quantity: float
    fill_price: float
    fee: float
    ts: str
    order_id: str = ""
    paper: bool = True


@dataclass
class PaperExecutor:
    """Simulates fills with fees and slippage — no real capital moved."""
    fee_bps: float = 10.0    # 0.10%
    slip_bps: float = 5.0    # 0.05%
    _trade_counter: int = field(default=0, init=False, repr=False)

    def buy(self, symbol: str, quantity: float, price: float) -> FillResult:
        slip = price * (self.slip_bps / 10_000)
        fill_price = price + slip
        fee = fill_price * quantity * (self.fee_bps / 10_000)
        self._trade_counter += 1
        return FillResult(
            symbol=symbol,
            side="buy",
            quantity=quantity,
            fill_price=fill_price,
            fee=fee,
            ts=datetime.now(timezone.utc).isoformat(),
            order_id=f"paper-{self._trade_counter}",
            paper=True,
        )

    def sell(self, symbol: str, quantity: float, price: float) -> FillResult:
        slip = price * (self.slip_bps / 10_000)
        fill_price = price - slip
        fee = fill_price * quantity * (self.fee_bps / 10_000)
        self._trade_counter += 1
        return FillResult(
            symbol=symbol,
            side="sell",
            quantity=quantity,
            fill_price=fill_price,
            fee=fee,
            ts=datetime.now(timezone.utc).isoformat(),
            order_id=f"paper-{self._trade_counter}",
            paper=True,
        )


class LiveExecutor:
    """Real execution via ccxt. ONLY used when TRADING['paper_mode'] is False."""

    def __init__(self) -> None:
        if TRADING["paper_mode"]:
            raise RuntimeError("LiveExecutor instantiated in paper mode — use PaperExecutor")
        import ccxt
        self._exchange = ccxt.binance({
            "apiKey": API_KEYS["binance_key"],
            "secret": API_KEYS["binance_secret"],
            "enableRateLimit": True,
        })

    def buy(self, symbol: str, quantity: float, price: float | None = None) -> FillResult:
        order: dict[str, Any] = self._exchange.create_market_buy_order(symbol, quantity)
        fill = float(order.get("price") or order.get("average") or price or 0)
        fee = float((order.get("fee") or {}).get("cost") or 0)
        return FillResult(
            symbol=symbol, side="buy", quantity=quantity,
            fill_price=fill, fee=fee,
            ts=datetime.now(timezone.utc).isoformat(),
            order_id=str(order.get("id", "")),
            paper=False,
        )

    def sell(self, symbol: str, quantity: float, price: float | None = None) -> FillResult:
        order: dict[str, Any] = self._exchange.create_market_sell_order(symbol, quantity)
        fill = float(order.get("price") or order.get("average") or price or 0)
        fee = float((order.get("fee") or {}).get("cost") or 0)
        return FillResult(
            symbol=symbol, side="sell", quantity=quantity,
            fill_price=fill, fee=fee,
            ts=datetime.now(timezone.utc).isoformat(),
            order_id=str(order.get("id", "")),
            paper=False,
        )


def get_executor() -> PaperExecutor | LiveExecutor:
    if TRADING["paper_mode"]:
        return PaperExecutor()
    return LiveExecutor()

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from ..models import Fill, Order, OrderType, Portfolio, Side


class OrderRejected(Exception):
    """Raised when the paper broker refuses to fill an order."""


@dataclass
class BrokerConfig:
    fee_bps: float = 10.0
    slippage_bps: float = 5.0
    allow_short: bool = False


@dataclass
class PaperBroker:
    portfolio: Portfolio
    config: BrokerConfig = None

    def __post_init__(self) -> None:
        if self.config is None:
            self.config = BrokerConfig()

    def _apply_slippage(self, side: Side, ref_price: float) -> float:
        slip = self.config.slippage_bps / 10_000.0
        return ref_price * (1.0 + slip) if side is Side.BUY else ref_price * (1.0 - slip)

    def execute(self, order: Order, bar_open: float, bar_high: float, bar_low: float, ts: datetime) -> Fill:
        if order.quantity <= 0:
            raise OrderRejected("quantity must be positive")

        if order.order_type is OrderType.MARKET:
            price = self._apply_slippage(order.side, bar_open)
        elif order.order_type is OrderType.LIMIT:
            if order.limit_price is None:
                raise OrderRejected("limit order missing limit_price")
            if order.side is Side.BUY and bar_low <= order.limit_price:
                price = min(order.limit_price, bar_open)
            elif order.side is Side.SELL and bar_high >= order.limit_price:
                price = max(order.limit_price, bar_open)
            else:
                raise OrderRejected("limit not touched this bar")
        else:
            raise OrderRejected(f"unsupported order_type {order.order_type}")

        notional = price * order.quantity
        fee = notional * self.config.fee_bps / 10_000.0

        pos = self.portfolio.position(order.symbol)

        if order.side is Side.BUY:
            total_cost = notional + fee
            if total_cost > self.portfolio.cash + 1e-9:
                raise OrderRejected(
                    f"insufficient cash: need {total_cost:.2f}, have {self.portfolio.cash:.2f}"
                )
            new_qty = pos.quantity + order.quantity
            if pos.quantity >= 0:
                pos.avg_price = (
                    (pos.avg_price * pos.quantity) + notional
                ) / new_qty if new_qty > 0 else 0.0
            pos.quantity = new_qty
            self.portfolio.cash -= total_cost
        else:  # SELL
            if pos.quantity < order.quantity - 1e-9 and not self.config.allow_short:
                raise OrderRejected(
                    f"shorting disabled; have {pos.quantity}, selling {order.quantity}"
                )
            realized = (price - pos.avg_price) * min(order.quantity, pos.quantity)
            self.portfolio.realized_pnl += realized
            pos.quantity -= order.quantity
            self.portfolio.cash += notional - fee
            if abs(pos.quantity) < 1e-12:
                pos.quantity = 0.0
                pos.avg_price = 0.0
                pos.stop_loss = None
                pos.take_profit = None

        if order.stop_loss is not None:
            pos.stop_loss = order.stop_loss
        if order.take_profit is not None:
            pos.take_profit = order.take_profit

        return Fill(
            symbol=order.symbol,
            side=order.side,
            quantity=order.quantity,
            price=price,
            fee=fee,
            timestamp=ts,
            reason=order.reason,
        )

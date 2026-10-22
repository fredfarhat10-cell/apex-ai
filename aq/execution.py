"""Execution-cost model: order-book slippage and short funding.

Slippage: walk the live L2 order book for the intended size and measure the VWAP against the mid price (this
includes half the spread). If no book is available, fall back to the configured flat assumption and say so.

Funding (shorts only): a spot short is modelled as a perpetual-futures short. Shorts pay funding when the rate is
negative and receive it when positive. Conservative assumption: income is ignored and only costs are counted. The
latest funding rate is held constant over the horizon. If no funding data is available, a configured
per-day borrow assumption is used instead.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass

from aq.data.base import OrderBook


@dataclass
class CostModel:
    fee_bps_per_side: float
    slippage_bps_per_side: float
    slippage_source: str
    funding_bps_per_day: float  # cost only (>= 0); 0 for longs
    funding_source: str

    def round_trip_pct(self, direction: str = "LONG", horizon_hours: float = 0.0) -> float:
        rt = 2 * (self.fee_bps_per_side + self.slippage_bps_per_side) / 10_000
        if direction == "SHORT":
            rt += self.funding_bps_per_day / 10_000 * horizon_hours / 24
        return rt

    def to_dict(self) -> dict:
        return asdict(self)


def walk_book(book: OrderBook, side: str, notional_usd: float) -> float | None:
    """Slippage in bps vs mid for a market order of `notional_usd`. side: 'buy' walks asks, 'sell' walks bids.
    Returns None if the visible book is too thin to fill the order."""
    if not book.bids or not book.asks or notional_usd <= 0:
        return None
    mid = (book.bids[0][0] + book.asks[0][0]) / 2
    levels = book.asks if side == "buy" else book.bids
    remaining, cost, qty = notional_usd, 0.0, 0.0
    for price, size in levels:
        take = min(remaining, price * size)
        cost += take
        qty += take / price
        remaining -= take
        if remaining <= 1e-9:
            break
    if remaining > 1e-9:
        return None
    vwap = cost / qty
    return abs(vwap / mid - 1) * 10_000


def flat_costs(s, direction: str = "LONG") -> CostModel:
    return CostModel(s.fee_bps_per_side, s.slippage_bps_per_side, "flat assumption (no order book)",
                     s.short_borrow_bps_per_day if direction == "SHORT" else 0.0,
                     "flat assumption (no funding data)" if direction == "SHORT" else "n/a (long)")


def estimate_costs(s, direction: str, notional_usd: float, book: OrderBook | None,
                   funding_rate_8h: float | None, funding_source: str | None) -> CostModel:
    cm = flat_costs(s, direction)
    if book is not None:
        side = "buy" if direction == "LONG" else "sell"
        entry = walk_book(book, side, notional_usd)
        exit_ = walk_book(book, "sell" if side == "buy" else "buy", notional_usd)
        if entry is not None and exit_ is not None:
            cm.slippage_bps_per_side = max(s.min_slippage_bps_per_side, (entry + exit_) / 2)
            cm.slippage_source = (f"{book.source} L2 book walk for ${notional_usd:,.0f} "
                                  f"(entry {entry:.2f} bps, exit {exit_:.2f} bps, floor {s.min_slippage_bps_per_side})")
        else:
            cm.slippage_source = f"flat assumption ({book.source} book too thin for size)"
    if direction == "SHORT" and funding_rate_8h is not None:
        # Negative rate => shorts pay. Positive => shorts receive, which is ignored (conservative).
        cm.funding_bps_per_day = max(0.0, -funding_rate_8h) * 3 * 10_000
        cm.funding_source = f"{funding_source} last funding rate {funding_rate_8h * 100:.4f}%/8h (income ignored)"
    return cm

from __future__ import annotations

from dataclasses import dataclass, field

from ..models import Portfolio


@dataclass(frozen=True)
class ExposureGroup:
    """A set of symbols that share underlying risk (sector, factor, cluster).

    ``max_exposure_pct`` caps the sum of |notional| across every symbol in the
    group as a fraction of total equity.  Keep this *below* the single-position
    cap × len(symbols) — the whole point is to prevent a cluster of highly
    correlated positions from adding up to uncapped factor exposure.
    """

    name: str
    symbols: frozenset[str]
    max_exposure_pct: float

    def contains(self, symbol: str) -> bool:
        return symbol in self.symbols


@dataclass
class ExposureEngine:
    """Evaluates group-level exposure against a prospective order.

    The engine is stateless across bars — callers pass the current portfolio
    and the prospective order each time.  This keeps it safe to reuse inside
    the RiskManager without sync bugs.
    """

    groups: list[ExposureGroup] = field(default_factory=list)

    def groups_for(self, symbol: str) -> list[ExposureGroup]:
        return [g for g in self.groups if g.contains(symbol)]

    def current_group_notional(
        self, group: ExposureGroup, portfolio: Portfolio, prices: dict[str, float]
    ) -> float:
        total = 0.0
        for sym in group.symbols:
            pos = portfolio.positions.get(sym)
            if pos is None or pos.quantity == 0:
                continue
            px = prices.get(sym)
            if px is None:
                continue
            total += abs(pos.quantity) * px
        return total

    def check_order(
        self,
        symbol: str,
        add_notional: float,
        portfolio: Portfolio,
        prices: dict[str, float],
        equity: float,
    ) -> tuple[bool, str, float]:
        """Return (accepted, reason, max_additional_notional).

        If a group cap is breached, ``max_additional_notional`` is the
        largest notional the caller could still add without breaching.
        Zero means fully blocked.
        """
        if equity <= 0:
            return True, "ok", add_notional
        min_headroom = float("inf")
        blocking_group: str | None = None
        for g in self.groups_for(symbol):
            cap = equity * g.max_exposure_pct
            current = self.current_group_notional(g, portfolio, prices)
            headroom = cap - current
            if add_notional > headroom + 1e-9:
                if headroom < min_headroom:
                    min_headroom = headroom
                    blocking_group = g.name
        if blocking_group is not None:
            return False, f"group exposure cap '{blocking_group}' exceeded", max(0.0, min_headroom)
        return True, "ok", add_notional

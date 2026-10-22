"""Deterministic Risk Engine. No LLM output can override these checks.

Position sizing: units are chosen so that loss-at-stop INCLUDING round-trip fee and slippage estimates
does not exceed max_risk_per_trade_pct of current equity, then capped by remaining exposure capacity.
Reward/risk is evaluated NET of estimated costs (conservative).
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field

from aq.execution import CostModel, flat_costs


@dataclass
class TradePlan:
    direction: str
    entry_price_usd: float
    stop_price_usd: float
    target_price_usd: float
    atr_usd: float
    stop_atr_multiple: float
    target_atr_multiple: float
    gross_reward_risk: float
    net_reward_risk: float
    round_trip_cost_pct: float
    costs: dict = field(default_factory=dict)
    horizon_hours: float = 24.0

    def to_dict(self) -> dict:
        return asdict(self)

    @property
    def round_trip_fraction(self) -> float:
        return self.round_trip_cost_pct / 100


def round_trip_cost_pct(s) -> float:
    return 2 * (s.fee_bps_per_side + s.slippage_bps_per_side) / 10_000


def build_trade_plan(direction: str, entry: float, atr: float, stop_mult: float, target_mult: float, s,
                     costs: CostModel | None = None, horizon_hours: float = 24.0) -> TradePlan:
    costs = costs or flat_costs(s, direction)
    rt = costs.round_trip_pct(direction, horizon_hours)
    sign = 1 if direction == "LONG" else -1
    stop = entry - sign * stop_mult * atr
    target = entry + sign * target_mult * atr
    risk_per_unit = abs(entry - stop)
    reward_per_unit = abs(target - entry)
    cost_per_unit = entry * rt
    gross = reward_per_unit / risk_per_unit if risk_per_unit > 0 else 0.0
    net = (reward_per_unit - cost_per_unit) / (risk_per_unit + cost_per_unit) if risk_per_unit > 0 else 0.0
    return TradePlan(direction, entry, stop, target, atr, stop_mult, target_mult, round(gross, 4), round(net, 4),
                     rt * 100, costs.to_dict(), horizon_hours)


@dataclass
class RiskCheck:
    name: str
    passed: bool
    detail: str


@dataclass
class RiskDecision:
    approved: bool
    checks: list[RiskCheck] = field(default_factory=list)
    position: dict | None = None

    @property
    def failed(self) -> list[RiskCheck]:
        return [c for c in self.checks if not c.passed]

    def to_dict(self) -> dict:
        return {"approved": self.approved, "checks": [asdict(c) for c in self.checks], "position": self.position}


@dataclass
class PortfolioState:
    equity_gbp: float
    exposure_gbp: float
    open_positions: int
    open_assets: list[str]
    daily_pnl_gbp: float
    day_start_equity_gbp: float


def evaluate(s, *, asset: str, proposed_action: str, da_verdict: str, plan: TradePlan | None,
             fx_usd_per_gbp: float | None, data_fresh: bool, data_detail: str, state: PortfolioState) -> RiskDecision:
    checks: list[RiskCheck] = []
    add = lambda n, ok, d: checks.append(RiskCheck(n, bool(ok), d))  # noqa: E731

    add("scout_proposed_trade", proposed_action in ("LONG", "SHORT"), f"Scout proposal: {proposed_action}")
    da_ok = da_verdict == "APPROVE" or (da_verdict == "MONITOR" and s.trade_on_monitor_verdict)
    add("devils_advocate_not_veto", da_ok,
        f"Devil's Advocate verdict: {da_verdict}" + (" (MONITOR = wait; not tradeable under current config)"
                                                     if da_verdict == "MONITOR" and not da_ok else ""))
    add("market_data_available", data_fresh and fx_usd_per_gbp is not None,
        data_detail if fx_usd_per_gbp is not None else data_detail + "; GBP/USD FX unavailable")
    if proposed_action == "SHORT":
        add("short_allowed", s.allow_short, "Shorts enabled" if s.allow_short else "Shorts disabled by config")

    if plan is None or proposed_action not in ("LONG", "SHORT"):
        add("stop_loss_defined", False, "No trade plan")
        return RiskDecision(False, checks)

    sign = 1 if plan.direction == "LONG" else -1
    stop_ok = plan.stop_price_usd > 0 and (plan.entry_price_usd - plan.stop_price_usd) * sign > 0
    add("stop_loss_defined", stop_ok, f"Stop {plan.stop_price_usd:.6g} vs entry {plan.entry_price_usd:.6g}")
    add("min_reward_risk", plan.net_reward_risk >= s.min_reward_risk,
        f"Net R:R {plan.net_reward_risk:.2f} (gross {plan.gross_reward_risk:.2f}) vs minimum {s.min_reward_risk}")
    add("max_open_positions", state.open_positions < s.max_open_positions,
        f"{state.open_positions} open / max {s.max_open_positions}")
    add("no_duplicate_asset_position", asset not in state.open_assets,
        f"Existing open position in {asset}" if asset in state.open_assets else f"No open {asset} position")
    daily_limit = state.day_start_equity_gbp * s.daily_loss_limit_pct / 100
    add("daily_loss_limit", state.daily_pnl_gbp > -daily_limit,
        f"Today's P/L £{state.daily_pnl_gbp:.2f} vs limit -£{daily_limit:.2f} ({s.daily_loss_limit_pct}%)")

    position = None
    if fx_usd_per_gbp and stop_ok:
        risk_budget = state.equity_gbp * s.max_risk_per_trade_pct / 100
        loss_per_unit_gbp = (abs(plan.entry_price_usd - plan.stop_price_usd)
                             + plan.entry_price_usd * plan.round_trip_fraction) / fx_usd_per_gbp
        units = risk_budget / loss_per_unit_gbp
        notional = units * plan.entry_price_usd / fx_usd_per_gbp
        capacity = state.equity_gbp * s.max_portfolio_exposure_pct / 100 - state.exposure_gbp
        capped = False
        if notional > capacity:
            capped = True
            units = max(capacity, 0) / (plan.entry_price_usd / fx_usd_per_gbp)
            notional = units * plan.entry_price_usd / fx_usd_per_gbp
        risk_gbp = units * loss_per_unit_gbp
        reward_gbp = units * (abs(plan.target_price_usd - plan.entry_price_usd)
                              - plan.entry_price_usd * plan.round_trip_fraction) / fx_usd_per_gbp
        add("exposure_capacity", notional >= s.min_position_gbp,
            f"Notional £{notional:.2f}; remaining capacity £{capacity:.2f} of {s.max_portfolio_exposure_pct}% cap"
            + (" (size capped by exposure limit)" if capped else ""))
        position = {"units": units, "notional_gbp": notional, "risk_gbp": risk_gbp,
                    "planned_reward_gbp": reward_gbp, "risk_budget_gbp": risk_budget,
                    "risk_pct_of_equity": risk_gbp / state.equity_gbp * 100, "capped_by_exposure": capped,
                    "fx_usd_per_gbp": fx_usd_per_gbp, **plan.to_dict()}
    approved = all(c.passed for c in checks)
    return RiskDecision(approved, checks, position)

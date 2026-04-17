from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from ..risk.manager import RiskConfig


class Phase(str, Enum):
    CAPITAL_PROTECTION = "phase_1_capital_protection"
    EDGE_EXPLOITATION = "phase_2_edge_exploitation"
    AGGRESSIVE = "phase_3_aggressive"


@dataclass
class PhaseConfig:
    """Thresholds are expressed as equity multiples of the starting equity."""
    phase_2_threshold: float = 1.05   # need +5% proven before graduating
    phase_3_threshold: float = 1.15   # need +15% and enough trades under belt
    min_trades_for_phase_2: int = 20
    min_trades_for_phase_3: int = 60
    min_win_rate_for_phase_3: float = 0.50


PHASE_RISK: dict[Phase, RiskConfig] = {
    Phase.CAPITAL_PROTECTION: RiskConfig(
        max_position_pct=0.05,
        risk_per_trade_pct=0.005,
        max_risk_per_trade_pct=0.01,
        stop_loss_pct=0.02,
        max_daily_drawdown_pct=0.02,
        max_total_drawdown_pct=0.08,
        max_gross_exposure_pct=0.40,
        min_risk_reward=2.0,
    ),
    Phase.EDGE_EXPLOITATION: RiskConfig(
        max_position_pct=0.08,
        risk_per_trade_pct=0.01,
        max_risk_per_trade_pct=0.015,
        stop_loss_pct=0.03,
        max_daily_drawdown_pct=0.03,
        max_total_drawdown_pct=0.10,
        max_gross_exposure_pct=0.70,
        min_risk_reward=2.0,
    ),
    Phase.AGGRESSIVE: RiskConfig(
        max_position_pct=0.10,
        risk_per_trade_pct=0.015,
        max_risk_per_trade_pct=0.02,
        stop_loss_pct=0.04,
        max_daily_drawdown_pct=0.04,
        max_total_drawdown_pct=0.12,
        max_gross_exposure_pct=1.00,
        min_risk_reward=2.0,
    ),
}


@dataclass
class PhaseController:
    starting_equity: float
    config: PhaseConfig = field(default_factory=PhaseConfig)
    phase: Phase = Phase.CAPITAL_PROTECTION

    def risk_config(self) -> RiskConfig:
        return PHASE_RISK[self.phase]

    def update(self, equity: float, trades: int, win_rate: float) -> Phase:
        if self.starting_equity <= 0:
            return self.phase
        multiple = equity / self.starting_equity

        if (
            self.phase is Phase.CAPITAL_PROTECTION
            and multiple >= self.config.phase_2_threshold
            and trades >= self.config.min_trades_for_phase_2
        ):
            self.phase = Phase.EDGE_EXPLOITATION

        elif (
            self.phase is Phase.EDGE_EXPLOITATION
            and multiple >= self.config.phase_3_threshold
            and trades >= self.config.min_trades_for_phase_3
            and win_rate >= self.config.min_win_rate_for_phase_3
        ):
            self.phase = Phase.AGGRESSIVE

        # Regression: if equity drops back below phase_2 threshold, fall back.
        if self.phase is not Phase.CAPITAL_PROTECTION and multiple < self.config.phase_2_threshold:
            self.phase = Phase.CAPITAL_PROTECTION

        return self.phase

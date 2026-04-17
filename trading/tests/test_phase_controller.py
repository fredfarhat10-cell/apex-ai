from apex_trader.phase.controller import Phase, PhaseConfig, PhaseController


def test_starts_in_capital_protection():
    pc = PhaseController(starting_equity=10_000.0)
    assert pc.phase is Phase.CAPITAL_PROTECTION
    rc = pc.risk_config()
    assert rc.risk_per_trade_pct == 0.005
    assert rc.max_total_drawdown_pct == 0.08


def test_graduates_to_phase_2_after_threshold_and_trades():
    pc = PhaseController(starting_equity=10_000.0)
    # Not enough trades yet
    pc.update(equity=10_600.0, trades=5, win_rate=0.60)
    assert pc.phase is Phase.CAPITAL_PROTECTION
    # Enough trades and multiple met
    pc.update(equity=10_600.0, trades=25, win_rate=0.60)
    assert pc.phase is Phase.EDGE_EXPLOITATION
    assert pc.risk_config().risk_per_trade_pct == 0.01


def test_requires_win_rate_for_phase_3():
    pc = PhaseController(starting_equity=10_000.0)
    pc.update(10_600.0, 25, 0.60)
    assert pc.phase is Phase.EDGE_EXPLOITATION
    # Equity up but win rate weak
    pc.update(11_700.0, 70, 0.40)
    assert pc.phase is Phase.EDGE_EXPLOITATION
    # Win rate clears threshold
    pc.update(11_700.0, 70, 0.55)
    assert pc.phase is Phase.AGGRESSIVE


def test_regression_drops_back_to_phase_1():
    pc = PhaseController(starting_equity=10_000.0)
    pc.update(10_600.0, 25, 0.60)
    pc.update(11_700.0, 70, 0.55)
    assert pc.phase is Phase.AGGRESSIVE
    # Drawdown below the phase 2 gate -> fall back to phase 1
    pc.update(10_200.0, 80, 0.55)
    assert pc.phase is Phase.CAPITAL_PROTECTION

import pytest

from apex_trader.allocation.allocator import AllocationConfig, CapitalAllocator, Sleeve


def test_default_is_85_15():
    a = CapitalAllocator()
    assert a.budget(Sleeve.CORE, 10_000.0) == pytest.approx(8_500.0)
    assert a.budget(Sleeve.EXPERIMENTAL, 10_000.0) == pytest.approx(1_500.0)


def test_fractions_must_sum_to_one():
    with pytest.raises(ValueError):
        AllocationConfig(core_fraction=0.7, experimental_fraction=0.2)


def test_max_new_notional_respects_existing_exposure():
    a = CapitalAllocator()
    # Experimental sleeve: budget = 1500, already 1200 used -> 300 headroom
    assert a.max_new_notional(Sleeve.EXPERIMENTAL, 10_000.0, 1_200.0) == pytest.approx(300.0)
    # Over-used sleeve clamps to 0, never negative
    assert a.max_new_notional(Sleeve.EXPERIMENTAL, 10_000.0, 5_000.0) == 0.0


def test_zero_equity_returns_zero_budget():
    a = CapitalAllocator()
    assert a.budget(Sleeve.CORE, 0.0) == 0.0

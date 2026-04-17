from __future__ import annotations

import copy
import random
from dataclasses import fields, is_dataclass
from typing import Any


def mutate_strategy(
    strategy: Any,
    mutable_params: dict[str, tuple[float, float]],
    rng: random.Random | None = None,
    suffix: str = "_mut",
) -> Any:
    """Return a deep-copied strategy with selected fields perturbed in-range.

    ``mutable_params`` maps field name → (lower_bound_pct, upper_bound_pct).  The
    new value is drawn uniformly from ``original × (1 + u)`` where ``u`` ∈
    [lower, upper].  Integer fields stay integers (rounded, min 1).

    The mutant's ``name`` field (if present) is suffixed so the MetaLearner
    tracks it independently from its parent.

    Raises
    ------
    TypeError: if ``strategy`` is not a dataclass instance.
    """
    if not is_dataclass(strategy):
        raise TypeError(f"{type(strategy).__name__} is not a dataclass")

    rng = rng or random.Random()
    mutant = copy.deepcopy(strategy)
    field_types = {f.name: f.type for f in fields(strategy)}

    for field_name, (lo, hi) in mutable_params.items():
        if field_name not in field_types:
            raise KeyError(f"{type(strategy).__name__} has no field '{field_name}'")
        original = getattr(strategy, field_name)
        if not isinstance(original, (int, float)):
            raise TypeError(f"field '{field_name}' is not numeric")
        perturb = rng.uniform(lo, hi)
        new_value = original * (1.0 + perturb)
        if isinstance(original, bool):  # bool is subclass of int — skip
            raise TypeError(f"cannot mutate boolean field '{field_name}'")
        if isinstance(original, int):
            new_value = max(1, round(new_value))
        setattr(mutant, field_name, new_value)

    if hasattr(mutant, "name") and isinstance(mutant.name, str):
        mutant.name = f"{mutant.name}{suffix}"

    return mutant

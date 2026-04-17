from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..performance.monitor import PerformanceMonitor

log = logging.getLogger(__name__)

_DEFAULT_REBALANCE_DAYS = 7
_MIN_WEIGHT = 0.05    # floor so no strategy is fully deactivated
_BLEND_ALPHA = 0.30   # EWA: new_weight = α × fresh + (1-α) × old
# Evolution: after this many consecutive rebalances with Sharpe <= suppression
# threshold, a strategy is hard-suppressed (weight forced to 0 regardless of
# min_weight floor).  Distinct from the floor so that legitimate under-performers
# still collect data, but chronically broken ones get retired.
_DEFAULT_SUPPRESSION_THRESHOLD = 0.0
_DEFAULT_SUPPRESSION_STRIKES = 3


class MetaLearner:
    """Adjusts strategy weights based on recent Sharpe contribution.

    Weekly rebalance (configurable):
      1. Compute per-strategy Sharpe over the last `performance_window` trades.
      2. Floor negative Sharpes at 0 and normalise to sum to 1.
      3. Apply `min_weight` floor and re-normalise.
      4. Blend: new = α × fresh + (1-α) × previous (smooth transitions).
      5. Save to `weights_path` for reproducibility / warm restart.

    Weights are loaded from file on construction if the file exists.
    """

    def __init__(
        self,
        strategy_names: list[str],
        initial_weights: dict[str, float] | None = None,
        rebalance_period_days: int = _DEFAULT_REBALANCE_DAYS,
        min_weight: float = _MIN_WEIGHT,
        blend_alpha: float = _BLEND_ALPHA,
        performance_window: int = 30,
        weights_path: str | Path | None = None,
        suppression_threshold: float = _DEFAULT_SUPPRESSION_THRESHOLD,
        suppression_strikes: int = _DEFAULT_SUPPRESSION_STRIKES,
    ) -> None:
        self._names = list(strategy_names)
        self._min_weight = min_weight
        self._blend_alpha = blend_alpha
        self._rebalance_period_days = rebalance_period_days
        self._performance_window = performance_window
        self._weights_path = Path(weights_path) if weights_path else None
        self._last_rebalance: datetime | None = None
        self._suppression_threshold = suppression_threshold
        self._suppression_strikes = suppression_strikes
        self._strike_count: dict[str, int] = {n: 0 for n in self._names}
        self._suppressed: set[str] = set()

        # Initialise equal weights unless given or loaded from file
        if self._weights_path and self._weights_path.exists():
            self._weights = self._load()
        elif initial_weights:
            self._weights = self._normalise({n: initial_weights.get(n, 1.0) for n in self._names})
        else:
            self._weights = {n: 1.0 / len(self._names) for n in self._names}

    # ── public API ─────────────────────────────────────────────────────────

    def get_weights(self) -> dict[str, float]:
        """Return current strategy weights (always sums to 1)."""
        return dict(self._weights)

    def suppressed(self) -> set[str]:
        """Names of strategies currently hard-suppressed (weight forced to 0)."""
        return set(self._suppressed)

    def reinstate(self, name: str) -> None:
        """Lift suppression — used after a mutation produces a new candidate."""
        self._suppressed.discard(name)
        self._strike_count[name] = 0

    def update_weights(
        self,
        monitor: PerformanceMonitor,
        as_of: datetime | None = None,
    ) -> dict[str, float]:
        """Rebalance if the rebalance period has elapsed; else return current weights.

        Parameters
        ----------
        monitor: Live `PerformanceMonitor` with per-strategy Sharpe data.
        as_of:   Timestamp override (useful for backtesting / testing).
        """
        now = as_of or datetime.now(timezone.utc)
        if self._last_rebalance is not None:
            elapsed_days = (now - self._last_rebalance).total_seconds() / 86400.0
            if elapsed_days < self._rebalance_period_days:
                return self.get_weights()

        fresh = self._compute_fresh_weights(monitor)
        blended = self._blend(fresh)
        self._weights = blended
        self._last_rebalance = now

        if self._weights_path:
            self._save()

        log.info("MetaLearner rebalanced weights: %s", {k: round(v, 3) for k, v in blended.items()})
        return self.get_weights()

    def force_update(self, monitor: PerformanceMonitor) -> dict[str, float]:
        """Force an immediate rebalance regardless of elapsed time."""
        self._last_rebalance = None
        return self.update_weights(monitor)

    # ── internals ──────────────────────────────────────────────────────────

    def _compute_fresh_weights(self, monitor: PerformanceMonitor) -> dict[str, float]:
        raw: dict[str, float] = {}
        for name in self._names:
            sharpe = monitor.strategy_sharpe(name)
            # Strike accounting for evolutionary suppression
            if sharpe <= self._suppression_threshold:
                self._strike_count[name] = self._strike_count.get(name, 0) + 1
                if self._strike_count[name] >= self._suppression_strikes:
                    self._suppressed.add(name)
                    log.warning("MetaLearner suppressing %s after %d strikes (sharpe=%.3f)",
                                name, self._strike_count[name], sharpe)
            else:
                self._strike_count[name] = 0
            raw[name] = 0.0 if name in self._suppressed else max(sharpe, 0.0)

        total = sum(raw.values())
        if total <= 0:
            # All strategies underwater → equal weights across the non-suppressed set
            active = [n for n in self._names if n not in self._suppressed]
            if not active:
                return {n: 1.0 / len(self._names) for n in self._names}
            return {n: (1.0 / len(active) if n in active else 0.0) for n in self._names}

        normalised = {n: v / total for n, v in raw.items()}
        return self._apply_floor(normalised)

    def _apply_floor(self, weights: dict[str, float]) -> dict[str, float]:
        """Ensure non-suppressed strategies stay at ``min_weight`` or above."""
        floored = {
            n: 0.0 if n in self._suppressed else max(w, self._min_weight)
            for n, w in weights.items()
        }
        return self._normalise(floored)

    def _blend(self, fresh: dict[str, float]) -> dict[str, float]:
        blended = {}
        for name in self._names:
            if name in self._suppressed:
                blended[name] = 0.0  # suppression bypasses the EWA blend
                continue
            old = self._weights.get(name, 1.0 / len(self._names))
            new = fresh.get(name, self._min_weight)
            blended[name] = self._blend_alpha * new + (1.0 - self._blend_alpha) * old
        return self._normalise(blended)

    @staticmethod
    def _normalise(weights: dict[str, float]) -> dict[str, float]:
        total = sum(weights.values())
        if total <= 0:
            n = len(weights)
            return {k: 1.0 / n for k in weights}
        return {k: v / total for k, v in weights.items()}

    # ── persistence ────────────────────────────────────────────────────────

    def _save(self) -> None:
        assert self._weights_path is not None
        payload = {
            "weights": self._weights,
            "last_rebalance": self._last_rebalance.isoformat() if self._last_rebalance else None,
        }
        self._weights_path.write_text(json.dumps(payload, indent=2))

    def _load(self) -> dict[str, float]:
        assert self._weights_path is not None
        try:
            payload = json.loads(self._weights_path.read_text())
            loaded = payload.get("weights", {})
            last_rb = payload.get("last_rebalance")
            if last_rb:
                self._last_rebalance = datetime.fromisoformat(last_rb)
            # Only keep names we actually have strategies for
            weights = {n: loaded.get(n, 1.0 / len(self._names)) for n in self._names}
            return self._normalise(weights)
        except Exception as exc:
            log.warning("Could not load weights from %s: %s", self._weights_path, exc)
            return {n: 1.0 / len(self._names) for n in self._names}

from __future__ import annotations

import logging
from typing import Any

import pandas as pd

from ..scanner.base import Opportunity, OpportunityList
from .collectors.onchain import OnChainCollector
from .collectors.polymarket import PolymarketCollector
from .collectors.stocks import StockVolumeCollector
from .signals import SmartMoneySignal
from .validator import MultiSourceValidator

log = logging.getLogger(__name__)

_MIN_RR = 2.0
_DEFAULT_STOP_PCT = 0.05   # 5% default stop if no hint available
_DEFAULT_TP_MULTIPLIER = 2.0  # take-profit = entry + 2 × risk


class SmartMoneyTracker:
    """Orchestrates all smart-money collectors → validation → R:R filter → OpportunityList.

    Implements the Scanner protocol so it can be used anywhere a Scanner is expected.

    Parameters
    ----------
    polymarket:     PolymarketCollector (or mock).
    onchain:        OnChainCollector (or mock).
    stocks:         StockVolumeCollector (or mock).
    validator:      MultiSourceValidator.
    min_rr:         Minimum risk/reward to include an opportunity.
    max_age_minutes: Maximum signal age before it's considered stale.
    """

    def __init__(
        self,
        polymarket: PolymarketCollector | None = None,
        onchain: OnChainCollector | None = None,
        stocks: StockVolumeCollector | None = None,
        validator: MultiSourceValidator | None = None,
        min_rr: float = _MIN_RR,
        max_age_minutes: float = 60.0,
        stock_symbols: list[str] | None = None,
        token_contracts: list[str] | None = None,
    ) -> None:
        self._polymarket = polymarket or PolymarketCollector()
        self._onchain = onchain or OnChainCollector()
        self._stocks = stocks or StockVolumeCollector()
        self._validator = validator or MultiSourceValidator(max_age_minutes=max_age_minutes)
        self.min_rr = min_rr
        self.stock_symbols = stock_symbols or []
        self.token_contracts = token_contracts or []

    # ── public API ─────────────────────────────────────────────────────────────

    def scan(
        self,
        candidates: dict[str, pd.DataFrame] | None = None,  # kept for Scanner compat
        news_hits: set[str] | None = None,
        sentiment_hits: set[str] | None = None,
        reaction_hits: set[str] | None = None,
    ) -> OpportunityList:
        """Collect signals, validate, convert to Opportunity objects."""
        signals = self._collect_all()
        if not signals:
            return OpportunityList()

        validated = self._validator.validate(
            signals,
            news_hits=news_hits,
            sentiment_hits=sentiment_hits,
            reaction_hits=reaction_hits,
        )

        opportunities: list[Opportunity] = []
        for vr in validated:
            opp = self._to_opportunity(vr.signals)
            if opp and (opp.risk_reward is None or opp.risk_reward >= self.min_rr):
                opportunities.append(opp)

        return OpportunityList(opportunities=opportunities)

    # ── internals ─────────────────────────────────────────────────────────────

    def _collect_all(self) -> list[SmartMoneySignal]:
        all_signals: list[SmartMoneySignal] = []
        for collector_fn in [
            lambda: self._polymarket.collect(),
            lambda: self._onchain.collect(self.token_contracts or None),
            lambda: self._stocks.collect(self.stock_symbols) if self.stock_symbols else [],
        ]:
            try:
                all_signals.extend(collector_fn())
            except Exception as exc:
                log.warning("Collector error: %s", exc)
        return all_signals

    def _to_opportunity(self, signals: list[SmartMoneySignal]) -> Opportunity | None:
        if not signals:
            return None

        # Dominant signal by magnitude
        dominant = max(signals, key=lambda s: s.magnitude)
        asset = dominant.asset
        market = dominant.market

        # Derive strategy type from signal type
        strategy_map = {
            "sudden_position_increase": "news",
            "rapid_odds_shift": "arbitrage",
            "unusual_volume": "trend",
            "large_wallet_transfer": "trend",
            "price_divergence": "mean_reversion",
        }
        strategy_type = strategy_map.get(dominant.signal_type, "trend")

        # Confidence: blend magnitude + freshness (fresher = better)
        freshness_score = max(0.0, 1.0 - dominant.freshness_minutes / 60.0)
        raw_confidence = (dominant.magnitude * 50.0 + freshness_score * 50.0)
        confidence = min(95.0, max(10.0, raw_confidence))

        # EV = confidence × magnitude (coarse proxy)
        ev = confidence * dominant.magnitude

        # Build entry/stop/target hints if we have a directional signal
        entry_hint: float | None = None
        stop_hint: float | None = None
        target_hint: float | None = None
        rr: float | None = None

        # For prediction markets and on-chain signals, hints are abstract
        if dominant.market in ("crypto", "stock"):
            # No price available from signal alone — callers should enrich
            pass

        catalyst_parts = [s.raw_detail for s in signals if s.raw_detail]
        catalyst = "; ".join(catalyst_parts[:3]) or f"{dominant.signal_type} on {asset}"

        return Opportunity(
            asset=asset,
            market=market,
            strategy_type=strategy_type,  # type: ignore[arg-type]
            catalyst=catalyst,
            entry_hint=entry_hint,
            stop_hint=stop_hint,
            target_hint=target_hint,
            risk_reward=rr,
            expected_value=ev,
            confidence=confidence,
        )

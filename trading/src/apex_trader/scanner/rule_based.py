from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import pandas as pd

from ..indicators import atr, bollinger, ema, rsi
from .base import Opportunity, OpportunityList


@dataclass
class RuleBasedScanner:
    """Rule-based opportunity scanner over OHLCV history.

    Emits opportunities with R:R >= min_rr using ATR for stop distance. EV
    score is a rough proxy: (win_p * reward) - ((1 - win_p) * risk), with
    win_p inferred from signal strength — not a calibration, just a ranker.
    """
    min_rr: float = 2.0
    market: Literal["crypto", "stock", "prediction_market"] = "crypto"
    min_bars: int = 60

    def _scan_one(self, symbol: str, df: pd.DataFrame) -> Opportunity | None:
        if len(df) < self.min_bars:
            return None
        close = df["close"]
        high = df["high"]
        low = df["low"]
        ema20 = ema(close, 20).iloc[-1]
        ema50 = ema(close, 50).iloc[-1]
        rsi14 = float(rsi(close, 14).iloc[-1])
        bb_lo, _, bb_up = bollinger(close, 20, 2.0)
        atr14 = float(atr(high, low, close, 14).iloc[-1])
        px = float(close.iloc[-1])

        # Trend breakout: close crosses above EMA50 with positive slope.
        if (
            ema20 > ema50
            and close.iloc[-2] <= ema50.item() <= close.iloc[-1]  # type: ignore[union-attr]
        ):
            stop = px - 2.0 * atr14
            target = px + 4.0 * atr14
            if px - stop <= 0:
                return None
            rr = (target - px) / (px - stop)
            return Opportunity(
                asset=symbol,
                market=self.market,
                strategy_type="trend",
                catalyst="break and close above EMA50 in uptrend",
                entry_hint=px,
                stop_hint=stop,
                target_hint=target,
                risk_reward=rr,
                expected_value=0.55 * (target - px) - 0.45 * (px - stop),
                confidence=60.0,
            )

        # Mean reversion: oversold at lower Bollinger in an uptrend.
        if rsi14 < 30 and close.iloc[-1] <= bb_lo.iloc[-1] and ema20 > ema50:
            stop = px - 1.5 * atr14
            target = float(bb_up.iloc[-1])
            if px - stop <= 0 or target <= px:
                return None
            rr = (target - px) / (px - stop)
            return Opportunity(
                asset=symbol,
                market=self.market,
                strategy_type="mean_reversion",
                catalyst="RSI<30 at lower BB in uptrend",
                entry_hint=px,
                stop_hint=stop,
                target_hint=target,
                risk_reward=rr,
                expected_value=0.50 * (target - px) - 0.50 * (px - stop),
                confidence=55.0,
            )

        return None

    def scan(self, candidates: dict[str, pd.DataFrame]) -> OpportunityList:
        out: list[Opportunity] = []
        for symbol, df in candidates.items():
            opp = self._scan_one(symbol, df)
            if opp is None:
                continue
            if opp.risk_reward is None or opp.risk_reward < self.min_rr:
                continue
            out.append(opp)
        return OpportunityList(opportunities=out)

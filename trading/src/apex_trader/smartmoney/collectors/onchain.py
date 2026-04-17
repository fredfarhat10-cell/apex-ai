from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from ..signals import SmartMoneySignal

log = logging.getLogger(__name__)

# Whale transfer threshold in USD
_WHALE_THRESHOLD_USD = 1_000_000
# Etherscan-compatible public API (no auth for basic usage)
_ETHERSCAN_BASE = "https://api.etherscan.io/api"


def _get(url: str, params: dict | None = None) -> Any:
    import json as _json
    import urllib.parse
    import urllib.request

    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=10) as resp:
        return _json.loads(resp.read())


class OnChainCollector:
    """Detects large on-chain wallet movements using public block explorers.

    Etherscan requires a free API key for higher rate limits; works without one
    at reduced rate. Inject `http_get` in tests to avoid real network calls.
    """

    def __init__(
        self,
        http_get: Any = None,
        api_key: str = "",
        whale_threshold_usd: float = _WHALE_THRESHOLD_USD,
    ) -> None:
        self._get = http_get or _get
        self._api_key = api_key
        self.whale_threshold_usd = whale_threshold_usd

    def collect(self, token_contracts: list[str] | None = None) -> list[SmartMoneySignal]:
        """Scan recent large transfers for the given token contract addresses."""
        if not token_contracts:
            # Default: ETH large transfers
            return self._scan_eth_transfers()
        signals: list[SmartMoneySignal] = []
        for contract in token_contracts:
            signals.extend(self._scan_token_transfers(contract))
        return signals

    def _scan_eth_transfers(self) -> list[SmartMoneySignal]:
        signals: list[SmartMoneySignal] = []
        try:
            params: dict = {
                "module": "account",
                "action": "txlist",
                "address": "0x0000000000000000000000000000000000000000",
                "sort": "desc",
                "offset": "20",
                "page": "1",
            }
            if self._api_key:
                params["apikey"] = self._api_key
            data = self._get(_ETHERSCAN_BASE, params)
            txs = data.get("result", [])
            if not isinstance(txs, list):
                return signals
            now = datetime.now(timezone.utc)
            for tx in txs:
                signals.extend(self._tx_to_signal(tx, "ETH", now))
        except Exception as exc:
            log.warning("Etherscan fetch failed: %s", exc)
        return signals

    def _scan_token_transfers(self, contract: str) -> list[SmartMoneySignal]:
        signals: list[SmartMoneySignal] = []
        try:
            params: dict = {
                "module": "account",
                "action": "tokentx",
                "contractaddress": contract,
                "sort": "desc",
                "offset": "20",
                "page": "1",
            }
            if self._api_key:
                params["apikey"] = self._api_key
            data = self._get(_ETHERSCAN_BASE, params)
            txs = data.get("result", [])
            if not isinstance(txs, list):
                return signals
            now = datetime.now(timezone.utc)
            for tx in txs:
                token_name = tx.get("tokenSymbol", contract[:8])
                signals.extend(self._tx_to_signal(tx, token_name, now))
        except Exception as exc:
            log.warning("Token transfer fetch failed for %s: %s", contract, exc)
        return signals

    def _tx_to_signal(self, tx: dict, asset: str, now: datetime) -> list[SmartMoneySignal]:
        try:
            value_wei = int(tx.get("value", 0))
            decimals = int(tx.get("tokenDecimal", 18))
            value_tokens = value_wei / (10 ** decimals)
            # Crude USD approximation — real impl would multiply by spot price
            value_usd_approx = value_tokens  # caller should pass USD value if available
            if value_usd_approx < self.whale_threshold_usd:
                return []
            ts_raw = tx.get("timeStamp", "0")
            event_ts = datetime.fromtimestamp(int(ts_raw), tz=timezone.utc)
            freshness = (now - event_ts).total_seconds() / 60
            return [
                SmartMoneySignal(
                    source="onchain",
                    signal_type="large_wallet_transfer",
                    asset=asset,
                    market="crypto",
                    magnitude=min(value_usd_approx / 10_000_000, 1.0),
                    direction="neutral",
                    timestamp=event_ts,
                    freshness_minutes=freshness,
                    raw_detail=f"{asset} transfer {value_tokens:.2f} tokens ({value_usd_approx:,.0f} USD)",
                )
            ]
        except Exception:
            return []

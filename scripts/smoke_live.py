"""Live smoke test against the REAL providers (needs outbound internet).

Usage: python scripts/smoke_live.py
Prints which providers are reachable, the resolved universe, a spot price, the FX rate and a feature summary.
Exits non-zero if no market data can be obtained.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from aq.config import get_settings  # noqa: E402
from aq.data.base import DataUnavailable, closed_only, utcnow  # noqa: E402
from aq.data.service import build_default_service  # noqa: E402
from aq.features import compute_features  # noqa: E402


def main() -> int:
    s = get_settings()
    svc = build_default_service(s)
    res = svc.resolve_universe(force=True)
    print("active universe:", res.active)
    print("removed:", res.removed)
    for h in svc.health_report():
        print(f"  {h['name']:12} ok={h['ok']} err={(h['last_error'] or '')[:120]}")
    if not res.active:
        print("FAIL: no market data provider reachable")
        return 1
    asset = next(iter(res.active))
    q = svc.get_spot_price(asset)
    print(f"{asset} spot ${q.price_usd:,.4f} from {q.source} at {q.timestamp}")
    try:
        fx = svc.get_fx_usd_per_gbp()
        print(f"GBP/USD {fx.usd_per_gbp:.4f} ({fx.source})")
    except DataUnavailable as e:
        print("FX unavailable:", e)
    candles, src = svc.get_candles(asset, "1h", limit=300)
    f = compute_features(closed_only(candles, utcnow()))
    print(f"{len(candles)} 1h candles from {src}; ret_24h={f['ret_24h_pct']:.2f}% z_24h={f['z_24h']:.2f} "
          f"vol_ratio={f['volume_ratio_24h']} rsi={f['rsi_14']:.1f} trend={f['trend']}")
    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())

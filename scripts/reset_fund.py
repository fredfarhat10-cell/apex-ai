"""Start the paper fund fresh at its starting capital (Day 1).

Backs up the current ledger next to it (adaptive_quant.db.bak-<timestamp>) before removing it, so nothing is lost.
Usage:  python scripts/reset_fund.py --yes
"""
import argparse
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from aq.config import get_settings  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--yes", action="store_true", help="confirm: back up and remove the current ledger")
    args = ap.parse_args()
    db = Path(get_settings().db_path)
    if not db.exists():
        print(f"No ledger at {db}; the fund will start fresh on next launch.")
        return 0
    if not args.yes:
        print(f"This backs up and removes {db}. Stop the server first, then re-run with --yes.")
        return 1
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup = db.with_name(f"{db.name}.bak-{stamp}")
    shutil.copy2(db, backup)
    for p in (db, db.with_name(db.name + "-wal"), db.with_name(db.name + "-shm")):
        if p.exists():
            p.unlink()
    print(f"Backed up to {backup}. Ledger removed: the fund restarts at its starting capital on next launch.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

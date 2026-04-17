from __future__ import annotations

import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from config import LEARNING_LOG, TRADING
from data import LiveDataFeed, SyntheticDataFeed
from executor import get_executor
from logger import TradeLogger, TradeRecord
from risk import RiskState, compute_position_size, detect_regime, validate_trade

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("apex")


def _load_prompt(name: str) -> str:
    path = Path(__file__).parent / "prompts" / f"{name}.txt"
    return path.read_text()


def _call_claude(system: str, user: str) -> dict:
    """Call Claude and parse JSON response. Returns {} on error."""
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        msg = client.messages.create(
            model=TRADING["llm_model"],
            max_tokens=4096,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        text = msg.content[0].text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as exc:
        log.error("Claude call failed: %s", exc)
        return {}


def _post_mortem(trade: dict, result: dict, logger: TradeLogger) -> None:
    try:
        prompt = _load_prompt("post_trade_prompt")
        pnl = result.get("pnl", 0)
        user_msg = prompt.format(
            asset=trade.get("asset", ""),
            entry=trade.get("entry", ""),
            exit=result.get("exit_price", ""),
            stop_loss=trade.get("stop_loss", ""),
            take_profit=trade.get("take_profit", ""),
            pnl=pnl,
            strategy=trade.get("strategy", ""),
            duration=result.get("duration", ""),
            thesis=trade.get("reasoning", ""),
        )
        review = _call_claude(_load_prompt("system_prompt"), user_msg)
        if review:
            with open(LEARNING_LOG, "a") as f:
                f.write(json.dumps({"trade": trade, "result": result, "review": review}) + "\n")
    except Exception as exc:
        log.warning("Post-mortem failed: %s", exc)


def run_once(
    symbols: list[str] | None = None,
    paper: bool = True,
    synthetic: bool = False,
) -> None:
    """Single scan-decide-execute cycle (call in a loop for live operation)."""
    symbols = symbols or TRADING["symbols"]
    executor = get_executor()
    db = TradeLogger()
    state = RiskState()

    feed = SyntheticDataFeed() if synthetic else LiveDataFeed()

    system_prompt = _load_prompt("system_prompt")
    scanner_prompt = _load_prompt("scanner_prompt")

    # Estimate current equity from open trades + a fixed starting balance
    balance = 10_000.0  # TODO: fetch real balance from exchange/portfolio
    state.on_bar(balance)

    if state.halted:
        log.warning("Kill-switch active (%s) — no trades", state.halt_reason)
        return

    # Collect market snapshots
    snapshots = {}
    for sym in symbols:
        try:
            snap = feed.fetch_snapshot(sym)
            snapshots[sym] = snap
        except Exception as exc:
            log.warning("Could not fetch %s: %s", sym, exc)

    if not snapshots:
        log.warning("No market data available")
        return

    # Build scanner user message
    market_summary = "\n".join(
        f"- {sym}: last={snap.last_price:.4f}, regime={snap.regime}, "
        f"vol_ratio={snap.last_volume / max(snap.avg_volume, 1):.1f}x"
        for sym, snap in snapshots.items()
    )
    scanner_user = f"{scanner_prompt}\n\nMarket data:\n{market_summary}"

    proposals_raw = _call_claude(system_prompt, scanner_user)
    if not proposals_raw or proposals_raw.get("action") == "HOLD":
        log.info("No opportunities — HOLD")
        return

    # proposals_raw may be a list or a single dict
    proposals = proposals_raw if isinstance(proposals_raw, list) else [proposals_raw]

    for proposal in proposals[:3]:  # process top 3
        sym = proposal.get("asset", "")
        if sym not in snapshots:
            continue

        accepted, reason = validate_trade(proposal, balance, state)
        if not accepted:
            log.info("Trade rejected [%s]: %s", sym, reason)
            continue

        snap = snapshots[sym]
        closes = snap.closes
        strategy_stats_list = db.strategy_stats(proposal.get("strategy", ""))
        stats = strategy_stats_list[0] if strategy_stats_list else {}

        sizing = compute_position_size(
            equity=balance,
            price=proposal["entry"],
            stop_price=proposal["stop_loss"],
            closes=closes,
            win_rate=stats.get("winning_trades", 0) / max(stats.get("total_trades", 1), 1),
            avg_win=abs(stats.get("total_pnl", 0)) / max(stats.get("winning_trades", 1), 1) if stats.get("winning_trades") else None,
            avg_loss=None,
        )
        if sizing.quantity <= 0:
            log.info("Zero quantity for %s — skip", sym)
            continue

        fill = executor.buy(sym, sizing.quantity, snap.last_price)
        record = TradeRecord(
            asset=sym,
            strategy=proposal.get("strategy", "unknown"),
            entry=fill.fill_price,
            stop_loss=proposal["stop_loss"],
            take_profit=proposal["take_profit"],
            quantity=fill.quantity,
            thesis=proposal.get("reasoning", ""),
        )
        trade_id = db.open_trade(record)
        log.info(
            "OPEN [%s] %s qty=%.4f @ %.4f (paper=%s, method=%s)",
            trade_id, sym, fill.quantity, fill.fill_price, fill.paper, sizing.method,
        )


def main() -> None:
    log.info("Apex trading bot starting — paper_mode=%s", TRADING["paper_mode"])
    while True:
        try:
            run_once()
        except KeyboardInterrupt:
            log.info("Stopped by user")
            break
        except Exception as exc:
            log.error("Cycle error: %s", exc, exc_info=True)
        time.sleep(3600)  # 1-hour cycle for h1 bars


if __name__ == "__main__":
    main()

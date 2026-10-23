# Go-live checklist: real-time paper fund

The fund trades £10,000 of **paper** money against **real** live prices, real order-book costs and real outcomes.
There are no exchange keys and no real orders anywhere in this codebase.

Allow about 15 minutes. You need a GitHub account (this repo), an Anthropic API key, and an account on one host.

## 1. Choose where it runs (always-on)

| Option | Cost (approx.) | Notes |
|---|---|---|
| **Render** (recommended) | ~$7/month starter instance + $0.25/GB disk | `render.yaml` is included: one-click Blueprint. Pick the **Frankfurt** region. |
| **Railway** | ~$5–10/month usage-based | `railway.json` is included; add a Volume in the dashboard. |
| **Your own computer** | free | Fine for a trial; the bot stops when the machine sleeps, missing stops, targets and scans. |

Run **exactly one instance**: the scheduler and the SQLite ledger expect a single writer. Do not use a
free tier that sleeps, because a sleeping server misses exits and its scans.

Region: choose an EU region. Binance's public market data is not served to US IP addresses; the app would fall
back to Coinbase, which works but makes Binance-style live streaming unavailable.

## 2. Get the keys and secrets ready

1. **Anthropic API key**: console.anthropic.com → API keys. Set a monthly spend limit there as well.
2. **Dashboard password**: any long random string. The browser login user is `admin`.

## 3. Deploy

### Render
1. Render dashboard → **New → Blueprint** → select this repo and the branch.
2. It reads `render.yaml`: one web service, Docker, `/healthz` health check, a 1 GB disk at `/data`.
3. When prompted, paste `ANTHROPIC_API_KEY` and `AQ_DASHBOARD_PASSWORD`.
4. Deploy. Open the service URL and log in as `admin` with your password.

### Railway
1. **New Project → Deploy from GitHub repo** → this repo and branch (it reads `railway.json`).
2. Service → **Volumes → Add Volume**, mount path `/data`.
3. Service → **Variables**: `ANTHROPIC_API_KEY`, `AQ_DASHBOARD_PASSWORD`, `AQ_ALLOW_SHORT=false`.
4. Service → **Settings → Networking → Generate Domain**. Open it and log in.

### Your own computer
```bash
pip install -r requirements.txt
cp .env.example .env        # fill in ANTHROPIC_API_KEY (password optional when only you can reach it)
python scripts/smoke_live.py
python -m aq                # http://127.0.0.1:8000
```
Or with Docker: `docker build -t adaptive-quant . && docker run -p 8000:8000 -v aqdata:/data --env-file .env adaptive-quant`.

## 4. Verify it is really live (5 minutes)

- [ ] `https://<your-app>/healthz` returns `"status":"ok"` and `"scheduler_running": true`.
- [ ] The status in the dashboard header shows **Live market data** and agents **llm:claude-…** (not `rules:v1`).
- [ ] Trade page: the pair header shows a green **● LIVE** badge with a ticking time, and the order book updates.
- [ ] Portfolio page: GBP/USD shows **live rate** with a recent time.
- [ ] Within about 1 minute of boot, System → Monitor runs shows the first scan with status `ok`.
- [ ] Run one manual investigation (Trade → **Run Investigation**). The Scout and Devil's Advocate show engine
      `llm:claude-…`, and Research shows the full reasoning chain.

If any box fails, open System → Data providers for the exact error.

## 5. Start the fund clean (Day 1 = £10,000)

The fund starts on the first boot of a fresh volume. If you ran tests or trials on the same disk first:

```bash
# stop the service, then on the server or locally:
python scripts/reset_fund.py --yes   # backs up the old ledger, then the next boot starts at £10,000
```

## 6. Settings that make it behave as if the money were real

These are the defaults; change them only deliberately and write the change down (it is a new experiment).

| Setting | Default | Why |
|---|---|---|
| `AQ_ALLOW_SHORT` | `false` | UK retail cannot access crypto derivatives (FCA ban, 2021), so a UK-realistic fund only buys. |
| `AQ_FEE_BPS_PER_SIDE` | `10` | Binance spot taker ≈ 0.10%. If you would execute on Coinbase retail, use 60 or more. |
| `AQ_MAX_RISK_PER_TRADE_PCT` | `0.5` | £50 at risk per trade on £10,000. |
| `AQ_MAX_OPEN_POSITIONS` | `3` | |
| `AQ_DAILY_LOSS_LIMIT_PCT` | `2` | No new trades after a 2% day. |
| `AQ_MAX_LLM_CALLS_PER_DAY` | `60` | Claude spend cap; above it the agents fall back to `rules:v1` (labelled). |
| `AQ_DASHBOARD_PASSWORD` | — | Required on a public server: otherwise anyone can trigger investigations (and spend your credit). |
| `AQ_PUBLIC_READ_ONLY` | `false` | Set `true` to let anyone *view* the fund while only you can act. |

## 7. First week: what to watch

- **Daily:** System → Monitor runs (no `error` status), the agent engine is still `llm:claude-…`, and Claude spend in the
  Anthropic console.
- **Every trade:** open it and read the Scout / Devil's Advocate reasoning. Note anything that looks wrong; that feedback
  is the most valuable input right now.
- **Do not change rules after a loss.** Lessons accumulate; a change is considered only after ≥10 similar cases
  (see Lessons → Evidence accumulation).
- **Do not publish performance yet.** Below 20 closed trades the dashboard labels every metric as insufficient sample;
  see `docs/STRATEGY.md` for the content and compliance plan.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Market data offline" | Host region blocked (use EU) or exchange outage; check System → Data providers. |
| Agents show `rules:v1` | `ANTHROPIC_API_KEY` missing or wrong, or the daily cap is reached (`/healthz` shows `llm_calls_today`). |
| Fund restarted at £10,000 unexpectedly | The disk/volume is not mounted at `/data`, so the ledger was lost on redeploy. |
| Browser keeps asking for the password | The username must be `admin`; the password is `AQ_DASHBOARD_PASSWORD`. |

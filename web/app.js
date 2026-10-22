// Adaptive Quant — Arena dashboard. Every element is rendered from a backend endpoint; nothing is simulated.
"use strict";

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const NA = '<span class="muted">—</span>';

async function api(path, opts = {}) {
  const r = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.detail || body.error || `HTTP ${r.status}`);
  return body;
}

// ---- formatting ---------------------------------------------------------------
const num = (v, d = 2) => (v === null || v === undefined || Number.isNaN(v)) ? null : Number(v).toFixed(d);
const gbp = (v, d = 2) => v == null ? NA : `${v < 0 ? "−" : ""}£${Math.abs(v).toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const signedGbp = (v) => v == null ? NA : `<span class="${v >= 0 ? "pos" : "neg"}">${v >= 0 ? "+" : "−"}£${Math.abs(v).toFixed(2)}</span>`;
const pct = (v, d = 2) => v == null ? NA : `<span class="${v > 0 ? "pos" : v < 0 ? "neg" : ""}">${v > 0 ? "+" : ""}${Number(v).toFixed(d)}%</span>`;
function usd(v) {
  if (v == null) return NA;
  const d = v >= 1000 ? 2 : v >= 1 ? 4 : 6;
  return "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: d });
}
const when = (iso) => iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";
const hhmm = (iso) => iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—";
const ago = (iso) => {
  if (!iso) return "";
  const s = (Date.now() - Date.parse(iso)) / 1000;
  return s < 60 ? `${Math.max(0, s | 0)}s ago` : s < 3600 ? `${(s / 60) | 0}m ago` : s < 86400 ? `${(s / 3600) | 0}h ago` : `${(s / 86400) | 0}d ago`;
};
const badge = (t) => `<span class="badge ${esc(t)}">${esc(String(t).replaceAll("_", " "))}</span>`;
const empty = (msg) => `<div class="empty">${esc(msg)}</div>`;
function fval(v) {
  if (v === null || v === undefined) return "Data unavailable";
  if (typeof v === "number") return Math.abs(v) >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 2 }) : Number(v.toPrecision(5)).toString();
  return v;
}
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// ---- routing -------------------------------------------------------------------
const TABS = ["arena", "research", "lessons", "system"];
function route() {
  const h = location.hash.slice(1) || "arena";
  const [name, id] = h.split("/");
  const view = TABS.includes(name) || name === "trade" || name === "investigation" ? name : "arena";
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
  document.querySelectorAll("#tabs a").forEach((a) => a.classList.toggle("active",
    a.dataset.tab === view || (view === "trade" && a.dataset.tab === "arena") || (view === "investigation" && a.dataset.tab === "research")));
  ({ arena: loadArena, research: loadResearch, lessons: loadLessons, system: loadSystem,
     trade: () => loadTrade(id), investigation: () => loadInvestigationDetail(id) })[view]();
}
window.addEventListener("hashchange", route);

// ---- status + ticker -----------------------------------------------------------
let STATUS = null, PRICES = null, selectedAsset = null;
async function loadStatus() {
  try {
    STATUS = await api("/api/status");
    const live = STATUS.providers.some((p) => p.ok) && Object.keys(STATUS.universe.active).length;
    $("status-line").innerHTML = `<span class="dot ${live ? "live" : "down"}"></span>
      <span>${live ? "LIVE DATA" : "DATA OFFLINE"}</span><span class="muted">·</span>
      <span>AGENTS: ${esc(STATUS.llm.engine.toUpperCase())}</span><span class="muted">·</span>
      <span id="next-scan">${STATUS.monitor.enabled ? "NEXT SCAN " + countdown(STATUS.monitor.next_run) : "MONITOR OFF"}</span>`;
    renderChips();
  } catch (e) {
    $("status-line").innerHTML = `<span class="dot down"></span><span class="neg">API UNREACHABLE</span>`;
  }
}
function countdown(iso) {
  if (!iso) return "—";
  const s = Math.max(0, (Date.parse(iso) - Date.now()) / 1000);
  return `${String((s / 60) | 0).padStart(2, "0")}:${String((s % 60) | 0).padStart(2, "0")}`;
}
setInterval(() => {
  if (STATUS && STATUS.monitor.enabled && $("next-scan")) $("next-scan").textContent = "NEXT SCAN " + countdown(STATUS.monitor.next_run);
}, 1000);

async function loadPrices() {
  try {
    PRICES = await api("/api/prices");
    const items = PRICES.assets.map((a) => a.available
      ? `<span class="tick"><b>${esc(a.asset)}</b><span class="px">${usd(a.price_usd)}</span>${a.change_24h_pct == null ? "" : pct(a.change_24h_pct)}</span>`
      : `<span class="tick"><b>${esc(a.asset)}</b><span class="muted">data unavailable</span></span>`);
    const removed = Object.entries(PRICES.removed || {}).map(([a, r]) => `<span class="tick"><b class="muted">${esc(a)}</b><span class="muted">${esc(r)}</span></span>`);
    const all = [...items, ...removed];
    // The track is duplicated so the CSS marquee loops seamlessly; the values are the same real quotes.
    $("ticker").innerHTML = all.length ? all.join("") + all.join("") : `<span class="tick neg">MARKET DATA UNAVAILABLE — no provider reachable</span>`;
  } catch (e) {
    $("ticker").innerHTML = `<span class="tick neg">MARKET DATA UNAVAILABLE: ${esc(e.message)}</span>`;
  }
}

function renderChips() {
  const active = STATUS ? Object.keys(STATUS.universe.active) : [];
  if (!active.includes(selectedAsset)) selectedAsset = active[0] || null;
  $("asset-chips").innerHTML = active.length
    ? active.map((a) => `<button data-asset="${esc(a)}" class="${a === selectedAsset ? "on" : ""}">${esc(a)}</button>`).join("")
    : `<span class="neg small">no assets — market data unavailable</span>`;
  $("run-btn").disabled = !active.length;
  $("asset-chips").querySelectorAll("button").forEach((b) => b.onclick = () => { selectedAsset = b.dataset.asset; renderChips(); });
}

$("run-btn").addEventListener("click", async () => {
  if (!selectedAsset) return;
  $("run-btn").disabled = true;
  $("run-status").innerHTML = `<span class="pos">●</span> ${esc(selectedAsset)}: fetching data → scout → devil's advocate → risk engine…`;
  try {
    const inv = await api("/api/investigations", { method: "POST", body: JSON.stringify({ asset: selectedAsset }) });
    $("run-status").innerHTML = `${badge(inv.final_decision)} <a href="#investigation/${inv.id}">view full reasoning →</a>`;
    loadArena();
  } catch (e) {
    $("run-status").innerHTML = `<span class="neg">failed: ${esc(e.message)}</span>`;
  } finally { $("run-btn").disabled = false; }
});

// ---- arena ---------------------------------------------------------------------
const SERIES_COLOR = { ai: "--c-ai", hodl: "--c-hodl", sma: "--c-sma" };
const SERIES_TAG = { ai: "AI", hodl: "HODL", sma: "SMA" };
let LAST_SERIES = null, LAST_TREND = null, resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (LAST_SERIES) $("race-chart").innerHTML = raceChart(LAST_SERIES);
    if (LAST_TREND) $("trend-chart").innerHTML = trendChart(LAST_TREND);
  }, 150);
});

// Fund value (£) per day. Points come straight from recorded equity; days with no recording break the line.
function trendChart(tr) {
  const pts = tr.points;
  if (pts.length < 2) return empty(`Day 1 of the fund: ${gbp(tr.starting_capital_gbp, 0).replace(/<[^>]+>/g, "")} invested. The trend line appears once a second day has been recorded.`);
  const W = Math.max(320, $("trend-chart").clientWidth || 1000), H = W < 600 ? 240 : 280;
  const L = W < 600 ? 62 : 76, R = 24, T = 26, B = 30;
  const maxDay = pts[pts.length - 1].day;
  const vals = pts.flatMap((p) => [p.value_gbp, p.high_gbp, p.low_gbp]).concat([tr.starting_capital_gbp]);
  let y0 = Math.min(...vals), y1 = Math.max(...vals);
  const pad = Math.max((y1 - y0) * 0.15, tr.starting_capital_gbp * 0.002); y0 -= pad; y1 += pad;
  const X = (d) => L + (maxDay === 1 ? 0.5 : (d - 1) / (maxDay - 1)) * (W - L - R);
  const Y = (v) => T + (y1 - v) / (y1 - y0) * (H - T - B);
  const line = css("--line"), dim = css("--dim"), muted = css("--muted"), green = css("--green"), red = css("--red");
  const fmt = (v) => "£" + Math.round(v).toLocaleString("en-GB");
  let g = "";
  for (let i = 0; i <= 4; i++) {
    const v = y0 + (y1 - y0) * i / 4;
    g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${line}"/><text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="${dim}">${fmt(v)}</text>`;
  }
  const step = Math.max(1, Math.ceil(maxDay / (W < 600 ? 5 : 10)));
  for (let d = 1; d <= maxDay; d += step) g += `<text x="${X(d)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="${dim}">DAY ${d}</text>`;
  g += `<line x1="${L}" x2="${W - R}" y1="${Y(tr.starting_capital_gbp)}" y2="${Y(tr.starting_capital_gbp)}" stroke="${muted}" stroke-dasharray="4 4"/>
    <text x="${W - R}" y="${Y(tr.starting_capital_gbp) - 6}" text-anchor="end" font-size="10" fill="${muted}">invested ${fmt(tr.starting_capital_gbp)}</text>`;
  // Split into contiguous runs so missing days show as gaps.
  const runs = [];
  for (const p of pts) { const r = runs[runs.length - 1]; if (r && p.day === r[r.length - 1].day + 1) r.push(p); else runs.push([p]); }
  const lines = runs.map((r) => {
    const d = r.map((p, i) => `${i ? "L" : "M"}${X(p.day).toFixed(1)},${Y(p.value_gbp).toFixed(1)}`).join("");
    const area = `${d}L${X(r[r.length - 1].day).toFixed(1)},${Y(tr.starting_capital_gbp).toFixed(1)}L${X(r[0].day).toFixed(1)},${Y(tr.starting_capital_gbp).toFixed(1)}Z`;
    return `<path d="${area}" fill="${green}" fill-opacity=".07"/><path d="${d}" fill="none" stroke="${green}" stroke-width="2.4" stroke-linejoin="round" filter="url(#glow2)"/>`;
  }).join("");
  const showAll = pts.length <= (W < 600 ? 6 : 14);
  const hi = pts.reduce((a, b) => (b.value_gbp > a.value_gbp ? b : a)), lo = pts.reduce((a, b) => (b.value_gbp < a.value_gbp ? b : a));
  // Label first, last, best, worst (or all when few), skipping any that would collide with a neighbour's label.
  const want = pts.map((p, i) => showAll || i === 0 || i === pts.length - 1 || p === hi || p === lo);
  const placed = [];
  for (const i of [pts.length - 1, ...pts.keys()]) {
    if (!want[i] || placed.includes(i)) continue;
    const x = X(pts[i].day), y = Y(pts[i].value_gbp);
    if (placed.some((j) => Math.abs(X(pts[j].day) - x) < 64 && Math.abs(Y(pts[j].value_gbp) - y) < 16)) want[i] = false;
    else placed.push(i);
  }
  const marks = pts.map((p, i) => {
    const col = p.value_gbp >= tr.starting_capital_gbp ? green : red;
    const label = want[i];
    const range = p.high_gbp > p.low_gbp ? `<line x1="${X(p.day)}" x2="${X(p.day)}" y1="${Y(p.high_gbp)}" y2="${Y(p.low_gbp)}" stroke="${col}" stroke-opacity=".45" stroke-width="3"/>` : "";
    return `${range}<circle cx="${X(p.day)}" cy="${Y(p.value_gbp)}" r="4" fill="${col}"/>${label
      ? `<text x="${X(p.day)}" y="${Y(p.value_gbp) - 10}" text-anchor="middle" font-size="11" font-weight="700" fill="${col}">${fmt(p.value_gbp)}</text>` : ""}`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" style="height:${H}px" role="img" aria-label="Fund value by day since inception">
    <defs><filter id="glow2"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    ${g}${lines}${marks}</svg>`;
}

async function loadTrend() {
  let tr;
  try { tr = await api("/api/investment-trend"); } catch (e) { $("trend-chart").innerHTML = empty("Data unavailable: " + e.message); return; }
  LAST_TREND = tr;
  $("trend-chart").innerHTML = trendChart(tr);
  const last = tr.points[tr.points.length - 1];
  $("trend-meta").innerHTML = `day ${tr.days_elapsed} · ${gbp(tr.starting_capital_gbp, 0)} invested → ${gbp(last.value_gbp)} ${pct(last.return_pct)}`;
  // Milestones: every recorded day if few, otherwise a spaced selection that always includes first, last, best and worst.
  let ms = tr.points;
  if (ms.length > 12) {
    const keep = new Set([0, ms.length - 1]);
    const hiI = ms.reduce((a, p, i) => (p.value_gbp > ms[a].value_gbp ? i : a), 0), loI = ms.reduce((a, p, i) => (p.value_gbp < ms[a].value_gbp ? i : a), 0);
    keep.add(hiI); keep.add(loI);
    const step = Math.ceil(ms.length / 8);
    for (let i = 0; i < ms.length; i += step) keep.add(i);
    ms = [...keep].sort((a, b) => a - b).map((i) => tr.points[i]);
  }
  $("trend-milestones").innerHTML = ms.map((p) => `<div class="mile"><div class="d">DAY ${p.day} · ${esc(p.date)}</div>
    <div class="v ${p.value_gbp > tr.starting_capital_gbp ? "pos" : p.value_gbp < tr.starting_capital_gbp ? "neg" : ""}">${gbp(p.value_gbp)}</div>
    <div class="c">${signedGbp(p.change_from_start_gbp)} ${pct(p.return_pct)}</div></div>`).join("");
  $("trend-note").textContent = tr.note + (tr.missing_days.length ? ` Days with no recording: ${tr.missing_days.join(", ")}.` : "")
    + " Paper performance only — not evidence of future results.";
}

function raceChart(series) {
  // viewBox matches the container's pixel size so text never stretches.
  const W = Math.max(320, $("race-chart").clientWidth || 1000), H = W < 600 ? 260 : 340;
  const L = 50, R = W < 600 ? 104 : 150, T = 18, B = 28;
  const pts = series.flatMap((s) => s.points.map(([t, v]) => [Date.parse(t), v]));
  if (pts.length < 3) return empty("The race starts after the first BTC price is observed and the first equity snapshots are taken.");
  const x0 = Math.min(...pts.map((p) => p[0]));
  const x1 = Math.max(x0 + 60e3, ...pts.map((p) => p[0]));
  let y0 = Math.min(0, ...pts.map((p) => p[1])), y1 = Math.max(0, ...pts.map((p) => p[1]));
  const pad = Math.max((y1 - y0) * 0.12, 0.25); y0 -= pad; y1 += pad;
  const X = (t) => L + (t - x0) / (x1 - x0) * (W - L - R), Y = (v) => T + (y1 - v) / (y1 - y0) * (H - T - B);
  const line = css("--line"), muted = css("--muted"), dim = css("--dim");
  let grid = "";
  for (let i = 0; i <= 4; i++) {
    const v = y0 + (y1 - y0) * i / 4;
    grid += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${line}"/><text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="${dim}">${v >= 0 ? "+" : ""}${v.toFixed(1)}%</text>`;
    const t = x0 + (x1 - x0) * i / 4;
    if (W < 600 && i % 2) continue;
    grid += `<text x="${X(t)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="${dim}">${new Date(t).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</text>`;
  }
  grid += `<line x1="${L}" x2="${W - R}" y1="${Y(0)}" y2="${Y(0)}" stroke="${muted}" stroke-dasharray="3 4"/>`;
  const labels = [];
  const paths = series.map((s) => {
    const col = css(SERIES_COLOR[s.id] || "--muted");
    const p = s.points.map(([t, v]) => [Date.parse(t), v]).sort((a, b) => a[0] - b[0]);
    if (!p.length) return "";
    const d = p.map((q, i) => `${i ? "L" : "M"}${X(q[0]).toFixed(1)},${Y(q[1]).toFixed(1)}`).join("");
    const last = p[p.length - 1];
    labels.push({ y: Y(last[1]), x: X(last[0]), v: last[1], col, id: s.id });
    return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${s.id === "ai" ? 2.6 : 1.6}" ${s.id === "ai" ? 'filter="url(#glow)"' : ""} stroke-linejoin="round"/>`;
  }).join("");
  labels.sort((a, b) => a.y - b.y);
  const ly = labels.map((l) => l.y);
  for (let i = 1; i < ly.length; i++) if (ly[i] - ly[i - 1] < 26) ly[i] = ly[i - 1] + 26;
  const tags = labels.map((l, i) => `<circle cx="${l.x}" cy="${l.y}" r="4" fill="${l.col}"/>
    <line x1="${l.x}" y1="${l.y}" x2="${W - R + 8}" y2="${ly[i]}" stroke="${l.col}" stroke-opacity=".4"/>
    <rect x="${W - R + 8}" y="${ly[i] - 11}" width="${R - 12}" height="22" fill="${l.col}" fill-opacity=".12" stroke="${l.col}"/>
    <text x="${W - R + 14}" y="${ly[i] + 4}" font-size="11" font-weight="700" fill="${l.col}">${l.v >= 0 ? "+" : ""}${l.v.toFixed(2)}% ${SERIES_TAG[l.id] || ""}</text>`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" style="height:${H}px" role="img" aria-label="Return race: AI fund vs baselines">
    <defs><filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    ${grid}${paths}${tags}</svg>`;
}

function stat(label, value, note = "") {
  return `<div class="stat"><div class="label">${esc(label)}</div><div class="v">${value}</div>${note ? `<div class="n">${esc(note)}</div>` : ""}</div>`;
}

async function loadArena() {
  loadPrices();
  let a;
  try { a = await api("/api/arena"); } catch (e) { $("race-chart").innerHTML = empty("Arena unavailable: " + e.message); return; }
  const o = a.overview, st = o.state, em = o.equity_metrics, tm = o.trade_metrics, eq = tm.evidence_quality;
  const small = eq.level === "insufficient" || eq.level === "none";
  const pnl = st.equity_gbp - o.fund.starting_capital;
  $("acct-value").innerHTML = `<span class="${pnl > 0 ? "pos" : pnl < 0 ? "neg" : ""}">${gbp(st.equity_gbp)}</span>`;
  $("acct-sub").innerHTML = `${signedGbp(pnl)} ${pct(em.total_return_pct)} <span class="muted">all-time · today ${pct(em.today_return_pct)} · realised ${gbp(st.realized_gbp)} · unrealised ${gbp(st.unrealized_gbp)}</span>`;
  LAST_SERIES = a.series;
  $("race-chart").innerHTML = raceChart(a.series);
  loadTrend();
  $("race-legend").innerHTML = a.series.map((s) => `<span><i style="background:${css(SERIES_COLOR[s.id])}"></i>${esc(s.name)} <span class="muted">(${esc(s.unit)})</span></span>`).join("") +
    (o.benchmarks.period_start ? `<span class="muted">from ${when(o.benchmarks.period_start)} — fixed start, no date picking</span>` : "");
  const n = small ? (eq.level === "none" ? "no trades yet" : `n=${tm.number_of_trades} · not significant`) : "";
  $("stats").innerHTML = [
    stat("TRADES", tm.number_of_trades),
    stat("WIN RATE", tm.win_rate_pct == null ? NA : `${num(tm.win_rate_pct, 0)}%`, n),
    stat("PROFIT FACTOR", tm.profit_factor == null ? NA : num(tm.profit_factor), tm.profit_factor_note || n),
    stat("EXPECTANCY", tm.expectancy_r == null ? NA : `${num(tm.expectancy_r)}R`, n),
    stat("AVG WIN / LOSS", `${tm.average_winner_gbp == null ? "—" : gbp(tm.average_winner_gbp, 0)} / ${tm.average_loser_gbp == null ? "—" : gbp(tm.average_loser_gbp, 0)}`),
    stat("MAX DRAWDOWN", `${num(em.max_drawdown_pct)}%`),
    stat("SHARPE", em.sharpe == null ? NA : num(em.sharpe), em.sharpe == null ? "insufficient sample" : ""),
    stat("EXPOSURE", gbp(st.exposure_gbp, 0), `${st.open_positions}/${o.risk_config.max_open_positions} positions`),
  ].join("") + (o.warnings || []).map((w) => `<div class="stat" style="grid-column:1/-1"><div class="n">⚠ ${esc(w)}</div></div>`).join("");

  const trades = await api("/api/trades");
  renderPositions(trades.filter((t) => t.status === "OPEN"), o.fx ? o.fx.usd_per_gbp : null);
  const closed = trades.filter((t) => t.status === "CLOSED");
  $("sub-completed").innerHTML = closed.length ? `<div class="scroll"><table><tr><th>CLOSED</th><th>ASSET</th><th>SIDE</th><th>ENTRY → EXIT</th><th>EXIT</th><th>NET P/L</th><th>THESIS</th></tr>
    ${closed.map((t) => `<tr class="click" onclick="location.hash='trade/${t.id}'"><td>${when(t.exit_time)}</td><td><b>${esc(t.asset)}</b></td><td>${badge(t.direction)}</td>
    <td>${usd(t.entry_price_usd)} → ${usd(t.exit_price_usd)}</td><td>${badge(t.exit_reason)}</td><td>${signedGbp(t.net_pnl_gbp)}</td><td>${t.thesis_correct ? badge(t.thesis_correct) : NA}</td></tr>`).join("")}</table></div>`
    : empty("No completed trades yet.");
  $("sub-leaderboard").innerHTML = `<table><tr><th>#</th><th>STRATEGY</th><th>RETURN</th><th>VALUE</th><th>TRADES</th><th>NOTE</th></tr>
    ${a.leaderboard.map((r, i) => `<tr><td class="rank ${i === 0 && r.return_pct != null ? "r1" : ""}">${r.return_pct == null ? "—" : i + 1}</td>
    <td><span class="swatch" style="background:${css(SERIES_COLOR[r.id])}"></span><b>${esc(r.name)}</b></td><td>${pct(r.return_pct)}</td>
    <td>${gbp(r.value_gbp)}</td><td>${r.trades ?? "—"}</td><td class="muted small">${esc(r.note || "")}</td></tr>`).join("")}</table>
    <div class="muted small" style="margin-top:8px">Same automatically fixed observation period. A ranking over days or a handful of trades is not evidence of skill.</div>`;

  const events = await api("/api/feed?limit=80");
  renderAgents(events);
  renderChat(events);
  renderTerminal(events);
}

function renderPositions(open, fx) {
  if (!open.length) { $("sub-positions").innerHTML = empty("No open positions — the system is comfortable doing nothing until evidence qualifies."); return; }
  const px = Object.fromEntries((PRICES?.assets || []).filter((a) => a.available).map((a) => [a.asset, a.price_usd]));
  $("sub-positions").innerHTML = `<div class="positions">${open.map((t) => {
    const p = px[t.asset], sign = t.direction === "LONG" ? 1 : -1;
    // Bar: left edge = stop, right edge = target, whatever the direction.
    const bar = (v) => Math.min(100, Math.max(0, (v - t.stop_price_usd) / (t.target_price_usd - t.stop_price_usd) * 100));
    const upnl = p != null && fx ? t.units * (p - t.entry_price_usd) * sign / fx : null;
    return `<div class="pos-card" onclick="location.hash='trade/${t.id}'">
      <div class="pos-row"><span><span class="pos-asset">${esc(t.asset)}</span> ${badge(t.direction)}</span><span class="pnl">${upnl == null ? '<span class="muted small">price unavailable</span>' : signedGbp(upnl)}</span></div>
      <div class="pos-row muted small"><span>entry ${usd(t.entry_price_usd)}</span><span>mark ${p == null ? "—" : usd(p)}</span></div>
      <div class="range"><div class="entry" style="left:${bar(t.entry_price_usd)}%"></div>${p == null ? "" : `<div class="now" style="left:${bar(p)}%"></div>`}</div>
      <div class="range-labels"><span class="neg">STOP ${usd(t.stop_price_usd)}</span><span class="pos">TARGET ${usd(t.target_price_usd)}</span></div>
      <div class="pos-row muted small" style="margin-top:6px"><span>risk ${gbp(t.risk_gbp)} · ${gbp(t.notional_gbp, 0)} notional</span><span>expires ${when(t.expires_at)}</span></div>
    </div>`;
  }).join("")}</div>`;
}

document.querySelectorAll("#subtabs button").forEach((b) => b.onclick = () => {
  document.querySelectorAll("#subtabs button").forEach((x) => x.classList.toggle("on", x === b));
  document.querySelectorAll(".sub-view").forEach((v) => v.classList.toggle("on", v.id === `sub-${b.dataset.sub}`));
});

// ---- agents / chat / terminal --------------------------------------------------
const AGENT = {
  INVESTIGATION: ["SC", "SCOUT", "a-scout"], CHALLENGE: ["DA", "DEVIL'S ADVOCATE", "a-da"],
  PAPER_TRADE: ["RE", "RISK ENGINE", "a-risk"], NO_TRADE: ["RE", "RISK ENGINE", "a-risk"],
  TRADE_CLOSED: ["PF", "PORTFOLIO", "a-trade"], LESSON: ["LN", "LEARNING", "a-learn"], FOLLOWUP: ["LN", "LEARNING", "a-learn"],
  MONITOR_RUN: ["MN", "MONITOR", "a-sys"], DATA_UNAVAILABLE: ["MN", "DATA", "a-sys"], BENCHMARK_START: ["MN", "BENCHMARK", "a-sys"],
};
function chatText(e) {
  const p = e.payload_json || {};
  switch (e.type) {
    case "INVESTIGATION": return `<b>${esc(e.title)}</b><br>${esc(p.summary)}<br><span class="muted">Thesis:</span> ${esc(p.thesis)} <span class="muted">· confidence ${esc(p.research_confidence)}/5 (not a probability)</span>`;
    case "CHALLENGE": return `${badge(p.verdict)} ${esc(p.summary)}`;
    case "PAPER_TRADE": return `<b>OPENED ${esc(e.asset)} ${esc(p.direction)}</b> @ ${usd(p.entry)} · stop ${usd(p.stop)} · target ${usd(p.target)} · risk ${gbp(p.risk_gbp)}`;
    case "NO_TRADE": return `<b>NO TRADE</b> — ${esc(p.reason)}`;
    case "TRADE_CLOSED": return `<b>${esc(e.title)}</b><br>thesis: ${esc(p.thesis_correct)} · exit ${usd(p.exit_price)}`;
    case "LESSON": return esc(p.lesson);
    case "FOLLOWUP": return esc(p.timing_assessment);
    case "DATA_UNAVAILABLE": return `<span class="neg">${esc(e.title)}</span>`;
    case "BENCHMARK_START": return `Race start recorded: BTC ${usd(p.price_usd)}`;
    default: return esc(e.title);
  }
}
const link = (e) => e.ref_type === "trade" ? `#trade/${e.ref_id}` : e.ref_type === "investigation" ? `#investigation/${e.ref_id}` : null;
function renderChat(events) {
  // Quiet monitor scans are kept for the system log; the chat shows agent activity.
  const msgs = events.filter((e) => e.type !== "MONITOR_RUN" || Object.keys((e.payload_json || {}).triggers || {}).length);
  $("chat").innerHTML = msgs.length ? msgs.map((e) => {
    const [ab, name, cls] = AGENT[e.type] || ["··", e.type, "a-sys"];
    const l = link(e);
    return `<div class="msg"><div class="avatar ${cls}">${ab}</div><div><div class="who">${name}<span class="when">${hhmm(e.created_at)} · ${ago(e.created_at)}</span></div>
      <div class="text">${chatText(e)}${l ? ` <a href="${l}">open →</a>` : ""}</div></div></div>`;
  }).join("") : empty("Quiet. No agent activity yet — run an investigation or wait for the monitor.");
}
function renderAgents(events) {
  const last = (types) => events.find((e) => types.includes(e.type));
  const card = (color, name, e, fallback) => `<div class="agent"><div class="name" style="color:var(${color})">● ${name}</div>
    <div class="what" title="${esc(e ? e.title : fallback)}">${e ? `${ago(e.created_at)} · ${esc(e.title)}` : esc(fallback)}</div></div>`;
  $("agents").innerHTML = card("--cyan", "SCOUT", last(["INVESTIGATION"]), "idle — no investigations yet")
    + card("--violet", "DEVIL'S ADVOCATE", last(["CHALLENGE"]), "idle — nothing to challenge")
    + card("--amber", "RISK ENGINE", last(["PAPER_TRADE", "NO_TRADE"]), "idle")
    + card("--green", "LEARNING", last(["LESSON", "FOLLOWUP"]), "no closed trades yet");
}
function renderTerminal(events) {
  const lines = [...events].reverse().map((e) => {
    const p = e.payload_json || {};
    const extra = e.type === "MONITOR_RUN" && (p.errors || []).length ? ` <span class="neg">errors: ${esc(p.errors.join("; ").slice(0, 160))}</span>` : "";
    return `<div class="term-line"><span class="t">[${when(e.created_at)}]</span> <span class="k">${esc(e.type.padEnd(16))}</span> ${esc(e.title)}${extra}</div>`;
  });
  $("terminal").innerHTML = lines.length ? lines.join("") : `<div class="term-line"><span class="k">$</span> waiting for first event…</div>`;
  $("terminal").scrollTop = $("terminal").scrollHeight;
  $("term-meta").textContent = `${events.length} most recent events`;
}

// ---- research / investigation detail -------------------------------------------
async function loadResearch() {
  const list = await api("/api/investigations?limit=50");
  $("investigation-list").innerHTML = list.length ? `<div class="scroll"><table><tr><th>TIME</th><th>ASSET</th><th>TRIGGER</th><th>SCOUT</th><th>DECISION</th><th>REASON</th></tr>
    ${list.map((i) => `<tr class="click" onclick="location.hash='investigation/${i.id}'"><td>${when(i.created_at)}</td><td><b>${esc(i.asset)}</b></td><td>${esc(i.trigger)}</td>
    <td>${i.proposed_action ? badge(i.proposed_action) : badge(i.status)}</td><td>${badge(i.final_decision || "—")}</td><td class="muted small">${esc((i.final_reason || "").slice(0, 140))}</td></tr>`).join("")}</table></div>`
    : empty("No investigations yet. Use RUN on the Arena.");
}

function conditions(list) {
  if (!list || !list.length) return '<span class="muted">None stated</span>';
  return `<ul class="tight">${list.map((c) => `<li>${esc(c.description)} <span class="mono">[${esc(c.metric)} ${esc(c.operator)} ${fval(c.threshold)}]</span></li>`).join("")}</ul>`;
}

function memoryBlock(mem, dir) {
  const m = mem && mem[dir];
  if (!m) return "";
  return `<h3>EXPERIENCE MEMORY · ${esc(dir)}</h3><p>${esc(m.summary.note)}</p>${m.matches.length ? `<table><tr><th>PAST TRADE</th><th>DISTANCE</th><th>R</th><th>OUTCOME</th><th>LESSON</th></tr>
    ${m.matches.map((x) => `<tr class="click" onclick="location.hash='trade/${x.trade_id}'"><td>${esc(x.asset)} ${when(x.entry_time)}</td><td>${num(x.similarity_distance)}</td><td>${num(x.r_multiple)}</td>
    <td>${badge(x.exit_reason)} ${esc(x.failure_category || "win")}</td><td class="muted small">${esc((x.lesson || "").slice(0, 120))}</td></tr>`).join("")}</table>` : ""}`;
}

function renderInvestigation(inv) {
  if (inv.status === "data_unavailable") {
    return `<div class="card"><div class="step bad"><div class="step-title"><span class="who">${esc(inv.asset)} · ${when(inv.created_at)}</span>${badge("NO_TRADE")}</div>
      <p>${esc(inv.final_reason)}</p><p class="muted">No analysis was performed because real market data could not be obtained. Nothing was simulated.</p></div></div>`;
  }
  const sc = inv.scout_output_json || {}, ch = inv.challenge || {}, da = ch.devils_advocate_output_json || {};
  const rk = inv.risk || {}, pos = rk.position_json, obs = inv.observation || {}, reg = sc.market_regime || {};
  const mem = inv.memory_json || {}, ce = mem.cost_estimation || {};
  const ev = (inv.evidence_json || []).map((e) => `<tr><td class="mono">${esc(e.key)}</td><td>${esc(fval(e.value))}</td><td class="muted small">${esc(e.description)}</td></tr>`).join("");
  const daClass = da.verdict === "APPROVE" ? "ok" : da.verdict === "VETO" ? "bad" : "warn";
  const findings = (da.findings || []).map((f) => `<li>${badge(f.severity)} <b>${esc(f.check)}</b> <span class="muted">(${esc(f.category.replaceAll("_", " "))})</span>: ${esc(f.claim)}${f.evidence_keys.length ? ` <span class="mono">[${esc(f.evidence_keys.join(", "))}]</span>` : ""}</li>`).join("");
  const noProposal = inv.proposed_action === "NO_TRADE";
  return `<div class="card"><div class="panel-head"><h2>${esc(inv.asset)} INVESTIGATION · ${when(inv.created_at)}</h2>${badge(inv.final_decision)}</div>
  <div class="chain">
    <div class="step"><div class="step-title"><span class="who">01 · OBSERVATION — what was known at time T</span><span class="mono">${esc(obs.data_source)} · last closed 1h candle ${when(obs.last_closed_candle_at)}</span></div>
      <dl class="kv"><dt>Spot</dt><dd>${usd(obs.price_usd)} <span class="muted">(${when(obs.price_timestamp)})</span></dd>
      <dt>GBP/USD</dt><dd>${obs.fx_usd_per_gbp ? num(obs.fx_usd_per_gbp, 4) + ` <span class="muted">${esc(obs.fx_source)}</span>` : "Data unavailable"}</dd>
      <dt>Regime</dt><dd>${esc(reg.label)} <span class="muted">(BTC ${esc(reg.btc_trend)}, ${esc(reg.breadth_up_24h)}/${esc(reg.assets_observed)} up 24h)</span></dd>
      <dt>News</dt><dd>${esc((sc.news_status || {}).reason || "—")}</dd></dl>
      <details style="margin-top:8px"><summary>Evidence (deterministic features)</summary><div class="scroll"><table>${ev}</table></div></details></div>
    <div class="step"><div class="step-title"><span class="who" style="color:var(--cyan)">02 · SCOUT</span><span>${badge(inv.proposed_action)} <span class="mono">${esc(inv.scout_engine)}</span></span></div>
      <h3>WHAT IS HAPPENING</h3><p>${esc(sc.what_is_happening)}</p>
      <h3>WHY MIGHT IT BE HAPPENING</h3><ul class="tight">${(sc.possible_explanations || []).map((e) => `<li><b>${esc(e.category.replaceAll("_", " "))}</b> <span class="muted">(${esc(e.plausibility)})</span>: ${esc(e.explanation)}</li>`).join("")}</ul>
      <h3>THESIS</h3><p>${esc(sc.thesis)}</p>
      <div class="grid2"><div><h3>WOULD CONFIRM</h3>${conditions(sc.confirmation_conditions)}</div><div><h3>WOULD INVALIDATE</h3>${conditions(sc.invalidation_conditions)}</div></div>
      <dl class="kv"><dt>Horizon</dt><dd>${esc(sc.horizon_hours)}h</dd><dt>Research Confidence</dt><dd>${esc(sc.research_confidence)}/5 <span class="muted">ordinal evidence agreement — not a probability</span></dd>
      <dt>Rationale</dt><dd>${esc(sc.rationale)}</dd></dl>
      ${(sc.rejected_alternatives || []).length ? `<h3>ALTERNATIVES REJECTED</h3><ul class="tight">${sc.rejected_alternatives.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
      ${memoryBlock(mem, noProposal ? "LONG" : inv.proposed_action)}
      ${(sc.validation_notes || []).length ? `<div class="callout warn">Validation: ${esc(sc.validation_notes.join(" · "))}</div>` : ""}</div>
    <div class="step ${da.verdict === "NOT_REQUIRED" ? "" : daClass}"><div class="step-title"><span class="who" style="color:var(--violet)">03 · DEVIL'S ADVOCATE</span><span>${badge(da.verdict || ch.decision)} <span class="mono">${esc(da.engine)}</span></span></div>
      <p>${esc(da.summary)}</p>${findings ? `<ul class="tight">${findings}</ul>` : ""}
      ${(da.alternative_explanations || []).length ? `<h3>ALTERNATIVE EXPLANATIONS</h3><ul class="tight">${da.alternative_explanations.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      ${da.what_would_change_verdict ? `<p class="muted">What would change the verdict: ${esc(da.what_would_change_verdict)}</p>` : ""}
      ${(da.validation_notes || []).length ? `<div class="callout warn">${esc(da.validation_notes.join(" · "))}</div>` : ""}</div>
    <div class="step ${rk.approved ? "ok" : noProposal ? "" : "bad"}"><div class="step-title"><span class="who" style="color:var(--amber)">04 · RISK ENGINE (deterministic)</span>${badge(rk.approved ? "APPROVE" : noProposal ? "NO_PROPOSAL" : "VETO")}</div>
      <table>${(rk.checks_json || []).map((c) => `<tr><td>${c.passed ? '<span class="pos">✓</span>' : '<span class="neg">✗</span>'}</td><td class="mono">${esc(c.name)}</td><td class="muted small">${esc(c.detail)}</td></tr>`).join("")}</table>
      ${pos ? `<dl class="kv" style="margin-top:10px"><dt>Entry</dt><dd>${usd(pos.entry_price_usd)}</dd><dt>Stop</dt><dd>${usd(pos.stop_price_usd)} (${pos.stop_atr_multiple} ATR)</dd>
        <dt>Target</dt><dd>${usd(pos.target_price_usd)} (${pos.target_atr_multiple} ATR)</dd><dt>Size</dt><dd>${num(pos.units, 6)} units · ${gbp(pos.notional_gbp)}${pos.capped_by_exposure ? " (capped by exposure)" : ""}</dd>
        <dt>Planned risk</dt><dd>${gbp(pos.risk_gbp)} (${num(pos.risk_pct_of_equity)}% of equity, incl. est. costs)</dd><dt>Net R:R</dt><dd>${num(pos.net_reward_risk)} (gross ${num(pos.gross_reward_risk)})</dd></dl>` : ""}
      ${ce.costs ? `<h3>EXECUTION COST ESTIMATE</h3><dl class="kv"><dt>Fee</dt><dd>${esc(ce.costs.fee_bps_per_side)} bps/side</dd><dt>Slippage</dt><dd>${num(ce.costs.slippage_bps_per_side)} bps/side <span class="muted">${esc(ce.costs.slippage_source)}</span></dd>
        <dt>Funding</dt><dd>${num(ce.costs.funding_bps_per_day)} bps/day <span class="muted">${esc(ce.costs.funding_source)}</span></dd>
        ${ce.order_book_error ? `<dt>Order book</dt><dd class="muted">${esc(ce.order_book_error.slice(0, 160))}</dd>` : ""}</dl>` : ""}</div>
    <div class="step ${inv.final_decision === "TRADE" ? "ok" : ""}"><div class="step-title"><span class="who">05 · DECISION</span>${badge(inv.final_decision)}</div>
      <p>${esc(inv.final_reason)}</p>${inv.trade ? `<a href="#trade/${inv.trade.id}">view paper trade →</a>` : ""}</div>
  </div></div>`;
}

async function loadInvestigationDetail(id) {
  try {
    const inv = await api(`/api/investigations/${id}`);
    $("investigation-detail").innerHTML = `<a class="back" href="#research">← INVESTIGATIONS</a>` + renderInvestigation(inv);
  } catch (e) { $("investigation-detail").innerHTML = empty(e.message); }
}

// ---- trade detail --------------------------------------------------------------
function chartSvg(c) {
  const pts = [...(c.before_1h || []).slice(-24).map((x) => [Date.parse(x.open_time) + 3600e3, x.close]),
               ...(c.after_5m || []).map((x) => [Date.parse(x.open_time) + 300e3, x.close])].sort((a, b) => a[0] - b[0]);
  if (pts.length < 2) return empty(c.live_error || "Price path not yet available (no closed candles since entry).");
  const levels = [c.entry, c.stop, c.target, c.exit].filter((v) => v != null);
  const ys = pts.map((p) => p[1]).concat(levels);
  const x0 = pts[0][0], x1 = Math.max(pts[pts.length - 1][0], c.exit_time ? Date.parse(c.exit_time) : 0);
  const y0 = Math.min(...ys), y1 = Math.max(...ys), W = 900, H = 300, P = 40, R = 80;
  const X = (t) => P + (t - x0) / (x1 - x0 || 1) * (W - P - R), Y = (v) => H - P / 2 - (v - y0) / (y1 - y0 || 1) * (H - P);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join("");
  const hline = (v, col, dash) => `<line x1="${P}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${col}" stroke-dasharray="${dash}" stroke-width="1.3"/>
    <text x="${W - R + 4}" y="${Y(v) + 4}" font-size="10" fill="${col}">${Number(v.toPrecision(6))}</text>`;
  const et = Date.parse(c.entry_time);
  const pos = css("--green"), neg = css("--red"), acc = css("--cyan"), mut = css("--muted"), txt = css("--text");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Price chart with entry, stop, target and exit">
    <path d="${path}" fill="none" stroke="${txt}" stroke-width="1.4"/>
    ${hline(c.entry, acc, "4 3")}${hline(c.stop, neg, "6 3")}${hline(c.target, pos, "6 3")}
    <line x1="${X(et)}" x2="${X(et)}" y1="10" y2="${H - 10}" stroke="${mut}" stroke-dasharray="2 3"/>
    <text x="${X(et) + 4}" y="${H - 14}" font-size="10" fill="${mut}">entry ${new Date(et).toLocaleString("en-GB", { timeStyle: "short", dateStyle: "short" })}</text>
    ${c.exit != null ? `<circle cx="${X(Date.parse(c.exit_time))}" cy="${Y(c.exit)}" r="5" fill="${acc}"/>` : ""}
  </svg><div class="legend"><span><i style="background:${txt}"></i>Close (24h before entry at 1h, then 5m)</span><span><i style="background:${acc}"></i>Entry</span>
  <span><i style="background:${neg}"></i>Stop</span><span><i style="background:${pos}"></i>Target</span>${c.exit != null ? "<span>● Exit</span>" : ""}</div>`;
}

async function loadTrade(id) {
  const el = $("trade-detail");
  el.innerHTML = empty("Loading…");
  let t;
  try { t = await api(`/api/trades/${id}`); } catch (e) { el.innerHTML = empty(e.message); return; }
  const o = t.outcome, inv = t.investigation || {}, da = (inv.challenge || {}).devils_advocate_output_json || {};
  const l = t.lessons[0], d = (o && o.evaluation_json) || {}, costs = t.costs_json || {};
  el.innerHTML = `<a class="back" href="#arena">← ARENA</a>
  <div class="card"><div class="panel-head"><h2>${esc(t.asset)} ${badge(t.direction)} · ${when(t.entry_time)}</h2>
    <span>${badge(t.status)} ${t.status === "OPEN" ? '<button class="ghost" id="close-btn">CLOSE AT MARKET</button>' : ""}</span></div>
    <h3>WHY DID WE ENTER?</h3><p>${esc(t.thesis)}</p><p class="muted">${esc(t.entry_reason)}</p>
    <dl class="kv"><dt>Research Confidence</dt><dd>${esc(t.research_confidence)}/5 (not a probability)</dd>
    <dt>Agents</dt><dd>${(t.agents_json || []).map((a) => `${esc(a.agent)} <span class="muted">(${esc(a.engine)})</span>`).join(" · ")}</dd>
    <dt>Rejected</dt><dd>${esc((t.rejected_alternatives_json || []).join(" · "))}</dd></dl>
    <h3>WHAT DID WE KNOW AT THE TIME?</h3><p>${esc(inv.situation_summary)}</p>
    <div class="scroll"><table>${(t.evidence_json || []).map((e) => `<tr><td class="mono">${esc(e.key)}</td><td>${esc(fval(e.value))}</td><td class="muted small">${esc(e.description)}</td></tr>`).join("")}</table></div>
    <p class="muted small">Observation ${when((inv.observation || {}).observed_at)} from ${esc((inv.observation || {}).data_source)}; last closed candle ${when((inv.observation || {}).last_closed_candle_at)}.</p>
    ${memoryBlock(inv.memory_json, t.direction)}
    <h3>WHAT DID THE DEVIL'S ADVOCATE SAY?</h3><p>${badge(t.devils_advocate_verdict)} ${esc(da.summary || t.devils_advocate_summary)}</p>
    <ul class="tight">${(da.findings || []).map((f) => `<li>${badge(f.severity)} ${esc(f.claim)}</li>`).join("")}</ul>
    <h3>WHAT DID THE RISK ENGINE ALLOW?</h3>
    <dl class="kv"><dt>Entry</dt><dd>${usd(t.entry_price_usd)} <span class="muted">GBP/USD ${num(t.fx_entry_usd_per_gbp, 4)}</span></dd><dt>Stop</dt><dd>${usd(t.stop_price_usd)}</dd><dt>Target</dt><dd>${usd(t.target_price_usd)}</dd>
    <dt>Position</dt><dd>${num(t.units, 6)} units · ${gbp(t.notional_gbp)}</dd><dt>Planned risk</dt><dd>${gbp(t.risk_gbp)} · reward ${gbp(t.planned_reward_gbp)} · net R:R ${num(t.reward_risk)}</dd>
    <dt>Costs</dt><dd>${costs.fee_bps_per_side ?? "—"} bps fee · ${num(costs.slippage_bps_per_side) ?? "—"} bps slippage <span class="muted">(${esc(costs.slippage_source || "flat")})</span>${t.direction === "SHORT" ? ` · funding ${num(costs.funding_bps_per_day)} bps/day <span class="muted">(${esc(costs.funding_source)})</span>` : ""}</dd>
    <dt>Horizon</dt><dd>${esc(t.horizon_hours)}h (expires ${when(t.expires_at)})</dd></dl>
    <h3>WHAT HAPPENED?</h3><div id="trade-chart">${empty("Loading chart…")}</div>
    ${o ? `<dl class="kv" style="margin-top:10px"><dt>Exit</dt><dd>${usd(o.exit_price_usd)} · ${badge(o.exit_reason)} · ${when(o.exit_time)}</dd>
      <dt>Gross P/L</dt><dd>${signedGbp(o.gross_pnl_gbp)}</dd><dt>Est. fees</dt><dd>${gbp(o.fees_gbp)}</dd><dt>Est. slippage</dt><dd>${gbp(o.estimated_slippage_gbp)}</dd>
      ${o.funding_gbp ? `<dt>Est. funding</dt><dd>${gbp(o.funding_gbp)}</dd>` : ""}
      <dt>Net P/L</dt><dd>${signedGbp(o.net_pnl_gbp)} (${num(o.r_multiple)}R)</dd><dt>MFE / MAE</dt><dd>${pct(o.mfe_pct)} / ${pct(o.mae_pct)}</dd>
      <dt>Thesis correct</dt><dd>${badge(o.thesis_correct || "—")}</dd><dt>Reason matched</dt><dd>${esc(o.reason_matched_thesis)}</dd></dl>`
      : `<p class="muted">Position open. Last checked ${when(t.last_checked_at)}; best ${usd(t.max_favourable_price_usd)}, worst ${usd(t.max_adverse_price_usd)}.</p>`}
    <h3>WHAT DID WE LEARN?</h3>
    ${l ? `<dl class="kv"><dt>Direction correct</dt><dd>${l.prediction_correct ? "Yes" : "No"}</dd><dt>Timing</dt><dd>${esc(l.timing_assessment)}</dd>
      <dt>Risk management</dt><dd>${esc(l.risk_assessment)}</dd><dt>Failure category</dt><dd>${esc(l.failure_category || "n/a (win)")}</dd>
      <dt>DA anticipated</dt><dd>${l.devils_advocate_anticipated ? "Yes — " + esc((d.anticipated_findings || []).map((f) => f.check).join(", ")) : "No"}</dd>
      <dt>Observed</dt><dd>${esc(l.observed_error)}</dd><dt>Possible cause</dt><dd>${esc(l.possible_cause)}</dd>
      <dt>Lesson</dt><dd><b>${esc(l.lesson)}</b></dd><dt>Status</dt><dd>${badge(l.validation_status)} confidence ${esc(l.confidence)} · ${esc((l.review_json || {}).similar_observations)} of ${esc((l.review_json || {}).needed_for_review)} similar observations</dd></dl>
      ${(l.review_json || {}).llm_narrative ? `<div class="callout info">${esc(l.review_json.llm_narrative.narrative)}</div>` : ""}`
      : empty(o ? "Review pending." : "Post-trade review is generated when the position closes.")}
  </div>`;
  if ($("close-btn")) $("close-btn").onclick = async () => {
    $("close-btn").disabled = true;
    try { await api(`/api/trades/${id}/close`, { method: "POST" }); loadTrade(id); } catch (e) { alert(e.message); $("close-btn").disabled = false; }
  };
  try { $("trade-chart").innerHTML = chartSvg(await api(`/api/trades/${id}/chart`)); }
  catch (e) { $("trade-chart").innerHTML = empty("Data unavailable: " + e.message); }
}

// ---- lessons -------------------------------------------------------------------
async function loadLessons() {
  const [sum, ls] = await Promise.all([api("/api/lessons/summary"), api("/api/lessons")]);
  $("lesson-policy").textContent = sum.policy;
  $("lesson-summary").innerHTML = sum.groups.length ? `<table><tr><th>HYPOTHESIS</th><th>OUTCOME</th><th>OBSERVATIONS</th><th>DA ANTICIPATED</th><th>STATUS</th></tr>
    ${sum.groups.map((g) => `<tr><td class="mono">${esc(g.hypothesis_tag)}</td><td>${esc(g.outcome_category)}</td><td>${g.n} / ${g.needed}</td><td>${g.da_anticipated || 0}</td><td>${badge(g.status)}</td></tr>`).join("")}</table>`
    : empty("No lessons yet — lessons are created only from closed paper trades.");
  $("lessons").innerHTML = ls.length ? ls.map((l) => `<div class="msg"><div class="avatar a-learn">LN</div><div>
    <div class="who">${badge(l.validation_status)} <a href="#trade/${l.trade_id}">${esc(l.asset)} ${esc(l.direction)}</a> · ${esc(l.failure_category || "win")}<span class="when">${when(l.created_at)}</span></div>
    <div class="text">${esc(l.observed_error)}<br><b>${esc(l.lesson)}</b><br><span class="muted">${esc(l.timing_assessment)}</span></div></div></div>`).join("") : "";
}

// ---- system --------------------------------------------------------------------
async function loadSystem() {
  await loadStatus();
  const s = STATUS;
  if (s) {
    $("providers").innerHTML = `<table><tr><th>SOURCE</th><th>STATUS</th><th>LAST SUCCESS</th><th>LAST ERROR</th></tr>
      ${s.providers.map((p) => `<tr><td>${esc(p.name)}</td><td>${p.ok ? '<span class="pos">● ok</span>' : p.ok === false ? '<span class="neg">● unavailable</span>' : '<span class="muted">○ not yet used</span>'}</td>
      <td>${when(p.last_success)}</td><td class="muted small">${esc((p.last_error || "").slice(0, 200))}</td></tr>`).join("")}</table>
      <p class="muted small">Active universe: ${esc(Object.keys(s.universe.active).join(", ") || "none")}. ${Object.keys(s.universe.removed).length ? "Removed: " + esc(Object.entries(s.universe.removed).map(([a, r]) => `${a} (${r})`).join(", ")) : ""}</p>
      <p class="muted small">News: ${esc(s.news.reason)}<br>Social: ${esc(s.social.reason)}</p>`;
    $("monitor-meta").innerHTML = `<dl class="kv"><dt>Scheduler</dt><dd>${s.monitor.enabled ? '<span class="pos">running</span>' : "disabled"}</dd><dt>Interval</dt><dd>${s.monitor.interval_minutes} min</dd>
      <dt>Next run</dt><dd>${when(s.monitor.next_run)}</dd><dt>Agents</dt><dd>${esc(s.llm.engine)}${s.llm.note ? `<br><span class="muted small">${esc(s.llm.note)}</span>` : ""}</dd></dl>`;
  }
  const [runs, ov] = await Promise.all([api("/api/monitor/runs"), api("/api/overview")]);
  const rc = ov.risk_config;
  $("risk-config").innerHTML = `<dl class="kv">
    <dt>Max risk per trade</dt><dd>${rc.max_risk_per_trade_pct}% of equity (${gbp(ov.state.equity_gbp * rc.max_risk_per_trade_pct / 100)}), incl. est. costs</dd>
    <dt>Max open positions</dt><dd>${rc.max_open_positions}</dd><dt>Max exposure</dt><dd>${rc.max_portfolio_exposure_pct}%</dd>
    <dt>Min reward/risk</dt><dd>${rc.min_reward_risk} : 1 net of costs (experiment parameter, not optimal)</dd>
    <dt>Daily loss limit</dt><dd>${rc.daily_loss_limit_pct}% → no new trades</dd>
    <dt>Costs</dt><dd>${rc.fee_bps_per_side} bps fee/side · slippage from live order book (fallback ${rc.slippage_bps_per_side} bps) · short funding from perp rate</dd>
    <dt>Shorts</dt><dd>${rc.allow_short ? "allowed (paper)" : "disabled"}</dd></dl>`;
  $("monitor-runs").innerHTML = runs.length ? `<div class="scroll"><table><tr><th>STARTED</th><th>STATUS</th><th>TRIGGERS</th><th>INVESTIGATIONS</th><th>CLOSED</th><th>ERRORS</th></tr>
    ${runs.map((r) => `<tr><td>${when(r.started_at)}</td><td>${esc(r.status)}</td><td>${esc(Object.keys(r.triggers_json || {}).join(", ") || "none")}</td>
    <td>${(r.investigations_json || []).map((i) => `<a href="#investigation/${i.id}">${esc(i.asset)}: ${esc(i.decision)}</a>`).join(", ") || "none"}</td>
    <td>${(r.positions_closed_json || []).length}</td><td class="muted small">${esc((r.errors_json || []).join("; ").slice(0, 200))}</td></tr>`).join("")}</table></div>`
    : empty("No monitor runs yet.");
}
$("monitor-btn").addEventListener("click", async () => {
  $("monitor-btn").disabled = true;
  try { await api("/api/monitor/run", { method: "POST" }); } catch (e) { alert(e.message); }
  $("monitor-btn").disabled = false;
  loadSystem();
});

// ---- boot ----------------------------------------------------------------------
loadStatus().then(route);
setInterval(() => {
  const v = (location.hash.slice(1) || "arena").split("/")[0];
  if (v === "arena") loadArena();
  loadStatus();
}, 30000);

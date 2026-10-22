// Adaptive Quant dashboard. Every element rendered here comes from a backend endpoint; nothing is simulated.
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
const badge = (t) => `<span class="badge ${esc(t)}">${esc(String(t).replaceAll("_", " "))}</span>`;
const empty = (msg) => `<div class="empty">${esc(msg)}</div>`;
function fval(v) {
  if (v === null || v === undefined) return "Data unavailable";
  if (typeof v === "number") return Math.abs(v) >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 2 }) : Number(v.toPrecision(5)).toString();
  return v;
}

// ---- routing -------------------------------------------------------------------
const TABS = ["overview", "research", "feed", "trades", "lessons", "system"];
function route() {
  const h = location.hash.slice(1) || "overview";
  const [name, id] = h.split("/");
  const view = TABS.includes(name) ? name : name === "trade" ? "trade" : name === "investigation" ? "investigation" : "overview";
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
  document.querySelectorAll("#tabs a").forEach((a) => a.classList.toggle("active",
    a.dataset.tab === view || (view === "trade" && a.dataset.tab === "trades") || (view === "investigation" && a.dataset.tab === "research")));
  ({ overview: loadOverview, research: loadResearch, feed: loadFeed, trades: loadTrades, lessons: loadLessons,
     system: loadSystem, trade: () => loadTrade(id), investigation: () => loadInvestigationDetail(id) })[view]();
}
window.addEventListener("hashchange", route);

// ---- status chips --------------------------------------------------------------
async function loadStatus() {
  try {
    const s = await api("/api/status");
    const chips = s.providers.filter((p) => p.ok !== null || ["coinbase", "binance"].includes(p.name)).map((p) =>
      `<span class="chip ${p.ok ? "ok" : p.ok === false ? "bad" : "muted"}" title="${esc(p.last_error || "")}">${esc(p.name)}: ${p.ok ? "ok" : p.ok === false ? "unavailable" : "not yet used"}</span>`);
    chips.push(`<span class="chip ${s.llm.available ? "ok" : "warn"}" title="${esc(s.llm.note || "")}">Agents: ${esc(s.llm.engine)}</span>`);
    chips.push(`<span class="chip ${s.monitor.enabled ? "ok" : "muted"}">Monitor: ${s.monitor.enabled ? "every " + s.monitor.interval_minutes + " min" : "off"}</span>`);
    $("status-chips").innerHTML = chips.join("");
    return s;
  } catch (e) {
    $("status-chips").innerHTML = `<span class="chip bad">API unreachable: ${esc(e.message)}</span>`;
  }
}

// ---- overview ------------------------------------------------------------------
async function loadPrices() {
  try {
    const p = await api("/api/prices");
    const items = p.assets.map((a) => a.available
      ? `<div class="price"><div class="sym">${esc(a.asset)}</div><div class="px">${usd(a.price_usd)}</div><div class="hint">${esc(a.source)} · ${when(a.timestamp)}</div></div>`
      : `<div class="price"><div class="sym">${esc(a.asset)}</div><div class="px muted">Data unavailable</div><div class="hint" title="${esc(a.error)}">provider error</div></div>`);
    const removed = Object.entries(p.removed || {}).map(([a, r]) => `${a} (${r})`);
    $("prices").innerHTML = items.join("") || empty("Data unavailable — no market data provider is reachable.");
    $("prices-meta").innerHTML = (p.error ? `<span class="neg">${esc(p.error.slice(0, 160))}</span> ` : "") +
      (removed.length ? `Removed from universe: ${esc(removed.join(", "))}` : "");
  } catch (e) {
    $("prices").innerHTML = empty("Data unavailable: " + e.message);
  }
}

function kpi(label, value, note = "") {
  return `<div class="kpi"><div class="label">${esc(label)}</div><div class="value">${value}</div>${note ? `<div class="note">${esc(note)}</div>` : ""}</div>`;
}

async function loadOverview() {
  loadPrices();
  let o;
  try { o = await api("/api/overview"); } catch (e) { $("kpis").innerHTML = empty("Overview unavailable: " + e.message); return; }
  const st = o.state, em = o.equity_metrics, tm = o.trade_metrics, eq = tm.evidence_quality;
  const small = eq.level === "insufficient" || eq.level === "none";
  $("fund-meta").textContent = `Started ${when(o.fund.created_at)} · £${o.fund.starting_capital.toLocaleString()} paper capital`;
  $("kpis").innerHTML = [
    kpi("Current equity", gbp(st.equity_gbp)),
    kpi("Total return", pct(em.total_return_pct)),
    kpi("Today", pct(em.today_return_pct)),
    kpi("7-day", em.return_7d_pct == null ? NA : pct(em.return_7d_pct), em.return_7d_pct == null ? "Insufficient history" : ""),
    kpi("30-day", em.return_30d_pct == null ? NA : pct(em.return_30d_pct), em.return_30d_pct == null ? "Insufficient history" : ""),
    kpi("Max drawdown", `${num(em.max_drawdown_pct)}%`),
    kpi("Open positions", `${st.open_positions}`, `Exposure ${gbp(st.exposure_gbp)}`),
    kpi("Number of trades", `${tm.number_of_trades}`),
    kpi("Win rate", tm.win_rate_pct == null ? NA : `${num(tm.win_rate_pct, 1)}%`, small ? "Descriptive only" : ""),
    kpi("Average winner", gbp(tm.average_winner_gbp)),
    kpi("Average loser", gbp(tm.average_loser_gbp)),
    kpi("Profit factor", tm.profit_factor == null ? NA : num(tm.profit_factor), tm.profit_factor_note || (small ? "Descriptive only" : "")),
    kpi("Expectancy", gbp(tm.expectancy_gbp), tm.expectancy_r == null ? "" : `${num(tm.expectancy_r)}R per trade`),
    kpi("Avg planned R:R", tm.average_planned_reward_risk == null ? NA : num(tm.average_planned_reward_risk), "net of est. costs"),
    kpi("Sharpe", em.sharpe == null ? NA : num(em.sharpe), em.sharpe == null ? "Insufficient sample" : "daily, √365"),
    kpi("Avg holding time", tm.average_holding_hours == null ? NA : `${num(tm.average_holding_hours, 1)}h`),
  ].join("");
  $("evidence-quality").innerHTML = `<div class="callout ${small ? "warn" : "info"}"><strong>Evidence quality:</strong> ${esc(eq.label)}.
    ${eq.level === "insufficient" ? "Win rate, profit factor and averages from this few trades are not evidence of skill." : ""}
    ${em.annualised_note ? " " + esc(em.annualised_note) + "." : ""}</div>`;
  $("warnings").innerHTML = (o.warnings || []).map((w) => `<div class="callout warn">${esc(w)}</div>`).join("") +
    `<div class="callout info">Agents engine: <strong>${esc(o.llm.engine)}</strong>${o.llm.available ? "" : " — set ANTHROPIC_API_KEY to enable LLM interpretation."}</div>`;

  const b = o.benchmarks, bh = b.btc_buy_and_hold, sma = b.sma_baseline;
  $("benchmarks").innerHTML = `<table><tr><th>Strategy</th><th>Return</th><th>Notes</th></tr>
    <tr><td><strong>AI paper strategy</strong></td><td>${b.ai_strategy_return_pct_gbp == null ? NA : pct(b.ai_strategy_return_pct_gbp)}</td><td class="hint">GBP, net of estimated costs</td></tr>
    <tr><td>BTC buy-and-hold</td><td>${bh.available ? pct(bh.return_pct_gbp) : NA}</td><td class="hint">${bh.available ? `GBP; from ${usd(bh.start_price_usd)} to ${usd(bh.current_price_usd)}` : esc(bh.reason)}</td></tr>
    <tr><td>BTC SMA50 trend baseline</td><td>${sma.available ? pct(sma.return_pct_usd) : NA}</td><td class="hint">${sma.available ? esc(`${sma.rule}. ${sma.note}`) : esc(sma.reason)}</td></tr>
  </table><div class="hint" style="margin-top:8px">${b.period_start ? `Period: ${when(b.period_start)} → now (${num(b.period_days, 1)} days). Fixed start = first BTC observation; no date selection.` : ""}</div>`;
  const rc = o.risk_config;
  $("risk-config").innerHTML = `<dl class="kv">
    <dt>Max risk per trade</dt><dd>${rc.max_risk_per_trade_pct}% of equity (${gbp(st.equity_gbp * rc.max_risk_per_trade_pct / 100)})</dd>
    <dt>Max open positions</dt><dd>${rc.max_open_positions}</dd>
    <dt>Max portfolio exposure</dt><dd>${rc.max_portfolio_exposure_pct}%</dd>
    <dt>Minimum reward/risk</dt><dd>${rc.min_reward_risk} : 1 (net of costs; experiment parameter, not optimal)</dd>
    <dt>Daily loss limit</dt><dd>${rc.daily_loss_limit_pct}% → no new trades</dd>
    <dt>Cost assumption</dt><dd>${rc.fee_bps_per_side} bps fee + ${rc.slippage_bps_per_side} bps slippage per side</dd>
    <dt>Shorts</dt><dd>${rc.allow_short ? "allowed (paper)" : "disabled"}</dd></dl>`;
  const trades = await api("/api/trades");
  const open = trades.filter((t) => t.status === "OPEN");
  $("open-positions").innerHTML = open.length ? tradeTable(open) : empty("No open positions.");
}

// ---- research ------------------------------------------------------------------
let assetsLoaded = false;
async function loadResearch() {
  if (!assetsLoaded) {
    try {
      const s = await api("/api/status");
      const active = Object.keys(s.universe.active);
      $("asset-select").innerHTML = active.map((a) => `<option>${esc(a)}</option>`).join("") ||
        '<option disabled>No assets — data unavailable</option>';
      $("run-btn").disabled = !active.length;
      if (!active.length) $("run-status").textContent = "Data unavailable: " + (s.universe.error || "no provider reachable");
      assetsLoaded = active.length > 0;
    } catch (e) { $("run-status").textContent = e.message; }
  }
  const list = await api("/api/investigations?limit=25");
  $("investigation-list").innerHTML = list.length ? `<div class="scroll"><table><tr><th>Time</th><th>Asset</th><th>Trigger</th><th>Scout</th><th>Decision</th><th>Reason</th></tr>
    ${list.map((i) => `<tr class="click" onclick="location.hash='investigation/${i.id}'"><td>${when(i.created_at)}</td><td>${esc(i.asset)}</td><td>${esc(i.trigger)}</td>
    <td>${i.proposed_action ? badge(i.proposed_action) : badge(i.status)}</td><td>${badge(i.final_decision || "—")}</td><td class="hint">${esc((i.final_reason || "").slice(0, 140))}</td></tr>`).join("")}</table></div>`
    : empty("No investigations yet. Choose an asset and run one.");
}

$("run-btn").addEventListener("click", async () => {
  const asset = $("asset-select").value;
  $("run-btn").disabled = true;
  $("run-status").textContent = `Investigating ${asset}: fetching data, Scout, Devil's Advocate, Risk Engine…`;
  try {
    const inv = await api("/api/investigations", { method: "POST", body: JSON.stringify({ asset }) });
    $("investigation-result").innerHTML = renderInvestigation(inv);
    $("run-status").textContent = `Completed ${when(inv.created_at)}`;
    loadResearch(); loadStatus();
  } catch (e) {
    $("run-status").textContent = "Failed: " + e.message;
  } finally { $("run-btn").disabled = false; }
});

function conditions(list) {
  if (!list || !list.length) return '<span class="muted">None stated</span>';
  return `<ul class="tight">${list.map((c) => `<li>${esc(c.description)} <span class="mono muted">[${esc(c.metric)} ${esc(c.operator)} ${fval(c.threshold)}]</span></li>`).join("")}</ul>`;
}

function renderInvestigation(inv) {
  if (inv.status === "data_unavailable") {
    return `<div class="panel"><div class="step bad"><div class="step-title"><span class="who">${esc(inv.asset)} · ${when(inv.created_at)}</span>${badge("NO_TRADE")}</div>
      <p>${esc(inv.final_reason)}</p><p class="hint">No analysis was performed because real market data could not be obtained. Nothing was simulated.</p></div></div>`;
  }
  const sc = inv.scout_output_json || {}, ch = inv.challenge || {}, da = ch.devils_advocate_output_json || {};
  const rk = inv.risk || {}, pos = rk.position_json, obs = inv.observation || {};
  const reg = sc.market_regime || {};
  const ev = (inv.evidence_json || []).map((e) => `<tr><td class="mono">${esc(e.key)}</td><td>${esc(fval(e.value))}</td><td class="hint">${esc(e.description)}</td></tr>`).join("");
  const daClass = da.verdict === "APPROVE" ? "ok" : da.verdict === "VETO" ? "bad" : "warn";
  const findings = (da.findings || []).map((f) => `<li>${badge(f.severity)} <strong>${esc(f.check)}</strong> (${esc(f.category.replaceAll("_", " "))}): ${esc(f.claim)}${f.evidence_keys.length ? ` <span class="mono muted">[${esc(f.evidence_keys.join(", "))}]</span>` : ""}</li>`).join("");
  return `<div class="panel"><div class="panel-head"><h2>${esc(inv.asset)} investigation · ${when(inv.created_at)}</h2>${badge(inv.final_decision)}</div>
  <div class="chain">
    <div class="step"><div class="step-title"><span class="who">1 · Observation (what was known at time T)</span><span class="hint">${esc(obs.data_source)} · last closed 1h candle ${when(obs.last_closed_candle_at)}</span></div>
      <dl class="kv"><dt>Spot price</dt><dd>${usd(obs.price_usd)} <span class="hint">(${when(obs.price_timestamp)})</span></dd>
      <dt>GBP/USD</dt><dd>${obs.fx_usd_per_gbp ? num(obs.fx_usd_per_gbp, 4) + ` <span class="hint">${esc(obs.fx_source)}</span>` : "Data unavailable"}</dd>
      <dt>Market regime</dt><dd>${esc(reg.label)} <span class="hint">(BTC trend ${esc(reg.btc_trend)}, ${esc(reg.breadth_up_24h)}/${esc(reg.assets_observed)} assets up 24h)</span></dd>
      <dt>News</dt><dd>${esc((sc.news_status || {}).reason || "—")}</dd></dl>
      <details style="margin-top:8px"><summary>Evidence (deterministic features)</summary><div class="scroll"><table>${ev}</table></div></details></div>
    <div class="step"><div class="step-title"><span class="who">2 · Market Intelligence Scout</span><span>${badge(inv.proposed_action)} <span class="hint">engine ${esc(inv.scout_engine)}</span></span></div>
      <h3>What is happening</h3><p>${esc(sc.what_is_happening)}</p>
      <h3>Why might it be happening</h3><ul class="tight">${(sc.possible_explanations || []).map((e) => `<li><strong>${esc(e.category.replaceAll("_", " "))}</strong> (${esc(e.plausibility)}): ${esc(e.explanation)}</li>`).join("")}</ul>
      <h3>Thesis</h3><p>${esc(sc.thesis)}</p>
      <div class="grid2"><div><h3>Would confirm</h3>${conditions(sc.confirmation_conditions)}</div><div><h3>Would invalidate</h3>${conditions(sc.invalidation_conditions)}</div></div>
      <dl class="kv"><dt>Horizon</dt><dd>${esc(sc.horizon_hours)}h</dd><dt>Research Confidence</dt><dd>${esc(sc.research_confidence)}/5 <span class="hint">ordinal evidence agreement — not a probability</span></dd>
      <dt>Rationale</dt><dd>${esc(sc.rationale)}</dd></dl>
      ${(sc.rejected_alternatives || []).length ? `<h3>Alternatives rejected</h3><ul class="tight">${sc.rejected_alternatives.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
      ${(sc.validation_notes || []).length ? `<div class="callout warn">Validation: ${esc(sc.validation_notes.join(" · "))}</div>` : ""}</div>
    <div class="step ${da.verdict === "NOT_REQUIRED" ? "" : daClass}"><div class="step-title"><span class="who">3 · Devil's Advocate</span><span>${badge(da.verdict || ch.decision)} <span class="hint">engine ${esc(da.engine)}</span></span></div>
      <p>${esc(da.summary)}</p>${findings ? `<ul class="tight">${findings}</ul>` : ""}
      ${(da.alternative_explanations || []).length ? `<h3>Alternative explanations</h3><ul class="tight">${da.alternative_explanations.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      ${da.what_would_change_verdict ? `<p class="hint">What would change the verdict: ${esc(da.what_would_change_verdict)}</p>` : ""}
      ${(da.validation_notes || []).length ? `<div class="callout warn">${esc(da.validation_notes.join(" · "))}</div>` : ""}</div>
    <div class="step ${rk.approved ? "ok" : inv.proposed_action === "NO_TRADE" ? "" : "bad"}"><div class="step-title"><span class="who">4 · Risk Engine (deterministic)</span>${badge(rk.approved ? "APPROVE" : inv.proposed_action === "NO_TRADE" ? "NO_PROPOSAL" : "VETO")}</div>
      <table>${(rk.checks_json || []).map((c) => `<tr><td>${c.passed ? '<span class="pos">✓</span>' : '<span class="neg">✗</span>'}</td><td class="mono">${esc(c.name)}</td><td class="hint">${esc(c.detail)}</td></tr>`).join("")}</table>
      ${pos ? `<dl class="kv" style="margin-top:10px"><dt>Entry</dt><dd>${usd(pos.entry_price_usd)}</dd><dt>Stop</dt><dd>${usd(pos.stop_price_usd)} (${pos.stop_atr_multiple} ATR)</dd>
        <dt>Target</dt><dd>${usd(pos.target_price_usd)} (${pos.target_atr_multiple} ATR)</dd><dt>Size</dt><dd>${num(pos.units, 6)} units · ${gbp(pos.notional_gbp)} notional${pos.capped_by_exposure ? " (capped by exposure)" : ""}</dd>
        <dt>Planned risk</dt><dd>${gbp(pos.risk_gbp)} (${num(pos.risk_pct_of_equity)}% of equity, incl. est. costs)</dd><dt>Net reward/risk</dt><dd>${num(pos.net_reward_risk)} (gross ${num(pos.gross_reward_risk)})</dd></dl>` : ""}</div>
    <div class="step ${inv.final_decision === "TRADE" ? "ok" : ""}"><div class="step-title"><span class="who">5 · Decision</span>${badge(inv.final_decision)}</div>
      <p>${esc(inv.final_reason)}</p>${inv.trade ? `<a href="#trade/${inv.trade.id}">View paper trade →</a>` : ""}</div>
  </div></div>`;
}

async function loadInvestigationDetail(id) {
  try {
    const inv = await api(`/api/investigations/${id}`);
    $("investigation-detail").innerHTML = `<a class="back" href="#research">← Research</a>` + renderInvestigation(inv);
  } catch (e) { $("investigation-detail").innerHTML = empty(e.message); }
}

// ---- feed ----------------------------------------------------------------------
function feedBody(e) {
  const p = e.payload_json || {};
  switch (e.type) {
    case "INVESTIGATION": return `${p.trigger === "monitor" ? "Automated monitor · " : ""}Scout (${esc(p.scout_engine)}): ${esc(p.summary)}<br>Thesis: ${esc(p.thesis)} · Research Confidence ${esc(p.research_confidence)}/5`;
    case "CHALLENGE": return `${esc(p.summary)}`;
    case "PAPER_TRADE": return `Entry ${usd(p.entry)} · Stop ${usd(p.stop)} · Target ${usd(p.target)} · Risk ${gbp(p.risk_gbp)}<br>Thesis: ${esc(p.thesis)}`;
    case "TRADE_CLOSED": return `${signedGbp(p.net_pnl_gbp)} · exit ${usd(p.exit_price)} (${esc(p.exit_reason)}) · Thesis: ${esc(p.thesis_correct)}<br>Lesson: ${esc(p.lesson)}`;
    case "NO_TRADE": return esc(p.reason);
    case "LESSON": return esc(p.lesson);
    case "MONITOR_RUN": return Object.keys(p.triggers || {}).length ? "Triggers: " + esc(Object.entries(p.triggers).map(([a, t]) => `${a} (${t.map((x) => x.signal).join(", ")})`).join("; ")) : "Deterministic filters found nothing unusual.";
    case "DATA_UNAVAILABLE": return esc(p.error);
    case "FOLLOWUP": return esc(p.timing_assessment);
    case "BENCHMARK_START": return `BTC buy-and-hold and SMA baselines measured from here (GBP/USD ${num(p.fx_usd_per_gbp, 4)}, source ${esc(p.source)}).`;
    default: return esc(JSON.stringify(p).slice(0, 200));
  }
}
function feedLink(e) {
  if (e.ref_type === "trade") return `#trade/${e.ref_id}`;
  if (e.ref_type === "investigation") return `#investigation/${e.ref_id}`;
  return null;
}
async function loadFeed() {
  try {
    const ev = await api("/api/feed?limit=100");
    $("feed").innerHTML = ev.length ? ev.map((e) => {
      const link = feedLink(e);
      return `<div class="feed-item"><div class="when">${when(e.created_at)}<br>${badge(e.type)}</div>
        <div><div class="title">${link ? `<a href="${link}">${esc(e.title)}</a>` : esc(e.title)}</div><div class="body">${feedBody(e)}</div></div></div>`;
    }).join("") : empty("No events yet. Run an investigation or wait for the automated monitor.");
  } catch (e) { $("feed").innerHTML = empty(e.message); }
}

// ---- trades --------------------------------------------------------------------
function tradeTable(rows) {
  return `<div class="scroll"><table><tr><th>Entry</th><th>Asset</th><th>Dir</th><th>Entry px</th><th>Stop</th><th>Target</th><th>Risk</th><th>Status</th><th>Net P/L</th><th>Thesis</th></tr>
  ${rows.map((t) => `<tr class="click" onclick="location.hash='trade/${t.id}'"><td>${when(t.entry_time)}</td><td>${esc(t.asset)}</td><td>${badge(t.direction)}</td>
  <td>${usd(t.entry_price_usd)}</td><td>${usd(t.stop_price_usd)}</td><td>${usd(t.target_price_usd)}</td><td>${gbp(t.risk_gbp)}</td>
  <td>${esc(t.status)}${t.exit_reason ? ` · ${esc(t.exit_reason)}` : ""}</td><td>${t.net_pnl_gbp == null ? NA : signedGbp(t.net_pnl_gbp)}</td><td>${t.thesis_correct ? badge(t.thesis_correct) : NA}</td></tr>`).join("")}</table></div>`;
}
async function loadTrades() {
  const t = await api("/api/trades");
  $("trades").innerHTML = t.length ? tradeTable(t) : empty("No paper trades yet. The system is comfortable doing nothing until evidence qualifies.");
}

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
  const style = getComputedStyle(document.documentElement);
  const pos = style.getPropertyValue("--pos").trim(), neg = style.getPropertyValue("--neg").trim(), acc = style.getPropertyValue("--accent").trim(), mut = style.getPropertyValue("--muted").trim(), txt = style.getPropertyValue("--text").trim();
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Price chart with entry, stop, target and exit">
    <path d="${path}" fill="none" stroke="${txt}" stroke-width="1.4"/>
    ${hline(c.entry, acc, "4 3")}${hline(c.stop, neg, "6 3")}${hline(c.target, pos, "6 3")}
    <line x1="${X(et)}" x2="${X(et)}" y1="10" y2="${H - 10}" stroke="${mut}" stroke-dasharray="2 3"/>
    <text x="${X(et) + 4}" y="${H - 14}" font-size="10" fill="${mut}">entry ${new Date(et).toLocaleString("en-GB", { timeStyle: "short", dateStyle: "short" })}</text>
    ${c.exit != null ? `<circle cx="${X(Date.parse(c.exit_time))}" cy="${Y(c.exit)}" r="5" fill="${acc}"/>` : ""}
  </svg><div class="legend"><span><i style="background:${txt}"></i>Close (last 24h before entry at 1h, then 5m)</span><span><i style="background:${acc}"></i>Entry</span>
  <span><i style="background:${neg}"></i>Stop</span><span><i style="background:${pos}"></i>Target</span>${c.exit != null ? "<span>● Exit</span>" : ""}</div>`;
}

async function loadTrade(id) {
  const el = $("trade-detail");
  el.innerHTML = empty("Loading…");
  let t;
  try { t = await api(`/api/trades/${id}`); } catch (e) { el.innerHTML = empty(e.message); return; }
  const o = t.outcome, inv = t.investigation || {}, sc = inv.scout_output_json || {}, da = (inv.challenge || {}).devils_advocate_output_json || {};
  const l = t.lessons[0], d = (o && o.evaluation_json) || {};
  el.innerHTML = `<a class="back" href="#trades">← Trades</a>
  <div class="panel"><div class="panel-head"><h2>${esc(t.asset)} ${badge(t.direction)} · ${when(t.entry_time)}</h2>
    <span>${badge(t.status)} ${t.status === "OPEN" ? `<button class="secondary" id="close-btn">Close at current market price</button>` : ""}</span></div>
    <h3>Why did we enter?</h3><p>${esc(t.thesis)}</p><p class="hint">${esc(t.entry_reason)}</p>
    <dl class="kv"><dt>Research Confidence</dt><dd>${esc(t.research_confidence)}/5 (not a probability)</dd>
    <dt>Agents involved</dt><dd>${(t.agents_json || []).map((a) => `${esc(a.agent)} <span class="hint">(${esc(a.engine)})</span>`).join(" · ")}</dd>
    <dt>Alternatives rejected</dt><dd>${esc((t.rejected_alternatives_json || []).join(" · "))}</dd></dl>
    <h3>What did we know at the time?</h3>
    <p>${esc(inv.situation_summary)}</p>
    <div class="scroll"><table>${(t.evidence_json || []).map((e) => `<tr><td class="mono">${esc(e.key)}</td><td>${esc(fval(e.value))}</td><td class="hint">${esc(e.description)}</td></tr>`).join("")}</table></div>
    <p class="hint">Observation recorded ${when((inv.observation || {}).observed_at)} from ${esc((inv.observation || {}).data_source)}; last closed candle ${when((inv.observation || {}).last_closed_candle_at)}.</p>
    <h3>What did the Devil's Advocate say?</h3><p>${badge(t.devils_advocate_verdict)} ${esc(da.summary || t.devils_advocate_summary)}</p>
    <ul class="tight">${(da.findings || []).map((f) => `<li>${badge(f.severity)} ${esc(f.claim)}</li>`).join("")}</ul>
    <h3>What did the risk engine allow?</h3>
    <dl class="kv"><dt>Entry</dt><dd>${usd(t.entry_price_usd)} <span class="hint">GBP/USD ${num(t.fx_entry_usd_per_gbp, 4)}</span></dd><dt>Stop</dt><dd>${usd(t.stop_price_usd)}</dd><dt>Target</dt><dd>${usd(t.target_price_usd)}</dd>
    <dt>Position</dt><dd>${num(t.units, 6)} units · ${gbp(t.notional_gbp)}</dd><dt>Planned risk</dt><dd>${gbp(t.risk_gbp)} · planned reward ${gbp(t.planned_reward_gbp)} · net R:R ${num(t.reward_risk)}</dd>
    <dt>Horizon</dt><dd>${esc(t.horizon_hours)}h (expires ${when(t.expires_at)})</dd></dl>
    <h3>What happened?</h3><div id="trade-chart">${empty("Loading chart…")}</div>
    ${o ? `<dl class="kv" style="margin-top:10px"><dt>Exit</dt><dd>${usd(o.exit_price_usd)} · ${esc(o.exit_reason)} · ${when(o.exit_time)}</dd>
      <dt>Gross P/L</dt><dd>${signedGbp(o.gross_pnl_gbp)}</dd><dt>Estimated fees</dt><dd>${gbp(o.fees_gbp)}</dd><dt>Estimated slippage</dt><dd>${gbp(o.estimated_slippage_gbp)}</dd>
      <dt>Net P/L</dt><dd>${signedGbp(o.net_pnl_gbp)} (${num(o.r_multiple)}R)</dd><dt>MFE / MAE</dt><dd>${pct(o.mfe_pct)} / ${pct(o.mae_pct)}</dd>
      <dt>Thesis correct</dt><dd>${badge(o.thesis_correct || "—")}</dd><dt>Reason matched thesis</dt><dd>${esc(o.reason_matched_thesis)}</dd></dl>`
      : `<p class="hint">Position open. Last checked ${when(t.last_checked_at)}; best price so far ${usd(t.max_favourable_price_usd)}, worst ${usd(t.max_adverse_price_usd)}.</p>`}
    <h3>What did we learn?</h3>
    ${l ? `<dl class="kv"><dt>Prediction (direction) correct</dt><dd>${l.prediction_correct ? "Yes" : "No"}</dd><dt>Timing</dt><dd>${esc(l.timing_assessment)}</dd>
      <dt>Risk management</dt><dd>${esc(l.risk_assessment)}</dd><dt>Failure category</dt><dd>${esc(l.failure_category || "n/a (win)")}</dd>
      <dt>Devil's Advocate anticipated it</dt><dd>${l.devils_advocate_anticipated ? "Yes — " + esc((d.anticipated_findings || []).map((f) => f.check).join(", ")) : "No"}</dd>
      <dt>Observed</dt><dd>${esc(l.observed_error)}</dd><dt>Possible cause</dt><dd>${esc(l.possible_cause)}</dd>
      <dt>Lesson</dt><dd><strong>${esc(l.lesson)}</strong></dd><dt>Status</dt><dd>${badge(l.validation_status)} confidence ${esc(l.confidence)} · ${esc((l.review_json || {}).similar_observations)} of ${esc((l.review_json || {}).needed_for_review)} similar observations</dd></dl>
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
  $("lesson-summary").innerHTML = sum.groups.length ? `<table><tr><th>Hypothesis</th><th>Outcome category</th><th>Observations</th><th>DA anticipated</th><th>Status</th></tr>
    ${sum.groups.map((g) => `<tr><td class="mono">${esc(g.hypothesis_tag)}</td><td>${esc(g.outcome_category)}</td><td>${g.n} / ${g.needed}</td><td>${g.da_anticipated || 0}</td><td>${badge(g.status)}</td></tr>`).join("")}</table>`
    : empty("No lessons yet — lessons are created only from closed paper trades.");
  $("lessons").innerHTML = ls.length ? ls.map((l) => `<div class="feed-item"><div class="when">${when(l.created_at)}<br>${badge(l.validation_status)}</div>
    <div><div class="title"><a href="#trade/${l.trade_id}">${esc(l.asset)} ${esc(l.direction)}</a> · ${esc(l.failure_category || "win")}</div>
    <div class="body">${esc(l.observed_error)}<br><strong>${esc(l.lesson)}</strong><br>${esc(l.timing_assessment)}</div></div></div>`).join("") : "";
}

// ---- system --------------------------------------------------------------------
async function loadSystem() {
  const s = await loadStatus();
  if (s) {
    $("providers").innerHTML = `<table><tr><th>Source</th><th>Status</th><th>Last success</th><th>Last error</th></tr>
      ${s.providers.map((p) => `<tr><td>${esc(p.name)}</td><td>${p.ok ? '<span class="pos">ok</span>' : p.ok === false ? '<span class="neg">unavailable</span>' : '<span class="muted">not yet used</span>'}</td>
      <td>${when(p.last_success)}</td><td class="hint">${esc((p.last_error || "").slice(0, 200))}</td></tr>`).join("")}</table>
      <p class="hint">Active universe: ${esc(Object.keys(s.universe.active).join(", ") || "none")}. ${Object.keys(s.universe.removed).length ? "Removed: " + esc(Object.entries(s.universe.removed).map(([a, r]) => `${a} (${r})`).join(", ")) : ""}</p>
      <p class="hint">News: ${esc(s.news.reason)}<br>Social: ${esc(s.social.reason)}</p>`;
    $("monitor-meta").innerHTML = `<dl class="kv"><dt>Scheduler</dt><dd>${s.monitor.enabled ? "running" : "disabled"}</dd><dt>Interval</dt><dd>${s.monitor.interval_minutes} min</dd>
      <dt>Next run</dt><dd>${when(s.monitor.next_run)}</dd><dt>Agents</dt><dd>${esc(s.llm.engine)}${s.llm.note ? `<br><span class="hint">${esc(s.llm.note)}</span>` : ""}</dd></dl>`;
  }
  const runs = await api("/api/monitor/runs");
  $("monitor-runs").innerHTML = runs.length ? `<div class="scroll"><table><tr><th>Started</th><th>Status</th><th>Triggers</th><th>Investigations</th><th>Closed</th><th>Errors</th></tr>
    ${runs.map((r) => `<tr><td>${when(r.started_at)}</td><td>${esc(r.status)}</td><td>${esc(Object.keys(r.triggers_json || {}).join(", ") || "none")}</td>
    <td>${(r.investigations_json || []).map((i) => `<a href="#investigation/${i.id}">${esc(i.asset)}: ${esc(i.decision)}</a>`).join(", ") || "none"}</td>
    <td>${(r.positions_closed_json || []).length}</td><td class="hint">${esc((r.errors_json || []).join("; ").slice(0, 200))}</td></tr>`).join("")}</table></div>`
    : empty("No monitor runs yet.");
}
$("monitor-btn").addEventListener("click", async () => {
  $("monitor-btn").disabled = true;
  try { await api("/api/monitor/run", { method: "POST" }); } catch (e) { alert(e.message); }
  $("monitor-btn").disabled = false;
  loadSystem();
});

// ---- boot ----------------------------------------------------------------------
loadStatus();
route();
setInterval(() => {
  const v = (location.hash.slice(1) || "overview").split("/")[0];
  if (v === "feed") loadFeed();
  if (v === "overview") loadOverview();
  loadStatus();
}, 30000);

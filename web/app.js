// Adaptive Quant dashboard: Binance-style trading terminal + CoinMarketCap-style portfolio.
// Every element is rendered from a backend endpoint; nothing is simulated. Missing data shows as unavailable.
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
const css = (n) => getComputedStyle(document.body).getPropertyValue(n).trim();

// ---- formatting ---------------------------------------------------------------
const num = (v, d = 2) => (v === null || v === undefined || Number.isNaN(v)) ? null : Number(v).toFixed(d);
const gbp = (v, d = 2) => v == null ? NA : `${v < 0 ? "−" : ""}£${Math.abs(v).toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const signedGbp = (v) => v == null ? NA : `<span class="${v >= 0 ? "up" : "down"}">${v >= 0 ? "+" : "−"}£${Math.abs(v).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
const pct = (v, d = 2) => v == null ? NA : `<span class="${v > 0 ? "up" : v < 0 ? "down" : ""}">${v > 0 ? "+" : ""}${Number(v).toFixed(d)}%</span>`;
function pxDigits(v) { return v >= 1000 ? 2 : v >= 1 ? 4 : 6; }
const fmtPx = (v) => v == null ? "—" : Number(v).toLocaleString("en-US", { minimumFractionDigits: pxDigits(v), maximumFractionDigits: pxDigits(v) });
const usd = (v) => v == null ? NA : "$" + fmtPx(v);
const compact = (v) => v == null ? "—" : Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(v);
const when = (iso) => iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";
const hm = (iso) => iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—";
const badge = (t) => `<span class="badge ${esc(t)}">${esc(String(t).replaceAll("_", " "))}</span>`;
const empty = (m) => `<div class="empty">${esc(m)}</div>`;
function fval(v) {
  if (v === null || v === undefined) return "Data unavailable";
  if (typeof v === "number") return Math.abs(v) >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 2 }) : Number(v.toPrecision(5)).toString();
  return v;
}
const COIN = { BTC: "#f7931a", ETH: "#627eea", SOL: "#9945ff", BNB: "#f3ba2f", XRP: "#23292f", DOGE: "#c2a633" };
const coinIcon = (a) => `<i style="background:${COIN[a] || "#58667e"}">${esc(a.slice(0, 4))}</i>`;

// ---- routing / theme -----------------------------------------------------------
const TABS = ["trade", "portfolio", "research", "lessons", "system"];
let curAsset = "BTC", curIv = "1h";
function route() {
  const [name, arg] = (location.hash.slice(1) || "trade").split("/");
  const view = [...TABS, "position", "investigation"].includes(name) ? name : "trade";
  document.body.className = view === "portfolio" ? "theme-cmc" : "theme-bn";
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
  const tab = view === "position" ? "trade" : view === "investigation" ? "research" : view;
  document.querySelectorAll("#links a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));
  if (view === "trade" && arg) curAsset = arg.toUpperCase();
  ({ trade: loadTrade, portfolio: loadPortfolio, research: loadResearch, lessons: loadLessons, system: loadSystem,
     position: () => loadPosition(arg), investigation: () => loadInvestigationDetail(arg) })[view]();
}
window.addEventListener("hashchange", route);

let STATUS = null, OVERVIEW = null;
async function loadStatus() {
  try {
    STATUS = await api("/api/status");
    const live = STATUS.providers.some((p) => p.ok) && Object.keys(STATUS.universe.active).length;
    $("status-line").innerHTML = `<span class="dot ${live ? "live" : "down"}"></span>${live ? "Live market data" : "Market data offline"} · agents ${esc(STATUS.llm.engine)}`;
  } catch (e) { $("status-line").innerHTML = `<span class="dot down"></span>API unreachable`; }
  return STATUS;
}

// =============================== TRADE (Binance) ===============================
async function loadTrade() {
  if (!STATUS) await loadStatus();
  const active = Object.keys(STATUS?.universe?.active || {});
  if (active.length && !active.includes(curAsset)) curAsset = active[0];
  $("inv-asset").textContent = `${curAsset}/USD`;
  $("act-asset").textContent = curAsset;
  OVERVIEW = OVERVIEW || await api("/api/overview").catch(() => null);
  if (OVERVIEW) {
    const rc = OVERVIEW.risk_config;
    $("inv-risk").textContent = `${rc.max_risk_per_trade_pct}% (${gbp(OVERVIEW.state.equity_gbp * rc.max_risk_per_trade_pct / 100).replace(/<[^>]+>/g, "")})`;
    $("inv-rr").textContent = `${rc.min_reward_risk} : 1 net`;
    $("inv-engine").textContent = OVERVIEW.llm.available ? OVERVIEW.llm.engine : "rules:v1";
  }
  $("run-btn").disabled = !active.length;
  await Promise.all([loadMarket(), loadOrderBook(), loadMarkets(), loadBottom(), loadActivity()]);
}

async function loadMarket() {
  let m;
  try { m = await api(`/api/market/${curAsset}?interval=${curIv}`); }
  catch (e) {
    $("pairbar").innerHTML = `<div class="pair"><span class="sym">${esc(curAsset)}/USD</span></div><span class="down">Data unavailable: ${esc(e.message)}</span>`;
    $("candles").innerHTML = empty("Market data unavailable — no provider reachable. Nothing is simulated.");
    return;
  }
  const s = m.stats, last = m.candles[m.candles.length - 1];
  const dir = s.change_24h_pct == null ? "" : s.change_24h_pct >= 0 ? "up" : "down";
  $("pairbar").innerHTML = `<div class="pair">${coinIcon(curAsset).replace("<i ", '<i class="pi" ')}<div><div class="sym">${esc(curAsset)}/USD</div><div class="src">${esc(s.source)} · paper</div></div></div>
    <div class="lastpx ${dir}">${fmtPx(s.price_usd)}<span class="usd">$${fmtPx(s.price_usd)}</span></div>
    <div class="pstat"><div class="k">24h Change</div><div class="v ${dir}">${s.change_24h_pct == null ? "—" : `${s.change_24h_pct >= 0 ? "+" : ""}${num(s.change_24h_pct)}%`}</div></div>
    <div class="pstat"><div class="k">24h High</div><div class="v">${fmtPx(s.high_24h)}</div></div>
    <div class="pstat"><div class="k">24h Low</div><div class="v">${fmtPx(s.low_24h)}</div></div>
    <div class="pstat"><div class="k">24h Volume(${esc(curAsset)})</div><div class="v">${compact(s.volume_24h_base)}</div></div>
    <div class="pstat"><div class="k">24h Volume(USD)</div><div class="v">${compact(s.volume_24h_usd)}</div></div>`;
  document.title = `${fmtPx(s.price_usd)} | ${curAsset}/USD | Adaptive Quant`;
  drawCandles(m);
  setOhlc(last);
}

function setOhlc(c) {
  if (!c) { $("ohlc").innerHTML = ""; return; }
  const col = c.c >= c.o ? "up" : "down";
  $("ohlc").innerHTML = `${new Date(c.t).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })} &nbsp;O <b class="${col}">${fmtPx(c.o)}</b>H <b class="${col}">${fmtPx(c.h)}</b>L <b class="${col}">${fmtPx(c.l)}</b>C <b class="${col}">${fmtPx(c.c)}</b>Vol <b>${compact(c.v)}</b>${c.closed ? "" : '<span class="muted">(forming)</span>'}`;
}

function drawCandles(m) {
  const el = $("candles"), cs = m.candles;
  if (!cs.length) { el.innerHTML = empty("No candles returned."); return; }
  const W = Math.max(320, el.clientWidth), H = el.clientHeight || 440, R = 76, T = 10, B = 24;
  const volH = (H - T - B) * 0.18, priceH = H - T - B - volH - 6;
  const up = css("--up"), down = css("--down"), line = css("--line"), muted = css("--muted"), accent = css("--accent-strong");
  const open = m.trades.filter((t) => t.status === "OPEN");
  const lv = [];
  open.forEach((t) => lv.push(t.stop_price_usd, t.target_price_usd, t.entry_price_usd));
  let lo = Math.min(...cs.map((c) => c.l)), hi = Math.max(...cs.map((c) => c.h));
  const lvIn = lv.filter((v) => v > lo - (hi - lo) * 0.5 && v < hi + (hi - lo) * 0.5);
  lo = Math.min(lo, ...lvIn); hi = Math.max(hi, ...lvIn);
  const pad = (hi - lo) * 0.06 || hi * 0.001; lo -= pad; hi += pad;
  const n = cs.length, cw = (W - R) / n, bw = Math.max(1, cw * 0.7);
  const X = (i) => i * cw + cw / 2, Y = (v) => T + (hi - v) / (hi - lo) * priceH;
  const vmax = Math.max(...cs.map((c) => c.v)) || 1, VY0 = T + priceH + 6 + volH;
  let g = "";
  for (let i = 0; i <= 5; i++) {
    const v = lo + (hi - lo) * i / 5;
    g += `<line x1="0" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${line}" stroke-width="1"/><text x="${W - R + 6}" y="${Y(v) + 4}" font-size="11" fill="${muted}">${fmtPx(v)}</text>`;
  }
  const every = Math.ceil(n / Math.max(3, Math.floor((W - R) / 110)));
  for (let i = 0; i < n; i += every) {
    const d = new Date(cs[i].t);
    const lab = curIv === "1d" ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : curIv === "1h" ? d.toLocaleString("en-GB", { day: "2-digit", hour: "2-digit", minute: "2-digit" }) : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    g += `<line x1="${X(i)}" x2="${X(i)}" y1="${T}" y2="${VY0}" stroke="${line}" stroke-width="1"/><text x="${X(i)}" y="${H - 6}" font-size="11" fill="${muted}" text-anchor="middle">${lab}</text>`;
  }
  let bars = "";
  cs.forEach((c, i) => {
    const col = c.c >= c.o ? up : down, x = X(i);
    const y1 = Y(Math.max(c.o, c.c)), y2 = Y(Math.min(c.o, c.c));
    bars += `<line x1="${x}" x2="${x}" y1="${Y(c.h)}" y2="${Y(c.l)}" stroke="${col}" stroke-width="1"/>
      <rect x="${x - bw / 2}" y="${y1}" width="${bw}" height="${Math.max(1, y2 - y1)}" fill="${col}"${c.closed ? "" : ' fill-opacity=".6"'}/>
      <rect x="${x - bw / 2}" y="${VY0 - c.v / vmax * volH}" width="${bw}" height="${c.v / vmax * volH}" fill="${col}" fill-opacity=".35"/>`;
  });
  // Paper-trade overlays: levels for open positions, markers for entries/exits within the window.
  const idxAt = (iso) => { const t = Date.parse(iso); let k = -1; cs.forEach((c, i) => { if (Date.parse(c.t) <= t) k = i; }); return k; };
  const tag = (v, col, text) => `<line x1="0" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${col}" stroke-dasharray="5 4"/>
    <rect x="${W - R}" y="${Y(v) - 9}" width="${R}" height="18" fill="${col}"/><text x="${W - R + 4}" y="${Y(v) + 4}" font-size="10" font-weight="600" fill="#0b0e11">${text}</text>`;
  let ov = "";
  open.forEach((t) => { ov += tag(t.stop_price_usd, down, "STOP") + tag(t.target_price_usd, up, "TARGET") + tag(t.entry_price_usd, accent, "ENTRY"); });
  m.trades.forEach((t) => {
    const ie = idxAt(t.entry_time);
    if (ie >= 0) {
      const long = t.direction === "LONG", y = long ? Y(cs[ie].l) + 14 : Y(cs[ie].h) - 14;
      ov += `<path d="M${X(ie)},${y + (long ? -8 : 8)} l-6,${long ? 10 : -10} h12z" fill="${long ? up : down}"><title>${t.direction} entry ${fmtPx(t.entry_price_usd)}</title></path>
        <text x="${X(ie)}" y="${long ? y + 14 : y - 6}" font-size="10" text-anchor="middle" fill="${long ? up : down}">${long ? "BUY" : "SELL"}</text>`;
    }
    if (t.exit_time) {
      const ix = idxAt(t.exit_time);
      if (ix >= 0) ov += `<circle cx="${X(ix)}" cy="${Y(t.exit_price_usd)}" r="5" fill="${accent}" stroke="#0b0e11"><title>Exit ${t.exit_reason} ${fmtPx(t.exit_price_usd)} · ${t.net_pnl_gbp >= 0 ? "+" : ""}£${num(t.net_pnl_gbp)}</title></circle>`;
    }
  });
  const lc = cs[n - 1], lcol = lc.c >= lc.o ? up : down;
  const lastTag = `<line x1="0" x2="${W - R}" y1="${Y(lc.c)}" y2="${Y(lc.c)}" stroke="${lcol}" stroke-dasharray="2 3"/>
    <rect x="${W - R}" y="${Y(lc.c) - 9}" width="${R}" height="18" fill="${lcol}"/><text x="${W - R + 4}" y="${Y(lc.c) + 4}" font-size="11" font-weight="600" fill="#fff">${fmtPx(lc.c)}</text>`;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" id="csvg">${g}${bars}${ov}${lastTag}<g id="xhair"></g>
    <text x="10" y="${T + 16}" font-size="40" font-weight="700" fill="${muted}" fill-opacity=".08">${esc(curAsset)}/USD · ${curIv.toUpperCase()}</text></svg>`;
  const svg = $("csvg");
  svg.onmousemove = (e) => {
    const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    const i = Math.min(n - 1, Math.max(0, Math.floor(x / cw)));
    setOhlc(cs[i]);
    const v = hi - (y - T) / priceH * (hi - lo);
    $("xhair").innerHTML = `<line x1="${X(i)}" x2="${X(i)}" y1="${T}" y2="${VY0}" stroke="${muted}" stroke-dasharray="3 3"/>` +
      (y <= T + priceH ? `<line x1="0" x2="${W - R}" y1="${y}" y2="${y}" stroke="${muted}" stroke-dasharray="3 3"/><rect x="${W - R}" y="${y - 9}" width="${R}" height="18" fill="#474d57"/><text x="${W - R + 4}" y="${y + 4}" font-size="11" fill="#fff">${fmtPx(v)}</text>` : "");
  };
  svg.onmouseleave = () => { $("xhair").innerHTML = ""; setOhlc(lc); };
}

async function loadOrderBook() {
  try {
    const ob = await api(`/api/orderbook/${curAsset}?depth=14`);
    const rows = (lv, side) => {
      let cum = 0; const out = lv.map(([p, q]) => { cum += p * q; return { p, q, cum }; });
      const max = out.length ? out[out.length - 1].cum : 1;
      const html = out.map((r) => `<div class="ob-row"><div class="bar" style="width:${(r.cum / max * 100).toFixed(1)}%"></div>
        <span class="${side === "asks" ? "down" : "up"}">${fmtPx(r.p)}</span><span>${Number(r.q.toPrecision(5))}</span><span>${compact(r.p * r.q)}</span></div>`);
      return side === "asks" ? html.reverse().join("") : html.join("");
    };
    $("ob-asks").className = "ob-side asks"; $("ob-bids").className = "ob-side bids";
    $("ob-asks").innerHTML = rows(ob.asks, "asks");
    $("ob-bids").innerHTML = rows(ob.bids, "bids");
    $("ob-mid").innerHTML = `${fmtPx(ob.mid)} <small>mid · spread ${num(ob.spread_bps)} bps</small>`;
    $("ob-src").textContent = `${ob.source} · ${hm(ob.timestamp)}`;
  } catch (e) {
    $("ob-asks").innerHTML = ""; $("ob-bids").innerHTML = "";
    $("ob-mid").innerHTML = `<small class="down">Order book unavailable</small>`;
    $("ob-src").textContent = "";
  }
}

async function loadMarkets() {
  try {
    const p = await api("/api/prices");
    $("markets").innerHTML = p.assets.map((a) => `<div class="mk-row ${a.asset === curAsset ? "on" : ""}" onclick="location.hash='trade/${a.asset}'">
      <span><b>${esc(a.asset)}</b><small>/USD</small></span><span>${a.available ? fmtPx(a.price_usd) : '<span class="muted">n/a</span>'}</span>
      <span>${a.change_24h_pct == null ? NA : pct(a.change_24h_pct)}</span></div>`).join("")
      + Object.entries(p.removed || {}).map(([a, r]) => `<div class="mk-row" title="${esc(r)}"><span class="muted">${esc(a)}/USD</span><span class="muted">removed</span><span></span></div>`).join("")
      || empty("No markets — data unavailable");
  } catch (e) { $("markets").innerHTML = empty("Data unavailable"); }
}

const WHO = { INVESTIGATION: ["Scout", "--link"], CHALLENGE: ["Devil's Advocate", "--down"], PAPER_TRADE: ["Risk Engine", "--up"],
  NO_TRADE: ["Risk Engine", "--muted"], TRADE_CLOSED: ["Portfolio", "--accent-strong"], LESSON: ["Learning", "--up"], FOLLOWUP: ["Learning", "--up"],
  DATA_UNAVAILABLE: ["Data", "--down"], MONITOR_RUN: ["Monitor", "--muted"], BENCHMARK_START: ["Benchmark", "--muted"] };
const evLink = (e) => e.ref_type === "trade" ? `#position/${e.ref_id}` : e.ref_type === "investigation" ? `#investigation/${e.ref_id}` : null;
async function loadActivity() {
  const ev = await api("/api/feed?limit=150").catch(() => []);
  const mine = ev.filter((e) => e.asset === curAsset).slice(0, 40);
  $("activity").innerHTML = mine.length ? mine.map((e) => {
    const [who, col] = WHO[e.type] || [e.type, "--muted"]; const l = evLink(e);
    return `<div class="act"><span class="tm">${hm(e.created_at)}</span><div><div class="who" style="color:var(${col})">${esc(who)}</div>
      <div>${l ? `<a href="${l}" style="color:inherit">${esc(e.title)}</a>` : esc(e.title)}</div></div></div>`;
  }).join("") : empty(`No agent activity on ${curAsset} yet.`);
  $("b-log").innerHTML = ev.length ? `<div class="scroll"><table><tr><th>Time</th><th>Agent</th><th>Pair</th><th>Event</th></tr>${ev.slice(0, 60).map((e) => {
    const [who] = WHO[e.type] || [e.type]; const l = evLink(e);
    return `<tr><td class="num">${when(e.created_at)}</td><td>${esc(who)}</td><td>${esc(e.asset || "—")}</td><td>${l ? `<a href="${l}">${esc(e.title)}</a>` : esc(e.title)}</td></tr>`;
  }).join("")}</table></div>` : empty("No events yet.");
  // Latest investigation result for this market in the investigation panel.
  const lastInv = ev.find((e) => e.asset === curAsset && e.type === "INVESTIGATION");
  if (lastInv) showInvestigationSummary(await api(`/api/investigations/${lastInv.ref_id}`));
  else $("inv-result").innerHTML = empty(`No investigation of ${curAsset} yet. Run one to see the Scout's thesis, the Devil's Advocate challenge and the risk decision.`);
}

function showInvestigationSummary(inv) {
  if (inv.status === "data_unavailable") { $("inv-result").innerHTML = `<div class="res-head">${badge("NO_TRADE")}<span class="muted">${when(inv.created_at)}</span></div><div class="res-line">${esc(inv.final_reason)}</div>`; return; }
  const sc = inv.scout_output_json || {}, da = (inv.challenge || {}).devils_advocate_output_json || {}, rk = inv.risk || {};
  const failed = (rk.checks_json || []).filter((c) => !c.passed);
  $("inv-result").innerHTML = `<div class="res-head">${badge(inv.final_decision)} ${inv.proposed_action !== "NO_TRADE" ? badge(inv.proposed_action) : ""} <span class="muted">${when(inv.created_at)} · confidence ${esc(inv.research_confidence)}/5 (not a probability)</span>
    <a href="#investigation/${inv.id}" style="margin-left:auto">Full reasoning →</a></div>
    <div class="res-line">${esc(sc.what_is_happening)}</div>
    <div class="res-steps">
      <div class="res-step"><div class="t">Scout</div>${esc(sc.thesis)}</div>
      <div class="res-step"><div class="t">Devil's Advocate · ${esc(da.verdict || "—")}</div>${esc((da.summary || "").slice(0, 220))}</div>
      <div class="res-step"><div class="t">Risk Engine · ${rk.approved ? "approved" : inv.proposed_action === "NO_TRADE" ? "no proposal" : "blocked"}</div>${rk.approved && inv.trade ? `Opened: risk ${gbp(inv.trade.risk_gbp)}, stop ${usd(inv.trade.stop_price_usd)}, target ${usd(inv.trade.target_price_usd)}` : inv.proposed_action === "NO_TRADE" ? "Nothing to size — the Scout found no qualifying setup." : esc(failed.map((c) => c.name).join(", ") || "—")}</div>
    </div>`;
}

$("run-btn").addEventListener("click", async () => {
  $("run-btn").disabled = true;
  $("run-status").textContent = `Investigating ${curAsset}: data → Scout → Devil's Advocate → Risk Engine…`;
  try {
    const inv = await api("/api/investigations", { method: "POST", body: JSON.stringify({ asset: curAsset }) });
    $("run-status").innerHTML = `Done: ${badge(inv.final_decision)}`;
    showInvestigationSummary(inv);
    OVERVIEW = null;
    loadTrade();
  } catch (e) { $("run-status").innerHTML = `<span class="down">Failed: ${esc(e.message)}</span>`; }
  finally { $("run-btn").disabled = false; }
});
document.querySelectorAll(".chart-tools button").forEach((b) => b.onclick = () => {
  curIv = b.dataset.iv;
  document.querySelectorAll(".chart-tools button").forEach((x) => x.classList.toggle("on", x === b));
  loadMarket();
});
document.querySelectorAll("#btabs button").forEach((b) => b.onclick = () => {
  document.querySelectorAll("#btabs button").forEach((x) => x.classList.toggle("on", x === b));
  document.querySelectorAll(".bview").forEach((v) => v.classList.toggle("on", v.id === `b-${b.dataset.b}`));
});

async function loadBottom() {
  const [trades, prices, invs] = await Promise.all([api("/api/trades"), api("/api/prices").catch(() => ({ assets: [] })), api("/api/investigations?limit=40")]);
  const px = Object.fromEntries(prices.assets.filter((a) => a.available).map((a) => [a.asset, a.price_usd]));
  const fx = OVERVIEW?.fx?.usd_per_gbp;
  const open = trades.filter((t) => t.status === "OPEN"), closed = trades.filter((t) => t.status === "CLOSED");
  $("cnt-open").textContent = `(${open.length})`;
  $("b-positions").innerHTML = open.length ? `<div class="scroll"><table><tr><th>Pair</th><th>Side</th><th>Size</th><th>Entry Price</th><th>Mark Price</th><th>Stop</th><th>Target</th><th>Risk</th><th>Unrealized PnL</th><th>Expires</th></tr>
    ${open.map((t) => { const p = px[t.asset], s = t.direction === "LONG" ? 1 : -1; const u = p != null && fx ? t.units * (p - t.entry_price_usd) * s / fx : null;
      return `<tr class="click" onclick="location.hash='position/${t.id}'"><td><b>${esc(t.asset)}/USD</b></td><td>${badge(t.direction === "LONG" ? "BUY" : "SELL")}</td>
      <td class="num">${Number(t.units.toPrecision(6))} <span class="muted">(${gbp(t.notional_gbp, 0)})</span></td><td class="num">${fmtPx(t.entry_price_usd)}</td><td class="num">${p == null ? "—" : fmtPx(p)}</td>
      <td class="num down">${fmtPx(t.stop_price_usd)}</td><td class="num up">${fmtPx(t.target_price_usd)}</td><td class="num">${gbp(t.risk_gbp)}</td><td class="num">${u == null ? NA : signedGbp(u)}</td><td>${when(t.expires_at)}</td></tr>`; }).join("")}</table></div>`
    : empty("No open positions. The system is comfortable doing nothing until evidence qualifies.");
  $("b-history").innerHTML = closed.length ? `<div class="scroll"><table><tr><th>Closed</th><th>Pair</th><th>Side</th><th>Entry</th><th>Exit</th><th>Reason</th><th>Net PnL</th><th>Thesis</th></tr>
    ${closed.map((t) => `<tr class="click" onclick="location.hash='position/${t.id}'"><td>${when(t.exit_time)}</td><td><b>${esc(t.asset)}/USD</b></td><td>${badge(t.direction === "LONG" ? "BUY" : "SELL")}</td>
    <td class="num">${fmtPx(t.entry_price_usd)}</td><td class="num">${fmtPx(t.exit_price_usd)}</td><td>${badge(t.exit_reason)}</td><td class="num">${signedGbp(t.net_pnl_gbp)}</td><td>${t.thesis_correct ? badge(t.thesis_correct) : NA}</td></tr>`).join("")}</table></div>`
    : empty("No closed trades yet.");
  $("b-investigations").innerHTML = invs.length ? invTable(invs) : empty("No investigations yet.");
}
function invTable(list) {
  return `<div class="scroll"><table><tr><th>Time</th><th>Pair</th><th>Trigger</th><th>Scout</th><th>Decision</th><th>Reason</th></tr>
    ${list.map((i) => `<tr class="click" onclick="location.hash='investigation/${i.id}'"><td>${when(i.created_at)}</td><td><b>${esc(i.asset)}</b></td><td>${esc(i.trigger)}</td>
    <td>${i.proposed_action ? badge(i.proposed_action) : badge(i.status)}</td><td>${badge(i.final_decision || "—")}</td><td class="muted">${esc((i.final_reason || "").slice(0, 120))}</td></tr>`).join("")}</table></div>`;
}

// ============================ PORTFOLIO (CoinMarketCap) ============================
let PF_SERIES = null, PF_RANGE = 30;
async function loadPortfolio() {
  let pf, series, trend;
  try { [pf, series, trend] = await Promise.all([api("/api/portfolio"), api("/api/equity-series"), api("/api/investment-trend")]); }
  catch (e) { $("pf-balance").innerHTML = `<span class="down">Unavailable</span>`; $("pf-change").textContent = e.message; return; }
  PF_SERIES = series;
  $("pf-balance").textContent = "£" + pf.balance_gbp.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const chip = (v) => v == null ? `<span class="chip flat">24h: not enough history</span>`
    : `<span class="chip ${v >= 0 ? "up" : "down"}">${v >= 0 ? "▲" : "▼"} ${Math.abs(v).toFixed(2)}% (24h)</span>`;
  $("pf-change").innerHTML = `${chip(pf.change_24h_pct)} ${pf.change_24h_gbp == null ? "" : signedGbp(pf.change_24h_gbp)}
    <span class="pf-muted">· ${signedGbp(pf.all_time_profit_gbp)} all-time on ${gbp(pf.starting_capital_gbp, 0)} invested</span>`;

  const b = pf.benchmarks, bh = b.btc_buy_and_hold, sm = b.sma_baseline;
  const item = (av, col, name, val, on) => `<div class="pf-item ${on ? "on" : ""}"><span class="av" style="background:${col}">${av}</span><div><div class="nm">${esc(name)}</div><div class="val">${val}</div></div></div>`;
  $("pf-list").innerHTML = item("AQ", "#3861fb", "Adaptive Quant (AI)", `${gbp(pf.balance_gbp)} · ${pct(pf.all_time_profit_pct)}`, true)
    + item("₿", "#f7931a", "BTC buy & hold", bh.available ? `${gbp(bh.value_gbp)} · ${pct(bh.return_pct_gbp)}` : esc(bh.reason), false)
    + item("SMA", "#58667e", "SMA50 trend bot", sm.available ? `${gbp(pf.starting_capital_gbp * (1 + sm.return_pct_usd / 100))} · ${pct(sm.return_pct_usd)}` : esc(sm.reason), false);

  const eq = pf.evidence_quality, perf = (p) => p ? `<div class="v">${coinIconInline(p.asset)} ${esc(p.asset)}</div><div class="s">${signedGbp(p.pnl_gbp)}</div>` : `<div class="v">—</div><div class="s pf-muted">no trades yet</div>`;
  $("pf-cards").innerHTML = `<div class="pf-stat"><div class="k">All-time profit</div><div class="v">${signedGbp(pf.all_time_profit_gbp)}</div><div class="s">${pct(pf.all_time_profit_pct)}</div></div>
    <div class="pf-stat"><div class="k">Best performer</div>${perf(pf.best_performer)}</div>
    <div class="pf-stat"><div class="k">Worst performer</div>${perf(pf.worst_performer)}</div>
    <div class="pf-stat"><div class="k">Evidence quality</div><div class="v" style="font-size:15px">${esc(eq.closed_trades)} closed trades</div><div class="s" style="color:var(--warn)">${esc(eq.label)}</div></div>`;
  drawHistory();
  drawAllocation(pf.allocation);

  const pts = trend.points, last = pts[pts.length - 1];
  $("trend-meta").innerHTML = `Day ${trend.days_elapsed} · ${gbp(trend.starting_capital_gbp, 0)} invested → ${gbp(last.value_gbp)} ${pct(last.return_pct)}`;
  $("pf-days").innerHTML = pts.map((p) => `<div class="pf-day"><div class="d">Day ${p.day} · ${new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
    <div class="v">${gbp(p.value_gbp)}</div><div class="c">${signedGbp(p.change_from_start_gbp)} ${pct(p.return_pct)}</div></div>`).join("");
  $("trend-note").textContent = trend.note + (trend.missing_days.length ? ` Days with no recording: ${trend.missing_days.join(", ")}.` : "") + " Paper performance only.";

  const rows = pf.holdings.map((h, i) => `<tr class="click" onclick="location.hash='position/${h.trade_id}'"><td>${i + 1}</td>
    <td><span class="coin">${coinIcon(h.asset)} ${esc(h.asset)} <small>${h.direction === "SHORT" ? "short" : ""}</small></span></td>
    <td>${usd(h.price_usd)}</td><td>${h.change_24h_pct == null ? NA : pct(h.change_24h_pct)}</td>
    <td>${gbp(h.value_gbp)}<span class="sub2">${Number(h.units.toPrecision(6))} ${esc(h.asset)}</span></td>
    <td>${usd(h.avg_buy_usd)}</td><td>${signedGbp(h.pnl_gbp)}<span class="sub2">${h.pnl_pct == null ? "" : pct(h.pnl_pct)}</span></td></tr>`).join("");
  $("pf-assets").innerHTML = `<div class="scroll-x"><table class="ptable"><tr><th>#</th><th>Name</th><th>Price</th><th>24h %</th><th>Holdings</th><th>Avg. Buy Price</th><th>Profit/Loss</th></tr>
    ${rows}<tr><td>${pf.holdings.length + 1}</td><td><span class="coin"><i style="background:#3861fb">£</i> Uninvested <small>GBP</small></span></td><td>—</td><td>—</td><td>${gbp(pf.uninvested_gbp)}</td><td>—</td><td>—</td></tr></table></div>`
    + (pf.holdings.length ? "" : `<div class="pf-empty">No open positions — capital is uninvested until the agents find a qualifying opportunity.</div>`);

  const txs = [];
  pf.transactions.forEach((t) => {
    txs.push({ when: t.entry_time, type: t.direction === "LONG" ? "BUY" : "SELL", asset: t.asset, price: t.entry_price_usd, amount: t.units, id: t.id, pnl: null });
    if (t.exit_time) txs.push({ when: t.exit_time, type: t.direction === "LONG" ? "SELL" : "BUY", asset: t.asset, price: t.exit_price_usd, amount: t.units, id: t.id, pnl: t.net_pnl_gbp, reason: t.exit_reason });
  });
  txs.sort((a, b) => Date.parse(b.when) - Date.parse(a.when));
  $("pf-tx").innerHTML = txs.length ? `<div class="scroll-x"><table class="ptable"><tr><th>Type</th><th>Asset</th><th>Price</th><th>Amount</th><th>Realised</th></tr>
    ${txs.slice(0, 20).map((x) => `<tr class="click" onclick="location.hash='position/${x.id}'"><td>${badge(x.type)}<span class="sub2">${when(x.when)}</span></td>
    <td><span class="coin">${coinIcon(x.asset)} ${esc(x.asset)}</span></td><td>${usd(x.price)}</td><td>${Number(x.amount.toPrecision(6))}</td>
    <td>${x.pnl == null ? NA : signedGbp(x.pnl)}${x.reason ? `<span class="sub2">${esc(x.reason)}</span>` : ""}</td></tr>`).join("")}</table></div>`
    : `<div class="pf-empty">No transactions yet.</div>`;

  $("pf-bench").innerHTML = `<table class="ptable"><tr><th>#</th><th>Strategy</th><th>Return</th></tr>
    ${[["Adaptive Quant (AI)", b.ai_strategy_return_pct_gbp, "GBP, net of costs"], ["BTC buy & hold", bh.available ? bh.return_pct_gbp : null, bh.available ? "GBP" : bh.reason],
       ["SMA50 trend bot", sm.available ? sm.return_pct_usd : null, sm.available ? "USD price return" : sm.reason]]
      .sort((x, y) => (y[1] ?? -1e9) - (x[1] ?? -1e9)).map((r, i) => `<tr><td>${r[1] == null ? "—" : i + 1}</td><td>${esc(r[0])}<span class="sub2">${esc(r[2] || "")}</span></td><td>${pct(r[1])}</td></tr>`).join("")}</table>
    <div class="pf-muted small" style="margin-top:10px">${b.period_start ? `Since ${when(b.period_start)} (fixed start). ` : ""}A ranking over a few days or trades is not evidence of skill.</div>`;
}
const coinIconInline = (a) => `<span class="coin">${coinIcon(a)}</span>`;

function drawHistory() {
  const el = $("pf-history");
  const all = PF_SERIES.points.map(([t, v]) => [Date.parse(t), v]).sort((a, b) => a[0] - b[0]);
  const end = all[all.length - 1][0];
  const pts = PF_RANGE ? all.filter((p) => p[0] >= end - PF_RANGE * 864e5) : all;
  if (pts.length < 2) { el.innerHTML = `<div class="pf-empty">Not enough history for this range yet.</div>`; return; }
  const W = Math.max(300, el.clientWidth), H = el.clientHeight || 300, L = 64, R = 12, T = 12, B = 26;
  let lo = Math.min(...pts.map((p) => p[1])), hi = Math.max(...pts.map((p) => p[1]));
  const pad = Math.max((hi - lo) * 0.15, hi * 0.001); lo -= pad; hi += pad;
  const x0 = pts[0][0], x1 = pts[pts.length - 1][0];
  const X = (t) => L + (t - x0) / (x1 - x0 || 1) * (W - L - R), Y = (v) => T + (hi - v) / (hi - lo) * (H - T - B);
  const rising = pts[pts.length - 1][1] >= pts[0][1], col = rising ? css("--up") : css("--down");
  let g = "";
  for (let i = 0; i <= 4; i++) { const v = lo + (hi - lo) * i / 4; g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#eff2f5"/><text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="#58667e">£${Math.round(v).toLocaleString("en-GB")}</text>`; }
  for (let i = 0; i <= 4; i++) { const t = x0 + (x1 - x0) * i / 4; g += `<text x="${X(t)}" y="${H - 6}" text-anchor="middle" font-size="11" fill="#58667e">${new Date(t).toLocaleString("en-GB", PF_RANGE === 1 ? { hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short" })}</text>`; }
  const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join("");
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" id="hsvg"><defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".25"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
    ${g}<path d="${d}L${X(x1)},${H - B}L${X(x0)},${H - B}Z" fill="url(#hg)"/><path d="${d}" fill="none" stroke="${col}" stroke-width="2"/><g id="htip"></g></svg>`;
  const svg = $("hsvg");
  svg.onmousemove = (e) => {
    const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width;
    const t = x0 + (x - L) / (W - L - R) * (x1 - x0);
    const p = pts.reduce((a, b) => (Math.abs(b[0] - t) < Math.abs(a[0] - t) ? b : a));
    const tx = Math.min(X(p[0]) + 10, W - 170);
    $("htip").innerHTML = `<line x1="${X(p[0])}" x2="${X(p[0])}" y1="${T}" y2="${H - B}" stroke="#a6b0c3" stroke-dasharray="3 3"/><circle cx="${X(p[0])}" cy="${Y(p[1])}" r="5" fill="${col}" stroke="#fff" stroke-width="2"/>
      <rect x="${tx}" y="${T + 4}" width="160" height="44" rx="8" fill="#fff" stroke="#eff2f5"/><text x="${tx + 10}" y="${T + 22}" font-size="11" fill="#58667e">${new Date(p[0]).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</text>
      <text x="${tx + 10}" y="${T + 40}" font-size="13" font-weight="700" fill="#0d1421">£${p[1].toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</text>`;
  };
  svg.onmouseleave = () => { $("htip").innerHTML = ""; };
}
document.querySelectorAll("#range button").forEach((b) => b.onclick = () => {
  PF_RANGE = +b.dataset.r;
  document.querySelectorAll("#range button").forEach((x) => x.classList.toggle("on", x === b));
  if (PF_SERIES) drawHistory();
});

function drawAllocation(alloc) {
  const items = alloc.filter((a) => a.value_gbp > 0);
  const total = items.reduce((s, a) => s + a.value_gbp, 0);
  if (!total) { $("pf-alloc").innerHTML = `<div class="pf-empty">No allocation data.</div>`; return; }
  const palette = ["#3861fb", "#16c784", "#f7931a", "#9945ff", "#ea3943", "#c2a633", "#a6b0c3"];
  const colorFor = (a, i) => a.label.startsWith("Uninvested") ? "#a6b0c3" : (COIN[a.label.split(" ")[0]] || palette[i % palette.length]);
  let ang = -Math.PI / 2, arcs = "";
  const cx = 90, cy = 90, r = 80, ri = 54;
  items.forEach((a, i) => {
    const frac = a.value_gbp / total, a2 = ang + frac * Math.PI * 2, large = frac > 0.5 ? 1 : 0, col = colorFor(a, i);
    if (frac >= 0.9999) arcs += `<circle cx="${cx}" cy="${cy}" r="${(r + ri) / 2}" fill="none" stroke="${col}" stroke-width="${r - ri}"/>`;
    else {
      const p = (rad, ang2) => `${cx + rad * Math.cos(ang2)},${cy + rad * Math.sin(ang2)}`;
      arcs += `<path d="M${p(r, ang)} A${r},${r} 0 ${large} 1 ${p(r, a2)} L${p(ri, a2)} A${ri},${ri} 0 ${large} 0 ${p(ri, ang)} Z" fill="${col}"/>`;
    }
    ang = a2;
  });
  $("pf-alloc").innerHTML = `<div class="alloc"><svg viewBox="0 0 180 180">${arcs}<text x="90" y="86" text-anchor="middle" font-size="11" fill="#58667e">Total</text>
    <text x="90" y="104" text-anchor="middle" font-size="14" font-weight="700" fill="#0d1421">£${Math.round(total).toLocaleString("en-GB")}</text></svg>
    <div class="alloc-legend">${items.map((a, i) => `<div><span><i style="background:${colorFor(a, i)}"></i>${esc(a.label)}</span><b>${(a.value_gbp / total * 100).toFixed(1)}%</b></div>`).join("")}</div></div>`;
}

// ============================ RESEARCH / DETAIL PAGES ============================
async function loadResearch() {
  const list = await api("/api/investigations?limit=60");
  $("investigation-list").innerHTML = list.length ? invTable(list) : empty("No investigations yet. Use Run Investigation on the Trade page.");
}
function conditions(list) {
  if (!list || !list.length) return '<span class="muted">None stated</span>';
  return `<ul class="tight">${list.map((c) => `<li>${esc(c.description)} <span class="mono">[${esc(c.metric)} ${esc(c.operator)} ${fval(c.threshold)}]</span></li>`).join("")}</ul>`;
}
function memoryBlock(mem, dir) {
  const m = mem && mem[dir];
  if (!m) return "";
  return `<h3 class="sec">Experience memory · ${esc(dir)}</h3><p>${esc(m.summary.note)}</p>${m.matches.length ? `<table><tr><th>Past trade</th><th>Distance</th><th>R</th><th>Outcome</th><th>Lesson</th></tr>
    ${m.matches.map((x) => `<tr class="click" onclick="location.hash='position/${x.trade_id}'"><td>${esc(x.asset)} ${when(x.entry_time)}</td><td>${num(x.similarity_distance)}</td><td>${num(x.r_multiple)}</td>
    <td>${badge(x.exit_reason)} ${esc(x.failure_category || "win")}</td><td class="muted">${esc((x.lesson || "").slice(0, 120))}</td></tr>`).join("")}</table>` : ""}`;
}
function renderInvestigation(inv) {
  if (inv.status === "data_unavailable") {
    return `<div class="card"><div class="step bad"><div class="step-title"><span class="who">${esc(inv.asset)} · ${when(inv.created_at)}</span>${badge("NO_TRADE")}</div>
      <p>${esc(inv.final_reason)}</p><p class="muted">No analysis was performed because real market data could not be obtained. Nothing was simulated.</p></div></div>`;
  }
  const sc = inv.scout_output_json || {}, ch = inv.challenge || {}, da = ch.devils_advocate_output_json || {};
  const rk = inv.risk || {}, pos = rk.position_json, obs = inv.observation || {}, reg = sc.market_regime || {};
  const mem = inv.memory_json || {}, ce = mem.cost_estimation || {};
  const ev = (inv.evidence_json || []).map((e) => `<tr><td class="mono">${esc(e.key)}</td><td>${esc(fval(e.value))}</td><td class="muted">${esc(e.description)}</td></tr>`).join("");
  const daClass = da.verdict === "APPROVE" ? "ok" : da.verdict === "VETO" ? "bad" : "warn";
  const findings = (da.findings || []).map((f) => `<li>${badge(f.severity)} <b>${esc(f.check)}</b> <span class="muted">(${esc(f.category.replaceAll("_", " "))})</span>: ${esc(f.claim)}${f.evidence_keys.length ? ` <span class="mono">[${esc(f.evidence_keys.join(", "))}]</span>` : ""}</li>`).join("");
  const noProposal = inv.proposed_action === "NO_TRADE";
  return `<div class="card"><div class="panel-head"><h2>${esc(inv.asset)}/USD investigation · ${when(inv.created_at)}</h2><span>${badge(inv.final_decision)} <a href="#trade/${esc(inv.asset)}">open chart →</a></span></div>
  <div class="chain">
    <div class="step"><div class="step-title"><span class="who">1 · Observation — what was known at time T</span><span class="mono">${esc(obs.data_source)} · last closed 1h candle ${when(obs.last_closed_candle_at)}</span></div>
      <dl class="kv"><dt>Spot</dt><dd>${usd(obs.price_usd)} <span class="muted">(${when(obs.price_timestamp)})</span></dd>
      <dt>GBP/USD</dt><dd>${obs.fx_usd_per_gbp ? num(obs.fx_usd_per_gbp, 4) + ` <span class="muted">${esc(obs.fx_source)}</span>` : "Data unavailable"}</dd>
      <dt>Regime</dt><dd>${esc(reg.label)} <span class="muted">(BTC ${esc(reg.btc_trend)}, ${esc(reg.breadth_up_24h)}/${esc(reg.assets_observed)} up 24h)</span></dd>
      <dt>News</dt><dd>${esc((sc.news_status || {}).reason || "—")}</dd></dl>
      <details style="margin-top:8px"><summary>Evidence (deterministic features)</summary><div class="scroll"><table>${ev}</table></div></details></div>
    <div class="step"><div class="step-title"><span class="who">2 · Market Intelligence Scout</span><span>${badge(inv.proposed_action)} <span class="mono">${esc(inv.scout_engine)}</span></span></div>
      <h3 class="sec">What is happening</h3><p>${esc(sc.what_is_happening)}</p>
      <h3 class="sec">Why might it be happening</h3><ul class="tight">${(sc.possible_explanations || []).map((e) => `<li><b>${esc(e.category.replaceAll("_", " "))}</b> <span class="muted">(${esc(e.plausibility)})</span>: ${esc(e.explanation)}</li>`).join("")}</ul>
      <h3 class="sec">Thesis</h3><p>${esc(sc.thesis)}</p>
      <div class="grid2"><div><h3 class="sec">Would confirm</h3>${conditions(sc.confirmation_conditions)}</div><div><h3 class="sec">Would invalidate</h3>${conditions(sc.invalidation_conditions)}</div></div>
      <dl class="kv"><dt>Horizon</dt><dd>${esc(sc.horizon_hours)}h</dd><dt>Research Confidence</dt><dd>${esc(sc.research_confidence)}/5 <span class="muted">ordinal evidence agreement — not a probability</span></dd>
      <dt>Rationale</dt><dd>${esc(sc.rationale)}</dd></dl>
      ${(sc.rejected_alternatives || []).length ? `<h3 class="sec">Alternatives rejected</h3><ul class="tight">${sc.rejected_alternatives.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
      ${memoryBlock(mem, noProposal ? "LONG" : inv.proposed_action)}
      ${(sc.validation_notes || []).length ? `<div class="callout">Validation: ${esc(sc.validation_notes.join(" · "))}</div>` : ""}</div>
    <div class="step ${da.verdict === "NOT_REQUIRED" ? "" : daClass}"><div class="step-title"><span class="who">3 · Devil's Advocate</span><span>${badge(da.verdict || ch.decision)} <span class="mono">${esc(da.engine)}</span></span></div>
      <p>${esc(da.summary)}</p>${findings ? `<ul class="tight">${findings}</ul>` : ""}
      ${(da.alternative_explanations || []).length ? `<h3 class="sec">Alternative explanations</h3><ul class="tight">${da.alternative_explanations.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      ${da.what_would_change_verdict ? `<p class="muted">What would change the verdict: ${esc(da.what_would_change_verdict)}</p>` : ""}
      ${(da.validation_notes || []).length ? `<div class="callout">${esc(da.validation_notes.join(" · "))}</div>` : ""}</div>
    <div class="step ${rk.approved ? "ok" : noProposal ? "" : "bad"}"><div class="step-title"><span class="who">4 · Risk Engine (deterministic)</span>${badge(rk.approved ? "APPROVE" : noProposal ? "NO_PROPOSAL" : "VETO")}</div>
      <table>${(rk.checks_json || []).map((c) => `<tr><td>${c.passed ? '<span class="up">✓</span>' : '<span class="down">✗</span>'}</td><td class="mono">${esc(c.name)}</td><td class="muted">${esc(c.detail)}</td></tr>`).join("")}</table>
      ${pos ? `<dl class="kv" style="margin-top:10px"><dt>Entry</dt><dd>${usd(pos.entry_price_usd)}</dd><dt>Stop</dt><dd>${usd(pos.stop_price_usd)} (${pos.stop_atr_multiple} ATR)</dd>
        <dt>Target</dt><dd>${usd(pos.target_price_usd)} (${pos.target_atr_multiple} ATR)</dd><dt>Size</dt><dd>${num(pos.units, 6)} units · ${gbp(pos.notional_gbp)}${pos.capped_by_exposure ? " (capped by exposure)" : ""}</dd>
        <dt>Planned risk</dt><dd>${gbp(pos.risk_gbp)} (${num(pos.risk_pct_of_equity)}% of equity, incl. est. costs)</dd><dt>Net R:R</dt><dd>${num(pos.net_reward_risk)} (gross ${num(pos.gross_reward_risk)})</dd></dl>` : ""}
      ${ce.costs ? `<h3 class="sec">Execution cost estimate</h3><dl class="kv"><dt>Fee</dt><dd>${esc(ce.costs.fee_bps_per_side)} bps/side</dd><dt>Slippage</dt><dd>${num(ce.costs.slippage_bps_per_side)} bps/side <span class="muted">${esc(ce.costs.slippage_source)}</span></dd>
        <dt>Funding</dt><dd>${num(ce.costs.funding_bps_per_day)} bps/day <span class="muted">${esc(ce.costs.funding_source)}</span></dd>
        ${ce.order_book_error ? `<dt>Order book</dt><dd class="muted">${esc(ce.order_book_error.slice(0, 160))}</dd>` : ""}</dl>` : ""}</div>
    <div class="step ${inv.final_decision === "TRADE" ? "ok" : ""}"><div class="step-title"><span class="who">5 · Decision</span>${badge(inv.final_decision)}</div>
      <p>${esc(inv.final_reason)}</p>${inv.trade ? `<a href="#position/${inv.trade.id}">View paper trade →</a>` : ""}</div>
  </div></div>`;
}
async function loadInvestigationDetail(id) {
  try { $("investigation-detail").innerHTML = `<a class="back" href="#research">← Investigations</a>` + renderInvestigation(await api(`/api/investigations/${id}`)); }
  catch (e) { $("investigation-detail").innerHTML = empty(e.message); }
}

function chartSvg(c) {
  const pts = [...(c.before_1h || []).slice(-24).map((x) => [Date.parse(x.open_time) + 3600e3, x.close]),
               ...(c.after_5m || []).map((x) => [Date.parse(x.open_time) + 300e3, x.close])].sort((a, b) => a[0] - b[0]);
  if (pts.length < 2) return empty(c.live_error || "Price path not yet available (no closed candles since entry).");
  const ys = pts.map((p) => p[1]).concat([c.entry, c.stop, c.target, c.exit].filter((v) => v != null));
  const x0 = pts[0][0], x1 = Math.max(pts[pts.length - 1][0], c.exit_time ? Date.parse(c.exit_time) : 0);
  const y0 = Math.min(...ys), y1 = Math.max(...ys), W = 900, H = 300, P = 40, R = 80;
  const X = (t) => P + (t - x0) / (x1 - x0 || 1) * (W - P - R), Y = (v) => H - P / 2 - (v - y0) / (y1 - y0 || 1) * (H - P);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join("");
  const hline = (v, col, dash) => `<line x1="${P}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${col}" stroke-dasharray="${dash}" stroke-width="1.3"/><text x="${W - R + 4}" y="${Y(v) + 4}" font-size="10" fill="${col}">${fmtPx(v)}</text>`;
  const et = Date.parse(c.entry_time), up = css("--up"), dn = css("--down"), ac = css("--accent-strong"), mu = css("--muted"), tx = css("--text");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Price with entry, stop, target and exit">
    <path d="${path}" fill="none" stroke="${tx}" stroke-width="1.4"/>${hline(c.entry, ac, "4 3")}${hline(c.stop, dn, "6 3")}${hline(c.target, up, "6 3")}
    <line x1="${X(et)}" x2="${X(et)}" y1="10" y2="${H - 10}" stroke="${mu}" stroke-dasharray="2 3"/><text x="${X(et) + 4}" y="${H - 14}" font-size="10" fill="${mu}">entry</text>
    ${c.exit != null ? `<circle cx="${X(Date.parse(c.exit_time))}" cy="${Y(c.exit)}" r="5" fill="${ac}"/>` : ""}</svg>
    <div class="legend"><span><i style="background:${tx}"></i>Close (24h before entry at 1h, then 5m)</span><span><i style="background:${ac}"></i>Entry</span><span><i style="background:${dn}"></i>Stop</span><span><i style="background:${up}"></i>Target</span>${c.exit != null ? "<span>● Exit</span>" : ""}</div>`;
}

async function loadPosition(id) {
  const el = $("trade-detail");
  el.innerHTML = empty("Loading…");
  let t;
  try { t = await api(`/api/trades/${id}`); } catch (e) { el.innerHTML = empty(e.message); return; }
  const o = t.outcome, inv = t.investigation || {}, da = (inv.challenge || {}).devils_advocate_output_json || {};
  const l = t.lessons[0], d = (o && o.evaluation_json) || {}, costs = t.costs_json || {};
  el.innerHTML = `<a class="back" href="#trade/${esc(t.asset)}">← ${esc(t.asset)}/USD</a>
  <div class="card"><div class="panel-head"><h2>${esc(t.asset)}/USD ${badge(t.direction === "LONG" ? "BUY" : "SELL")} · ${when(t.entry_time)}</h2>
    <span>${badge(t.status)} ${t.status === "OPEN" ? '<button class="btn-ghost" id="close-btn">Close at market</button>' : ""}</span></div>
    <h3 class="sec">Why did we enter?</h3><p>${esc(t.thesis)}</p><p class="muted">${esc(t.entry_reason)}</p>
    <dl class="kv"><dt>Research Confidence</dt><dd>${esc(t.research_confidence)}/5 (not a probability)</dd>
    <dt>Agents</dt><dd>${(t.agents_json || []).map((a) => `${esc(a.agent)} <span class="muted">(${esc(a.engine)})</span>`).join(" · ")}</dd>
    <dt>Rejected</dt><dd>${esc((t.rejected_alternatives_json || []).join(" · "))}</dd></dl>
    <h3 class="sec">What did we know at the time?</h3><p>${esc(inv.situation_summary)}</p>
    <div class="scroll"><table>${(t.evidence_json || []).map((e) => `<tr><td class="mono">${esc(e.key)}</td><td>${esc(fval(e.value))}</td><td class="muted">${esc(e.description)}</td></tr>`).join("")}</table></div>
    <p class="muted small">Observation ${when((inv.observation || {}).observed_at)} from ${esc((inv.observation || {}).data_source)}; last closed candle ${when((inv.observation || {}).last_closed_candle_at)}.</p>
    ${memoryBlock(inv.memory_json, t.direction)}
    <h3 class="sec">What did the Devil's Advocate say?</h3><p>${badge(t.devils_advocate_verdict)} ${esc(da.summary || t.devils_advocate_summary)}</p>
    <ul class="tight">${(da.findings || []).map((f) => `<li>${badge(f.severity)} ${esc(f.claim)}</li>`).join("")}</ul>
    <h3 class="sec">What did the risk engine allow?</h3>
    <dl class="kv"><dt>Entry</dt><dd>${usd(t.entry_price_usd)} <span class="muted">GBP/USD ${num(t.fx_entry_usd_per_gbp, 4)}</span></dd><dt>Stop</dt><dd>${usd(t.stop_price_usd)}</dd><dt>Target</dt><dd>${usd(t.target_price_usd)}</dd>
    <dt>Position</dt><dd>${num(t.units, 6)} units · ${gbp(t.notional_gbp)}</dd><dt>Planned risk</dt><dd>${gbp(t.risk_gbp)} · reward ${gbp(t.planned_reward_gbp)} · net R:R ${num(t.reward_risk)}</dd>
    <dt>Costs</dt><dd>${costs.fee_bps_per_side ?? "—"} bps fee · ${num(costs.slippage_bps_per_side) ?? "—"} bps slippage <span class="muted">(${esc(costs.slippage_source || "flat")})</span>${t.direction === "SHORT" ? ` · funding ${num(costs.funding_bps_per_day)} bps/day <span class="muted">(${esc(costs.funding_source)})</span>` : ""}</dd>
    <dt>Horizon</dt><dd>${esc(t.horizon_hours)}h (expires ${when(t.expires_at)})</dd></dl>
    <h3 class="sec">What happened?</h3><div id="trade-chart">${empty("Loading chart…")}</div>
    ${o ? `<dl class="kv" style="margin-top:10px"><dt>Exit</dt><dd>${usd(o.exit_price_usd)} · ${badge(o.exit_reason)} · ${when(o.exit_time)}</dd>
      <dt>Gross P/L</dt><dd>${signedGbp(o.gross_pnl_gbp)}</dd><dt>Est. fees</dt><dd>${gbp(o.fees_gbp)}</dd><dt>Est. slippage</dt><dd>${gbp(o.estimated_slippage_gbp)}</dd>
      ${o.funding_gbp ? `<dt>Est. funding</dt><dd>${gbp(o.funding_gbp)}</dd>` : ""}
      <dt>Net P/L</dt><dd>${signedGbp(o.net_pnl_gbp)} (${num(o.r_multiple)}R)</dd><dt>MFE / MAE</dt><dd>${pct(o.mfe_pct)} / ${pct(o.mae_pct)}</dd>
      <dt>Thesis correct</dt><dd>${badge(o.thesis_correct || "—")}</dd><dt>Reason matched</dt><dd>${esc(o.reason_matched_thesis)}</dd></dl>`
      : `<p class="muted">Position open. Last checked ${when(t.last_checked_at)}; best ${usd(t.max_favourable_price_usd)}, worst ${usd(t.max_adverse_price_usd)}.</p>`}
    <h3 class="sec">What did we learn?</h3>
    ${l ? `<dl class="kv"><dt>Direction correct</dt><dd>${l.prediction_correct ? "Yes" : "No"}</dd><dt>Timing</dt><dd>${esc(l.timing_assessment)}</dd>
      <dt>Risk management</dt><dd>${esc(l.risk_assessment)}</dd><dt>Failure category</dt><dd>${esc(l.failure_category || "n/a (win)")}</dd>
      <dt>DA anticipated</dt><dd>${l.devils_advocate_anticipated ? "Yes — " + esc((d.anticipated_findings || []).map((f) => f.check).join(", ")) : "No"}</dd>
      <dt>Observed</dt><dd>${esc(l.observed_error)}</dd><dt>Possible cause</dt><dd>${esc(l.possible_cause)}</dd>
      <dt>Lesson</dt><dd><b>${esc(l.lesson)}</b></dd><dt>Status</dt><dd>${badge(l.validation_status)} confidence ${esc(l.confidence)} · ${esc((l.review_json || {}).similar_observations)} of ${esc((l.review_json || {}).needed_for_review)} similar observations</dd></dl>
      ${(l.review_json || {}).llm_narrative ? `<div class="callout">${esc(l.review_json.llm_narrative.narrative)}</div>` : ""}`
      : empty(o ? "Review pending." : "Post-trade review is generated when the position closes.")}
  </div>`;
  if ($("close-btn")) $("close-btn").onclick = async () => {
    $("close-btn").disabled = true;
    try { await api(`/api/trades/${id}/close`, { method: "POST" }); loadPosition(id); } catch (e) { alert(e.message); $("close-btn").disabled = false; }
  };
  try { $("trade-chart").innerHTML = chartSvg(await api(`/api/trades/${id}/chart`)); }
  catch (e) { $("trade-chart").innerHTML = empty("Data unavailable: " + e.message); }
}

async function loadLessons() {
  const [sum, ls] = await Promise.all([api("/api/lessons/summary"), api("/api/lessons")]);
  $("lesson-policy").textContent = sum.policy;
  $("lesson-summary").innerHTML = sum.groups.length ? `<table><tr><th>Hypothesis</th><th>Outcome</th><th>Observations</th><th>DA anticipated</th><th>Status</th></tr>
    ${sum.groups.map((g) => `<tr><td class="mono">${esc(g.hypothesis_tag)}</td><td>${esc(g.outcome_category)}</td><td>${g.n} / ${g.needed}</td><td>${g.da_anticipated || 0}</td><td>${badge(g.status)}</td></tr>`).join("")}</table>`
    : empty("No lessons yet — lessons are created only from closed paper trades.");
  $("lessons").innerHTML = ls.map((l) => `<div class="msg"><div class="avatar">LN</div><div>
    <div>${badge(l.validation_status)} <a href="#position/${l.trade_id}">${esc(l.asset)} ${esc(l.direction)}</a> · ${esc(l.failure_category || "win")} <span class="muted">${when(l.created_at)}</span></div>
    <div>${esc(l.observed_error)}<br><b>${esc(l.lesson)}</b><br><span class="muted">${esc(l.timing_assessment)}</span></div></div></div>`).join("");
}

async function loadSystem() {
  const s = await loadStatus();
  if (s) {
    $("providers").innerHTML = `<table><tr><th>Source</th><th>Status</th><th>Last success</th><th>Last error</th></tr>
      ${s.providers.map((p) => `<tr><td>${esc(p.name)}</td><td>${p.ok ? '<span class="up">● ok</span>' : p.ok === false ? '<span class="down">● unavailable</span>' : '<span class="muted">○ not yet used</span>'}</td>
      <td>${when(p.last_success)}</td><td class="muted">${esc((p.last_error || "").slice(0, 200))}</td></tr>`).join("")}</table>
      <p class="muted small">Active universe: ${esc(Object.keys(s.universe.active).join(", ") || "none")}. ${Object.keys(s.universe.removed).length ? "Removed: " + esc(Object.entries(s.universe.removed).map(([a, r]) => `${a} (${r})`).join(", ")) : ""}</p>
      <p class="muted small">News: ${esc(s.news.reason)}<br>Social: ${esc(s.social.reason)}</p>`;
    $("monitor-meta").innerHTML = `<dl class="kv"><dt>Scheduler</dt><dd>${s.monitor.enabled ? '<span class="up">running</span>' : "disabled"}</dd><dt>Interval</dt><dd>${s.monitor.interval_minutes} min</dd>
      <dt>Next run</dt><dd>${when(s.monitor.next_run)}</dd><dt>Agents</dt><dd>${esc(s.llm.engine)}${s.llm.note ? `<br><span class="muted small">${esc(s.llm.note)}</span>` : ""}</dd></dl>`;
  }
  const [runs, ov] = await Promise.all([api("/api/monitor/runs"), api("/api/overview")]);
  const rc = ov.risk_config;
  $("risk-config").innerHTML = `<dl class="kv"><dt>Max risk per trade</dt><dd>${rc.max_risk_per_trade_pct}% of equity (${gbp(ov.state.equity_gbp * rc.max_risk_per_trade_pct / 100)}), incl. est. costs</dd>
    <dt>Max open positions</dt><dd>${rc.max_open_positions}</dd><dt>Max exposure</dt><dd>${rc.max_portfolio_exposure_pct}%</dd>
    <dt>Min reward/risk</dt><dd>${rc.min_reward_risk} : 1 net of costs (experiment parameter, not optimal)</dd><dt>Daily loss limit</dt><dd>${rc.daily_loss_limit_pct}% → no new trades</dd>
    <dt>Costs</dt><dd>${rc.fee_bps_per_side} bps fee/side · slippage from live order book (fallback ${rc.slippage_bps_per_side} bps) · short funding from perp rate</dd>
    <dt>Shorts</dt><dd>${rc.allow_short ? "allowed (paper)" : "disabled"}</dd></dl>`;
  $("monitor-runs").innerHTML = runs.length ? `<div class="scroll"><table><tr><th>Started</th><th>Status</th><th>Triggers</th><th>Investigations</th><th>Closed</th><th>Errors</th></tr>
    ${runs.map((r) => `<tr><td>${when(r.started_at)}</td><td>${esc(r.status)}</td><td>${esc(Object.keys(r.triggers_json || {}).join(", ") || "none")}</td>
    <td>${(r.investigations_json || []).map((i) => `<a href="#investigation/${i.id}">${esc(i.asset)}: ${esc(i.decision)}</a>`).join(", ") || "none"}</td>
    <td>${(r.positions_closed_json || []).length}</td><td class="muted">${esc((r.errors_json || []).join("; ").slice(0, 200))}</td></tr>`).join("")}</table></div>` : empty("No monitor runs yet.");
}
$("monitor-btn").addEventListener("click", async () => {
  $("monitor-btn").disabled = true;
  try { await api("/api/monitor/run", { method: "POST" }); } catch (e) { alert(e.message); }
  $("monitor-btn").disabled = false;
  loadSystem();
});

// ---- boot / refresh --------------------------------------------------------------
let rT = null;
window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => {
  const v = (location.hash.slice(1) || "trade").split("/")[0];
  if (v === "trade") loadMarket(); if (v === "portfolio" && PF_SERIES) drawHistory();
}, 200); });
loadStatus().then(route);
setInterval(() => {
  const v = (location.hash.slice(1) || "trade").split("/")[0];
  if (v === "trade") { loadOrderBook(); loadMarkets(); }
  loadStatus();
}, 15000);
setInterval(() => {
  const v = (location.hash.slice(1) || "trade").split("/")[0];
  if (v === "trade") { loadMarket(); loadBottom(); loadActivity(); }
  if (v === "portfolio") loadPortfolio();
}, 60000);

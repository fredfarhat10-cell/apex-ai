import { addDays, todayKey } from "./dates";
import { allAreaScores, finalizeOutcomes } from "./scoring";
import { TEMPLATE_BY_ID } from "./templates";
import type { AppState, AreaId, DateKey, Kind, Outcome, Protocol } from "./types";
import { AREA_IDS, AREA_NAMES, MAX_ACTIVE_PER_AREA } from "./types";

export const STORAGE_KEY = "setpoint.state.v1";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function emptyState(): AppState {
  return {
    version: 1,
    areas: AREA_IDS.map((id, i) => ({ id, name: AREA_NAMES[id], order: i })),
    protocols: [],
    checks: {},
    entries: {},
    slips: [],
    proof: [],
    statements: [],
    statementsReadOn: [],
    parked: [],
    weeklyMoves: [],
    weeklyMoveChecks: {},
    reviews: {},
    setupTasks: [],
    settings: { morningTime: "07:30", eveningTime: "20:00" },
  };
}

export function parseState(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.version !== 1) return null;
    // Fill any fields added after the data was written.
    return { ...emptyState(), ...parsed } as AppState;
  } catch {
    return null;
  }
}

export function isOnboarded(s: AppState): boolean {
  return Boolean(s.profile?.completedAt);
}

export function isShrunk(s: AppState, areaId: AreaId, today: DateKey): boolean {
  const until = s.areas.find((a) => a.id === areaId)?.shrunkUntil;
  return Boolean(until && until >= today);
}

// ---------- Mutations (operate on a draft copy) ----------

/** Set or clear an explicit outcome. If the day is already logged, its scores are recomputed. */
export function setCheck(s: AppState, date: DateKey, protocolId: string, outcome: Outcome | undefined) {
  const day = { ...(s.checks[date] ?? {}) };
  const logged = Boolean(s.entries[date]);
  const p = s.protocols.find((x) => x.id === protocolId);
  if (outcome === undefined) {
    if (logged && p) day[protocolId] = p.kind === "trigger" ? "didNotFire" : "missed";
    else delete day[protocolId];
  } else {
    day[protocolId] = outcome;
  }
  s.checks[date] = day;
  if (logged) recomputeEntry(s, date);
}

export function allRulesKept(s: AppState, date: DateKey, areaId: AreaId) {
  for (const p of s.protocols) {
    if (p.isActive && p.areaId === areaId && p.kind === "rule") setCheck(s, date, p.id, "kept");
  }
}

function recomputeEntry(s: AppState, date: DateKey) {
  const e = s.entries[date];
  if (!e) return;
  s.entries[date] = { ...e, scores: allAreaScores(s.protocols, s.checks[date] ?? {}) };
}

export function saveEveningLog(s: AppState, date: DateKey, proofText: string, tomorrowFirstMove: string) {
  const final = finalizeOutcomes(s.protocols, s.checks[date] ?? {});
  s.checks[date] = final;
  const prev = s.entries[date];
  s.entries[date] = {
    date,
    scores: allAreaScores(s.protocols, final),
    proofText: proofText.trim(),
    tomorrowFirstMove: tomorrowFirstMove.trim(),
    loggedAt: new Date().toISOString(),
  };
  const text = proofText.trim();
  if (text && text !== prev?.proofText) {
    s.proof.push({ id: uid(), date, text, source: "daily" });
  }
}

export function activeCount(s: AppState, areaId: AreaId): number {
  return s.protocols.filter((p) => p.isActive && p.areaId === areaId).length;
}

export function addProtocol(
  s: AppState,
  input: { areaId: AreaId; kind: Kind; title: string; minimumVersion: string; templateId?: string; levelUpIdea?: string },
): boolean {
  if (activeCount(s, input.areaId) >= MAX_ACTIVE_PER_AREA) return false;
  const order = Math.max(-1, ...s.protocols.filter((p) => p.areaId === input.areaId).map((p) => p.order)) + 1;
  const tpl = input.templateId ? TEMPLATE_BY_ID[input.templateId] : undefined;
  s.protocols.push({
    id: uid(),
    level: 1,
    isActive: true,
    order,
    ...input,
    levelUpIdea: input.levelUpIdea ?? tpl?.levelUpIdea,
    auto: input.templateId === "mind.eveninglog" ? "eveningLog" : undefined,
  });
  return true;
}

export function updateProtocol(s: AppState, id: string, patch: Partial<Protocol>) {
  s.protocols = s.protocols.map((p) => (p.id === id ? { ...p, ...patch } : p));
}

export function moveProtocol(s: AppState, id: string, dir: -1 | 1) {
  const p = s.protocols.find((x) => x.id === id);
  if (!p) return;
  const list = s.protocols.filter((x) => x.areaId === p.areaId && x.isActive).sort((a, b) => a.order - b.order);
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  list.forEach((x, k) => updateProtocol(s, x.id, { order: k }));
}

export function levelUp(s: AppState, id: string, patch: { title: string; minimumVersion: string }) {
  const p = s.protocols.find((x) => x.id === id);
  if (!p) return;
  updateProtocol(s, id, { ...patch, level: p.level + 1 });
}

export function shrinkArea(s: AppState, areaId: AreaId, today: DateKey, days = 7) {
  s.areas = s.areas.map((a) => (a.id === areaId ? { ...a, shrunkUntil: addDays(today, days - 1) } : a));
}

export function endShrink(s: AppState, areaId: AreaId) {
  s.areas = s.areas.map((a) => (a.id === areaId ? { ...a, shrunkUntil: undefined } : a));
}

export function ackStatements(s: AppState, date = todayKey()) {
  if (!s.statementsReadOn.includes(date)) s.statementsReadOn = [...s.statementsReadOn.slice(-60), date];
}

export function parkIdea(s: AppState, text: string, now = new Date()) {
  const unlocks = new Date(now.getTime() + 7 * 86_400_000);
  s.parked.push({ id: uid(), text: text.trim(), createdAt: now.toISOString(), unlocksAt: unlocks.toISOString() });
}

export function moveInList<T extends { id: string; order: number }>(list: T[], id: string, dir: -1 | 1): T[] {
  const sorted = [...list].sort((a, b) => a.order - b.order);
  const i = sorted.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= sorted.length) return list;
  [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
  return sorted.map((x, k) => ({ ...x, order: k }));
}

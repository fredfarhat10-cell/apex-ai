import { addDays, weekDays } from "./dates";
import type { AppState, AreaId, DailyEntry, DateKey, Outcome, Protocol } from "./types";
import { AREA_IDS } from "./types";

export const round1 = (n: number) => Math.round(n * 10) / 10;

export function activeProtocols(protocols: Protocol[], areaId?: AreaId): Protocol[] {
  return protocols
    .filter((p) => p.isActive && (!areaId || p.areaId === areaId))
    .sort((a, b) => a.order - b.order);
}

/**
 * Final outcomes recorded when the evening log is saved:
 * - Rule/Daily: kept only if tapped, otherwise missed. Never didNotFire.
 * - Trigger: whatever the user set; untouched stays didNotFire.
 * - The Evening log Daily is kept.
 */
export function finalizeOutcomes(protocols: Protocol[], explicit: Record<string, Outcome>): Record<string, Outcome> {
  const out: Record<string, Outcome> = {};
  for (const p of protocols) {
    if (!p.isActive) continue;
    const chosen = explicit[p.id];
    if (p.auto === "eveningLog") out[p.id] = "kept";
    else if (p.kind === "trigger") out[p.id] = chosen ?? "didNotFire";
    else out[p.id] = chosen === "kept" ? "kept" : "missed";
  }
  return out;
}

/** score = applicable == 0 ? null : round(10 * kept / applicable, 1) */
export function areaScore(protocols: Protocol[], outcomes: Record<string, Outcome>, areaId: AreaId): number | null {
  let kept = 0;
  let applicable = 0;
  for (const p of protocols) {
    if (p.areaId !== areaId) continue;
    const o = outcomes[p.id];
    if (!o || o === "didNotFire") continue;
    applicable++;
    if (o === "kept") kept++;
  }
  return applicable === 0 ? null : round1((10 * kept) / applicable);
}

export function allAreaScores(protocols: Protocol[], outcomes: Record<string, Outcome>): Record<AreaId, number | null> {
  return Object.fromEntries(AREA_IDS.map((a) => [a, areaScore(protocols, outcomes, a)])) as Record<AreaId, number | null>;
}

/**
 * Live progress on Today: kept / applicable so far.
 * Rules and Dailies always count (an untapped one will become a miss); Triggers count once fired.
 */
export function liveProgress(protocols: Protocol[], explicit: Record<string, Outcome>, areaId: AreaId) {
  let kept = 0;
  let applicable = 0;
  for (const p of activeProtocols(protocols, areaId)) {
    const o = explicit[p.id];
    if (p.kind === "trigger") {
      if (o === "kept" || o === "missed") applicable++;
      if (o === "kept") kept++;
    } else {
      applicable++;
      if (o === "kept") kept++;
    }
  }
  return { kept, applicable };
}

/**
 * Never-miss-twice: the first (by area order, then protocol order) Rule or Daily that was
 * `missed` on each of the two previous calendar days.
 */
export function neverMissTwice(state: AppState, today: DateKey): Protocol | null {
  const d1 = addDays(today, -1);
  const d2 = addDays(today, -2);
  const c1 = state.checks[d1];
  const c2 = state.checks[d2];
  if (!c1 || !c2 || !state.entries[d1] || !state.entries[d2]) return null;
  const areaOrder = [...state.areas].sort((a, b) => a.order - b.order).map((a) => a.id);
  for (const areaId of areaOrder) {
    for (const p of activeProtocols(state.protocols, areaId)) {
      if (p.kind === "trigger" || p.auto) continue;
      if (c1[p.id] === "missed" && c2[p.id] === "missed") return p;
    }
  }
  return null;
}

export interface WeekAreaStats {
  average: number | null;
  /** Raw mean regardless of the 4-day rule (used for bad-week / level-up checks). */
  rawAverage: number | null;
  floor: number | null;
  floorDay: DateKey | null;
  loggedDays: number;
}

export const MIN_DAYS_FOR_AVERAGE = 4;

export function weekAreaStats(entries: Record<DateKey, DailyEntry>, start: DateKey, areaId: AreaId): WeekAreaStats {
  const scores: { day: DateKey; s: number }[] = [];
  for (const day of weekDays(start)) {
    const s = entries[day]?.scores[areaId];
    if (s !== null && s !== undefined) scores.push({ day, s });
  }
  const loggedDays = scores.length;
  if (loggedDays === 0) return { average: null, rawAverage: null, floor: null, floorDay: null, loggedDays };
  const rawAverage = round1(scores.reduce((a, b) => a + b.s, 0) / loggedDays);
  const min = scores.reduce((a, b) => (b.s < a.s ? b : a));
  return {
    average: loggedDays >= MIN_DAYS_FOR_AVERAGE ? rawAverage : null,
    rawAverage,
    floor: min.s,
    floorDay: min.day,
    loggedDays,
  };
}

/** Level-up: average >= 8.0 with >= 5 logged days for 3 consecutive weeks ending at `start`. */
export function qualifiesForLevelUp(entries: Record<DateKey, DailyEntry>, start: DateKey, areaId: AreaId): boolean {
  for (let i = 0; i < 3; i++) {
    const s = weekAreaStats(entries, addDays(start, -7 * i), areaId);
    if (s.loggedDays < 5 || s.rawAverage === null || s.rawAverage < 8.0) return false;
  }
  return true;
}

/** Bad week: average under 5.0 with 3+ logged days, or 2 or fewer logged days. */
export function isBadWeek(entries: Record<DateKey, DailyEntry>, start: DateKey, areaId: AreaId): boolean {
  const s = weekAreaStats(entries, start, areaId);
  if (s.loggedDays <= 2) return true;
  return s.rawAverage !== null && s.rawAverage < 5.0;
}

/** Floor trend headline across the given week starts (oldest first), e.g. "Body floor: 3.0 to 5.0 over 4 weeks." */
export function floorTrend(
  entries: Record<DateKey, DailyEntry>,
  starts: DateKey[],
  areaId: AreaId,
): { from: number; to: number; weeks: number } | null {
  const floors = starts
    .map((w) => weekAreaStats(entries, w, areaId).floor)
    .map((f, i) => ({ f, i }))
    .filter((x): x is { f: number; i: number } => x.f !== null);
  if (floors.length < 2) return null;
  const first = floors[0];
  const last = floors[floors.length - 1];
  return { from: first.f, to: last.f, weeks: last.i - first.i + 1 };
}

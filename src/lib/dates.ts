import type { DateKey } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

export function toKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(now = new Date()): DateKey {
  return toKey(now);
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
}

/** Monday of the week containing `key`. */
export function weekStart(key: DateKey): DateKey {
  const d = fromKey(key);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow);
  return toKey(d);
}

export function weekDays(start: DateKey): DateKey[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isSunday(key: DateKey): boolean {
  return fromKey(key).getDay() === 0;
}

export function formatDay(key: DateKey): string {
  return fromKey(key).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function formatShort(key: DateKey): string {
  return fromKey(key).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Minutes since midnight for "HH:MM". */
export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function nowMinutes(now = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function daysBetween(a: DateKey, b: DateKey): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86_400_000);
}

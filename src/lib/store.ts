import { useEffect, useState, useSyncExternalStore } from "react";
import { todayKey } from "./dates";
import { STORAGE_KEY, emptyState, parseState } from "./store-core";
import type { AppState } from "./types";

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

let state: AppState = parseState(readStorage()) ?? emptyState();
let saveError = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveError = false;
  } catch {
    saveError = true;
  }
}

export function getState(): AppState {
  return state;
}

export function hasSaveError(): boolean {
  return saveError;
}

/** Apply a mutation to a copy of the state, then save and notify. */
export function update(mutate: (draft: AppState) => void) {
  const draft = structuredClone(state);
  mutate(draft);
  state = draft;
  persist();
  listeners.forEach((l) => l());
}

export function replaceState(next: AppState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState);
}

/** Current time, refreshed every 30 seconds and whenever the app comes back to the foreground. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 30_000);
    const onVis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return now;
}

export function useToday(): string {
  return todayKey(useNow());
}

// Ask the browser not to evict our data (home-screen apps are usually exempt, but it doesn't hurt).
try {
  void navigator.storage?.persist?.();
} catch {
  /* ignore */
}

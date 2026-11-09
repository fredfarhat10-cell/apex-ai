import { describe, expect, it } from "vitest";
import {
  areaScore,
  finalizeOutcomes,
  floorTrend,
  isBadWeek,
  liveProgress,
  neverMissTwice,
  qualifiesForLevelUp,
  weekAreaStats,
} from "./scoring";
import { addDays } from "./dates";
import { emptyState } from "./store-core";
import type { AppState, AreaId, DailyEntry, Protocol } from "./types";

const p = (id: string, kind: Protocol["kind"], areaId: AreaId = "body", extra: Partial<Protocol> = {}): Protocol => ({
  id,
  areaId,
  kind,
  title: id,
  minimumVersion: "min",
  level: 1,
  isActive: true,
  order: 0,
  ...extra,
});

describe("finalizeOutcomes", () => {
  const protos = [p("r", "rule"), p("d", "daily"), p("t", "trigger"), p("t2", "trigger"), p("log", "daily", "mind", { auto: "eveningLog" })];

  it("records untapped rules and dailies as missed, untouched triggers as didNotFire", () => {
    expect(finalizeOutcomes(protos, {})).toEqual({ r: "missed", d: "missed", t: "didNotFire", t2: "didNotFire", log: "kept" });
  });

  it("keeps tapped items and trigger choices", () => {
    expect(finalizeOutcomes(protos, { r: "kept", t: "kept", t2: "missed" })).toEqual({
      r: "kept",
      d: "missed",
      t: "kept",
      t2: "missed",
      log: "kept",
    });
  });

  it("never records a rule or daily as didNotFire", () => {
    expect(finalizeOutcomes(protos, { r: "didNotFire", d: "didNotFire" })).toMatchObject({ r: "missed", d: "missed" });
  });

  it("skips inactive protocols", () => {
    expect(finalizeOutcomes([p("x", "rule", "body", { isActive: false })], {})).toEqual({});
  });
});

describe("areaScore", () => {
  const protos = [p("a", "rule"), p("b", "daily"), p("c", "daily"), p("t", "trigger")];

  it("doing nothing scores 0, not a free 6-7", () => {
    expect(areaScore(protos, finalizeOutcomes(protos, {}), "body")).toBe(0);
  });

  it("excludes didNotFire triggers from applicable", () => {
    expect(areaScore(protos, finalizeOutcomes(protos, { a: "kept", b: "kept", c: "kept" }), "body")).toBe(10);
  });

  it("counts fired-not-handled triggers as misses", () => {
    // 3 kept of 4 applicable = 7.5
    expect(areaScore(protos, finalizeOutcomes(protos, { a: "kept", b: "kept", c: "kept", t: "missed" }), "body")).toBe(7.5);
  });

  it("rounds to one decimal", () => {
    // 1 of 3 = 3.333 -> 3.3
    const three = [p("a", "rule"), p("b", "rule"), p("c", "rule")];
    expect(areaScore(three, { a: "kept", b: "missed", c: "missed" }, "body")).toBe(3.3);
  });

  it("is null when nothing is applicable", () => {
    expect(areaScore([p("t", "trigger")], { t: "didNotFire" }, "body")).toBeNull();
    expect(areaScore(protos, {}, "mind")).toBeNull();
  });
});

describe("liveProgress", () => {
  it("counts rules and dailies always, triggers only once fired", () => {
    const protos = [p("a", "rule"), p("b", "daily"), p("t", "trigger"), p("t2", "trigger")];
    expect(liveProgress(protos, {}, "body")).toEqual({ kept: 0, applicable: 2 });
    expect(liveProgress(protos, { a: "kept", t: "kept" }, "body")).toEqual({ kept: 2, applicable: 3 });
    expect(liveProgress(protos, { a: "kept", t: "kept", t2: "missed" }, "body")).toEqual({ kept: 2, applicable: 4 });
  });
});

const entry = (date: string, body: number | null): DailyEntry => ({
  date,
  scores: { body, mind: null, people: null, mission: null },
  proofText: "",
  tomorrowFirstMove: "",
  loggedAt: date,
});

function withEntries(start: string, scores: (number | null | undefined)[]): Record<string, DailyEntry> {
  const out: Record<string, DailyEntry> = {};
  scores.forEach((s, i) => {
    if (s !== undefined) out[addDays(start, i)] = entry(addDays(start, i), s);
  });
  return out;
}

describe("weekly stats", () => {
  const monday = "2026-11-02";

  it("hides the average below 4 logged days but always reports loggedDays and floor", () => {
    const s = weekAreaStats(withEntries(monday, [6, 4, 8]), monday, "body");
    expect(s).toMatchObject({ average: null, rawAverage: 6, floor: 4, floorDay: "2026-11-03", loggedDays: 3 });
  });

  it("shows the average at 4+ logged days", () => {
    const s = weekAreaStats(withEntries(monday, [6, 4, 8, 10]), monday, "body");
    expect(s).toMatchObject({ average: 7, floor: 4, loggedDays: 4 });
  });

  it("ignores days where the area had nothing applicable", () => {
    const s = weekAreaStats(withEntries(monday, [6, null, 8]), monday, "body");
    expect(s.loggedDays).toBe(2);
  });

  it("level-up needs 3 consecutive weeks of avg >= 8 with >= 5 days", () => {
    const w0 = "2026-10-19";
    const all = {
      ...withEntries(w0, [8, 8, 9, 8, 8]),
      ...withEntries(addDays(w0, 7), [9, 9, 9, 9, 9]),
      ...withEntries(addDays(w0, 14), [8, 8, 8, 8, 8, 8]),
    };
    expect(qualifiesForLevelUp(all, addDays(w0, 14), "body")).toBe(true);
    const short = { ...all, ...withEntries(addDays(w0, 7), [9, 9, 9, 9]) };
    delete short[addDays(w0, 11)];
    expect(qualifiesForLevelUp(short, addDays(w0, 14), "body")).toBe(false);
  });

  it("bad week: avg < 5 with 3+ days, or <= 2 days", () => {
    expect(isBadWeek(withEntries(monday, [4, 4, 5]), monday, "body")).toBe(true);
    expect(isBadWeek(withEntries(monday, [9, 9]), monday, "body")).toBe(true);
    expect(isBadWeek(withEntries(monday, [6, 6, 6]), monday, "body")).toBe(false);
  });

  it("floor trend reads first to last floor", () => {
    const w0 = "2026-10-12";
    const all = { ...withEntries(w0, [3, 6]), ...withEntries(addDays(w0, 21), [5, 7]) };
    expect(floorTrend(all, [w0, addDays(w0, 7), addDays(w0, 14), addDays(w0, 21)], "body")).toEqual({ from: 3, to: 5, weeks: 4 });
  });
});

describe("neverMissTwice", () => {
  it("returns the first rule/daily missed on both previous days, by area order", () => {
    const state: AppState = emptyState();
    state.protocols = [
      p("m1", "daily", "mind", { order: 0 }),
      p("b1", "rule", "body", { order: 1 }),
      p("b0", "trigger", "body", { order: 0 }),
    ];
    const today = "2026-11-09";
    for (const d of [addDays(today, -1), addDays(today, -2)]) {
      state.checks[d] = { m1: "missed", b1: "missed", b0: "missed" };
      state.entries[d] = entry(d, 0);
    }
    expect(neverMissTwice(state, today)?.id).toBe("b1");
    state.checks[addDays(today, -1)].b1 = "kept";
    expect(neverMissTwice(state, today)?.id).toBe("m1");
    delete state.entries[addDays(today, -2)];
    expect(neverMissTwice(state, today)).toBeNull();
  });
});

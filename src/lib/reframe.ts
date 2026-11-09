import type { ReframeRequest, ReframeResponse } from "./reframeShared";
import { TEMPLATES } from "./templates";
import type { PatternSummary, ReframeAnswers } from "./types";

const DEFAULT_SUGGESTIONS = [
  "body.wake",
  "body.move",
  "body.daylight",
  "mind.blockers",
  "mind.read",
  "mind.urge",
  "people.message",
  "people.newconvo",
  "people.phoneaway",
  "mission.deepwork",
  "mission.hardfirst",
  "mission.park",
];

function quote(text: string, max = 110): string {
  const clean = text.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
  if (!clean) return "";
  return `“${clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean}”`;
}

/** Built from fixed copy plus the user's own words. Used when the AI endpoint isn't reachable. */
export function offlinePattern(a: ReframeAnswers): PatternSummary {
  const parts: string[] = [];
  if (a.breaking.trim())
    parts.push(`You said ${quote(a.breaking)} keeps breaking. A promise that breaks again and again is usually too big or too vague, and each break costs a little trust in yourself.`);
  if (a.stepAway.trim())
    parts.push(`You step away around ${quote(a.stepAway)}. That moment is where a small, exact promise does the most work.`);
  if (a.works.trim())
    parts.push(`${quote(a.works)} already works without willpower. That's design, and the system should lean on it.`);
  if (a.yourself.trim()) parts.push(`You're fully yourself in ${quote(a.yourself)}. Effort there doesn't need debating.`);
  if (parts.length === 0)
    parts.push("Your answers decide the system. Start small and exact: promises you can keep on a bad day build more trust than big ones you can't.");

  return {
    summary: parts.join(" "),
    areaLines: {
      body: "Body: one fixed time you can hold, even on a bad day, is worth more than an ambitious plan.",
      mind: a.works.trim()
        ? `Mind: build on ${quote(a.works, 60)} so fewer choices rely on willpower.`
        : "Mind: remove the decision before it arrives: blockers, distance, a set place for the phone.",
      people: a.yourself.trim()
        ? `People: more of ${quote(a.yourself, 60)}, in small, exact doses.`
        : "People: one small, exact contact a day keeps the door open.",
      mission: a.floor90.trim()
        ? `Mission: aim for the floor you named, ${quote(a.floor90, 80)}, one short block at a time.`
        : "Mission: one short, protected block on your main priority, every day.",
    },
    suggestedTemplateIds: DEFAULT_SUGGESTIONS,
    source: "offline",
  };
}

export async function buildPattern(a: ReframeAnswers, timeoutMs = 60_000): Promise<PatternSummary> {
  const body: ReframeRequest = {
    answers: a,
    templates: TEMPLATES.filter((t) => !t.locked).map((t) => ({ id: t.id, area: t.areaId, title: t.title })),
  };
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch("/api/reframe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as ReframeResponse;
    if (!data?.summary || !data.areaLines) throw new Error("bad shape");
    const known = new Set(TEMPLATES.map((t) => t.id));
    const ids = (data.suggestedTemplateIds ?? []).filter((id) => known.has(id));
    return { summary: data.summary, areaLines: data.areaLines, suggestedTemplateIds: ids.length ? ids : DEFAULT_SUGGESTIONS, source: "ai" };
  } catch {
    return offlinePattern(a);
  } finally {
    window.clearTimeout(timer);
  }
}

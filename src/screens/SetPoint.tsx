import { useState } from "react";
import { SetPointChart } from "../components/Chart";
import { fmtScore } from "../components/ui";
import { addDays, formatShort, isSunday, weekStart } from "../lib/dates";
import { floorTrend, weekAreaStats } from "../lib/scoring";
import { update } from "../lib/store";
import { endShrink, isShrunk } from "../lib/store-core";
import type { AppState } from "../lib/types";
import { AREA_IDS, AREA_NAMES } from "../lib/types";
import { SundayReview, reviewWeekFor } from "./SundayReview";

export function SetPoint({ state, today }: { state: AppState; today: string }) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const thisWeek = weekStart(today);
  const weeks = Array.from({ length: 12 }, (_, i) => addDays(thisWeek, -7 * (11 - i)));
  const reviewWeek = reviewWeekFor(today);
  const reviewDone = Boolean(state.reviews[reviewWeek]);
  const latestReview = Object.values(state.reviews).sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];
  const priorities = latestReview?.priorities.filter((p) => p.trim()) ?? [];

  return (
    <div className="screen">
      <header className="stack-sm" style={{ gap: 2 }}>
        <span className="eyebrow">Target: 7+ on an average day</span>
        <h1 className="title">Set Point</h1>
      </header>

      <div className={`card ${isSunday(today) && !reviewDone ? "soft" : ""} row-between`}>
        <div className="stack-sm grow" style={{ gap: 2 }}>
          <span className="h3">Sunday review</span>
          <span className="small muted">
            {reviewDone ? `Done for the week of ${formatShort(reviewWeek)}.` : `Week of ${formatShort(reviewWeek)} · about 20 minutes`}
          </span>
        </div>
        <button className={`btn sm${!reviewDone ? " primary" : ""}`} onClick={() => setReviewOpen(true)}>
          {reviewDone ? "Open" : "Start"}
        </button>
      </div>

      {priorities.length > 0 && (
        <div className="card stack-sm">
          <span className="eyebrow">This week's priorities</span>
          <ol className="stack-sm" style={{ margin: 0, paddingLeft: 20 }}>
            {priorities.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </div>
      )}

      {AREA_IDS.map((a) => {
        const points = weeks.map((w) => {
          const s = weekAreaStats(state.entries, w, a);
          return { week: w, average: s.average, floor: s.floor };
        });
        const cur = weekAreaStats(state.entries, thisWeek, a);
        // Headline uses the last 4 complete weeks, so a partial week doesn't swing it.
        const trend = floorTrend(state.entries, weeks.slice(-5, -1), a);
        const shrunk = isShrunk(state, a, today);
        const until = state.areas.find((x) => x.id === a)?.shrunkUntil;
        return (
          <section key={a} className="card stack" aria-label={AREA_NAMES[a]}>
            <div className="stack-sm" style={{ gap: 2 }}>
              <h2 className="area-name">{AREA_NAMES[a]}</h2>
              <p className="small muted">
                {trend
                  ? `${AREA_NAMES[a]} floor: ${trend.from.toFixed(1)} to ${trend.to.toFixed(1)} over ${trend.weeks} weeks.`
                  : "The floor trend appears after two full weeks of logs."}
              </p>
            </div>
            <SetPointChart points={points} label={`${AREA_NAMES[a]}: weekly average and floor over 12 weeks`} />
            <div className="grid-2">
              <div className="stat">
                <span className="tiny faint">This week's average</span>
                {cur.average !== null ? (
                  <span className="num">
                    <strong style={{ fontSize: 18 }}>{fmtScore(cur.average)}</strong> <span className="small faint">{cur.loggedDays}/7 days</span>
                  </span>
                ) : (
                  <span className="small num">
                    Not enough days <span className="faint">{cur.loggedDays}/7</span>
                  </span>
                )}
              </div>
              <div className="stat">
                <span className="tiny faint">This week's floor</span>
                <strong className="num" style={{ fontSize: 18 }}>
                  {fmtScore(cur.floor)}
                </strong>
              </div>
            </div>
            {shrunk && until && (
              <div className="row-between">
                <span className="small muted">Smallest version until {formatShort(until)}</span>
                <button className="btn ghost sm" onClick={() => update((s) => endShrink(s, a))}>
                  End early
                </button>
              </div>
            )}
          </section>
        );
      })}

      {reviewOpen && <SundayReview state={state} today={today} onClose={() => setReviewOpen(false)} />}
    </div>
  );
}

import { useState } from "react";
import { Sheet, fmtScore } from "../components/ui";
import { addDays, formatDay, formatShort, isSunday, weekStart } from "../lib/dates";
import { activeProtocols, isBadWeek, qualifiesForLevelUp, weekAreaStats } from "../lib/scoring";
import { update } from "../lib/store";
import { isShrunk, levelUp, shrinkArea } from "../lib/store-core";
import type { AppState, AreaId, Protocol } from "../lib/types";
import { AREA_IDS, AREA_NAMES } from "../lib/types";

/** On Sunday, review the week that is ending; on other days, the last full week. */
export function reviewWeekFor(today: string): string {
  return isSunday(today) ? weekStart(today) : addDays(weekStart(today), -7);
}

export function SundayReview({ state, today, onClose }: { state: AppState; today: string; onClose: () => void }) {
  const week = reviewWeekFor(today);
  const existing = state.reviews[week];
  const [floorNotes, setFloorNotes] = useState<Record<AreaId, string>>(() =>
    Object.fromEntries(AREA_IDS.map((a) => [a, existing?.areas[a]?.floorNote ?? ""])) as Record<AreaId, string>,
  );
  const [priorities, setPriorities] = useState<[string, string, string]>(existing?.priorities ?? ["", "", ""]);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [upgrades, setUpgrades] = useState<string[]>(existing?.upgrades ?? []);
  const [shrinkApplied, setShrinkApplied] = useState<AreaId[]>(existing?.shrinkApplied ?? []);
  const [saved, setSaved] = useState(false);

  const moves = state.weeklyMoves.filter((m) => m.isActive).sort((a, b) => a.order - b.order);
  const moveChecks = state.weeklyMoveChecks[week] ?? {};
  const broughtIdeas = state.parked.filter((p) => p.broughtToReview);

  const save = () => {
    update((s) => {
      s.reviews[week] = {
        weekStart: week,
        areas: Object.fromEntries(
          AREA_IDS.map((a) => {
            const st = weekAreaStats(s.entries, week, a);
            return [a, { average: st.average, floor: st.floor, loggedDays: st.loggedDays, floorNote: floorNotes[a].trim() }];
          }),
        ) as AppState["reviews"][string]["areas"],
        upgrades,
        shrinkApplied,
        priorities: priorities.map((p) => p.trim()) as [string, string, string],
        notes: notes.trim(),
        savedAt: new Date().toISOString(),
      };
    });
    setSaved(true);
  };

  if (saved) {
    return (
      <Sheet title="Sunday review" onClose={onClose} closeLabel="Done">
        <p className="h2">Review saved.</p>
        <p className="muted">Next week has three priorities. Everything else can wait.</p>
        <button className="btn primary block" onClick={onClose}>
          Done
        </button>
      </Sheet>
    );
  }

  return (
    <Sheet title={`Sunday review · week of ${formatShort(week)}`} onClose={onClose} full closeLabel="Cancel">
      {AREA_IDS.map((a) => {
        const st = weekAreaStats(state.entries, week, a);
        const canLevel = qualifiesForLevelUp(state.entries, week, a);
        const levelled = upgrades.some((id) => state.protocols.find((p) => p.id === id)?.areaId === a);
        const bad = isBadWeek(state.entries, week, a);
        return (
          <section key={a} className="card stack">
            <div className="row-between">
              <h2 className="area-name">{AREA_NAMES[a]}</h2>
              <span className="small num muted">
                {st.average !== null ? (
                  <>
                    avg <strong>{fmtScore(st.average)}</strong> · {st.loggedDays}/7
                  </>
                ) : (
                  <>Not enough days · {st.loggedDays}/7</>
                )}
                {st.floor !== null && (
                  <>
                    {" "}
                    · floor <strong>{fmtScore(st.floor)}</strong>
                  </>
                )}
              </span>
            </div>
            {st.floorDay && (
              <label className="field">
                <span>
                  Lowest day: {formatDay(st.floorDay)} ({fmtScore(st.floor)}). What happened that day?
                </span>
                <input
                  className="input"
                  value={floorNotes[a]}
                  onChange={(e) => setFloorNotes({ ...floorNotes, [a]: e.target.value })}
                  placeholder="Optional, one line"
                />
              </label>
            )}
            {canLevel && !levelled && (
              <LevelUp
                protocols={activeProtocols(state.protocols, a).filter((p) => !p.auto)}
                areaName={AREA_NAMES[a]}
                onDone={(id) => setUpgrades([...upgrades, id])}
              />
            )}
            {levelled && <p className="small muted">Levelled up this week.</p>}
            {!canLevel && bad && !shrinkApplied.includes(a) && !isShrunk(state, a, today) && (
              <div className="card warm stack-sm">
                <p className="small">
                  A hard week for {AREA_NAMES[a]}. Run it at the smallest version for 7 days? Same protocols, smaller promises. No new plan needed.
                </p>
                <button
                  className="btn sm"
                  style={{ alignSelf: "flex-start" }}
                  onClick={() => {
                    update((s) => shrinkArea(s, a, today));
                    setShrinkApplied([...shrinkApplied, a]);
                  }}
                >
                  Use the smallest version
                </button>
              </div>
            )}
            {(shrinkApplied.includes(a) || (bad && isShrunk(state, a, today))) && (
              <p className="small muted">Smallest version is on for 7 days.</p>
            )}
          </section>
        );
      })}

      <section className="card stack-sm">
        <h2 className="h3">Weekly moves</h2>
        {moves.length === 0 ? (
          <p className="small faint">No weekly moves yet. Add them in Library.</p>
        ) : (
          moves.map((m) => (
            <label key={m.id} className="row" style={{ minHeight: 40 }}>
              <input
                type="checkbox"
                checked={Boolean(moveChecks[m.id])}
                onChange={(e) =>
                  update((s) => {
                    s.weeklyMoveChecks[week] = { ...(s.weeklyMoveChecks[week] ?? {}), [m.id]: e.target.checked };
                  })
                }
                style={{ width: 20, height: 20 }}
              />
              <span>{m.title}</span>
            </label>
          ))
        )}
      </section>

      {broughtIdeas.length > 0 && (
        <section className="card stack-sm">
          <h2 className="h3">Parked ideas brought to review</h2>
          {broughtIdeas.map((i) => (
            <div key={i.id} className="row-between">
              <span className="grow">{i.text}</span>
              <button className="btn sm" onClick={() => update((s) => (s.parked = s.parked.filter((x) => x.id !== i.id)))}>
                Delete
              </button>
            </div>
          ))}
          <p className="tiny faint">To act on one, make it a priority below or a protocol in Library.</p>
        </section>
      )}

      <section className="card stack-sm">
        <h2 className="h3">Next week's 3 priorities</h2>
        {priorities.map((p, i) => (
          <input
            key={i}
            className="input"
            value={p}
            aria-label={`Priority ${i + 1}`}
            placeholder={`Priority ${i + 1}`}
            onChange={(e) => {
              const next = [...priorities] as [string, string, string];
              next[i] = e.target.value;
              setPriorities(next);
            }}
          />
        ))}
      </section>

      <label className="field">
        <span>Notes</span>
        <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
      </label>

      <button className="btn primary block" onClick={save}>
        Save review
      </button>
    </Sheet>
  );
}

function LevelUp({ protocols, areaName, onDone }: { protocols: Protocol[]; areaName: string; onDone: (id: string) => void }) {
  const [pick, setPick] = useState<Protocol | null>(null);
  const [title, setTitle] = useState("");
  const [min, setMin] = useState("");
  return (
    <div className="card soft stack-sm">
      <p className="small">{areaName} has averaged 8 or more for three weeks. Make one protocol harder?</p>
      {!pick ? (
        <div className="chips">
          {protocols.map((p) => (
            <button
              key={p.id}
              className="chip"
              onClick={() => {
                setPick(p);
                setTitle(p.title);
                setMin(p.minimumVersion);
              }}
            >
              {p.title}
            </button>
          ))}
        </div>
      ) : (
        <div className="stack-sm">
          <label className="field">
            <span>Title</span>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="field">
            <span>Smallest version</span>
            <input className="input" value={min} onChange={(e) => setMin(e.target.value)} />
          </label>
          {pick.levelUpIdea && (
            <button className="btn ghost sm" style={{ alignSelf: "flex-start" }} onClick={() => setMin(pick.levelUpIdea!)}>
              Use idea: {pick.levelUpIdea}
            </button>
          )}
          <div className="btn-row">
            <button className="btn sm" onClick={() => setPick(null)}>
              Back
            </button>
            <button
              className="btn sm primary"
              disabled={!title.trim()}
              onClick={() => {
                update((s) => levelUp(s, pick.id, { title: title.trim(), minimumVersion: min.trim() }));
                onDone(pick.id);
              }}
            >
              Level up to {pick.level + 1}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

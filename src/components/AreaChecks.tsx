import { activeProtocols, liveProgress } from "../lib/scoring";
import { allRulesKept, isShrunk, setCheck } from "../lib/store-core";
import { update } from "../lib/store";
import { formatShort } from "../lib/dates";
import type { AppState, AreaId, DateKey } from "../lib/types";
import { AREA_NAMES } from "../lib/types";
import { CheckRow, TriggerRow, fmtScore } from "./ui";

export function AreaChecks({
  state,
  areaId,
  date,
  today,
  score,
}: {
  state: AppState;
  areaId: AreaId;
  date: DateKey;
  today: DateKey;
  /** When given (evening log), show the derived /10 score instead of live progress. */
  score?: number | null;
}) {
  const protos = activeProtocols(state.protocols, areaId);
  const explicit = state.checks[date] ?? {};
  const logged = Boolean(state.entries[date]);
  const shrunk = isShrunk(state, areaId, today);
  const until = state.areas.find((a) => a.id === areaId)?.shrunkUntil;
  const { kept, applicable } = liveProgress(state.protocols, explicit, areaId);
  const hasRules = protos.some((p) => p.kind === "rule");

  return (
    <section className="card flush" aria-label={AREA_NAMES[areaId]}>
      <div className="area-head">
        <div className="stack-sm" style={{ gap: 2 }}>
          <h2 className="area-name">{AREA_NAMES[areaId]}</h2>
          {shrunk && until && <span className="tiny faint">Smallest version until {formatShort(until)}</span>}
        </div>
        {score !== undefined ? (
          <span className="score-pill">
            {fmtScore(score)}
            <small>/10</small>
          </span>
        ) : (
          <span className="progress" aria-label={`${kept} kept of ${applicable} so far`}>
            {kept}/{applicable}
          </span>
        )}
      </div>
      {hasRules && (
        <div style={{ padding: "0 16px 10px" }}>
          <button className="btn sm" onClick={() => update((s) => allRulesKept(s, date, areaId))}>
            All rules kept
          </button>
        </div>
      )}
      {protos.length === 0 && <p className="small faint" style={{ padding: "4px 16px 14px" }}>No protocols in this area yet. Add them in Library.</p>}
      {protos.map((p) => {
        const title = shrunk ? p.minimumVersion || p.title : p.title;
        const sub = shrunk ? p.title : p.minimumVersion ? `Smallest version: ${p.minimumVersion}` : undefined;
        if (p.auto === "eveningLog") {
          return <CheckRow key={p.id} kind={p.kind} title={p.title} sub="Kept when you save the evening log" kept={logged} disabled />;
        }
        if (p.kind === "trigger") {
          return (
            <TriggerRow
              key={p.id}
              title={p.title}
              sub={shrunk ? `Smallest version: ${p.minimumVersion}` : undefined}
              value={explicit[p.id]}
              onChange={(o) => update((s) => setCheck(s, date, p.id, o))}
            />
          );
        }
        const isKept = explicit[p.id] === "kept";
        return (
          <CheckRow
            key={p.id}
            kind={p.kind}
            title={title}
            sub={sub}
            kept={isKept}
            missed={logged && explicit[p.id] === "missed"}
            onToggle={() => update((s) => setCheck(s, date, p.id, isKept ? undefined : "kept"))}
          />
        );
      })}
    </section>
  );
}

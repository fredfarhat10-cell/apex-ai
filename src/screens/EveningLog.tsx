import { useMemo, useState } from "react";
import { AreaChecks } from "../components/AreaChecks";
import { Sheet } from "../components/ui";
import { formatDay } from "../lib/dates";
import { allAreaScores, finalizeOutcomes } from "../lib/scoring";
import { update } from "../lib/store";
import { saveEveningLog } from "../lib/store-core";
import type { AppState, DateKey } from "../lib/types";
import { AREA_IDS } from "../lib/types";

export function EveningLog({ state, date, today, onClose }: { state: AppState; date: DateKey; today: DateKey; onClose: () => void }) {
  const existing = state.entries[date];
  const [proof, setProof] = useState(existing?.proofText ?? "");
  const [firstMove, setFirstMove] = useState(existing?.tomorrowFirstMove ?? "");
  const [saved, setSaved] = useState(false);

  // Scores as they would be if saved now.
  const scores = useMemo(
    () => allAreaScores(state.protocols, finalizeOutcomes(state.protocols, state.checks[date] ?? {})),
    [state.protocols, state.checks, date],
  );
  const low = AREA_IDS.some((a) => scores[a] !== null && (scores[a] as number) < 5);
  const proofToShow = useMemo(() => {
    if (!low || state.proof.length === 0) return null;
    const seed = [...date].reduce((a, c) => a + c.charCodeAt(0), 0);
    return state.proof[seed % state.proof.length];
  }, [low, state.proof, date]);

  const save = () => {
    update((s) => saveEveningLog(s, date, proof, firstMove));
    setSaved(true);
  };

  const label = date === today ? "Evening log" : `Evening log · ${formatDay(date)}`;

  if (saved) {
    return (
      <Sheet title={label} onClose={onClose} closeLabel="Done">
        <div className="stack">
          <p className="h2">Logged.</p>
          <p className="muted">Each day is one vote. {firstMove.trim() ? `Tomorrow starts with: ${firstMove.trim()}.` : "See you tomorrow."}</p>
          <button className="btn primary block" onClick={onClose}>
            Done
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title={label} onClose={onClose} full closeLabel="Cancel">
      <p className="small muted">Confirm what you kept. Anything not ticked counts as a miss; a trigger that didn't fire doesn't count either way.</p>
      {AREA_IDS.map((a) => (
        <AreaChecks key={a} state={state} areaId={a} date={date} today={today} score={scores[a]} />
      ))}
      {proofToShow && (
        <div className="card soft stack-sm">
          <span className="eyebrow">From your Proof file</span>
          <p>{proofToShow.text}</p>
        </div>
      )}
      <label className="field">
        <span>One line of proof</span>
        <input className="input" value={proof} onChange={(e) => setProof(e.target.value)} placeholder="Something you did today that counts" />
      </label>
      <label className="field">
        <span>Tomorrow's first move</span>
        <input className="input" value={firstMove} onChange={(e) => setFirstMove(e.target.value)} placeholder="The first thing you'll do" />
      </label>
      <button className="btn primary block" onClick={save}>
        {existing ? "Update evening log" : "Save evening log"}
      </button>
    </Sheet>
  );
}

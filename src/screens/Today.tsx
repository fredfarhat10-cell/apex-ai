import { useState } from "react";
import { AreaChecks } from "../components/AreaChecks";
import { fmtScore } from "../components/ui";
import { addDays, formatDay, minutesOf, nowMinutes } from "../lib/dates";
import { neverMissTwice } from "../lib/scoring";
import { update, useNow } from "../lib/store";
import { ackStatements } from "../lib/store-core";
import type { AppState } from "../lib/types";
import { AREA_IDS, AREA_NAMES } from "../lib/types";
import { EveningLog } from "./EveningLog";
import { SlipSheet } from "./SlipSheet";

export function Today({ state, today }: { state: AppState; today: string }) {
  const now = useNow();
  const [logDate, setLogDate] = useState<string | null>(null);
  const [slipOpen, setSlipOpen] = useState(false);

  const entry = state.entries[today];
  const yesterday = addDays(today, -1);
  const startedOn = state.profile?.completedAt?.slice(0, 10) ?? today;
  const yesterdayUnlogged = !state.entries[yesterday] && yesterday >= startedOn;
  const nmt = neverMissTwice(state, today);
  const statementsRead = state.statementsReadOn.includes(today);
  const isEvening = nowMinutes(now) >= minutesOf(state.settings.eveningTime);
  const statements = [...state.statements].sort((a, b) => a.order - b.order);

  return (
    <div className="screen">
      <header className="stack-sm" style={{ gap: 2 }}>
        <span className="eyebrow">{formatDay(today)}</span>
        <h1 className="title">Today</h1>
      </header>

      {nmt && (
        <p className="banner">
          {nmt.title}: one miss is data. Today, the smallest version: {nmt.minimumVersion || nmt.title}.
        </p>
      )}

      {yesterdayUnlogged && (
        <div className="card row-between">
          <p className="small muted grow">Yesterday isn't logged yet.</p>
          <button className="btn sm" onClick={() => setLogDate(yesterday)}>
            Log yesterday
          </button>
        </div>
      )}

      {statements.length > 0 &&
        (statementsRead ? (
          <button className="card row-between" style={{ textAlign: "left" }} onClick={() => update((s) => (s.statementsReadOn = s.statementsReadOn.filter((d) => d !== today)))}>
            <span className="small muted">Statements read</span>
            <span className="small faint">Show</span>
          </button>
        ) : (
          <div className="card stack">
            <span className="eyebrow">How I act</span>
            <ul className="stack-sm" style={{ margin: 0, paddingLeft: 18 }}>
              {statements.map((s) => (
                <li key={s.id}>{s.text}</li>
              ))}
            </ul>
            <button className="btn sm" style={{ alignSelf: "flex-start" }} onClick={() => update((s) => ackStatements(s, today))}>
              Read
            </button>
          </div>
        ))}

      {entry && (
        <div className="card soft stack-sm">
          <div className="row-between">
            <span className="h3">Logged</span>
            <button className="btn ghost sm" onClick={() => setLogDate(today)}>
              Edit
            </button>
          </div>
          <div className="row wrap" style={{ gap: 14 }}>
            {AREA_IDS.map((a) => (
              <span key={a} className="small num">
                {AREA_NAMES[a]} <strong>{fmtScore(entry.scores[a])}</strong>
              </span>
            ))}
          </div>
          {entry.tomorrowFirstMove && <p className="small muted">Tomorrow's first move: {entry.tomorrowFirstMove}</p>}
        </div>
      )}

      {!entry && isEvening && (
        <button className="btn primary block" onClick={() => setLogDate(today)}>
          Evening log
        </button>
      )}

      {AREA_IDS.map((a) => (
        <AreaChecks key={a} state={state} areaId={a} date={today} today={today} />
      ))}

      <div className="btn-row">
        <button className="btn" onClick={() => setSlipOpen(true)}>
          Log a slip
        </button>
        {!entry && (
          <button className={`btn${isEvening ? "" : " primary"}`} onClick={() => setLogDate(today)}>
            Evening log
          </button>
        )}
      </div>

      {logDate && <EveningLog state={state} date={logDate} today={today} onClose={() => setLogDate(null)} />}
      {slipOpen && <SlipSheet state={state} onClose={() => setSlipOpen(false)} />}
    </div>
  );
}

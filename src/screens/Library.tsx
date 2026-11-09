import { useMemo, useRef, useState, type ReactNode } from "react";
import { ProtocolForm } from "../components/ProtocolForm";
import { Chevron, KindTag, Sheet, UpDown } from "../components/ui";
import { formatDay, todayKey } from "../lib/dates";
import { replaceState, update } from "../lib/store";
import { activeCount, addProtocol, emptyState, moveInList, moveProtocol, parkIdea, parseState, uid, updateProtocol } from "../lib/store-core";
import { TEMPLATES } from "../lib/templates";
import type { AppState, AreaId, Protocol } from "../lib/types";
import { AREA_IDS, AREA_NAMES, MAX_ACTIVE_PER_AREA, SLIP_STATES } from "../lib/types";

type Section = "proof" | "slips" | "parked" | "moves" | "protocols" | "statements" | "setup" | "settings";

const SECTIONS: { id: Section; label: string; group: string }[] = [
  { id: "proof", label: "Proof file", group: "Record" },
  { id: "slips", label: "Slips", group: "Record" },
  { id: "parked", label: "Parked ideas", group: "Record" },
  { id: "moves", label: "Weekly moves", group: "Record" },
  { id: "protocols", label: "Protocols", group: "Your system" },
  { id: "statements", label: "Statements", group: "Your system" },
  { id: "setup", label: "Setup checklist", group: "Your system" },
  { id: "settings", label: "Times and data", group: "Your system" },
];

export function Library({ state }: { state: AppState }) {
  const [section, setSection] = useState<Section | null>(null);

  if (section) {
    const label = SECTIONS.find((s) => s.id === section)!.label;
    return (
      <div className="screen">
        <header className="stack-sm" style={{ gap: 6 }}>
          <button className="btn ghost sm" style={{ alignSelf: "flex-start", paddingLeft: 0 }} onClick={() => setSection(null)}>
            ‹ Library
          </button>
          <h1 className="title">{label}</h1>
        </header>
        {section === "proof" && <ProofSection state={state} />}
        {section === "slips" && <SlipsSection state={state} />}
        {section === "parked" && <ParkedSection state={state} />}
        {section === "moves" && <MovesSection state={state} />}
        {section === "protocols" && <ProtocolsSection state={state} />}
        {section === "statements" && <StatementsSection state={state} />}
        {section === "setup" && <SetupSection state={state} />}
        {section === "settings" && <SettingsSection state={state} />}
      </div>
    );
  }

  const counts: Partial<Record<Section, string>> = {
    proof: String(state.proof.length),
    slips: String(state.slips.length),
    parked: String(state.parked.length),
    moves: String(state.weeklyMoves.filter((m) => m.isActive).length),
    protocols: String(state.protocols.filter((p) => p.isActive).length),
    statements: String(state.statements.length),
    setup: state.setupTasks.length ? `${state.setupTasks.filter((t) => t.done).length}/${state.setupTasks.length}` : "",
  };

  return (
    <div className="screen">
      <header>
        <h1 className="title">Library</h1>
      </header>
      {["Record", "Your system"].map((g) => (
        <div key={g} className="stack-sm">
          <span className="eyebrow">{g}</span>
          <div className="card flush list">
            {SECTIONS.filter((s) => s.group === g).map((s) => (
              <button key={s.id} className="list-item" onClick={() => setSection(s.id)}>
                <span className="grow">{s.label}</span>
                <span className="small faint num">{counts[s.id]}</span>
                <Chevron />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AddLine({ placeholder, button, onAdd }: { placeholder: string; button: string; onAdd: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="row"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAdd(text.trim());
        setText("");
      }}
    >
      <input className="input grow" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      <button className="btn" type="submit" disabled={!text.trim()}>
        {button}
      </button>
    </form>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="small faint center" style={{ padding: "12px 0" }}>{children}</p>;
}

// ---------- Proof ----------
function ProofSection({ state }: { state: AppState }) {
  const items = [...state.proof].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <p className="small muted">Things you have actually done. Statements lean on these, and they come back on low days.</p>
      <AddLine placeholder="Something you did that counts" button="Add" onAdd={(text) => update((s) => s.proof.push({ id: uid(), date: todayKey(), text, source: "manual" }))} />
      {items.length === 0 ? (
        <Empty>No proof yet. Add one thing you finished, even a small one.</Empty>
      ) : (
        <div className="card flush list">
          {items.map((p) => (
            <div key={p.id} className="list-item" style={{ alignItems: "flex-start" }}>
              <div className="grow stack-sm" style={{ gap: 2 }}>
                <span>{p.text}</span>
                <span className="tiny faint">{formatDay(p.date)}</span>
              </div>
              <button className="btn ghost sm danger" onClick={() => update((s) => (s.proof = s.proof.filter((x) => x.id !== p.id)))} aria-label={`Delete proof: ${p.text}`}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ---------- Slips ----------
function SlipsSection({ state }: { state: AppState }) {
  const slips = state.slips;
  const byState = useMemo(() => SLIP_STATES.map((s) => ({ ...s, n: slips.filter((x) => x.state === s.id).length })), [slips]);
  const byHour = useMemo(() => {
    const h = Array(24).fill(0) as number[];
    slips.forEach((s) => h[new Date(s.timestamp).getHours()]++);
    return h;
  }, [slips]);
  const byMonth = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const n = slips.filter((s) => {
        const t = new Date(s.timestamp);
        return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth();
      }).length;
      return { label: d.toLocaleDateString(undefined, { month: "short" }), n };
    });
  }, [slips]);
  const maxState = Math.max(1, ...byState.map((s) => s.n));
  const maxHour = Math.max(1, ...byHour);
  const maxMonth = Math.max(1, ...byMonth.map((m) => m.n));

  if (slips.length === 0) return <Empty>No slips logged. When one happens, log it from Today: three taps, no verdict.</Empty>;

  return (
    <>
      <section className="card stack-sm">
        <h2 className="h3">Episodes per month</h2>
        <div className="bars" aria-label="Slips per month, last 6 months">
          {byMonth.map((m) => (
            <div key={m.label} className={m.n ? "" : "zero"} style={{ height: `${(m.n / maxMonth) * 100}%` }} title={`${m.label}: ${m.n}`} />
          ))}
        </div>
        <div className="row-between tiny faint">
          {byMonth.map((m) => (
            <span key={m.label} className="num">
              {m.label} {m.n}
            </span>
          ))}
        </div>
      </section>
      <section className="card stack-sm">
        <h2 className="h3">By state</h2>
        {byState.map((s) => (
          <div key={s.id} className="row small">
            <span style={{ width: 96 }}>{s.label}</span>
            <div className="grow" style={{ background: "var(--surface-2)", borderRadius: 4, height: 10 }}>
              <div style={{ width: `${(s.n / maxState) * 100}%`, background: "var(--accent)", height: 10, borderRadius: 4 }} />
            </div>
            <span className="num faint" style={{ width: 24, textAlign: "right" }}>
              {s.n}
            </span>
          </div>
        ))}
      </section>
      <section className="card stack-sm">
        <h2 className="h3">By hour</h2>
        <div className="bars" aria-label="Slips by hour of day">
          {byHour.map((n, h) => (
            <div key={h} className={n ? "" : "zero"} style={{ height: `${(n / maxHour) * 100}%` }} title={`${h}:00 – ${n}`} />
          ))}
        </div>
        <div className="row-between tiny faint">
          <span>0:00</span>
          <span>6:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </section>
      <section className="stack-sm">
        <span className="eyebrow">History</span>
        <div className="card flush list">
          {[...slips]
            .reverse()
            .slice(0, 50)
            .map((s) => (
              <div key={s.id} className="list-item" style={{ alignItems: "flex-start" }}>
                <div className="grow stack-sm" style={{ gap: 2 }}>
                  <span className="small">
                    {AREA_NAMES[s.areaId]} · {SLIP_STATES.find((x) => x.id === s.state)?.label} · {s.place}
                  </span>
                  {s.note && <span className="small muted">{s.note}</span>}
                  <span className="tiny faint">
                    {new Date(s.timestamp).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}

// ---------- Parked ideas ----------
function ParkedSection({ state }: { state: AppState }) {
  const now = Date.now();
  const items = [...state.parked].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <p className="small muted">A new idea waits 7 days. If it still matters after that, it goes to the Sunday review.</p>
      <AddLine placeholder="One line" button="Park" onAdd={(text) => update((s) => parkIdea(s, text))} />
      {items.length === 0 ? (
        <Empty>Nothing parked.</Empty>
      ) : (
        <div className="card flush list">
          {items.map((p) => {
            const left = Math.ceil((new Date(p.unlocksAt).getTime() - now) / 86_400_000);
            return (
              <div key={p.id} className="list-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
                <span>{p.text}</span>
                {left > 0 ? (
                  <span className="tiny faint">Unlocks in {left} {left === 1 ? "day" : "days"}</span>
                ) : p.broughtToReview ? (
                  <span className="tiny faint">In the next Sunday review</span>
                ) : (
                  <div className="row">
                    <button className="btn sm" onClick={() => update((s) => (s.parked = s.parked.map((x) => (x.id === p.id ? { ...x, broughtToReview: true } : x))))}>
                      Bring to Sunday review
                    </button>
                    <button className="btn sm danger" onClick={() => update((s) => (s.parked = s.parked.filter((x) => x.id !== p.id)))}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ---------- Weekly moves ----------
function MovesSection({ state }: { state: AppState }) {
  const moves = state.weeklyMoves.filter((m) => m.isActive).sort((a, b) => a.order - b.order);
  const [editing, setEditing] = useState<string | null>(null);
  const [text, setText] = useState("");
  return (
    <>
      <p className="small muted">Things you do once a week. You tick them in the Sunday review.</p>
      <AddLine
        placeholder="A weekly move"
        button="Add"
        onAdd={(title) => update((s) => s.weeklyMoves.push({ id: uid(), title, order: s.weeklyMoves.length, isActive: true }))}
      />
      {moves.length === 0 ? (
        <Empty>No weekly moves yet.</Empty>
      ) : (
        <div className="card flush list">
          {moves.map((m) => (
            <div key={m.id} className="list-item">
              {editing === m.id ? (
                <form
                  className="row grow"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!text.trim()) return;
                    update((s) => (s.weeklyMoves = s.weeklyMoves.map((x) => (x.id === m.id ? { ...x, title: text.trim() } : x))));
                    setEditing(null);
                  }}
                >
                  <input className="input grow" value={text} onChange={(e) => setText(e.target.value)} aria-label="Weekly move" autoFocus />
                  <button className="btn sm" type="submit">
                    Save
                  </button>
                </form>
              ) : (
                <>
                  <button
                    className="grow"
                    style={{ textAlign: "left", background: "none", border: 0, padding: 0 }}
                    onClick={() => {
                      setEditing(m.id);
                      setText(m.title);
                    }}
                  >
                    {m.title}
                  </button>
                  <UpDown
                    label={m.title}
                    onUp={() => update((s) => (s.weeklyMoves = moveInList(s.weeklyMoves, m.id, -1)))}
                    onDown={() => update((s) => (s.weeklyMoves = moveInList(s.weeklyMoves, m.id, 1)))}
                  />
                  <button
                    className="btn sm danger"
                    aria-label={`Remove ${m.title}`}
                    onClick={() => update((s) => (s.weeklyMoves = s.weeklyMoves.map((x) => (x.id === m.id ? { ...x, isActive: false } : x))))}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ---------- Protocols ----------
function ProtocolsSection({ state }: { state: AppState }) {
  const [editing, setEditing] = useState<Protocol | null>(null);
  const [adding, setAdding] = useState<AreaId | null>(null);
  return (
    <>
      <p className="small muted">Up to {MAX_ACTIVE_PER_AREA} active protocols per area. Grow them by levelling up in the Sunday review.</p>
      {AREA_IDS.map((a) => {
        const list = state.protocols.filter((p) => p.areaId === a && p.isActive).sort((x, y) => x.order - y.order);
        const full = activeCount(state, a) >= MAX_ACTIVE_PER_AREA;
        return (
          <section key={a} className="card flush">
            <div className="area-head">
              <h2 className="area-name">{AREA_NAMES[a]}</h2>
              <span className="progress">
                {list.length}/{MAX_ACTIVE_PER_AREA}
              </span>
            </div>
            <div className="list">
              {list.map((p) => (
                <div key={p.id} className="list-item" style={{ borderTop: "1px solid var(--line)" }}>
                  <button className="grow stack-sm" style={{ gap: 2, textAlign: "left", background: "none", border: 0, padding: 0 }} onClick={() => setEditing(p)} disabled={Boolean(p.auto)}>
                    <span className="row" style={{ gap: 6 }}>
                      <KindTag kind={p.kind} />
                      {p.level > 1 && <span className="tiny faint">Level {p.level}</span>}
                    </span>
                    <span>{p.title}</span>
                    {p.minimumVersion && <span className="small faint">{p.minimumVersion}</span>}
                  </button>
                  <UpDown label={p.title} onUp={() => update((s) => moveProtocol(s, p.id, -1))} onDown={() => update((s) => moveProtocol(s, p.id, 1))} />
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 16px 14px" }}>
              <button className="btn sm" disabled={full} onClick={() => setAdding(a)}>
                {full ? "Area is full" : "Add protocol"}
              </button>
            </div>
          </section>
        );
      })}

      {editing && (
        <Sheet title="Edit protocol" onClose={() => setEditing(null)}>
          <ProtocolForm
            initial={{ kind: editing.kind, title: editing.title, minimumVersion: editing.minimumVersion }}
            submitLabel="Save"
            onCancel={() => setEditing(null)}
            onSubmit={(d) => {
              update((s) => updateProtocol(s, editing.id, d));
              setEditing(null);
            }}
          />
          <div className="divider" />
          <button
            className="btn danger block"
            onClick={() => {
              if (window.confirm(`Remove "${editing.title}"? Past days keep their scores.`)) {
                update((s) => updateProtocol(s, editing.id, { isActive: false }));
                setEditing(null);
              }
            }}
          >
            Remove protocol
          </button>
        </Sheet>
      )}

      {adding && <AddProtocolSheet state={state} areaId={adding} onClose={() => setAdding(null)} />}
    </>
  );
}

function AddProtocolSheet({ state, areaId, onClose }: { state: AppState; areaId: AreaId; onClose: () => void }) {
  const used = new Set(state.protocols.filter((p) => p.isActive && p.templateId).map((p) => p.templateId));
  const options = TEMPLATES.filter((t) => t.areaId === areaId && !used.has(t.id));
  const [custom, setCustom] = useState(false);
  return (
    <Sheet title={`Add to ${AREA_NAMES[areaId]}`} onClose={onClose} full>
      {custom ? (
        <ProtocolForm
          submitLabel="Add"
          onCancel={() => setCustom(false)}
          onSubmit={(d) => {
            update((s) => addProtocol(s, { areaId, ...d }));
            onClose();
          }}
        />
      ) : (
        <>
          <button className="btn block" onClick={() => setCustom(true)}>
            Write your own
          </button>
          <span className="eyebrow">From the library</span>
          <div className="card flush list">
            {options.length === 0 && <Empty>All templates for this area are in use.</Empty>}
            {options.map((t) => (
              <button
                key={t.id}
                className="list-item"
                onClick={() => {
                  update((s) => addProtocol(s, { areaId, kind: t.kind, title: t.title, minimumVersion: t.minimumVersion, templateId: t.id }));
                  if (t.setupTask) update((s) => s.setupTasks.push({ templateId: t.id, text: t.setupTask!, done: false }));
                  onClose();
                }}
              >
                <span className="grow stack-sm" style={{ gap: 2 }}>
                  <span>
                    <KindTag kind={t.kind} />
                  </span>
                  <span>{t.title}</span>
                  <span className="small faint">{t.minimumVersion}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}

// ---------- Statements ----------
function StatementsSection({ state }: { state: AppState }) {
  const items = [...state.statements].sort((a, b) => a.order - b.order);
  return (
    <>
      <p className="small muted">How you act, each backed by something in your Proof file. No affirmations without evidence.</p>
      <AddLine
        placeholder="I … (how you act)"
        button="Add"
        onAdd={(text) => update((s) => s.statements.push({ id: uid(), text, order: s.statements.length }))}
      />
      {items.length === 0 ? (
        <Empty>No statements yet.</Empty>
      ) : (
        items.map((st) => (
          <div key={st.id} className="card stack-sm">
            <input
              className="input"
              value={st.text}
              aria-label="Statement"
              onChange={(e) => update((s) => (s.statements = s.statements.map((x) => (x.id === st.id ? { ...x, text: e.target.value } : x))))}
            />
            <label className="field">
              <span>Backed by</span>
              <select
                className="input"
                value={st.linkedProofId ?? ""}
                onChange={(e) =>
                  update((s) => (s.statements = s.statements.map((x) => (x.id === st.id ? { ...x, linkedProofId: e.target.value || undefined } : x))))
                }
              >
                <option value="">No proof linked yet</option>
                {state.proof.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.text}
                  </option>
                ))}
              </select>
            </label>
            <div className="row-between">
              <UpDown
                label={st.text}
                onUp={() => update((s) => (s.statements = moveInList(s.statements, st.id, -1)))}
                onDown={() => update((s) => (s.statements = moveInList(s.statements, st.id, 1)))}
              />
              <button className="btn sm danger" onClick={() => update((s) => (s.statements = s.statements.filter((x) => x.id !== st.id)))}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
}

// ---------- Setup ----------
function SetupSection({ state }: { state: AppState }) {
  if (state.setupTasks.length === 0) return <Empty>No setup jobs for your current protocols.</Empty>;
  return (
    <div className="card flush list">
      {state.setupTasks.map((t, i) => (
        <label key={t.templateId + i} className="list-item">
          <input
            type="checkbox"
            checked={t.done}
            onChange={(e) => update((s) => (s.setupTasks = s.setupTasks.map((x, j) => (j === i ? { ...x, done: e.target.checked } : x))))}
            style={{ width: 20, height: 20 }}
          />
          <span className={t.done ? "muted" : ""}>{t.text}</span>
        </label>
      ))}
    </div>
  );
}

// ---------- Settings ----------
function SettingsSection({ state }: { state: AppState }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `set-point-backup-${todayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <section className="card stack">
        <h2 className="h3">Times</h2>
        <div className="grid-2">
          <label className="field">
            <span>Morning statements</span>
            <input
              type="time"
              className="input"
              value={state.settings.morningTime}
              onChange={(e) => update((s) => (s.settings.morningTime = e.target.value || "07:30"))}
            />
          </label>
          <label className="field">
            <span>Evening log</span>
            <input
              type="time"
              className="input"
              value={state.settings.eveningTime}
              onChange={(e) => update((s) => (s.settings.eveningTime = e.target.value || "20:00"))}
            />
          </label>
        </div>
        <p className="tiny faint">
          The home-screen version can't send notifications yet. These times decide when Today brings the evening log forward.
        </p>
      </section>

      <section className="card stack-sm">
        <h2 className="h3">Your data</h2>
        <p className="small muted">Everything is stored on this device only. Export a backup now and then.</p>
        <div className="btn-row">
          <button className="btn sm" onClick={exportData}>
            Export backup
          </button>
          <button className="btn sm" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            const next = parseState(await f.text());
            if (!next) {
              setMsg("That file isn't a Set Point backup. Nothing was changed.");
              return;
            }
            if (window.confirm("Replace everything on this device with the backup?")) {
              replaceState(next);
              setMsg("Backup restored.");
            }
          }}
        />
        {msg && <p className="small muted">{msg}</p>}
      </section>

      <section className="card stack-sm">
        <h2 className="h3">Start over</h2>
        <p className="small muted">Deletes every protocol, log and note on this device and runs onboarding again.</p>
        <button
          className="btn sm danger"
          style={{ alignSelf: "flex-start" }}
          onClick={() => {
            if (window.confirm("Delete all Set Point data on this device? Export a backup first if you want to keep it.")) replaceState(emptyState());
          }}
        >
          Delete all data
        </button>
      </section>
    </>
  );
}

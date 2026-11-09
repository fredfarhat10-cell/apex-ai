import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ProtocolForm } from "../components/ProtocolForm";
import { KindTag } from "../components/ui";
import { todayKey } from "../lib/dates";
import { buildPattern } from "../lib/reframe";
import { ANSWER_MAX_CHARS, REFRAME_QUESTIONS } from "../lib/reframeShared";
import { update } from "../lib/store";
import { addProtocol, uid } from "../lib/store-core";
import { STATEMENT_EXAMPLES, TEMPLATES, TEMPLATE_BY_ID } from "../lib/templates";
import type { AreaId, Kind, PatternSummary, ReframeAnswers } from "../lib/types";
import { AREA_IDS, AREA_NAMES, MAX_ACTIVE_PER_AREA } from "../lib/types";

interface Pick {
  key: string;
  areaId: AreaId;
  kind: Kind;
  title: string;
  minimumVersion: string;
  templateId?: string;
  selected: boolean;
  locked?: boolean;
}

interface Draft {
  step: number;
  answers: ReframeAnswers;
  pattern?: PatternSummary;
  picks: Pick[];
  proof: [string, string, string];
  statements: { key: string; text: string; proofIndex: number | null }[];
  setupDone: Record<string, boolean>;
  morningTime: string;
  eveningTime: string;
}

const DRAFT_KEY = "setpoint.onboardingDraft.v1";
const MIN_PER_AREA = 2;

function initialDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw) as Draft;
  } catch {
    /* ignore */
  }
  return {
    step: 0,
    answers: { breaking: "", stepAway: "", works: "", yourself: "", floor90: "" },
    picks: [],
    proof: ["", "", ""],
    statements: [],
    setupDone: {},
    morningTime: "07:30",
    eveningTime: "20:00",
  };
}

function picksFrom(suggested: string[]): Pick[] {
  return TEMPLATES.map((t) => ({
    key: t.id,
    areaId: t.areaId,
    kind: t.kind,
    title: t.title,
    minimumVersion: t.minimumVersion,
    templateId: t.id,
    selected: Boolean(t.locked) || suggested.includes(t.id),
    locked: t.locked,
  }));
}

// Step layout
const Q0 = 1; // first question
const PATTERN = Q0 + REFRAME_QUESTIONS.length; // 6
const AREA0 = PATTERN + 1; // 7..10
const PROOF = AREA0 + AREA_IDS.length; // 11
const STATEMENTS = PROOF + 1;
const SETUP = STATEMENTS + 1;
const TIMES = SETUP + 1;
const TOTAL = TIMES + 1;

export function Onboarding() {
  const [d, setD] = useState<Draft>(initialDraft);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch {
      /* ignore */
    }
  }, [d]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [d.step]);

  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const go = (step: number) => set({ step });

  const setupTasks = useMemo(
    () =>
      d.picks
        .filter((p) => p.selected && p.templateId && TEMPLATE_BY_ID[p.templateId]?.setupTask)
        .map((p) => ({ templateId: p.templateId!, text: TEMPLATE_BY_ID[p.templateId!].setupTask! })),
    [d.picks],
  );

  const runPattern = async () => {
    setLoading(true);
    const pattern = await buildPattern(d.answers);
    setLoading(false);
    setD((prev) => ({ ...prev, pattern, picks: prev.picks.length ? prev.picks : picksFrom(pattern.suggestedTemplateIds) }));
  };

  const finish = () => {
    const today = todayKey();
    update((s) => {
      const proofIds: (string | undefined)[] = [];
      d.proof.forEach((text) => {
        if (text.trim()) {
          const id = uid();
          s.proof.push({ id, date: today, text: text.trim(), source: "onboarding" });
          proofIds.push(id);
        } else proofIds.push(undefined);
      });
      for (const a of AREA_IDS) {
        for (const p of d.picks.filter((x) => x.areaId === a && x.selected)) {
          addProtocol(s, { areaId: a, kind: p.kind, title: p.title.trim() || p.title, minimumVersion: p.minimumVersion.trim(), templateId: p.templateId });
        }
      }
      s.statements = d.statements
        .filter((x) => x.text.trim())
        .map((x, i) => ({ id: uid(), text: x.text.trim(), order: i, linkedProofId: x.proofIndex !== null ? proofIds[x.proofIndex] : undefined }));
      s.setupTasks = setupTasks.map((t) => ({ ...t, done: Boolean(d.setupDone[t.templateId]) }));
      s.settings = { morningTime: d.morningTime, eveningTime: d.eveningTime };
      s.profile = { answers: d.answers, pattern: d.pattern, completedAt: new Date().toISOString() };
    });
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  };

  const step = d.step;
  const back = () => go(step === TIMES && setupTasks.length === 0 ? STATEMENTS : step - 1);

  let body: ReactNode;
  let next: { label: string; onClick: () => void; disabled?: boolean } | null = null;
  let hint: string | null = null;

  if (step === 0) {
    body = (
      <div className="stack" style={{ paddingTop: "12vh" }}>
        <span className="eyebrow">Set Point Protocol</span>
        <h1 className="title">Your answers decide the system. Not a template.</h1>
        <p className="muted">
          A few questions about what keeps breaking and what already works. Then you choose small, exact promises across four areas: Body, Mind, People,
          Mission. Each evening you confirm what you kept. No streaks. A miss is one vote, not a verdict.
        </p>
      </div>
    );
    next = { label: "Start", onClick: () => go(Q0) };
  } else if (step >= Q0 && step < PATTERN) {
    const q = REFRAME_QUESTIONS[step - Q0];
    body = (
      <div className="stack">
        <span className="eyebrow">
          The reframe · {step - Q0 + 1} of {REFRAME_QUESTIONS.length}
        </span>
        <h1 className="h2" id="q">
          {q.question}
        </h1>
        <p className="small muted">{q.hint}</p>
        <textarea
          className="input"
          aria-labelledby="q"
          style={{ minHeight: 140 }}
          maxLength={ANSWER_MAX_CHARS}
          value={d.answers[q.key]}
          onChange={(e) => set({ answers: { ...d.answers, [q.key]: e.target.value } })}
          placeholder="In your own words"
        />
      </div>
    );
    next = {
      label: step === PATTERN - 1 ? "See my pattern" : "Next",
      onClick: () => {
        if (step === PATTERN - 1) set({ step: PATTERN, pattern: undefined });
        else go(step + 1);
      },
    };
    hint = d.answers[q.key].trim() ? null : "You can skip a question, but specific answers make a better system.";
  } else if (step === PATTERN) {
    body = <PatternStep pattern={d.pattern} loading={loading} onRun={runPattern} />;
    next = d.pattern ? { label: "Choose protocols", onClick: () => go(AREA0) } : null;
  } else if (step >= AREA0 && step < PROOF) {
    const areaId = AREA_IDS[step - AREA0];
    const chosen = d.picks.filter((p) => p.areaId === areaId && p.selected && !p.locked).length;
    const total = d.picks.filter((p) => p.areaId === areaId && p.selected).length;
    body = (
      <AreaPickStep
        areaId={areaId}
        line={d.pattern?.areaLines[areaId]}
        picks={d.picks}
        suggested={d.pattern?.suggestedTemplateIds ?? []}
        onChange={(picks) => set({ picks })}
        total={total}
      />
    );
    next = { label: "Next", onClick: () => go(step + 1), disabled: chosen < MIN_PER_AREA };
    hint = chosen < MIN_PER_AREA ? `Pick at least ${MIN_PER_AREA}. Three to five is a good start.` : chosen > 5 ? "More than five is a lot to start with. Fewer, kept, beats more, missed." : null;
  } else if (step === PROOF) {
    body = (
      <div className="stack">
        <span className="eyebrow">Your Proof file</span>
        <h1 className="h2">What have you actually done?</h1>
        <p className="small muted">One to three things: something hard you finished, a time you showed up when it was easier not to.</p>
        {d.proof.map((p, i) => (
          <input
            key={i}
            className="input"
            value={p}
            aria-label={`Proof ${i + 1}`}
            placeholder={i === 0 ? "Something hard I finished" : "Optional"}
            onChange={(e) => {
              const proof = [...d.proof] as Draft["proof"];
              proof[i] = e.target.value;
              set({ proof });
            }}
          />
        ))}
      </div>
    );
    next = { label: "Next", onClick: () => go(STATEMENTS), disabled: !d.proof.some((p) => p.trim()) };
  } else if (step === STATEMENTS) {
    body = <StatementsStep draft={d} onChange={(statements) => set({ statements })} />;
    const filled = d.statements.filter((s) => s.text.trim());
    next = { label: "Next", onClick: () => go(setupTasks.length ? SETUP : TIMES), disabled: filled.length === 0 };
    hint =
      filled.length > 0 && filled.some((s) => s.proofIndex === null)
        ? "Link each statement to proof when you can. No statement without evidence."
        : filled.length > 0 && filled.length < 3
          ? "Three to five statements works well."
          : null;
  } else if (step === SETUP) {
    body = (
      <div className="stack">
        <span className="eyebrow">One-time setup</span>
        <h1 className="h2">Design beats willpower.</h1>
        <p className="small muted">A few one-time jobs make your protocols easier to keep. Tick what's done; the rest stays in Library.</p>
        <div className="card flush list">
          {setupTasks.map((t) => (
            <label key={t.templateId} className="list-item">
              <input
                type="checkbox"
                checked={Boolean(d.setupDone[t.templateId])}
                onChange={(e) => set({ setupDone: { ...d.setupDone, [t.templateId]: e.target.checked } })}
                style={{ width: 20, height: 20 }}
              />
              <span>{t.text}</span>
            </label>
          ))}
        </div>
      </div>
    );
    next = { label: "Next", onClick: () => go(TIMES) };
  } else {
    body = (
      <div className="stack">
        <span className="eyebrow">Times</span>
        <h1 className="h2">When do your mornings and evenings start?</h1>
        <div className="grid-2">
          <label className="field">
            <span>Morning statements</span>
            <input type="time" className="input" value={d.morningTime} onChange={(e) => set({ morningTime: e.target.value || "07:30" })} />
          </label>
          <label className="field">
            <span>Evening log</span>
            <input type="time" className="input" value={d.eveningTime} onChange={(e) => set({ eveningTime: e.target.value || "20:00" })} />
          </label>
        </div>
        <p className="small muted">The home-screen version doesn't send notifications yet. After the evening time, Today puts the evening log first.</p>
      </div>
    );
    next = { label: "Start Today", onClick: finish };
  }

  return (
    <div className="screen no-tabs" style={{ minHeight: "100%" }}>
      <div className="progress-dots" aria-hidden>
        {Array.from({ length: TOTAL }, (_, i) => (
          <span key={i} className={i <= step ? "on" : ""} />
        ))}
      </div>
      {step > 0 && (
        <button className="btn ghost sm" style={{ alignSelf: "flex-start", paddingLeft: 0 }} onClick={back}>
          ‹ Back
        </button>
      )}
      {body}
      <div className="spacer" />
      {hint && <p className="small faint">{hint}</p>}
      {next && (
        <button className="btn primary block" onClick={next.onClick} disabled={next.disabled}>
          {next.label}
        </button>
      )}
    </div>
  );
}

/** Drops a leading "Body:" label (the area name is shown separately) and capitalises the first letter. */
function areaLine(text: string, areaId: AreaId): string {
  const t = text.replace(new RegExp(`^${AREA_NAMES[areaId]}\\s*[:.\u2013\u2014-]\\s*`, "i"), "").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function PatternStep({ pattern, loading, onRun }: { pattern?: PatternSummary; loading: boolean; onRun: () => void }) {
  useEffect(() => {
    if (!pattern && !loading) onRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!pattern) {
    return (
      <div className="stack" style={{ paddingTop: "10vh" }} aria-live="polite">
        <span className="eyebrow">Your pattern</span>
        <h1 className="h2">Reading your answers…</h1>
        <p className="small muted">This takes up to half a minute.</p>
      </div>
    );
  }
  return (
    <div className="stack" aria-live="polite">
      <span className="eyebrow">Your pattern</span>
      <p style={{ fontSize: 18, lineHeight: 1.5 }}>{pattern.summary}</p>
      <div className="card stack-sm">
        {AREA_IDS.map((a) => (
          <p key={a} className="small">
            <strong>{AREA_NAMES[a]}.</strong> {areaLine(pattern.areaLines[a], a)}
          </p>
        ))}
      </div>
      {pattern.source === "offline" && (
        <div className="row-between">
          <span className="tiny faint">Written offline from your answers.</span>
          <button className="btn ghost sm" onClick={onRun} disabled={loading}>
            {loading ? "Trying…" : "Try again"}
          </button>
        </div>
      )}
    </div>
  );
}

function AreaPickStep({
  areaId,
  line,
  picks,
  suggested,
  onChange,
  total,
}: {
  areaId: AreaId;
  line?: string;
  picks: Pick[];
  suggested: string[];
  onChange: (p: Pick[]) => void;
  total: number;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const list = picks.filter((p) => p.areaId === areaId);
  const full = total >= MAX_ACTIVE_PER_AREA;
  const patch = (key: string, change: Partial<Pick>) => onChange(picks.map((p) => (p.key === key ? { ...p, ...change } : p)));

  return (
    <div className="stack">
      <span className="eyebrow">Choose protocols · {AREA_NAMES[areaId]}</span>
      <h1 className="h2">{AREA_NAMES[areaId]}</h1>
      {line && <p className="small muted">{areaLine(line, areaId)}</p>}
      <p className="small faint">Pick 3 to 5. Tap Edit to make the promise and its smallest version your own.</p>
      <div className="card flush list">
        {list.map((p) => (
          <div key={p.key} style={{ borderTop: "1px solid var(--line)" }}>
            <div className="row" style={{ padding: "12px 16px", alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={p.selected}
                disabled={p.locked || (!p.selected && full)}
                onChange={(e) => patch(p.key, { selected: e.target.checked })}
                aria-label={p.title}
                style={{ width: 22, height: 22, marginTop: 2, flex: "none" }}
              />
              <div className="grow stack-sm" style={{ gap: 2 }}>
                <span className="row" style={{ gap: 6 }}>
                  <KindTag kind={p.kind} />
                  {p.templateId && suggested.includes(p.templateId) && !p.locked && <span className="tiny" style={{ color: "var(--accent)" }}>Suggested</span>}
                  {p.locked && <span className="tiny faint">Always on</span>}
                </span>
                <span>{p.title}</span>
                {p.minimumVersion && <span className="small faint">Smallest: {p.minimumVersion}</span>}
              </div>
              {p.selected && !p.locked && (
                <button className="btn ghost sm" onClick={() => setEditing(editing === p.key ? null : p.key)}>
                  {editing === p.key ? "Done" : "Edit"}
                </button>
              )}
            </div>
            {editing === p.key && (
              <div className="stack-sm" style={{ padding: "0 16px 14px" }}>
                <label className="field">
                  <span>Promise</span>
                  <input className="input" value={p.title} onChange={(e) => patch(p.key, { title: e.target.value })} />
                </label>
                <label className="field">
                  <span>Smallest version</span>
                  <input className="input" value={p.minimumVersion} onChange={(e) => patch(p.key, { minimumVersion: e.target.value })} />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
      {adding ? (
        <div className="card">
          <ProtocolForm
            submitLabel="Add"
            onCancel={() => setAdding(false)}
            onSubmit={(x) => {
              onChange([...picks, { key: uid(), areaId, ...x, selected: true }]);
              setAdding(false);
            }}
          />
        </div>
      ) : (
        <button className="btn" onClick={() => setAdding(true)} disabled={full}>
          Add your own
        </button>
      )}
    </div>
  );
}

function StatementsStep({ draft, onChange }: { draft: Draft; onChange: (s: Draft["statements"]) => void }) {
  const proofs = draft.proof.map((p, i) => ({ i, text: p.trim() })).filter((p) => p.text);
  const list = draft.statements;
  const add = (text: string) => onChange([...list, { key: uid(), text, proofIndex: proofs.length === 1 ? proofs[0].i : null }]);
  const used = new Set(list.map((s) => s.text));
  return (
    <div className="stack">
      <span className="eyebrow">Statements</span>
      <h1 className="h2">How do you act?</h1>
      <p className="small muted">Write or pick 3 to 5, phrased as how you act. Link each to something in your Proof file.</p>
      <div className="chips">
        {STATEMENT_EXAMPLES.filter((x) => !used.has(x)).map((x) => (
          <button key={x} className="chip" onClick={() => add(x)}>
            + {x}
          </button>
        ))}
      </div>
      {list.map((s, idx) => (
        <div key={s.key} className="card stack-sm">
          <input
            className="input"
            value={s.text}
            aria-label={`Statement ${idx + 1}`}
            placeholder="I …"
            onChange={(e) => onChange(list.map((x) => (x.key === s.key ? { ...x, text: e.target.value } : x)))}
          />
          <label className="field">
            <span>Backed by</span>
            <select
              className="input"
              value={s.proofIndex ?? ""}
              onChange={(e) => onChange(list.map((x) => (x.key === s.key ? { ...x, proofIndex: e.target.value === "" ? null : Number(e.target.value) } : x)))}
            >
              <option value="">No proof linked yet</option>
              {proofs.map((p) => (
                <option key={p.i} value={p.i}>
                  {p.text}
                </option>
              ))}
            </select>
          </label>
          <button className="btn ghost sm danger" style={{ alignSelf: "flex-end" }} onClick={() => onChange(list.filter((x) => x.key !== s.key))}>
            Remove
          </button>
        </div>
      ))}
      <button className="btn" onClick={() => add("")}>
        Write your own
      </button>
    </div>
  );
}

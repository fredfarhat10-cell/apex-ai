import { useState } from "react";
import type { Kind } from "../lib/types";
import { KIND_LABEL } from "./ui";

export interface ProtocolDraft {
  kind: Kind;
  title: string;
  minimumVersion: string;
}

export function ProtocolForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: ProtocolDraft;
  submitLabel: string;
  onSubmit: (d: ProtocolDraft) => void;
  onCancel?: () => void;
}) {
  const [d, setD] = useState<ProtocolDraft>(initial ?? { kind: "daily", title: "", minimumVersion: "" });
  return (
    <form
      className="stack-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (d.title.trim()) onSubmit({ ...d, title: d.title.trim(), minimumVersion: d.minimumVersion.trim() });
      }}
    >
      <div className="seg" role="radiogroup" aria-label="Kind">
        {(["rule", "trigger", "daily"] as Kind[]).map((k) => (
          <button type="button" key={k} role="radio" aria-checked={d.kind === k} className={d.kind === k ? "on" : ""} onClick={() => setD({ ...d, kind: k })}>
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <p className="tiny faint">
        {d.kind === "rule"
          ? "Rule: decided once, confirmed each day."
          : d.kind === "trigger"
            ? "Trigger: if this happens, then I do that. Doesn't count on days it doesn't fire."
            : "Daily: an action you do each day."}
      </p>
      <label className="field">
        <span>Promise</span>
        <input
          className="input"
          value={d.title}
          onChange={(e) => setD({ ...d, title: e.target.value })}
          placeholder={d.kind === "trigger" ? "If X happens: I do Y" : "A small, exact promise"}
        />
      </label>
      <label className="field">
        <span>Smallest version</span>
        <input className="input" value={d.minimumVersion} onChange={(e) => setD({ ...d, minimumVersion: e.target.value })} placeholder="What counts on a bad day" />
      </label>
      <div className="btn-row">
        {onCancel && (
          <button type="button" className="btn sm" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn sm primary" disabled={!d.title.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

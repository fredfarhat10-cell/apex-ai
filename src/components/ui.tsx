import { useEffect, useRef, type ReactNode } from "react";
import type { Kind, Outcome } from "../lib/types";

export function Sheet({
  title,
  onClose,
  children,
  full,
  closeLabel = "Close",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  full?: boolean;
  closeLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`sheet${full ? " full" : ""}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="sheet-head">
          <h2 className="h3">{title}</h2>
          <button className="btn ghost sm" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export const KIND_LABEL: Record<Kind, string> = { rule: "Rule", trigger: "Trigger", daily: "Daily" };

export function KindTag({ kind }: { kind: Kind }) {
  return <span className="tag">{KIND_LABEL[kind]}</span>;
}

/** A Rule or Daily row: tap toggles kept. */
export function CheckRow({
  kind,
  title,
  sub,
  kept,
  missed,
  onToggle,
  disabled,
}: {
  kind: Kind;
  title: string;
  sub?: string;
  kept: boolean;
  missed?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`proto${disabled ? " static" : ""}`}
      onClick={disabled ? undefined : onToggle}
      aria-pressed={kept}
      aria-disabled={disabled}
    >
      <span className="text">
        <span className="row" style={{ gap: 8 }}>
          <KindTag kind={kind} />
        </span>
        <span className="t">{title}</span>
        {sub && <span className="m">{sub}</span>}
      </span>
      <span className={`check${kept ? " on" : missed ? " missed" : ""}`} aria-hidden />
    </button>
  );
}

/** A Trigger row: hasn't fired (default) / fired, handled / fired, not handled. */
export function TriggerRow({
  title,
  sub,
  value,
  onChange,
}: {
  title: string;
  sub?: string;
  value: Outcome | undefined;
  onChange: (o: Outcome | undefined) => void;
}) {
  const v = value ?? "didNotFire";
  return (
    <div className="trigger">
      <div className="text stack-sm" style={{ gap: 2 }}>
        <span>
          <KindTag kind="trigger" />
        </span>
        <span className="t" style={{ fontWeight: 550 }}>
          {title}
        </span>
        {sub && <span className="m small faint">{sub}</span>}
      </div>
      <div className="seg" role="radiogroup" aria-label={title}>
        <button role="radio" aria-checked={v === "didNotFire"} className={v === "didNotFire" ? "on" : ""} onClick={() => onChange(undefined)}>
          Hasn't fired
        </button>
        <button role="radio" aria-checked={v === "kept"} className={v === "kept" ? "on kept" : ""} onClick={() => onChange("kept")}>
          Fired, handled
        </button>
        <button role="radio" aria-checked={v === "missed"} className={v === "missed" ? "on missed" : ""} onClick={() => onChange("missed")}>
          Fired, not handled
        </button>
      </div>
    </div>
  );
}

export function fmtScore(s: number | null | undefined): string {
  return s === null || s === undefined ? "–" : s.toFixed(1);
}

export function Chevron() {
  return (
    <svg className="chev" width="8" height="14" viewBox="0 0 8 14" aria-hidden>
      <path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UpDown({ onUp, onDown, label }: { onUp: () => void; onDown: () => void; label: string }) {
  return (
    <span className="row" style={{ gap: 4 }}>
      <button className="btn sm" onClick={onUp} aria-label={`Move ${label} up`}>
        ↑
      </button>
      <button className="btn sm" onClick={onDown} aria-label={`Move ${label} down`}>
        ↓
      </button>
    </span>
  );
}

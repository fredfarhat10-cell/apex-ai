import { useMemo, useState } from "react";
import { Sheet } from "../components/ui";
import { update } from "../lib/store";
import { uid } from "../lib/store-core";
import type { AppState, AreaId, SlipState } from "../lib/types";
import { AREA_IDS, AREA_NAMES, SLIP_STATES } from "../lib/types";

const DEFAULT_PLACES = ["Bed", "Desk", "Couch", "Kitchen", "Commute", "Out"];

export function SlipSheet({ state, onClose }: { state: AppState; onClose: () => void }) {
  const [area, setArea] = useState<AreaId | null>(null);
  const [slipState, setSlipState] = useState<SlipState | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState("");

  const places = useMemo(() => {
    const recent: string[] = [];
    for (const s of [...state.slips].reverse()) {
      if (s.place && !recent.includes(s.place)) recent.push(s.place);
      if (recent.length >= 4) break;
    }
    return [...recent, ...DEFAULT_PLACES.filter((p) => !recent.includes(p))].slice(0, 8);
  }, [state.slips]);

  const save = (place: string) => {
    if (!area || !slipState) return;
    const id = uid();
    update((s) => {
      s.slips.push({ id, timestamp: new Date().toISOString(), areaId: area, state: slipState, place: place.trim(), note: "" });
    });
    setSavedId(id);
  };

  const close = () => {
    if (savedId && note.trim()) {
      update((s) => {
        s.slips = s.slips.map((x) => (x.id === savedId ? { ...x, note: note.trim() } : x));
      });
    }
    onClose();
  };

  return (
    <Sheet title="Log a slip" onClose={close} closeLabel={savedId ? "Done" : "Cancel"}>
      {savedId ? (
        <div className="stack">
          <p className="h2">One vote. Next protocol.</p>
          <label className="field">
            <span>Note (optional)</span>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything worth remembering" />
          </label>
          <button className="btn primary block" onClick={close}>
            Done
          </button>
        </div>
      ) : !area ? (
        <div className="stack">
          <p className="muted">Which area?</p>
          <div className="grid-2">
            {AREA_IDS.map((a) => (
              <button key={a} className="btn" style={{ minHeight: 56 }} onClick={() => setArea(a)}>
                {AREA_NAMES[a]}
              </button>
            ))}
          </div>
        </div>
      ) : !slipState ? (
        <div className="stack">
          <p className="muted">What was going on?</p>
          <div className="chips">
            {SLIP_STATES.map((s) => (
              <button key={s.id} className="chip" onClick={() => setSlipState(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="stack">
          <p className="muted">Where?</p>
          <div className="chips">
            {places.map((p) => (
              <button key={p} className="chip" onClick={() => save(p)}>
                {p}
              </button>
            ))}
          </div>
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              if (custom.trim()) save(custom);
            }}
          >
            <input className="input grow" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Somewhere else" aria-label="Place" />
            <button className="btn" type="submit" disabled={!custom.trim()}>
              Save
            </button>
          </form>
        </div>
      )}
    </Sheet>
  );
}

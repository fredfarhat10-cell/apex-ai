import { formatShort } from "../lib/dates";

export interface ChartPoint {
  week: string;
  average: number | null;
  floor: number | null;
}

const W = 320;
const H = 150;
const PAD = { l: 22, r: 8, t: 8, b: 22 };

function segments(points: ChartPoint[], key: "average" | "floor") {
  const step = (W - PAD.l - PAD.r) / Math.max(1, points.length - 1);
  const y = (v: number) => PAD.t + (1 - v / 10) * (H - PAD.t - PAD.b);
  const segs: string[] = [];
  const dots: { x: number; y: number }[] = [];
  let cur: string[] = [];
  points.forEach((p, i) => {
    const v = p[key];
    if (v === null) {
      if (cur.length) segs.push(cur.join(" "));
      cur = [];
      return;
    }
    const pt = `${(PAD.l + i * step).toFixed(1)},${y(v).toFixed(1)}`;
    cur.push(pt);
    dots.push({ x: PAD.l + i * step, y: y(v) });
  });
  if (cur.length) segs.push(cur.join(" "));
  return { segs, dots };
}

/** 12-week chart: weekly average (solid) and weekly floor (dashed), 0–10 scale with the 7 target marked. */
export function SetPointChart({ points, label }: { points: ChartPoint[]; label: string }) {
  const avg = segments(points, "average");
  const floor = segments(points, "floor");
  const y = (v: number) => PAD.t + (1 - v / 10) * (H - PAD.t - PAD.b);
  const step = (W - PAD.l - PAD.r) / Math.max(1, points.length - 1);
  const labelIdx = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label} style={{ display: "block" }}>
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={PAD.l - 6} y={y(v) + 4} fontSize="10" textAnchor="end" fill="var(--ink-3)">
              {v}
            </text>
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={y(7)} y2={y(7)} stroke="var(--accent)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 3" />
        <text x={PAD.l - 6} y={y(7) + 4} fontSize="10" textAnchor="end" fill="var(--accent)">
          7
        </text>
        {floor.segs.map((s, i) => (
          <polyline key={`f${i}`} points={s} fill="none" stroke="var(--ink-2)" strokeWidth="1.75" strokeDasharray="4 4" strokeLinejoin="round" />
        ))}
        {floor.dots.map((d, i) => (
          <circle key={`fd${i}`} cx={d.x} cy={d.y} r="2.2" fill="var(--ink-2)" />
        ))}
        {avg.segs.map((s, i) => (
          <polyline key={`a${i}`} points={s} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {avg.dots.map((d, i) => (
          <circle key={`ad${i}`} cx={d.x} cy={d.y} r="3" fill="var(--accent)" />
        ))}
        {labelIdx.map((i) => (
          <text key={i} x={PAD.l + i * step} y={H - 6} fontSize="10" fill="var(--ink-3)" textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}>
            {formatShort(points[i].week)}
          </text>
        ))}
      </svg>
      <figcaption className="row tiny faint" style={{ gap: 14, marginTop: 4 }}>
        <span className="row" style={{ gap: 6 }}>
          <svg width="18" height="6" aria-hidden>
            <line x1="0" x2="18" y1="3" y2="3" stroke="var(--accent)" strokeWidth="2.5" />
          </svg>
          Weekly average
        </span>
        <span className="row" style={{ gap: 6 }}>
          <svg width="18" height="6" aria-hidden>
            <line x1="0" x2="18" y1="3" y2="3" stroke="var(--ink-2)" strokeWidth="1.75" strokeDasharray="4 3" />
          </svg>
          Weekly floor
        </span>
      </figcaption>
    </figure>
  );
}

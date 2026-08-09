import { generatePcb } from "@/lib/pcb/generate";
import type { Trace } from "@/lib/pcb/types";

/**
 * A flat, static circuit-board pattern rendered as plain SVG — no WebGL,
 * no camera, no lighting or bloom. Every earlier attempt at a "3D" version
 * of this look (tilt, shadows, bloom, drift) rendered differently on real
 * hardware than in this sandbox's software-rendered test browser, which is
 * exactly why those rounds kept missing. SVG is vector and deterministic:
 * what gets built here is pixel-for-pixel what ships, on any device.
 */

const WIDTH = 1600;
const HEIGHT = 900;

const TRACE_LOW = { r: 0x24, g: 0x42, b: 0x7a };
const TRACE_HIGH = { r: 0x5b, g: 0x8c, b: 0xf0 };
const CHIP_FILL = "#18234a";
const CHIP_STROKE = "#3a5fac";
const PAD_COLOR = "#5b8cf0";
const PIN_COLOR = "#2c4a8f";

function lerpChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function traceColor(tint: number): string {
  const r = lerpChannel(TRACE_LOW.r, TRACE_HIGH.r, tint);
  const g = lerpChannel(TRACE_LOW.g, TRACE_HIGH.g, tint);
  const b = lerpChannel(TRACE_LOW.b, TRACE_HIGH.b, tint);
  return `rgb(${r},${g},${b})`;
}

function pathFor(trace: Trace): string {
  return trace.points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
}

function traceLength(trace: Trace): number {
  let len = 0;
  for (let i = 1; i < trace.points.length; i++) {
    const a = trace.points[i - 1];
    const b = trace.points[i];
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}

export default function CircuitBackground({ className }: { className?: string }) {
  const layout = generatePcb({ width: WIDTH, height: HEIGHT, density: 0.85, seed: 0x9e7a });

  // a handful of traces read as "live" — a short bright dash animated along
  // their length on a loop, the one bit of motion in an otherwise still,
  // crisp board
  const eligible = layout.traces.filter((t) => t.points.length >= 3);
  const liveIndices = new Set<number>();
  for (let i = 0; i < eligible.length && liveIndices.size < 8; i += Math.floor(eligible.length / 8) || 1) {
    liveIndices.add(i);
  }

  return (
    <div aria-hidden="true" className={className}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
      >
        <defs>
          <radialGradient id="circuit-bg" cx="30%" cy="15%" r="85%">
            <stop offset="0%" stopColor="#0a1330" />
            <stop offset="100%" stopColor="#05091a" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#circuit-bg)" />

        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {layout.traces.map((trace, i) => (
            <path
              key={`trace-${i}`}
              d={pathFor(trace)}
              stroke={traceColor(trace.tint)}
              strokeWidth={1.6}
              opacity={0.55}
            />
          ))}
        </g>

        {eligible.map((trace, i) => {
          if (!liveIndices.has(i)) return null;
          const len = traceLength(trace);
          const dash = Math.max(24, len * 0.12);
          const duration = 3.5 + (i % 5) * 0.9;
          const delay = (i % 7) * 0.6;
          return (
            <path
              key={`live-${i}`}
              className="circuit-live"
              d={pathFor(trace)}
              fill="none"
              stroke="#8fb4fb"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${Math.max(1, len - dash)}`}
              opacity={0.85}
              style={{
                animationDuration: `${duration}s`,
                animationDelay: `-${delay}s`,
              }}
            />
          );
        })}

        <g>
          {layout.vias.map((via, i) => (
            <circle key={`via-${i}`} cx={via.x} cy={via.y} r={via.r} fill={PAD_COLOR} opacity={0.5} />
          ))}
          {layout.pads.map((pad, i) =>
            pad.square ? (
              <rect
                key={`pad-${i}`}
                x={pad.x - pad.r}
                y={pad.y - pad.r}
                width={pad.r * 2}
                height={pad.r * 2}
                fill={PAD_COLOR}
                opacity={0.6}
              />
            ) : (
              <circle key={`pad-${i}`} cx={pad.x} cy={pad.y} r={pad.r} fill={PAD_COLOR} opacity={0.6} />
            ),
          )}
        </g>

        <g>
          {layout.chips.map((chip, i) => (
            <g key={`chip-${i}`}>
              {chip.pins.map((pin, pi) => (
                <line
                  key={pi}
                  x1={pin.x1}
                  y1={pin.y1}
                  x2={pin.x2}
                  y2={pin.y2}
                  stroke={PIN_COLOR}
                  strokeWidth={1.4}
                  opacity={0.75}
                />
              ))}
              <rect
                x={chip.x}
                y={chip.y}
                width={chip.w}
                height={chip.h}
                rx={1.5}
                fill={CHIP_FILL}
                stroke={CHIP_STROKE}
                strokeWidth={1}
              />
              <circle cx={chip.dot.x} cy={chip.dot.y} r={1.6} fill={PAD_COLOR} opacity={0.8} />
            </g>
          ))}
        </g>
      </svg>

      <style>{`
        .circuit-live {
          animation-name: circuit-flow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes circuit-flow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -1000; }
        }
        @media (prefers-reduced-motion: reduce) {
          .circuit-live { animation: none; }
        }
      `}</style>
    </div>
  );
}

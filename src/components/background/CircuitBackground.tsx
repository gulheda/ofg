import { generatePcb } from "@/lib/pcb/generate";
import type { Trace } from "@/lib/pcb/types";

/**
 * A flat, static circuit-board pattern rendered as plain SVG — no WebGL, no
 * camera, no lighting, bloom, or animation. Earlier rounds (3D tilt/shadow/
 * bloom, then an animated "current flowing" version) all read as artificial
 * or patchy; a single calm trace color and no motion is what actually
 * matches a real fabricated board. SVG is vector and deterministic too —
 * what gets built here is pixel-for-pixel what ships, on any device.
 */

const WIDTH = 1600;
const HEIGHT = 900;

// one calm, uniform trace tone instead of per-trace random hue/brightness —
// random tinting read as patchy and artificial rather than a real board's
// single consistent copper color
const TRACE_COLOR = "#3a5fac";
const CHIP_FILL = "#141d3d";
const CHIP_STROKE = "#33538f";
const PAD_COLOR = "#4d76c9";
const PIN_COLOR = "#2c4a8f";

function pathFor(trace: Trace): string {
  return trace.points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
}

export default function CircuitBackground({ className }: { className?: string }) {
  const layout = generatePcb({ width: WIDTH, height: HEIGHT, density: 0.55, seed: 0x9e7a });

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

        <g fill="none" strokeLinecap="round" strokeLinejoin="round" stroke={TRACE_COLOR} opacity={0.45}>
          {layout.traces.map((trace, i) => (
            <path key={`trace-${i}`} d={pathFor(trace)} strokeWidth={1.6} />
          ))}
        </g>

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
    </div>
  );
}

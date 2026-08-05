import type { ProjectVisual as Variant } from "@/data/projects";

const stroke = "rgba(228,228,231,0.35)";
const accent = "#2F6FEE";
const accentSoft = "rgba(47,111,238,0.55)";
const label = "rgba(228,228,231,0.5)";

/**
 * Hand-drawn schematic illustrations — one per project, drawn as inline SVG
 * so every visual is original, crisp at any DPI and costs zero network bytes.
 */
export default function ProjectVisual({ variant }: { variant: Variant }) {
  return (
    <svg
      viewBox="0 0 400 220"
      role="img"
      aria-hidden="true"
      className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <pattern id="dotgrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.06)" />
        </pattern>
      </defs>
      <rect width="400" height="220" fill="url(#dotgrid)" />
      {variant === "uav" && <UavArt />}
      {variant === "cansat" && <CansatArt />}
      {variant === "swarm" && <SwarmArt />}
    </svg>
  );
}

/** Quadcopter top view: flight controller + power distribution to four ESCs. */
function UavArt() {
  const arms = [
    { mx: 110, my: 50 },
    { mx: 290, my: 50 },
    { mx: 110, my: 170 },
    { mx: 290, my: 170 },
  ];
  return (
    <g stroke={stroke} strokeWidth="1.2">
      {/* flight controller */}
      <rect x="176" y="86" width="48" height="48" rx="4" stroke={accentSoft} />
      <circle cx="184" cy="94" r="2" fill={accent} stroke="none" />
      <text x="200" y="114" textAnchor="middle" fill={label} fontSize="9" fontFamily="monospace" stroke="none">FC</text>
      {/* arms with power traces to motors */}
      {arms.map((a) => (
        <g key={`${a.mx}-${a.my}`}>
          <path d={`M200 110 L${a.mx} ${a.my}`} stroke={accent} strokeWidth="1.4" className="signal-line" />
          {/* ESC inline on the arm */}
          <rect
            x={(200 + a.mx) / 2 - 9}
            y={(110 + a.my) / 2 - 6}
            width="18"
            height="12"
            rx="2"
          />
          {/* motor + prop arcs */}
          <circle cx={a.mx} cy={a.my} r="12" stroke={accentSoft} />
          <circle cx={a.mx} cy={a.my} r="3" fill={accent} stroke="none" />
          <path d={`M${a.mx - 26} ${a.my} a26 26 0 0 1 12 -22`} />
          <path d={`M${a.mx + 26} ${a.my} a26 26 0 0 1 -12 22`} />
        </g>
      ))}
      {/* battery + PDB rail */}
      <path d="M200 134 V158" stroke={accent} strokeWidth="1.4" className="signal-line" />
      <rect x="178" y="158" width="44" height="20" rx="3" />
      <path d="M186 154 H194 M203 150 H211" />
      <text x="200" y="172" textAnchor="middle" fill={label} fontSize="8" fontFamily="monospace" stroke="none">LiPo 4S</text>
      <text x="316" y="112" fill="rgba(47,111,238,0.6)" fontSize="8" fontFamily="monospace" stroke="none">PDB →</text>
    </g>
  );
}

/** Model satellite: flight computer, sensor bus and RF telemetry downlink. */
function CansatArt() {
  return (
    <g stroke={stroke} strokeWidth="1.2">
      {/* cansat body */}
      <rect x="72" y="48" width="70" height="120" rx="10" stroke={accentSoft} />
      <path d="M72 76 H142 M72 140 H142" />
      <text x="107" y="112" textAnchor="middle" fill={label} fontSize="9" fontFamily="monospace" stroke="none">FC</text>
      {/* parachute hint */}
      <path d="M87 48 a20 20 0 0 1 40 0" strokeDasharray="3 4" />
      {/* sensor blocks on the bus */}
      {[
        { y: 70, name: "GPS" },
        { y: 106, name: "IMU" },
        { y: 142, name: "BARO" },
      ].map((s) => (
        <g key={s.name}>
          <rect x="196" y={s.y - 11} width="42" height="22" rx="3" />
          <text x="217" y={s.y + 3} textAnchor="middle" fill={label} fontSize="8" fontFamily="monospace" stroke="none">{s.name}</text>
          <path d={`M196 ${s.y} H168 L156 ${s.y - 8} H142`} />
        </g>
      ))}
      {/* RF downlink to ground station */}
      <path d="M142 90 H280 L300 110 H316" stroke={accent} strokeWidth="1.4" className="signal-line" />
      <path d="M322 96 a20 20 0 0 1 20 -20" stroke={accent} />
      <path d="M322 96 a12 12 0 0 1 12 -12" stroke={accent} />
      <circle cx="322" cy="96" r="2" fill={accent} stroke="none" />
      {/* ground station */}
      <rect x="300" y="150" width="56" height="30" rx="3" />
      <path d="M322 110 V150" strokeDasharray="4 4" stroke={accentSoft} />
      <text x="328" y="169" textAnchor="middle" fill={label} fontSize="8" fontFamily="monospace" stroke="none">YER İST.</text>
      <text x="238" y="82" fill="rgba(47,111,238,0.6)" fontSize="8" fontFamily="monospace" stroke="none">TLM →</text>
    </g>
  );
}

/** Swarm: three UAV nodes synchronised over a MAVLink mesh + GCS. */
function SwarmArt() {
  const drones = [
    { x: 110, y: 62 },
    { x: 290, y: 62 },
    { x: 200, y: 128 },
  ];
  return (
    <g stroke={stroke} strokeWidth="1.2">
      {drones.map((d) => (
        <g key={`${d.x}-${d.y}`}>
          {/* mini quad glyph: body + two rotor circles */}
          <rect x={d.x - 10} y={d.y - 7} width="20" height="14" rx="3" stroke={accentSoft} />
          <path d={`M${d.x - 10} ${d.y - 7} L${d.x - 20} ${d.y - 15} M${d.x + 10} ${d.y - 7} L${d.x + 20} ${d.y - 15}`} />
          <circle cx={d.x - 22} cy={d.y - 17} r="6" />
          <circle cx={d.x + 22} cy={d.y - 17} r="6" />
          <circle cx={d.x} cy={d.y} r="2" fill={accent} stroke="none" />
        </g>
      ))}
      {/* mesh links between drones */}
      <path
        d="M124 66 L184 122 M276 66 L216 122 M124 58 H272"
        stroke={accentSoft}
        className="signal-line"
      />
      <text x="200" y="48" textAnchor="middle" fill="rgba(47,111,238,0.6)" fontSize="8" fontFamily="monospace" stroke="none">MAVLink MESH</text>
      {/* ground control station */}
      <rect x="164" y="168" width="72" height="28" rx="3" />
      <text x="200" y="186" textAnchor="middle" fill={label} fontSize="8" fontFamily="monospace" stroke="none">GCS</text>
      <path d="M200 138 V168" stroke={accent} strokeWidth="1.4" className="signal-line" />
      {/* sync pulses on the uplink */}
      <circle cx="200" cy="150" r="2" fill={accent} stroke="none" />
      <circle cx="200" cy="159" r="1.4" fill={accentSoft} stroke="none" />
    </g>
  );
}

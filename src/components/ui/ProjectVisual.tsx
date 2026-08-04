import type { ProjectVisual as Variant } from "@/data/projects";

const stroke = "rgba(228,228,231,0.35)";
const accent = "#3B82F6";
const accentSoft = "rgba(59,130,246,0.55)";

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
      {variant === "mcu" && <McuArt />}
      {variant === "power" && <PowerArt />}
      {variant === "sensor" && <SensorArt />}
      {variant === "signal" && <SignalArt />}
    </svg>
  );
}

function McuArt() {
  const pinsLeft = [80, 95, 110, 125, 140];
  return (
    <g stroke={stroke} strokeWidth="1.2">
      {/* IC package */}
      <rect x="160" y="70" width="80" height="80" rx="4" stroke={accentSoft} />
      <circle cx="172" cy="82" r="2.5" fill={accent} stroke="none" />
      <text x="200" y="115" textAnchor="middle" fill="rgba(228,228,231,0.5)" fontSize="10" fontFamily="monospace" stroke="none">STM32F4</text>
      {/* left pins escaping to pads with 45° bends */}
      {pinsLeft.map((y, i) => (
        <g key={y}>
          <path d={`M160 ${y} H${120 - i * 6} L${100 - i * 6} ${y + 20} H60`} />
          <circle cx="52" cy={y + 20} r="4" stroke={accentSoft} />
        </g>
      ))}
      {/* right side to USB */}
      <path d={`M240 95 H290 L310 115 H340`} stroke={accent} strokeWidth="1.4" />
      <path d={`M240 110 H284 L304 130 H340`} stroke={accent} strokeWidth="1.4" />
      <rect x="340" y="100" width="26" height="42" rx="3" />
      <text x="353" y="126" textAnchor="middle" fill="rgba(228,228,231,0.5)" fontSize="8" fontFamily="monospace" stroke="none">USB</text>
      {/* bottom decoupling caps */}
      {[180, 200, 220].map((x) => (
        <g key={x}>
          <path d={`M${x} 150 V166`} />
          <path d={`M${x - 6} 166 H${x + 6} M${x - 6} 172 H${x + 6}`} />
        </g>
      ))}
    </g>
  );
}

function PowerArt() {
  return (
    <g stroke={stroke} strokeWidth="1.2">
      {/* Vin */}
      <text x="34" y="86" fill="rgba(228,228,231,0.5)" fontSize="10" fontFamily="monospace" stroke="none">24V</text>
      <path d="M30 100 H90" />
      {/* MOSFET switch */}
      <rect x="90" y="84" width="34" height="32" rx="3" stroke={accentSoft} />
      <path d="M124 100 H160" />
      {/* inductor: coil bumps */}
      <path d="M160 100 a8 8 0 0 1 16 0 a8 8 0 0 1 16 0 a8 8 0 0 1 16 0 a8 8 0 0 1 16 0" stroke={accent} strokeWidth="1.5" />
      <path d="M224 100 H300" />
      {/* sync FET to ground */}
      <path d="M160 100 V140" />
      <rect x="146" y="140" width="28" height="26" rx="3" />
      <path d="M160 166 V180 M150 180 H170 M154 185 H166 M158 190 H162" />
      {/* output cap */}
      <path d="M260 100 V132 M250 132 H270 M250 140 H270 M260 140 V172 M250 172 H270 M254 177 H266 M258 182 H262" />
      {/* Vout */}
      <circle cx="300" cy="100" r="3.5" stroke={accent} />
      <text x="312" y="96" fill="rgba(228,228,231,0.6)" fontSize="10" fontFamily="monospace" stroke="none">5V / 3A</text>
      {/* PWM feedback dashed */}
      <path d="M300 110 V150 H120 V116" strokeDasharray="4 4" stroke={accentSoft} />
      <text x="196" y="162" textAnchor="middle" fill="rgba(59,130,246,0.6)" fontSize="8" fontFamily="monospace" stroke="none">FEEDBACK</text>
    </g>
  );
}

function SensorArt() {
  return (
    <g stroke={stroke} strokeWidth="1.2">
      {/* ESP module with antenna area */}
      <rect x="60" y="70" width="90" height="80" rx="4" stroke={accentSoft} />
      <path d="M70 80 H100 M70 88 H100 M70 96 H100" stroke={accent} strokeWidth="1" />
      <text x="105" y="120" textAnchor="middle" fill="rgba(228,228,231,0.5)" fontSize="9" fontFamily="monospace" stroke="none">ESP32</text>
      {/* wifi arcs */}
      <path d="M170 78 a26 26 0 0 1 26 -26" stroke={accent} />
      <path d="M170 78 a16 16 0 0 1 16 -16" stroke={accent} />
      <circle cx="171" cy="77" r="2" fill={accent} stroke="none" />
      {/* sensor blocks feeding in */}
      {[
        { y: 84, label: "T°" },
        { y: 110, label: "RH" },
        { y: 136, label: "AQ" },
      ].map((s) => (
        <g key={s.label}>
          <rect x="238" y={s.y - 10} width="34" height="22" rx="3" />
          <text x="255" y={s.y + 4} textAnchor="middle" fill="rgba(228,228,231,0.5)" fontSize="8" fontFamily="monospace" stroke="none">{s.label}</text>
          <path d={`M238 ${s.y} H190 L172 ${s.y - 8} H150`} />
        </g>
      ))}
      {/* battery */}
      <path d="M105 150 V170 M95 170 H115 M99 176 H111" />
      <text x="300" y="115" fill="rgba(59,130,246,0.6)" fontSize="8" fontFamily="monospace" stroke="none">MQTT →</text>
    </g>
  );
}

function SignalArt() {
  // FFT-like bars, tallest around the fundamental
  const bars = [14, 26, 58, 34, 20, 46, 16, 10, 24, 12, 8, 6];
  return (
    <g stroke={stroke} strokeWidth="1.2">
      {/* time-domain waveform */}
      <path
        d="M40 70 q10 -28 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"
        stroke={accent}
        strokeWidth="1.5"
      />
      <path d="M40 70 H364" strokeDasharray="2 6" stroke="rgba(255,255,255,0.15)" />
      {/* arrow to frequency domain */}
      <path d="M200 96 V116 M195 110 L200 117 L205 110" stroke={accentSoft} />
      <text x="212" y="112" fill="rgba(59,130,246,0.6)" fontSize="8" fontFamily="monospace" stroke="none">FFT</text>
      {/* frequency-domain bars */}
      {bars.map((h, i) => (
        <rect
          key={i}
          x={70 + i * 22}
          y={186 - h}
          width="10"
          height={h}
          rx="2"
          fill={i === 2 ? accentSoft : "rgba(228,228,231,0.18)"}
          stroke="none"
        />
      ))}
      <path d="M60 188 H350" />
    </g>
  );
}

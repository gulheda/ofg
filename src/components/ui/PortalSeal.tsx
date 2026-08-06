"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A signal-acquisition HUD, not a mystic circle: a rotating radar sweep,
 * a lock-on reticle at the centre, and a live-looking telemetry readout
 * beside it. The Doctor Strange "circle opening" beat is still there — it
 * snaps open on mount and idles afterward — but everything it's built
 * from (sweep, bezel ticks, corner brackets, a signal-lock label) reads
 * as the RF/telemetry equipment this site is actually about, not a rune.
 */
export default function PortalSeal({ className = "" }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const spin = (duration: number, reverse = false) =>
    reducedMotion
      ? undefined
      : {
          animate: { rotate: reverse ? -360 : 360 },
          transition: { duration, repeat: Infinity, ease: "linear" as const },
        };

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      initial={{ opacity: 0, scale: 0.5, rotate: -60 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: reducedMotion ? 0 : 1.2,
        delay: reducedMotion ? 0 : 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <svg
        viewBox="0 0 400 400"
        className="h-full w-full"
        style={{ filter: "drop-shadow(0 0 30px rgba(0,210,255,0.3))" }}
      >
        <defs>
          <radialGradient id="seal-sweep" cx="200" cy="200" r="186" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(0,210,255,0)" />
            <stop offset="100%" stopColor="rgba(0,210,255,0.5)" />
          </radialGradient>
        </defs>

        {/* outer bezel: dashed ring + tick marks, slow clockwise drift */}
        <motion.g style={{ transformOrigin: "200px 200px" }} {...spin(80)}>
          <circle cx="200" cy="200" r="188" fill="none" stroke="rgba(0,210,255,0.35)" strokeWidth="1" strokeDasharray="2 7" />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={200 + Math.cos(a) * 178}
                y1={200 + Math.sin(a) * 178}
                x2={200 + Math.cos(a) * 188}
                y2={200 + Math.sin(a) * 188}
                stroke="rgba(0,210,255,0.4)"
                strokeWidth="1"
              />
            );
          })}
        </motion.g>

        {/* radar sweep — the one clearly-legible "signal search" cue */}
        <motion.g
          style={{ transformOrigin: "200px 200px" }}
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={reducedMotion ? undefined : { duration: 5.5, repeat: Infinity, ease: "linear" }}
        >
          <path d="M200,200 L200,14 A186,186 0 0 1 319.6,57.5 Z" fill="url(#seal-sweep)" opacity="0.65" />
        </motion.g>

        {/* middle ring: signal nodes, counter-rotates */}
        <motion.g style={{ transformOrigin: "200px 200px" }} {...spin(46, true)}>
          <circle cx="200" cy="200" r="148" fill="none" stroke="rgba(0,210,255,0.5)" strokeWidth="1.2" />
          <circle cx="200" cy="200" r="148" fill="none" stroke="rgba(110,231,255,0.85)" strokeWidth="3" strokeDasharray="1 36" />
          {[0, 90, 180, 270].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return <circle key={deg} cx={200 + Math.cos(a) * 148} cy={200 + Math.sin(a) * 148} r="4" fill="#6ee7ff" />;
          })}
        </motion.g>

        {/* lock-on reticle: crosshair + corner brackets, the thing being "acquired" */}
        <motion.g style={{ transformOrigin: "200px 200px" }} {...spin(120)}>
          <circle cx="200" cy="200" r="64" fill="none" stroke="rgba(0,210,255,0.3)" strokeWidth="1" />
          <line x1="200" y1="146" x2="200" y2="166" stroke="rgba(110,231,255,0.75)" strokeWidth="1.5" />
          <line x1="200" y1="234" x2="200" y2="254" stroke="rgba(110,231,255,0.75)" strokeWidth="1.5" />
          <line x1="146" y1="200" x2="166" y2="200" stroke="rgba(110,231,255,0.75)" strokeWidth="1.5" />
          <line x1="234" y1="200" x2="254" y2="200" stroke="rgba(110,231,255,0.75)" strokeWidth="1.5" />
          {[
            [140, 140, 156, 140, 140, 156],
            [260, 140, 244, 140, 260, 156],
            [140, 260, 156, 260, 140, 244],
            [260, 260, 244, 260, 260, 244],
          ].map(([x1, y1, x2, y2, x3, y3], i) => (
            <path
              key={i}
              d={`M${x1},${y1} L${x2},${y2} M${x1},${y1} L${x3},${y3}`}
              stroke="rgba(0,210,255,0.45)"
              strokeWidth="1.5"
              fill="none"
            />
          ))}
        </motion.g>

        <circle cx="200" cy="200" r="3" fill="#6ee7ff" />
      </svg>

      {/* telemetry readout — real HTML text so it stays crisp at any seal size */}
      <div className="pointer-events-none absolute right-[8%] top-[14%] hidden font-mono text-[10px] uppercase tracking-[0.2em] lg:block">
        <div className="flex items-center gap-1.5 text-accent/80">
          <span className="h-1 w-1 animate-pulse rounded-full bg-accent" />
          Sinyal Kilidi
        </div>
        <div className="mt-1 text-zinc-500">RF 433.920 MHz</div>
      </div>
    </motion.div>
  );
}

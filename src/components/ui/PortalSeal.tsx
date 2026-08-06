"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A rotating technical seal — concentric rings, bezel ticks, cardinal
 * nodes — that snaps open like a portal on mount and then idles in slow,
 * opposed rotation. The Doctor Strange circle reimagined as a system
 * authorising itself rather than a spell being cast: still glyphed, still
 * layered, but drawn like an instrument bezel instead of a rune.
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
        {/* outer bezel: dashed ring + tick marks, slow clockwise drift */}
        <motion.g style={{ transformOrigin: "200px 200px" }} {...spin(70)}>
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
                stroke="rgba(0,210,255,0.45)"
                strokeWidth="1"
              />
            );
          })}
        </motion.g>

        {/* middle ring: cardinal nodes, counter-rotates */}
        <motion.g style={{ transformOrigin: "200px 200px" }} {...spin(46, true)}>
          <circle cx="200" cy="200" r="148" fill="none" stroke="rgba(0,210,255,0.5)" strokeWidth="1.2" />
          <circle cx="200" cy="200" r="148" fill="none" stroke="rgba(110,231,255,0.85)" strokeWidth="3" strokeDasharray="1 36" />
          {[0, 90, 180, 270].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return <circle key={deg} cx={200 + Math.cos(a) * 148} cy={200 + Math.sin(a) * 148} r="4" fill="#6ee7ff" />;
          })}
        </motion.g>

        {/* inner core: diamond frame, near-static drift */}
        <motion.g style={{ transformOrigin: "200px 200px" }} {...spin(100)}>
          <circle cx="200" cy="200" r="102" fill="none" stroke="rgba(0,210,255,0.28)" strokeWidth="1" />
          <path d="M200 94 L216 200 L200 306 L184 200 Z" fill="none" stroke="rgba(0,210,255,0.22)" strokeWidth="1" />
        </motion.g>

        <circle cx="200" cy="200" r="3" fill="#6ee7ff" />
      </svg>
    </motion.div>
  );
}

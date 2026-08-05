"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const DRAW_MS = 900;
const LIT_HOLD_MS = 350;
const FADE_MS = 550;
const REDUCED_HOLD_MS = 450;

const traceEase: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** Four traces from viewBox 0 0 240 240 into a chip pad. Same 90°-bend
 * routing style as the PCB generator, so the intro reads as the board
 * itself powering on rather than a generic loading widget. */
const traces = [
  "M24 24 H104 V104",
  "M216 24 H136 V104",
  "M24 216 H104 V136",
  "M216 216 H136 V136",
];

/** Circuit power-on sequence — traces draw in toward a center chip which
 * then lights up, before the overlay dissolves into the page. This is the
 * opening half of the site's bookend (ClosingSeal in Contact is the other).
 */
export default function IntroOverlay() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setLit(true);
      const t = window.setTimeout(() => setVisible(false), REDUCED_HOLD_MS);
      return () => window.clearTimeout(t);
    }
    const t1 = window.setTimeout(() => setLit(true), DRAW_MS);
    const t2 = window.setTimeout(() => setVisible(false), DRAW_MS + LIT_HOLD_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg width="200" height="200" viewBox="0 0 240 240" fill="none">
            <g stroke="#3B74DC" strokeWidth="1.5" strokeLinecap="round">
              {traces.map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  initial={{ pathLength: 0, opacity: 0.9 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.7,
                    delay: reducedMotion ? 0 : i * 0.08,
                    ease: traceEase,
                  }}
                />
              ))}
            </g>

            <motion.rect
              x="104"
              y="104"
              width="32"
              height="32"
              rx="4"
              stroke="#3B74DC"
              strokeWidth="1.5"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: lit ? 1 : 0.5 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            />
            <motion.circle
              cx="120"
              cy="120"
              r="4"
              fill="#3B74DC"
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={
                lit
                  ? { opacity: 1, scale: [0.8, 1.25, 1] }
                  : { opacity: 0.5, scale: 0.8 }
              }
              transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeOut" }}
              style={{
                filter: lit ? "drop-shadow(0 0 10px rgba(59,116,220,0.9))" : "none",
              }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const HOLD_MS = 220;
const OPEN_S = 0.6;

/**
 * The opening half of the site's bookend (ClosingSeal in Contact is the
 * other) — a scan line draws itself across a dark screen, then the whole
 * frame splits open along it and folds away, like a CRT powering on. An
 * earlier plain-dissolve version read as too flat; a full "boot sequence"
 * with text read as a gimmick. This sits between the two: one deliberate
 * motion, gone in well under a second, same on phone and desktop since
 * it's sized off the viewport rather than any breakpoint-specific layout.
 */
export default function IntroOverlay() {
  const reducedMotion = useSafeReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), HOLD_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background"
          initial={{ scaleY: 1 }}
          exit={{ scaleY: reducedMotion ? 1 : 0.015, opacity: reducedMotion ? 0 : 1 }}
          transition={{
            duration: reducedMotion ? 0 : OPEN_S,
            ease: [0.76, 0, 0.86, 0],
          }}
        >
          <motion.span
            aria-hidden="true"
            className="h-[2px] w-2/3 max-w-xs rounded-full bg-accent"
            style={{ boxShadow: "0 0 18px 3px rgba(59,130,246,0.75)" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

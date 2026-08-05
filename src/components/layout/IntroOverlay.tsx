"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const HOLD_MS = 150;
const FADE_MS = 500;

/**
 * The opening half of the site's bookend (ClosingSeal in Contact is the
 * other) — deliberately just a brief dissolve, nothing drawn or animated
 * on top. Anything more elaborate here kept reading as a gimmick rather
 * than a considered detail.
 */
export default function IntroOverlay() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), HOLD_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : FADE_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </AnimatePresence>
  );
}

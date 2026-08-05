"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const BOOT_DURATION_MS = 1200;
const HOLD_MS = 250;
const FADE_MS = 550;

/** A real boot sequence before the page reveals itself — the opening half of the site's bookend. */
export default function IntroOverlay() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false);
      return;
    }
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / BOOT_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => setVisible(false), HOLD_MS);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-accent/70"
            style={{ boxShadow: "0 0 18px rgba(47,111,238,0.5)" }}
          >
            <span className="h-1 w-1 rounded-full bg-accent" />
          </span>

          <div className="w-52 sm:w-64">
            <div className="h-px w-full overflow-hidden bg-zinc-800">
              <div
                className="h-full bg-accent transition-[width] duration-75 ease-linear"
                style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(47,111,238,0.8)" }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              <span>Sistem Başlatılıyor</span>
              <span className="tabular-nums text-zinc-400">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

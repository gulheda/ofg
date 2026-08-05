"use client";

import { motion, useReducedMotion } from "framer-motion";

const PHASES = ["Tasarım", "Üretim", "Entegrasyon", "Test"];

/** A lap-timer sector strip, repurposed: each segment lights up for a project phase completed. */
export default function SectorBar() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {PHASES.map((phase, i) => (
        <div key={phase} className="flex-1">
          <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-accent/80"
              initial={reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-zinc-600">
            {phase}
          </p>
        </div>
      ))}
    </div>
  );
}

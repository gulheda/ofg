"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const READOUT_SETS = [
  [
    { label: "LINK", value: "MAVLink 2.0" },
    { label: "MODE", value: "STABILIZE" },
    { label: "PWR", value: "LiPo 4S · 14.8V" },
  ],
  [
    { label: "TX", value: "433 MHz RF" },
    { label: "GPS", value: "3D FIX" },
    { label: "ROLE", value: "Aviyonik Sorumlusu" },
  ],
] as const;

/** A quiet cockpit-telemetry panel — cross-fades between two readout sets. Purely atmospheric. */
export default function HeroHud() {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % READOUT_SETS.length), 5000);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const rows = READOUT_SETS[index];

  return (
    <div className="w-52 rounded-xl border border-subtle bg-card/70 p-4 font-mono text-[11px] backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2 text-zinc-500">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        <span className="tracking-[0.2em]">TELEMETRY</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={reducedMotion ? undefined : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.5 }}
          className="space-y-1.5"
        >
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3">
              <span className="text-zinc-600">{row.label}</span>
              <span className="truncate text-zinc-300">{row.value}</span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

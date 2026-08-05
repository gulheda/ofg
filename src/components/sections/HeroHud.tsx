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

/** A cockpit-dash arc gauge — draws in once, then holds. Signal strength, atmospherically. */
function RevGauge() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mb-3 flex items-center gap-3 border-b border-subtle pb-3">
      <svg viewBox="0 0 100 58" className="h-9 w-14 shrink-0 overflow-visible">
        <path
          d="M8 54 A42 42 0 0 1 92 54"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <motion.path
          d="M8 54 A42 42 0 0 1 92 54"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: reducedMotion ? 0.74 : 0.74 }}
          viewport={{ once: true }}
          transition={{ duration: reducedMotion ? 0 : 1.2, ease: "easeOut", delay: 0.2 }}
        />
        <motion.line
          x1="50"
          y1="54"
          x2="50"
          y2="16"
          stroke="#e4e4e7"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transformOrigin: "50px 54px" }}
          initial={{ rotate: -85 }}
          whileInView={{ rotate: reducedMotion ? 25 : 25 }}
          viewport={{ once: true }}
          transition={{ duration: reducedMotion ? 0 : 1.2, ease: "easeOut", delay: 0.2 }}
        />
        <circle cx="50" cy="54" r="3" fill="#e4e4e7" />
      </svg>
      <div>
        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
          Link Quality
        </p>
        <p className="font-mono text-sm text-zinc-200">Güçlü</p>
      </div>
    </div>
  );
}

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
    <div className="hidden w-52 rounded-xl border border-subtle bg-card/70 p-4 font-mono text-[11px] backdrop-blur-sm lg:block">
      <div className="mb-3 flex items-center gap-2 text-zinc-500">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        <span className="tracking-[0.2em]">TELEMETRY</span>
      </div>
      <RevGauge />
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

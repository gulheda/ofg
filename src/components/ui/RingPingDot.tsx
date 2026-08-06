"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A status dot that sends out one expanding ring the moment it scrolls
 * into view — the hero seal's portal-open motif, scaled down to a single
 * heartbeat, so every section entrance carries the same signature instead
 * of just the hero getting one.
 */
export default function RingPingDot({ className = "" }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  // Always render the same element (only the animation values change) —
  // conditionally mounting it based on reducedMotion would make the DOM
  // shape depend on a value that's unknown during SSR/first paint, which
  // is a hydration mismatch waiting to happen for anyone with a system
  // "reduce motion" preference set.
  return (
    <span className={`relative inline-flex h-1.5 w-1.5 shrink-0 ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      <motion.span
        className="absolute inset-0 rounded-full border border-accent"
        initial={{ scale: 1, opacity: reducedMotion ? 0 : 0.8 }}
        whileInView={{ scale: reducedMotion ? 1 : 7, opacity: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{
          duration: reducedMotion ? 0 : 1.1,
          delay: reducedMotion ? 0 : 0.15,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </span>
  );
}

"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * A status dot that sends out one expanding ring the moment it scrolls
 * into view — the same portal-open motif used elsewhere on the site,
 * scaled down to a single heartbeat, so every section entrance carries
 * it instead of just the hero.
 *
 * Triggered off `useScroll` crossing a threshold rather than
 * `whileInView` + `viewport.once` — that combination got stuck
 * permanently in its closed state in this static-export build (see
 * Section.tsx for the full diagnosis), so this uses the same
 * scroll-position-driven approach already proven reliable there instead
 * of relying on the flaky trigger path.
 */
export default function RingPingDot({ className = "" }: { className?: string }) {
  const reducedMotion = useSafeReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [fired, setFired] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.6"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.05 && !fired) setFired(true);
  });

  return (
    <span ref={ref} className={`relative inline-flex h-1.5 w-1.5 shrink-0 ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      <motion.span
        className="absolute inset-0 rounded-full border border-accent"
        initial={false}
        animate={
          reducedMotion ? { opacity: 0 } : fired ? { scale: 7, opacity: 0 } : { scale: 1, opacity: 0.8 }
        }
        transition={{ duration: reducedMotion ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </span>
  );
}

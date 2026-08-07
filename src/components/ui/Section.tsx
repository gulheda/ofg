"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

interface SectionProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Every section pulls into focus as it scrolls up into place — starting
 * slightly small, soft-blurred and dimmed, then sharpening to full scale
 * and brightness, like a camera racking focus onto the next shot rather
 * than a hard geometric wipe. Scrubbed directly to scroll position via
 * `useScroll` (the same mechanism already driving the navbar's progress
 * bar and the hero's parallax) instead of a `whileInView` one-shot —
 * an earlier clip-path version built on `whileInView` + `viewport.once`
 * got stuck permanently closed in this static-export build, so this
 * sticks with the trigger path already proven reliable here.
 */
export default function Section({ id, children, className = "" }: SectionProps) {
  const reducedMotion = useSafeReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "start 0.4"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], reducedMotion ? [1, 1] : [0.95, 1]);
  const blurPx = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [9, 0]);
  const brightness = useTransform(scrollYProgress, [0, 1], reducedMotion ? [1, 1] : [0.45, 1]);
  const filter = useTransform([blurPx, brightness], (v) => {
    const [b, br] = v as number[];
    return `blur(${b.toFixed(1)}px) brightness(${br.toFixed(2)})`;
  });

  // a soft light sweep that crosses the panel once, right as it's mostly
  // in focus — the one unabashedly "cinematic" flourish, kept brief so it
  // reads as a highlight catching the frame rather than a loading bar
  const sweepX = useTransform(scrollYProgress, [0.15, 0.75], ["-30%", "130%"]);
  const sweepOpacity = useTransform(scrollYProgress, [0, 0.15, 0.55, 0.8], [0, 0.5, 0.5, 0]);

  return (
    <motion.section
      id={id}
      ref={ref}
      style={{ scale, filter }}
      className={`relative scroll-mt-24 overflow-hidden py-24 md:py-32 ${className}`}
    >
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
          style={{
            left: sweepX,
            opacity: sweepOpacity,
            background:
              "linear-gradient(90deg, transparent, rgba(45,212,191,0.14), transparent)",
          }}
        />
      )}
      <div className="relative mx-auto w-full max-w-content px-6 md:px-8">{children}</div>
    </motion.section>
  );
}

"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

type RevealVariant = "fade" | "slide-up" | "slide-left" | "scale" | "tilt" | "line";

const variantMap: Record<RevealVariant, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  line: {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1 },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
  tilt: {
    hidden: { opacity: 0, rotateX: -14, y: 28 },
    visible: { opacity: 1, rotateX: 0, y: 0 },
  },
};

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

/**
 * Scroll-triggered entrance — deliberately restrained: one soft move, once.
 *
 * Triggered off `useScroll` crossing a threshold rather than `whileInView` +
 * `viewport.once` — that combination was confirmed to get stuck permanently
 * in its hidden state in this static-export build (see Section.tsx for the
 * full diagnosis: a plain, un-abstracted IntersectionObserver retriggers
 * correctly on scroll in the same page, so the bug was specific to that
 * trigger path). `useScroll` already drives the navbar's progress bar, the
 * hero's parallax, and Section's own transition without issue.
 */
export default function Reveal({
  children,
  variant = "slide-up",
  delay = 0,
  className,
}: RevealProps) {
  const reducedMotion = useSafeReducedMotion();
  const is3d = variant === "tilt";
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.6"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.02 && !shown) setShown(true);
  });

  const animateState = reducedMotion || shown ? "visible" : "hidden";

  const motionEl = (
    <motion.div
      ref={ref}
      className={is3d ? undefined : className}
      initial={false}
      animate={animateState}
      variants={variantMap[variant]}
      transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );

  // rotateX needs a perspective ancestor to read as depth rather than a plain skew.
  if (!is3d) return motionEl;
  return (
    <div className={className} style={{ perspective: 900 }}>
      {motionEl}
    </div>
  );
}

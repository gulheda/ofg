"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)" },
  visible: { clipPath: "inset(0% 0% 0% 0%)" },
};

const TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  span: motion.span,
} as const;

interface TextRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof typeof TAGS;
  /** "inView" (default) waits for scroll into view; "mount" plays immediately — use for above-the-fold content. */
  trigger?: "inView" | "mount";
}

/**
 * A line of text that rises up from behind a mask instead of just fading in.
 *
 * Always renders the same motion element regardless of reduced-motion state
 * (only the animate/whileInView props change) — switching between a plain
 * tag and a motion tag based on a value that starts unresolved during SSR
 * previously left the text permanently clipped for users with a system-level
 * "reduce motion" preference, since `initial` is only honoured on mount and
 * a later prop swap doesn't get a second chance to apply it.
 */
export default function TextReveal({
  children,
  delay = 0,
  className,
  as = "span",
  trigger = "inView",
}: TextRevealProps) {
  const reducedMotion = useReducedMotion();
  const MotionTag = TAGS[as];

  // `animate` is reactive to prop changes (unlike `initial`), so forcing it to
  // "visible" here reliably unclips the text even if reducedMotion starts
  // false during SSR and only resolves to true after mount.
  const animate = reducedMotion || trigger === "mount" ? "visible" : undefined;
  const whileInView = !reducedMotion && trigger === "inView" ? "visible" : undefined;

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      animate={animate}
      whileInView={whileInView}
      viewport={whileInView ? { once: true, margin: "-40px" } : undefined}
      transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

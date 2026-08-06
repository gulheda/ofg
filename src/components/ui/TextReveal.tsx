"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const container: Variants = {
  hidden: {},
  visible: {},
};

const word: Variants = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(6px)" },
  visible: { opacity: 1, y: "0em", filter: "blur(0px)" },
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
  /** Gap (seconds) between each word's own reveal — the "typing itself into existence" cadence. */
  stagger?: number;
}

/**
 * Text that assembles itself word by word — each one rising out of a blurred
 * mask on its own beat — instead of the whole line sliding up as one flat
 * block. Falls back to plain text when `children` isn't a simple string
 * (e.g. contains nested elements), since word-splitting only makes sense for
 * a run of plain text.
 *
 * Always renders the same motion elements regardless of reduced-motion state
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
  stagger = 0.07,
}: TextRevealProps) {
  const reducedMotion = useReducedMotion();
  const MotionTag = TAGS[as];
  const Wrapper = motion.span;

  // `animate` is reactive to prop changes (unlike `initial`), so forcing it to
  // "visible" here reliably unclips the text even if reducedMotion starts
  // false during SSR and only resolves to true after mount.
  const animate = reducedMotion || trigger === "mount" ? "visible" : undefined;
  const whileInView = !reducedMotion && trigger === "inView" ? "visible" : undefined;

  const sharedProps = {
    initial: "hidden" as const,
    animate,
    whileInView,
    viewport: whileInView ? { once: true, margin: "-40px" } : undefined,
  };

  if (typeof children !== "string") {
    return (
      <MotionTag
        className={className}
        variants={word}
        {...sharedProps}
        transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </MotionTag>
    );
  }

  const words = children.split(" ");

  return (
    <MotionTag
      className={className}
      variants={container}
      {...sharedProps}
      transition={{ delayChildren: reducedMotion ? 0 : delay, staggerChildren: reducedMotion ? 0 : stagger }}
    >
      {words.map((w, i) => (
        <Wrapper
          key={i}
          variants={word}
          className="inline-block"
          style={{ willChange: "transform, filter, opacity" }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </Wrapper>
      ))}
    </MotionTag>
  );
}

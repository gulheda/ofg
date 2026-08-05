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

/** A line of text that rises up from behind a mask instead of just fading in — the agency-site staple. */
export default function TextReveal({
  children,
  delay = 0,
  className,
  as = "span",
  trigger = "inView",
}: TextRevealProps) {
  const reducedMotion = useReducedMotion();
  const MotionTag = TAGS[as];

  if (reducedMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const viewProps =
    trigger === "mount"
      ? { initial: "hidden", animate: "visible" }
      : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-40px" } };

  return (
    <MotionTag
      className={className}
      variants={variants}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...viewProps}
    >
      {children}
    </MotionTag>
  );
}

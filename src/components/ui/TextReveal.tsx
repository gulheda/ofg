"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const container: Variants = {
  hidden: {},
  visible: {},
};

const word: Variants = {
  hidden: { opacity: 0, y: "0.4em", clipPath: "inset(106% 0% -8% 0%)" },
  visible: { opacity: 1, y: "0em", clipPath: "inset(-8% 0% -8% 0%)" },
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
 * Text that assembles itself word by word — each one wiped in from below by
 * a rising clip-path mask on its own beat, like light climbing the letters —
 * instead of the whole line sliding up as one flat block. Falls back to
 * plain text when `children` isn't a simple string
 * (e.g. contains nested elements), since word-splitting only makes sense for
 * a run of plain text.
 *
 * Triggered off `useScroll` crossing a threshold (for `trigger="inView"`)
 * rather than `whileInView` + `viewport.once` — that combination was
 * confirmed to get stuck permanently hidden in this static-export build
 * (see Section.tsx for the full diagnosis). `trigger="mount"` renders
 * already-shown from the first frame (deterministic from the prop, so
 * server and client always agree — no hydration risk).
 */
export default function TextReveal({
  children,
  delay = 0,
  className,
  as = "span",
  trigger = "inView",
  stagger = 0.07,
}: TextRevealProps) {
  const reducedMotion = useSafeReducedMotion();
  const MotionTag = TAGS[as];
  const Wrapper = motion.span;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const [shown, setShown] = useState(trigger === "mount");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.6"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (trigger === "inView" && v > 0.02 && !shown) setShown(true);
  });

  const animateState = reducedMotion || shown ? "visible" : "hidden";

  if (typeof children !== "string") {
    return (
      <MotionTag
        ref={ref}
        className={className}
        variants={word}
        initial={false}
        animate={animateState}
        transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </MotionTag>
    );
  }

  const words = children.split(" ");

  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={container}
      initial={false}
      animate={animateState}
      transition={{ delayChildren: reducedMotion ? 0 : delay, staggerChildren: reducedMotion ? 0 : stagger }}
    >
      {words.map((w, i) => (
        // The space is a plain sibling text node, not part of the animated
        // span's own content — a trailing space placed *inside* an
        // inline-block gets silently trimmed by the browser at the box's
        // edge, which is what was collapsing every reveal into one
        // run-together word.
        <span key={i}>
          <Wrapper
            variants={word}
            className="inline-block"
            style={{ willChange: "transform, filter, opacity" }}
            transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {w}
          </Wrapper>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </MotionTag>
  );
}

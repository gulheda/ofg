"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Every section opens with an iris wipe scrubbed directly to scroll
 * position — the circular mask grows as the section's top edge travels
 * from the bottom of the viewport up into the upper-middle, the whole
 * panel (background included, not just the text) snapping into frame
 * like a cut to a new shot. Tied to `useScroll` rather than a
 * `whileInView`-fired one-shot: the latter's IntersectionObserver-based
 * "once" trigger proved to get stuck at its closed state in this
 * static-export build (confirmed with a plain, un-abstracted
 * IntersectionObserver in the same page: it fired correctly on scroll,
 * so the bug was specific to that trigger path, not the environment) —
 * `useScroll` already drives the navbar's progress bar and the hero's
 * parallax without issue, so this reuses a mechanism proven to work
 * here instead of debugging the flaky one further.
 */
export default function Section({ id, children, className = "" }: SectionProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "start 0.42"],
  });
  const radius = useTransform(scrollYProgress, [0, 1], reducedMotion ? [150, 150] : [0, 150]);
  const clipPath = useTransform(radius, (r) => `circle(${r}% at 50% 50%)`);

  return (
    <motion.section
      id={id}
      ref={ref}
      style={{ clipPath }}
      className={`scroll-mt-24 py-24 md:py-32 ${className}`}
    >
      <div className="mx-auto w-full max-w-content px-6 md:px-8">{children}</div>
    </motion.section>
  );
}

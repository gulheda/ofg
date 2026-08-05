"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealVariant = "fade" | "slide-up" | "slide-left" | "scale" | "tilt";

const variantMap: Record<RevealVariant, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
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

/** Scroll-triggered entrance — deliberately restrained: one soft move, once. */
export default function Reveal({
  children,
  variant = "slide-up",
  delay = 0,
  className,
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const is3d = variant === "tilt";

  const motionEl = (
    <motion.div
      className={is3d ? undefined : className}
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-64px" }}
      variants={variantMap[variant]}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
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

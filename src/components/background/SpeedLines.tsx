"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";

const ROWS = [6, 17, 28, 40, 52, 64, 76, 88, 96];

/**
 * Scroll-velocity speed lines — the page itself reacts to how fast you move
 * through it. Streaks stay invisible at rest and stretch into view only
 * once you're scrolling with real intent, like passing markers at speed.
 */
export default function SpeedLines() {
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const rawVelocity = useVelocity(scrollY);
  const velocity = useSpring(rawVelocity, { stiffness: 380, damping: 50, mass: 0.4 });

  const opacity = useTransform(velocity, (v) => Math.min(Math.abs(v) / 2600, 1) * 0.65);
  const scaleX = useTransform(velocity, (v) => 1 + Math.min(Math.abs(v) / 700, 2.2));
  const translateX = useTransform(velocity, (v) => Math.max(-1, Math.min(1, v / 3000)) * 40);

  if (reducedMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {ROWS.map((top, i) => (
        <motion.span
          key={top}
          className="absolute left-0 h-px w-full origin-center bg-gradient-to-r from-transparent via-accent to-transparent"
          style={{
            top: `${top}%`,
            opacity,
            scaleX,
            x: translateX,
            filter: i % 3 === 0 ? "brightness(1.4)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

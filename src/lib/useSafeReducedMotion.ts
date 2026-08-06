"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Same as framer-motion's `useReducedMotion`, except the returned value is
 * always `false` on the very first render — matching server-side rendering,
 * where there's no `window` to check — and only updates to the real system
 * preference after mount, via an effect.
 *
 * Baking the real value into a component's *first* render (e.g. through
 * `initial={false}` combined with a reducedMotion-dependent animation
 * target) makes that render depend on state that can differ between the
 * server and a client that already has the OS "reduce motion" preference
 * active before hydration completes — a hydration mismatch (confirmed via
 * React error #418 in this app when testing with reduced motion forced on).
 * Keeping first paint deterministic and applying the real preference one
 * tick later is invisible in practice — it's a static snap, not a visible
 * transition — but avoids the mismatch entirely.
 */
export function useSafeReducedMotion() {
  const real = useReducedMotion();
  const [safe, setSafe] = useState(false);
  useEffect(() => {
    if (real) setSafe(true);
  }, [real]);
  return safe;
}

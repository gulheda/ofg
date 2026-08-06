"use client";

import { useEffect } from "react";

/**
 * One delegated pointermove listener drives every `[data-spot]` element's
 * hover glow — each keeps its own CSS custom properties (--mx/--my, set here
 * on the fly) and does the actual radial-gradient reveal in CSS on `:hover`.
 * Cheaper than a listener per card, and the glow tracks the cursor's exact
 * position inside whichever element it's currently over.
 */
export default function SpotlightDelegate() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest?.("[data-spot]") as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      target.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}

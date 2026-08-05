"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

/**
 * A fixed, page-wide engineering-drawing frame: viewfinder corner marks,
 * a title-block label, a rotated margin note and a live status readout.
 * Purely decorative and non-interactive — it is what makes the site read
 * as a technical document rather than a generic template.
 */
export default function TechnicalFrame() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  const cornerBase = "fixed h-4 w-4 border-zinc-500/35";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30">
      <span className={`${cornerBase} left-3.5 top-3.5 border-l border-t`} />
      <span className={`${cornerBase} right-3.5 top-3.5 border-r border-t`} />
      <span className={`${cornerBase} bottom-3.5 left-3.5 border-b border-l`} />
      <span className={`${cornerBase} bottom-3.5 right-3.5 border-b border-r`} />

      {/* title block, bottom-right */}
      <span className="fixed bottom-6 right-8 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600/70 md:block">
        Sheet 1/1 · Rev A
      </span>

      {/* rotated margin note, right edge, desktop only */}
      <span
        className="fixed right-6 top-1/2 hidden -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500/25 lg:block"
        style={{ writingMode: "vertical-rl" }}
      >
        {site.name} · {site.title}
      </span>

      {/* live status chip, bottom-left */}
      {time && (
        <div className="fixed bottom-6 left-8 hidden items-center gap-2 rounded-full border border-subtle bg-card/60 px-3 py-1.5 font-mono text-[10px] text-zinc-500 backdrop-blur-sm md:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <span className="tracking-wider">{site.location.toUpperCase()}</span>
          <span className="text-zinc-700">·</span>
          <span className="tabular-nums text-zinc-400">{time}</span>
        </div>
      )}
    </div>
  );
}

"use client";

import { skills } from "@/data/skills";

const items = skills.map((s) => s.name);

/**
 * A slow, seamless drift of outlined — never filled — names, present but
 * never shouting. Two duplicated lists sit in one flex track and the whole
 * track scrolls exactly -50%, so the loop point is invisible. Pauses on
 * hover as a small courtesy, not a functional necessity.
 */
export default function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="group relative overflow-hidden border-y border-subtle py-5"
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
      }}
    >
      <div className="marquee-track flex w-max items-center gap-10 group-hover:[animation-play-state:paused]">
        {[...items, ...items].map((name, i) => (
          <span
            key={i}
            className="whitespace-nowrap font-mono text-sm uppercase tracking-[0.15em] text-transparent [-webkit-text-stroke:1px_rgba(230,230,228,0.28)]"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

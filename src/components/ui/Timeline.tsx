import type { TimelineItem } from "@/data/timeline";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";

/** Same numbered-index language as Projects — one consistent way of listing things on this site. */
export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-3" style={{ perspective: 1200 }}>
      {items.map((item, i) => (
        <Reveal key={item.title} variant="fade" delay={i * 0.08}>
          <TiltCard
            maxTilt={3}
            className="text-glass grid gap-4 px-5 py-8 transition-colors duration-300 hover:bg-accent/[0.03] md:grid-cols-[3rem_8rem_1fr] md:gap-8"
          >
            <span className="font-mono text-sm text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">{item.period}</p>
            <div>
              <h3 className="text-lg font-medium text-zinc-100">{item.title}</h3>
              <p className="mt-0.5 text-sm text-accent/80">{item.subtitle}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                {item.description}
              </p>
            </div>
          </TiltCard>
        </Reveal>
      ))}
    </div>
  );
}

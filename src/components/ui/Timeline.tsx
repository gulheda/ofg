import type { TimelineItem } from "@/data/timeline";
import Reveal from "./Reveal";

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative ml-3 border-l border-subtle">
      {items.map((item, i) => (
        <li key={item.title} className="pb-12 pl-8 last:pb-0">
          <Reveal variant="slide-up" delay={i * 0.08}>
            {/* node marker — a via on the timeline trace */}
            <span className="absolute -left-[7px] mt-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-accent/60 bg-background">
              <span className="h-1 w-1 rounded-full bg-accent" />
            </span>
            <p className="font-mono text-xs tracking-wider text-zinc-500">{item.period}</p>
            <h3 className="mt-2 text-lg font-medium text-zinc-100">{item.title}</h3>
            <p className="mt-0.5 text-sm text-accent/80">{item.subtitle}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
              {item.description}
            </p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

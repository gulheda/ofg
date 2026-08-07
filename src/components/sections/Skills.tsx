import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import { skills, type Skill } from "@/data/skills";

const CATEGORIES: Skill["category"][] = ["Aviyonik", "PCB & Elektronik", "Yazılım", "Araçlar"];

export default function Skills() {
  return (
    <Section id="yetkinlikler" className="bg-surface/10">
      <SectionHeading
        eyebrow="02 — Teknik Yetkinlikler"
        title="Araç kutum"
        description="Donanımdan yazılıma, simülasyondan üretime uzanan zincirde her gün kullandığım teknolojiler."
      />
      <div className="space-y-10">
        {CATEGORIES.map((category, groupIndex) => {
          const items = skills.filter((s) => s.category === category);
          return (
            <div key={category}>
              <Reveal variant="fade" delay={groupIndex * 0.06}>
                <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {category}
                </h3>
              </Reveal>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {items.map((skill, i) => (
                  <Reveal key={skill.name} variant="scale" delay={groupIndex * 0.06 + i * 0.04}>
                    <li
                      data-spot
                      className="overflow-hidden rounded-xl border border-subtle bg-card/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow-sm"
                    >
                      <TiltCard className="flex items-center gap-3 rounded-xl p-4" maxTilt={8}>
                        <skill.icon size={18} className="shrink-0 text-accent/80" />
                        <p className="text-sm font-medium text-zinc-200">{skill.name}</p>
                      </TiltCard>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

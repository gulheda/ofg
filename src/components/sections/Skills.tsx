import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TechnicalCorners from "@/components/ui/TechnicalCorners";
import TiltCard from "@/components/ui/TiltCard";
import { skills } from "@/data/skills";

export default function Skills() {
  return (
    <Section id="yetkinlikler" className="bg-surface/65 backdrop-blur-sm">
      <SectionHeading
        eyebrow="02 — Teknik Yetkinlikler"
        title="Araç kutum"
        description="Donanımdan yazılıma, simülasyondan üretime uzanan zincirde her gün kullandığım teknolojiler."
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {skills.map((skill, i) => (
          <Reveal key={skill.name} variant="scale" delay={(i % 6) * 0.05}>
            <li className="group relative rounded-xl border border-subtle bg-card/85 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow-sm">
              <TechnicalCorners />
              <TiltCard className="relative overflow-hidden rounded-xl p-4" maxTilt={10}>
                {/* faint accent wash that fades in on hover */}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.06] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="font-mono text-[10px] tracking-wider text-zinc-700">
                  C-{String(i + 1).padStart(2, "0")}
                </p>
                <skill.icon
                  size={20}
                  className="mt-2 text-zinc-500 transition-colors duration-300 group-hover:text-accent"
                />
                <p className="mt-3 text-sm font-medium text-zinc-200">{skill.name}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                  [{skill.category}]
                </p>
              </TiltCard>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

import { Award } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { certificates } from "@/data/timeline";

export default function Certificates() {
  return (
    <Section id="sertifikalar" className="bg-surface">
      <SectionHeading eyebrow="06 — Sertifikalar" title="Sürekli öğrenme" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {certificates.map((cert, i) => (
          <Reveal key={cert.title} variant="fade" delay={i * 0.08}>
            <li className="flex h-full flex-col rounded-xl border border-subtle bg-card p-5 transition-colors duration-300 hover:border-accent/30">
              <Award size={18} className="text-accent/80" />
              <h3 className="mt-4 flex-1 text-sm font-medium leading-snug text-zinc-100">
                {cert.title}
              </h3>
              <p className="mt-3 text-xs text-zinc-500">{cert.issuer}</p>
              <p className="mt-1 font-mono text-xs text-zinc-600">{cert.year}</p>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

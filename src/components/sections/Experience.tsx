import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Timeline from "@/components/ui/Timeline";
import { experience } from "@/data/timeline";

export default function Experience() {
  return (
    <Section id="deneyim" className="bg-surface/35 backdrop-blur-md">
      <SectionHeading
        eyebrow="04 — Deneyim"
        title="Sahada öğrendiklerim"
      />
      <Timeline items={experience} />
    </Section>
  );
}

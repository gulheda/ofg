import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Timeline from "@/components/ui/Timeline";
import { education } from "@/data/timeline";

export default function Education() {
  return (
    <Section id="egitim" className="bg-surface/10">
      <SectionHeading eyebrow="05 — Eğitim" title="Akademik yolculuk" />
      <Timeline items={education} />
    </Section>
  );
}

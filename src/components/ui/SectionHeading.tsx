import Reveal from "./Reveal";
import TextReveal from "./TextReveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-14 max-w-2xl md:mb-20">
      <Reveal variant="fade">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-accent">
          {eyebrow}
        </p>
      </Reveal>
      <TextReveal
        as="h2"
        delay={0.08}
        className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl"
      >
        {title}
      </TextReveal>
      {description && (
        <Reveal variant="fade" delay={0.2}>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">{description}</p>
        </Reveal>
      )}
    </div>
  );
}

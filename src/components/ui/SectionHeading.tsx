import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <Reveal variant="tilt" className="mb-14 max-w-2xl md:mb-20">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-accent">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-zinc-400">{description}</p>
      )}
    </Reveal>
  );
}

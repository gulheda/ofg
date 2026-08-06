import Reveal from "./Reveal";
import TextReveal from "./TextReveal";
import RingPingDot from "./RingPingDot";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

/**
 * Every section opens with the same three-beat drawing-title-block move: a
 * huge, near-invisible numeral watermarked behind the text (the sheet
 * number, basically), a "// 01 — Hakkımda" eyebrow read as a code comment,
 * and the title itself wiping in word by word — closed off by a hairline
 * that grows in from the left like an underline being drawn.
 */
export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  const [index] = eyebrow.split(" — ");

  return (
    <div className="relative mb-14 max-w-2xl md:mb-20">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-1 -top-6 select-none font-sans text-[5rem] font-light leading-none text-transparent [-webkit-text-stroke:1px_rgba(230,230,228,0.06)] sm:text-[7rem] md:-top-10 md:text-[9rem]"
      >
        {index}
      </span>

      <Reveal variant="slide-up">
        <p className="relative mb-4 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] text-accent">
          <RingPingDot />
          <span aria-hidden="true" className="text-zinc-600">
            //
          </span>
          {eyebrow}
        </p>
      </Reveal>
      <TextReveal
        as="h2"
        delay={0.08}
        className="relative font-sans text-2xl font-light tracking-tight text-white md:text-3xl"
      >
        {title}
      </TextReveal>
      <Reveal variant="line" delay={0.32} className="relative mt-5 h-px w-10 origin-left bg-accent/40">
        {null}
      </Reveal>
      {description && (
        <Reveal variant="fade" delay={0.2}>
          <p className="relative mt-4 text-sm leading-relaxed text-zinc-400">{description}</p>
        </Reveal>
      )}
    </div>
  );
}

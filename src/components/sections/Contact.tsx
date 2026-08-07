"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, FileDown, Linkedin, Phone } from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/ui/TextReveal";
import RingPingDot from "@/components/ui/RingPingDot";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { site } from "@/data/site";

const secondaryLinks = [
  { icon: Linkedin, label: "LinkedIn", href: site.linkedin, external: true },
  { icon: Phone, label: site.phone, href: site.phoneHref, external: false },
  { icon: FileDown, label: "CV İndir", href: site.cvUrl, external: false },
];

export default function Contact() {
  return (
    <Section id="iletisim" className="bg-surface/10">
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-1 -top-6 select-none font-sans text-[5rem] font-light leading-none text-transparent [-webkit-text-stroke:1px_rgba(230,230,228,0.06)] sm:text-[7rem] md:-top-10 md:text-[9rem]"
        >
          06
        </span>

        <Reveal variant="slide-up">
          <p className="relative mb-4 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] text-accent">
            <RingPingDot />
            <span aria-hidden="true" className="text-zinc-600">
              //
            </span>
            06 — İletişim
          </p>
        </Reveal>

        <TextReveal
          as="h2"
          delay={0.05}
          className="relative font-sans text-3xl font-light tracking-tight text-white sm:text-4xl md:text-5xl"
        >
          Birlikte neler yapabiliriz?
        </TextReveal>
      </div>

      <Reveal variant="fade" delay={0.2}>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
          Bir proje fikriniz mi var, staj ya da yarışma iş birliği mi konuşmak
          istiyorsunuz? Mesajınızı bekliyorum.
        </p>
      </Reveal>

      <Reveal variant="slide-up" delay={0.3}>
        <a
          href={`mailto:${site.email}`}
          className="circuit-link group mt-12 inline-flex max-w-full items-center gap-2 break-all text-base font-medium text-zinc-100 transition-colors duration-300 hover:text-accent sm:gap-3 sm:text-lg md:text-xl lg:text-2xl"
        >
          {site.email}
          <ArrowUpRight
            size={24}
            className="hidden shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 sm:block"
          />
        </a>
      </Reveal>

      <Reveal variant="fade" delay={0.42}>
        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-subtle pt-8">
          {secondaryLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="circuit-link inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <link.icon size={16} />
              {link.label}
            </a>
          ))}
        </div>
      </Reveal>

      <ClosingSeal />
    </Section>
  );
}

/**
 * The site's last word — a warm gold portal blooming open behind two
 * traces closing inward on a status dot, mirroring the opening sequence
 * at first load but in the one color the rest of the site deliberately
 * never uses. Everywhere else, accent color means "this is interactive" —
 * here, reaching the end, it means "you've arrived." Scrubbed to scroll
 * position via `useScroll` rather than `whileInView`, matching Section's
 * approach: that trigger path is the one already proven not to get stuck
 * in this static-export build.
 */
function ClosingSeal() {
  const reducedMotion = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.55"],
  });

  const lineScale = useTransform(scrollYProgress, [0, 1], reducedMotion ? [1, 1] : [0, 1]);
  const dotScale = useTransform(scrollYProgress, [0, 0.7, 1], reducedMotion ? [1, 1, 1] : [0.5, 1.3, 1]);
  const dotOpacity = useTransform(scrollYProgress, [0, 0.3], reducedMotion ? [1, 1] : [0, 1]);
  const portalOpacity = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0.5, 0.5] : [0, 0.6]);
  const portalScale = useTransform(scrollYProgress, [0, 1], reducedMotion ? [1, 1] : [0.35, 1.15]);

  return (
    <div ref={ref} className="relative mt-24 flex items-center gap-4" aria-hidden="true">
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          opacity: portalOpacity,
          scale: portalScale,
          background:
            "radial-gradient(circle, rgba(245,178,66,0.4) 0%, rgba(245,178,66,0.14) 45%, transparent 72%)",
        }}
      />

      <motion.span
        style={{ scaleX: lineScale }}
        className="h-px flex-1 origin-right bg-gradient-to-r from-transparent to-[#f5b242]"
      />
      <span className="relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
        <motion.span
          style={{ opacity: dotOpacity, scale: dotScale }}
          className="h-1.5 w-1.5 rounded-full bg-[#f5b242] shadow-[0_0_10px_rgba(245,178,66,0.8)]"
        />
        EOF
      </span>
      <motion.span
        style={{ scaleX: lineScale }}
        className="h-px flex-1 origin-left bg-gradient-to-l from-transparent to-[#f5b242]"
      />
    </div>
  );
}

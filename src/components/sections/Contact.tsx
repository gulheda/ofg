"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, FileDown, Linkedin, Phone } from "lucide-react";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/ui/TextReveal";
import { site } from "@/data/site";

const secondaryLinks = [
  { icon: Linkedin, label: "LinkedIn", href: site.linkedin, external: true },
  { icon: Phone, label: site.phone, href: site.phoneHref, external: false },
  { icon: FileDown, label: "CV İndir", href: site.cvUrl, external: false },
];

export default function Contact() {
  return (
    <Section id="iletisim" className="bg-surface/35 backdrop-blur-md">
      <Reveal variant="fade">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-accent">
          06 — İletişim
        </p>
      </Reveal>

      <TextReveal
        as="h2"
        delay={0.05}
        className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl"
      >
        Birlikte neler yapabiliriz?
      </TextReveal>

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

/** The site's last word — two traces closing inward on a status dot, mirroring the opening sequence at first load. */
function ClosingSeal() {
  return (
    <div className="relative mt-24 flex items-center gap-4" aria-hidden="true">
      <motion.span
        className="h-px flex-1 origin-right bg-gradient-to-r from-transparent to-accent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-accent"
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: [0.6, 1.4, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        EOF
      </span>
      <motion.span
        className="h-px flex-1 origin-left bg-gradient-to-l from-transparent to-accent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

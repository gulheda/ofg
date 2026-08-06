"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Github } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { projects } from "@/data/projects";

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

export default function Projects() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="projeler" className="bg-surface/35 backdrop-blur-md">
      <SectionHeading
        eyebrow="03 — Projeler"
        title="Seçili çalışmalar"
        description="Yarışma pistinden sahaya: tasarlayıp entegre ettiğim ve bizzat uçurduğum aviyonik sistemler. Detaylar için bir satıra dokun."
      />
      <div className="mt-4 divide-y divide-subtle border-y border-subtle">
        {projects.map((project, i) => {
          const isOpen = openIndex === i;
          return (
            <Reveal key={project.title} variant="fade" delay={i * 0.05}>
              <article
                data-spot
                className={`group overflow-hidden rounded-lg px-3 -mx-3 transition-all duration-300 hover:scale-[1.01] hover:bg-accent/[0.05] hover:shadow-glow-sm active:scale-[0.99] ${
                  isOpen ? "bg-accent/[0.04]" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="grid w-full gap-4 py-8 text-left md:grid-cols-[3.5rem_1fr_auto] md:items-center md:gap-10"
                >
                  <span
                    className={`font-mono text-sm transition-colors duration-300 md:pt-0.5 ${
                      isOpen ? "text-accent" : "text-zinc-600 group-hover:text-accent"
                    }`}
                  >
                    <span
                      className={`mr-2 inline-block h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                        isOpen ? "bg-accent shadow-glow-sm" : "bg-zinc-700"
                      }`}
                    />
                    P.{String(i + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                      {project.title}
                    </h3>
                    <p className="mt-1.5 font-mono text-xs uppercase tracking-wide text-accent/80">
                      {project.role}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <span className="whitespace-nowrap font-mono text-xs text-zinc-500">
                      {project.period}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-zinc-500 transition-transform duration-400 ${
                        isOpen ? "rotate-180 text-accent" : ""
                      }`}
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-6 pb-9 md:grid-cols-[3.5rem_1fr_auto] md:gap-10">
                        <span aria-hidden="true" className="hidden md:block" />
                        <div>
                          <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
                            {project.description}
                          </p>
                          <ul className="mt-5 flex flex-wrap gap-2">
                            {project.tech.map((t, ti) => (
                              <motion.li
                                key={t}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.1 + ti * 0.05, ease }}
                                className="rounded-md border border-accent/25 bg-background/50 px-2.5 py-1 font-mono text-[11px] text-zinc-300"
                              >
                                {t}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex shrink-0 flex-row items-center gap-5 md:flex-col md:items-end md:justify-end">
                          {project.github && (
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="circuit-link inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                            >
                              <Github size={15} />
                              GitHub
                            </a>
                          )}
                          {project.demo && (
                            <a
                              href={project.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="circuit-link inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-accent"
                            >
                              <ArrowUpRight size={15} />
                              Canlı Demo
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

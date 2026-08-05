import { ArrowUpRight, Github } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <Section id="projeler" className="bg-surface/70 backdrop-blur-md">
      <SectionHeading
        eyebrow="03 — Projeler"
        title="Seçili çalışmalar"
        description="Yarışma pistinden sahaya: tasarlayıp entegre ettiğim ve bizzat uçurduğum aviyonik sistemler."
      />
      <div className="mt-4 divide-y divide-subtle border-y border-subtle">
        {projects.map((project, i) => (
          <Reveal key={project.title} variant="fade" delay={i * 0.05}>
            <article className="group grid gap-6 py-10 md:grid-cols-[3.5rem_1fr_auto] md:items-start md:gap-10">
              <span className="font-mono text-sm text-zinc-600 transition-colors duration-300 group-hover:text-accent md:pt-1">
                P.{String(i + 1).padStart(2, "0")}
              </span>

              <div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-50 md:text-2xl">
                  {project.title}
                </h3>
                <p className="mt-1.5 font-mono text-xs uppercase tracking-wide text-accent/80">
                  {project.role}
                </p>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
                  {project.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <li
                      key={t}
                      className="rounded-md border border-subtle bg-background/50 px-2.5 py-1 font-mono text-[11px] text-zinc-400"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex shrink-0 flex-row items-center gap-5 md:flex-col md:items-end md:gap-4 md:pt-1">
                <span className="whitespace-nowrap font-mono text-xs text-zinc-500">
                  {project.period}
                </span>
                <div className="flex items-center gap-5">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
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
                      className="circuit-link inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-accent"
                    >
                      <ArrowUpRight size={15} />
                      Canlı Demo
                    </a>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

import { ExternalLink, Github } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ProjectVisual from "@/components/ui/ProjectVisual";
import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <Section id="projeler">
      <SectionHeading
        eyebrow="03 — Projeler"
        title="Seçili çalışmalar"
        description="Yarışma pistinden sahaya: tasarlayıp entegre ettiğim ve bizzat uçurduğum aviyonik sistemler."
      />
      <div className="border-y border-subtle">
        {projects.map((project, i) => (
          <Reveal key={project.title} variant="fade" delay={i * 0.08}>
            <article className="group grid gap-6 border-b border-subtle py-10 transition-colors duration-300 last:border-b-0 md:grid-cols-[3rem_1fr_18rem] md:gap-10">
              <span className="font-mono text-sm text-zinc-600 transition-colors duration-300 group-hover:text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-xl font-medium tracking-tight text-zinc-50">
                    {project.title}
                  </h3>
                  <span className="whitespace-nowrap font-mono text-xs text-zinc-500">
                    {project.period}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-accent/80">{project.role}</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                  {project.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <li
                      key={t}
                      className="rounded-md border border-subtle bg-background/50 px-2.5 py-1 font-mono text-[11px] text-zinc-400"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-5">
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
                      <ExternalLink size={15} />
                      Canlı Demo
                    </a>
                  )}
                </div>
              </div>

              <div className="aspect-[4/3] overflow-hidden rounded-xl border border-subtle bg-surface/90 transition-colors duration-300 group-hover:border-accent/30 md:aspect-auto md:h-full md:min-h-[14rem]">
                <ProjectVisual variant={project.visual} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

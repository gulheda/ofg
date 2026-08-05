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
      <div className="space-y-20 md:space-y-28">
        {projects.map((project, i) => (
          <Reveal key={project.title} variant="scale" delay={i * 0.05}>
            <article className="group">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-subtle bg-surface/90 transition-colors duration-500 group-hover:border-accent/30 md:aspect-[21/9]">
                <ProjectVisual variant={project.visual} />
              </div>

              <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="md:max-w-2xl">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-sm text-zinc-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
                      {project.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-sm text-accent/80">{project.role}</p>
                  <p className="mt-4 text-base leading-relaxed text-zinc-400">
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

                <div className="flex shrink-0 items-center gap-5 md:flex-col md:items-end md:gap-4">
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
                        <ExternalLink size={15} />
                        Canlı Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

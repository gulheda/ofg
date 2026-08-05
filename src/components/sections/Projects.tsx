import { ExternalLink, Github } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ProjectVisual from "@/components/ui/ProjectVisual";
import TechnicalCorners from "@/components/ui/TechnicalCorners";
import TiltCard from "@/components/ui/TiltCard";
import SectorBar from "@/components/ui/SectorBar";
import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <Section id="projeler">
      <SectionHeading
        eyebrow="03 — Projeler"
        title="Seçili çalışmalar"
        description="Yarışma pistinden sahaya: tasarlayıp entegre ettiğim ve bizzat uçurduğum aviyonik sistemler."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.title} delay={(i % 2) * 0.1}>
            <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-subtle bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-glow">
              <TechnicalCorners />
              <TiltCard className="flex h-full flex-col" maxTilt={5}>
                <div className="relative aspect-[16/9] border-b border-subtle bg-surface">
                  <ProjectVisual variant={project.visual} />
                  <span className="absolute left-3 top-3 rounded-md border border-subtle bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400 backdrop-blur-sm">
                    PRJ-{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                {/* dimension-line tick strip bridging image and copy */}
                <div className="flex items-center gap-1 px-6 pt-3" aria-hidden="true">
                  <span className="h-2 w-px bg-zinc-700" />
                  <span className="h-px flex-1 bg-zinc-800" />
                  <span className="h-2 w-px bg-zinc-700" />
                </div>
                <div className="flex flex-1 flex-col p-6 pt-3">
                  <h3 className="text-lg font-medium tracking-tight text-zinc-50">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-accent/80">{project.role}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
                    {project.description}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <li
                        key={t}
                        className="rounded-md border border-subtle bg-background px-2.5 py-1 font-mono text-[11px] text-zinc-400"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    <SectorBar />
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-5 border-t border-subtle pt-4">
                    <span className="font-mono text-xs text-zinc-500">{project.period}</span>
                    <div className="flex items-center gap-5">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
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
                          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-accent"
                        >
                          <ExternalLink size={15} />
                          Canlı Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

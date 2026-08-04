import { Github, Linkedin, Mail } from "lucide-react";
import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-subtle">
      <div className="mx-auto flex w-full max-w-content flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-zinc-500 md:flex-row md:px-8">
        <p>
          © {new Date().getFullYear()} {site.name} — Şematikten donanıma.
        </p>
        <div className="flex items-center gap-5">
          <a href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="transition-colors hover:text-zinc-200">
            <Github size={18} />
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition-colors hover:text-zinc-200">
            <Linkedin size={18} />
          </a>
          <a href={`mailto:${site.email}`} aria-label="E-posta" className="transition-colors hover:text-zinc-200">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}

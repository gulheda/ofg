"use client";

import { useState, type FormEvent } from "react";
import { FileDown, Github, Linkedin, Mail, Send } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/data/site";

const contactLinks = [
  { icon: Github, label: "GitHub", href: site.github, external: true },
  { icon: Linkedin, label: "LinkedIn", href: site.linkedin, external: true },
  { icon: Mail, label: site.email, href: `mailto:${site.email}`, external: false },
  { icon: FileDown, label: "CV İndir", href: site.cvUrl, external: false },
];

const inputClass =
  "w-full rounded-lg border border-subtle bg-card px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors duration-200 focus:border-accent/60 focus:ring-1 focus:ring-accent/30";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolyo üzerinden mesaj — ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
  };

  return (
    <Section id="iletisim">
      <SectionHeading
        eyebrow="07 — İletişim"
        title="Birlikte çalışalım"
        description="Bir proje fikriniz mi var, staj ya da iş birliği mi konuşmak istiyorsunuz? Mesajınızı bekliyorum."
      />
      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">Ad Soyad</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Adınız"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">E-posta</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ornek@mail.com"
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Mesaj</span>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Merhaba Gülheda, ..."
                className={`${inputClass} resize-none`}
              />
            </label>
            <button
              type="submit"
              className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-glow"
            >
              Gönder
              <Send size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </form>
        </Reveal>

        <Reveal variant="slide-left" delay={0.1}>
          <div className="space-y-3">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex items-center gap-4 rounded-xl border border-subtle bg-card px-5 py-4 transition-all duration-300 hover:border-accent/30 hover:bg-card/80"
              >
                <link.icon
                  size={18}
                  className="text-zinc-500 transition-colors duration-300 group-hover:text-accent"
                />
                <span className="text-sm text-zinc-300 transition-colors group-hover:text-zinc-100">
                  {link.label}
                </span>
              </a>
            ))}
            <p className="pt-4 text-sm leading-relaxed text-zinc-500">
              Genellikle 24 saat içinde dönüş yaparım. Açık kaynak donanım projeleri ve
              teknik tartışmalar için GitHub üzerinden de ulaşabilirsiniz.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

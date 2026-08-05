"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks, site } from "@/data/site";

/**
 * The site's spine — a fixed left rail on desktop instead of a top navbar,
 * styled like a PCB edge connector: each nav item sits on a pin, and the
 * pin lights up (an actual scroll-spy, not a decoration) as its section
 * comes into view. Collapses to a plain top bar below lg.
 */
export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(navLinks[0].href);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r border-subtle bg-background/85 backdrop-blur-md lg:flex">
        <a href="#" className="flex h-20 shrink-0 items-center gap-2.5 border-b border-subtle px-6" aria-label="Ana sayfa">
          <span className="flex h-3 w-3 items-center justify-center rounded-full border border-accent/70">
            <span className="h-1 w-1 rounded-full bg-accent" />
          </span>
          <span className="font-mono text-sm tracking-wider text-zinc-200">{site.handle}</span>
        </a>

        <nav className="flex-1 py-8">
          <ol className="relative ml-6 border-l border-subtle">
            {navLinks.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href} className="relative py-3.5 pl-6">
                  <span
                    className={`absolute -left-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border transition-colors duration-300 ${
                      isActive ? "border-accent bg-accent" : "border-zinc-600 bg-background"
                    }`}
                  />
                  <a
                    href={link.href}
                    className={`text-sm transition-colors duration-200 ${
                      isActive ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="border-t border-subtle px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          {site.location}
        </div>
      </aside>

      {/* mobile / tablet top bar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 lg:hidden ${
          scrolled || open
            ? "border-b border-subtle bg-background/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        } transition-colors duration-300`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2.5" aria-label="Ana sayfa">
            <span className="flex h-3 w-3 items-center justify-center rounded-full border border-accent/70">
              <span className="h-1 w-1 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-sm tracking-wider text-zinc-200">{site.handle}</span>
          </a>
          <button
            type="button"
            className="text-zinc-300"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <ul className="border-t border-subtle px-6 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-sm text-zinc-300 transition-colors hover:text-zinc-50"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, site } from "@/data/site";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-subtle bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* the current running along the top edge — real scroll progress, not decoration */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-accent shadow-[0_0_6px_rgba(47,111,238,0.8)]"
        style={{ scaleX: progress }}
      />

      <nav className="mx-auto flex h-16 w-full max-w-content items-center justify-between px-6 md:px-8">
        <a href="#" className="group flex items-center gap-2.5" aria-label="Ana sayfa">
          <span className="flex h-3 w-3 items-center justify-center rounded-full border border-accent/70 transition-shadow duration-300 group-hover:shadow-glow-sm">
            <span className="h-1 w-1 rounded-full bg-accent" />
          </span>
          <span className="font-mono text-sm tracking-wider text-zinc-200">{site.handle}</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="circuit-link text-sm text-zinc-400 transition-colors duration-200 hover:text-zinc-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="text-zinc-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <ul className="border-t border-subtle px-6 py-4 md:hidden">
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
  );
}

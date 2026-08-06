"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, site } from "@/data/site";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const reducedMotion = useReducedMotion();
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
        open
          ? "border-b border-subtle bg-background/95 backdrop-blur-xl"
          : scrolled
            ? "border-b border-subtle bg-background/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* the current running along the top edge — real scroll progress, not decoration */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-accent shadow-[0_0_6px_rgba(0,210,255,0.8)]"
        style={{ scaleX: progress }}
      />

      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reducedMotion ? 0 : 0.6,
          delay: reducedMotion ? 0 : 0.7,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
        className="mx-auto flex h-16 w-full max-w-content items-center justify-between px-6 md:px-8"
      >
        <a
          href="#"
          onClick={() => setPulseKey((k) => k + 1)}
          className="group relative flex items-center gap-2.5"
          aria-label="Ana sayfa"
        >
          <span className="relative flex h-3 w-3 items-center justify-center rounded-full border border-accent/70 transition-shadow duration-300 group-hover:shadow-glow-sm">
            <span className="h-1 w-1 rounded-full bg-accent" />
            <AnimatePresence>
              {pulseKey > 0 && !reducedMotion && (
                <motion.span
                  key={pulseKey}
                  className="absolute inset-0 rounded-full border border-accent"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 3.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                />
              )}
            </AnimatePresence>
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
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-subtle py-2 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.li
                key={link.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.25,
                  delay: reducedMotion ? 0 : 0.06 + i * 0.04,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="px-6"
              >
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-sm text-zinc-300 transition-colors hover:text-white active:text-accent"
                >
                  {link.label}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FileDown } from "lucide-react";
import { site } from "@/data/site";

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

export default function Hero() {
  const reducedMotion = useReducedMotion();

  const enter = (delay: number) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease },
        };

  return (
    <section className="relative flex min-h-svh items-center overflow-hidden">
      {/* soft radial vignette keeps the copy razor-legible over the board */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 38% 45%, rgba(9,9,11,0) 0%, rgba(9,9,11,0.6) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-content px-6 md:px-8">
        <div className="max-w-3xl">
          <motion.p
            {...enter(0.1)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-subtle bg-card/60 px-4 py-1.5 font-mono text-xs tracking-wider text-zinc-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {site.title}
          </motion.p>

          <motion.h1
            {...enter(0.2)}
            className="text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl md:text-7xl"
          >
            {site.name}
          </motion.h1>

          <motion.p
            {...enter(0.32)}
            className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg"
          >
            {site.tagline}
          </motion.p>

          <motion.div {...enter(0.44)} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#projeler"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-400 via-accent to-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-glow-sm transition-all duration-300 hover:shadow-glow"
            >
              Projelerimi İncele
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
            <a
              href={site.cvUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-subtle bg-card/60 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors duration-300 hover:border-white/20 hover:bg-card"
            >
              <FileDown size={16} />
              CV İndir
            </a>
          </motion.div>

          {/* title-block strip — the drawing's metadata, read left to right like a dimension line */}
          <motion.div
            {...enter(0.56)}
            className="mt-14 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600"
          >
            <span className="h-px w-10 bg-zinc-700" />
            <span>Rev A</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Balıkesir Üniversitesi · EEE</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>2023—2027</span>
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        {...enter(0.9)}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
        aria-hidden="true"
      >
        <div className="h-10 w-px bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
      </motion.div>
    </section>
  );
}

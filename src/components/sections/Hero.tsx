"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, FileDown } from "lucide-react";
import TypewriterHeading from "@/components/ui/TypewriterHeading";
import { site } from "@/data/site";

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

export default function Hero() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax: as the hero scrolls out, its content rises and fades faster
  // than the fixed PCB canvas behind it, reading as a depth gap between layers.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reducedMotion ? 1 : 0]);

  // Always provide the same initial/animate shape — `initial` only applies on
  // first mount, so conditionally stripping these props to {} once reducedMotion
  // resolves true (often after SSR/first paint) leaves elements stuck at their
  // hidden initial state forever. Only the transition timing varies.
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : delay, ease },
  });

  return (
    <section ref={sectionRef} className="relative flex min-h-svh items-center overflow-hidden">
      {/* scrim darkens behind the text column so the copy stays legible over
          the board, fading out toward the right where the PCB is meant to show */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(18,18,18,0.88) 0%, rgba(18,18,18,0.68) 32%, rgba(18,18,18,0.28) 58%, rgba(18,18,18,0) 78%), radial-gradient(ellipse 80% 60% at 50% 50%, rgba(18,18,18,0) 0%, rgba(18,18,18,0.48) 100%)",
        }}
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto w-full max-w-content px-6 md:px-8"
      >
        <div className="max-w-3xl">
          <motion.p
            {...enter(0.1)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-subtle bg-card/60 px-4 py-1.5 font-mono text-xs tracking-wider text-zinc-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {site.title}
          </motion.p>

          <TypewriterHeading
            text={site.name}
            startDelay={0.18}
            className="font-mono text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl"
          />

          <motion.p
            {...enter(0.32)}
            className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base"
          >
            <span className="text-zinc-100">Teknofest İHA</span> takımında elektronik alt
            sistem ekibini yöneten; <span className="font-mono text-accent">güç dağıtımından</span>{" "}
            <span className="font-mono text-accent">RF</span> haberleşmeye, aviyonik sistemleri
            tasarlayıp sahada uçuran bir Elektrik-Elektronik Mühendisliği öğrencisi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: reducedMotion ? 1 : [0.96, 1.03, 1],
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.7,
              delay: reducedMotion ? 0 : 0.44,
              ease,
            }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#projeler"
              className="beam-border group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-br from-accent-light via-accent to-accent-deep px-5 py-2.5 text-sm font-medium text-white shadow-glow-sm transition-all duration-300 hover:shadow-glow active:scale-[0.96]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              Projelerimi İncele
              <ArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
            <a
              href={site.cvUrl}
              download
              className="beam-border inline-flex items-center gap-2 rounded-lg border border-subtle bg-card/60 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-all duration-300 hover:border-white/20 hover:bg-card active:scale-[0.96]"
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
      </motion.div>

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

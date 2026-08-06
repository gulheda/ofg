"use client";

import { useEffect, useRef } from "react";
import { generatePcb } from "@/lib/pcb/generate";
import { renderBaseLayer, renderLitLayer } from "@/lib/pcb/render";
import type { Point, Trace } from "@/lib/pcb/types";

/** Resting opacity of the copper layer (breathes ±15% around this). */
const BASE_ALPHA = 0.5;
const FADE_IN_MS = 700;
/** Scanline sweep + settle-in jitter plays over this window on first mount. */
const SCAN_MS = 550;
const GLITCH_MS = 160;
const BREATHE_PERIOD_MS = 9000;
const PULSE_COUNT = 22;
const PULSE_MIN_LEN = 50;

interface Pulse {
  points: Point[];
  cum: number[];
  total: number;
  duration: number;
  phase: number;
}

function buildPulses(traces: Trace[]): Pulse[] {
  const candidates = traces
    .map((t) => {
      const cum = [0];
      for (let i = 1; i < t.points.length; i++) {
        const a = t.points[i - 1];
        const b = t.points[i];
        cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
      }
      return { points: t.points, cum, total: cum[cum.length - 1] ?? 0 };
    })
    .filter((t) => t.total >= PULSE_MIN_LEN);

  if (candidates.length === 0) return [];

  const stride = Math.max(1, Math.floor(candidates.length / PULSE_COUNT));
  const pulses: Pulse[] = [];
  for (let i = 0; i < candidates.length && pulses.length < PULSE_COUNT; i += stride) {
    const c = candidates[i];
    pulses.push({
      points: c.points,
      cum: c.cum,
      total: c.total,
      duration: 2600 + Math.random() * 3200,
      phase: Math.random(),
    });
  }
  return pulses;
}

/**
 * Fades the board out toward the far corners so it reads as one composed
 * scene with a focal centre, instead of an edge-to-edge scatter of traces
 * at uniform density. Applied once per resize, not per frame.
 */
function applyVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const cx = width * 0.52;
  const cy = height * 0.4;
  const radius = Math.max(width, height) * 0.78;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.55, "rgba(0,0,0,0.92)");
  g.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/** Position at normalised progress t (0..1) along a polyline, given its cumulative lengths. */
function pointAtT(points: Point[], cum: number[], total: number, t: number): Point {
  const target = t * total;
  let i = 1;
  while (i < cum.length && cum[i] < target) i++;
  if (i >= points.length) return points[points.length - 1];
  const segStart = cum[i - 1];
  const segLen = cum[i] - segStart;
  const segT = segLen > 0 ? (target - segStart) / segLen : 0;
  const a = points[i - 1];
  const b = points[i];
  return { x: a.x + (b.x - a.x) * segT, y: a.y + (b.y - a.y) * segT };
}

/**
 * The site's one PCB canvas — mounted once, fixed behind every section, not
 * just the hero. Cards sit on top of it at partial opacity so the same board
 * reads through the whole page instead of stopping at the fold.
 *
 * Architecture: geometry is generated once per resize and rasterised into two
 * offscreen layers (resting + accent). The rAF loop only composites bitmaps —
 * a full-viewport drawImage plus a small masked "spotlight" around the
 * pointer — so per-frame CPU cost stays minimal and 60fps is trivial to hold.
 *
 * prefers-reduced-motion only turns off the one truly ambient, autoplaying
 * bit (the slow breathing pulse) — the pointer glow and scroll response are
 * direct reactions to the user's own input, not autoplay, so they stay on;
 * otherwise a system-level "reduce motion" setting would make the whole
 * board go flat and static with no way to tell it was ever there.
 */
export default function PcbBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile =
      window.matchMedia("(max-width: 768px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;

    const density = isMobile ? 1.15 : 1.4;
    const glowRadius = isMobile ? 165 : 220;
    // no cursor on touch, so the glow can't chase a pointer — instead it
    // roams to a new random point every few seconds, keeping the board
    // visibly alive instead of sitting as one flat static print
    const autoRoam = isMobile && !reducedMotion;

    const base = document.createElement("canvas");
    const lit = document.createElement("canvas");
    const spot = document.createElement("canvas");

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let startTime = 0;
    let pulses: Pulse[] = [];

    // pointer state lives outside React — no re-renders in the hot path
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, active: false };

    // scroll-velocity state — drives a soft motion blur, like the board is rushing past
    let lastScrollY = window.scrollY;
    let lastFrameTime = 0;
    let smoothSpeed = 0;
    canvas.style.willChange = "transform, filter";

    const rebuild = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const layout = generatePcb({ width, height, density, seed: 0x5eed });

      for (const layer of [base, lit]) {
        layer.width = width * dpr;
        layer.height = height * dpr;
      }
      const baseCtx = base.getContext("2d")!;
      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderBaseLayer(baseCtx, layout, width, height);
      applyVignette(baseCtx, width, height);

      const litCtx = lit.getContext("2d")!;
      litCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderLitLayer(litCtx, layout, width, height);
      applyVignette(litCtx, width, height);

      spot.width = glowRadius * 2 * dpr;
      spot.height = glowRadius * 2 * dpr;

      pulses = reducedMotion ? [] : buildPulses(layout.traces);
    };

    /** Copy the accent layer through a soft radial mask around the pointer. */
    const renderSpot = () => {
      const spotCtx = spot.getContext("2d")!;
      const size = glowRadius * 2 * dpr;
      spotCtx.setTransform(1, 0, 0, 1, 0, 0);
      spotCtx.clearRect(0, 0, size, size);
      spotCtx.globalCompositeOperation = "source-over";

      const g = spotCtx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2,
      );
      g.addColorStop(0, "rgba(255,255,255,0.9)");
      g.addColorStop(0.45, "rgba(255,255,255,0.45)");
      g.addColorStop(0.75, "rgba(255,255,255,0.12)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      spotCtx.fillStyle = g;
      spotCtx.fillRect(0, 0, size, size);

      spotCtx.globalCompositeOperation = "source-in";

      // clamp the source rect to the lit layer's bounds
      const sx = Math.round((pointer.x - glowRadius) * dpr);
      const sy = Math.round((pointer.y - glowRadius) * dpr);
      const cx = Math.max(sx, 0);
      const cy = Math.max(sy, 0);
      const cw = Math.min(sx + size, lit.width) - cx;
      const ch = Math.min(sy + size, lit.height) - cy;
      if (cw > 0 && ch > 0) {
        spotCtx.drawImage(lit, cx, cy, cw, ch, cx - sx, cy - sy, cw, ch);
      }
    };

    const frame = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;

      const fade = reducedMotion ? 1 : Math.min(elapsed / FADE_IN_MS, 1);
      const easedFade = 1 - Math.pow(1 - fade, 3);
      const breathe = reducedMotion ? 1 : 1 + 0.15 * Math.sin((elapsed / BREATHE_PERIOD_MS) * Math.PI * 2);

      // scroll speed → soft motion blur + slight scale, settles back at rest
      if (!lastFrameTime) lastFrameTime = now;
      const dt = Math.max(now - lastFrameTime, 1);
      lastFrameTime = now;
      const scrollY = window.scrollY;
      const rawSpeed = Math.abs(scrollY - lastScrollY) / dt;
      lastScrollY = scrollY;
      smoothSpeed += (rawSpeed - smoothSpeed) * 0.12;
      const speedT = Math.min(smoothSpeed / 2.6, 1);
      canvas.style.filter = speedT > 0.02 ? `blur(${(speedT * 2.2).toFixed(2)}px)` : "";
      // parallax: the board drifts a little slower than the page scrolls,
      // clamped so it never scrolls far enough to expose a viewport edge
      const parallaxY = reducedMotion ? 0 : Math.max(scrollY * -0.03, -22);
      canvas.style.transform = `translateY(${parallaxY.toFixed(1)}px) scale(${(1 + speedT * 0.014).toFixed(4)})`;

      // smooth pointer follow + eased glow strength
      pointer.x += (pointer.tx - pointer.x) * 0.14;
      pointer.y += (pointer.ty - pointer.y) * 0.14;
      const targetStrength = pointer.active ? 1 : 0;
      pointer.strength += (targetStrength - pointer.strength) * 0.08;

      // settle-in jitter — a brief, decaying tremor while the board "boots",
      // like a signal still finding lock, gone well before the fade finishes
      let jx = 0;
      let jy = 0;
      if (!reducedMotion && elapsed < GLITCH_MS) {
        const jitterT = 1 - elapsed / GLITCH_MS;
        jx = (Math.random() - 0.5) * 6 * jitterT;
        jy = (Math.random() - 0.5) * 3 * jitterT;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(jx, jy);
      ctx.globalAlpha = BASE_ALPHA * breathe * easedFade;
      ctx.drawImage(base, 0, 0, width, height);
      ctx.restore();
      ctx.globalAlpha = 1;

      // scanline sweep — two bright lines racing from centre to the edges
      // on first mount, like the board is being scanned into existence
      if (!reducedMotion && elapsed < SCAN_MS) {
        const scanT = elapsed / SCAN_MS;
        const scanEase = 1 - Math.pow(1 - scanT, 2);
        const scanAlpha = (1 - scanT) * 0.8;
        const midY = height / 2;
        ctx.save();
        ctx.fillStyle = `rgba(140,235,255,${scanAlpha.toFixed(3)})`;
        ctx.shadowColor = "rgba(110,231,255,0.9)";
        ctx.shadowBlur = 8;
        ctx.fillRect(0, midY - scanEase * midY - 1, width, 2);
        ctx.fillRect(0, midY + scanEase * midY - 1, width, 2);
        ctx.restore();
      }

      // signal pulses — small bright dots travelling the traces on loop, so
      // the board reads as live current flowing rather than a static print.
      if (pulses.length > 0) {
        ctx.save();
        ctx.fillStyle = "#6ee7ff";
        ctx.shadowColor = "rgba(0,210,255,0.9)";
        ctx.shadowBlur = 6;
        ctx.globalAlpha = easedFade;
        for (const p of pulses) {
          const t = ((elapsed / p.duration + p.phase) % 1 + 1) % 1;
          const pos = pointAtT(p.points, p.cum, p.total, t);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (pointer.strength > 0.01) {
        renderSpot();
        ctx.globalAlpha = 0.9 * pointer.strength * easedFade;
        ctx.drawImage(
          spot,
          pointer.x - glowRadius,
          pointer.y - glowRadius,
          glowRadius * 2,
          glowRadius * 2,
        );
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    rebuild();
    start();

    let roamTimer = 0;
    const pickRoamTarget = () => {
      const margin = 48;
      pointer.tx = margin + Math.random() * Math.max(1, width - margin * 2);
      pointer.ty = margin + Math.random() * Math.max(1, height * 0.7 - margin);
    };
    if (autoRoam) {
      pointer.active = true;
      pointer.x = width / 2;
      pointer.y = height * 0.32;
      pickRoamTarget();
      roamTimer = window.setInterval(pickRoamTarget, 3000);
    }

    const onPointerMove = (e: PointerEvent) => {
      pointer.active = true;
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
      if (pointer.strength < 0.01) {
        // snap on first movement so the glow doesn't fly across the screen
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }
    };
    const onPointerLeave = () => {
      if (!autoRoam) pointer.active = false;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const wasRunning = running;
        stop();
        startTime = 0;
        rebuild();
        if (wasRunning) start();
      }, 150);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.clearInterval(roamTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}

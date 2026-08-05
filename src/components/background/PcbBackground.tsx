"use client";

import { useEffect, useRef } from "react";
import { generatePcb } from "@/lib/pcb/generate";
import { renderBaseLayer, renderLitLayer } from "@/lib/pcb/render";

/** Resting opacity of the copper layer (breathes ±15% around this). */
const BASE_ALPHA = 0.6;
const FADE_IN_MS = 1600;
const BREATHE_PERIOD_MS = 9000;

/**
 * The site's one PCB canvas — mounted once, fixed behind every section, not
 * just the hero. Cards sit on top of it at partial opacity so the same board
 * reads through the whole page instead of stopping at the fold.
 *
 * Architecture: geometry is generated once per resize and rasterised into two
 * offscreen layers (resting + accent). The rAF loop only composites bitmaps —
 * a full-viewport drawImage plus a small masked "spotlight" around the
 * pointer — so per-frame CPU cost stays minimal and 60fps is trivial to hold.
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

    const density = isMobile ? 0.5 : 1.3;
    const glowRadius = isMobile ? 100 : 170;

    const base = document.createElement("canvas");
    const lit = document.createElement("canvas");
    const spot = document.createElement("canvas");

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let startTime = 0;

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
      renderBaseLayer(baseCtx, layout);

      const litCtx = lit.getContext("2d")!;
      litCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderLitLayer(litCtx, layout);

      spot.width = glowRadius * 2 * dpr;
      spot.height = glowRadius * 2 * dpr;
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

      const fade = Math.min(elapsed / FADE_IN_MS, 1);
      const easedFade = 1 - Math.pow(1 - fade, 3);
      const breathe = 1 + 0.15 * Math.sin((elapsed / BREATHE_PERIOD_MS) * Math.PI * 2);

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
      canvas.style.transform = `scale(${(1 + speedT * 0.014).toFixed(4)})`;

      // smooth pointer follow + eased glow strength
      pointer.x += (pointer.tx - pointer.x) * 0.14;
      pointer.y += (pointer.ty - pointer.y) * 0.14;
      const targetStrength = pointer.active ? 1 : 0;
      pointer.strength += (targetStrength - pointer.strength) * 0.08;

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = BASE_ALPHA * breathe * easedFade;
      ctx.drawImage(base, 0, 0, width, height);

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

    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = BASE_ALPHA;
      ctx.drawImage(base, 0, 0, width, height);
      ctx.globalAlpha = 1;
    };

    rebuild();

    if (reducedMotion) {
      renderStatic();
    } else {
      start();
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
      pointer.active = false;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reducedMotion) start();
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const wasRunning = running;
        stop();
        startTime = 0;
        rebuild();
        if (reducedMotion) renderStatic();
        else if (wasRunning) start();
      }, 150);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("blur", onPointerLeave);
    }

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}

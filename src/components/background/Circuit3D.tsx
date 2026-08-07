"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { generatePcb } from "@/lib/pcb/generate";
import type { PcbLayout, Point } from "@/lib/pcb/types";

/**
 * A real WebGL scene, not a flat picture of one: an exploded-view multi-
 * layer PCB stack floating in depth, the way a datasheet's assembly diagram
 * separates copper layers to show how they route past each other. Each
 * layer is its own procedurally-routed board (reusing the same generator
 * as the old 2D canvas), placed further back in Z with a slight rotational
 * offset so the stack reads as pulled apart, not stacked flat.
 *
 * The whole rig drifts on its own, leans gently toward the cursor (heavily
 * damped, never snappy), and the camera pushes deeper into the stack as the
 * page scrolls — so reaching the end of the site reads as having flown all
 * the way through the board.
 */

const LAYER_COUNT_DESKTOP = 5;
const LAYER_COUNT_MOBILE = 3;
const LAYER_SPACING = 260;
const WORLD_SCALE = 1 / 110;
const BG_HEX = 0x121212;
const ACCENT = new THREE.Color("#00d2ff");
const ACCENT_DIM = new THREE.Color("#0092b8");
const MOTE_GLYPHS = ["Ω", "V", "A", "Hz", "dB", "kΩ", "μF", "0x3F"];

function buildGlowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function buildGlyphTexture(glyph: string): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.font = "600 52px ui-monospace, 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,210,255,0.9)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#bdf4ff";
  ctx.fillText(glyph, size / 2, size / 2 + 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Position at normalised progress t (0..1) along a polyline. */
function pointAtT(points: Point[], t: number): Point {
  if (points.length < 2) return points[0] ?? { x: 0, y: 0 };
  const lens: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    lens.push(lens[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  const total = lens[lens.length - 1];
  const target = t * total;
  let i = 1;
  while (i < lens.length && lens[i] < target) i++;
  if (i >= points.length) return points[points.length - 1];
  const segLen = lens[i] - lens[i - 1];
  const segT = segLen > 0 ? (target - lens[i - 1]) / segLen : 0;
  const a = points[i - 1];
  const b = points[i];
  return { x: a.x + (b.x - a.x) * segT, y: a.y + (b.y - a.y) * segT };
}

interface Pulse {
  points: Point[];
  z: number;
  duration: number;
  phase: number;
  sprite: THREE.Sprite;
}

interface Mote {
  sprite: THREE.Sprite;
  baseY: number;
  vy: number;
  drift: number;
  phase: number;
}

export default function Circuit3D({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof window === "undefined" || !window.WebGLRenderingContext) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile =
      window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(pointer: coarse)").matches;
    const layerCount = isMobile ? LAYER_COUNT_MOBILE : LAYER_COUNT_DESKTOP;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(BG_HEX, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(BG_HEX, 4, 15);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 40);
    camera.position.set(0, 0, 6.5);

    const rig = new THREE.Group();
    scene.add(rig);

    const glowTex = buildGlowTexture();
    const glyphTexCache = new Map<string, THREE.Texture>();
    const getGlyphTex = (g: string) => {
      let t = glyphTexCache.get(g);
      if (!t) {
        t = buildGlyphTexture(g);
        glyphTexCache.set(g, t);
      }
      return t;
    };

    const pulses: Pulse[] = [];
    const layerTraces: { points: Point[]; z: number }[] = [];

    for (let li = 0; li < layerCount; li++) {
      const layout: PcbLayout = generatePcb({
        width: 1400,
        height: 900,
        density: isMobile ? 0.85 : 1.1,
        seed: 0x9e7a + li * 733,
      });

      const z = -li * LAYER_SPACING * WORLD_SCALE;
      const depthT = li / Math.max(1, layerCount - 1);
      const layerColor = ACCENT.clone().lerp(ACCENT_DIM, depthT * 0.7);
      const layerOpacity = 0.85 - depthT * 0.5;

      const positions: number[] = [];
      for (const trace of layout.traces) {
        layerTraces.push({ points: trace.points, z });
        for (let i = 1; i < trace.points.length; i++) {
          const a = trace.points[i - 1];
          const b = trace.points[i];
          positions.push(
            (a.x - 700) * WORLD_SCALE,
            (450 - a.y) * WORLD_SCALE,
            z,
            (b.x - 700) * WORLD_SCALE,
            (450 - b.y) * WORLD_SCALE,
            z,
          );
        }
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: layerColor,
        transparent: true,
        opacity: layerOpacity,
        fog: true,
      });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      // each layer sits at a slightly different angle, like plates pulled apart
      // from an assembled stack rather than perfectly parallel sheets
      lines.rotation.x = (li - layerCount / 2) * 0.015;
      lines.rotation.y = (li % 2 === 0 ? 1 : -1) * 0.02;
      rig.add(lines);

      const padPositions: number[] = [];
      for (const pad of layout.pads) {
        padPositions.push((pad.x - 700) * WORLD_SCALE, (450 - pad.y) * WORLD_SCALE, z);
      }
      for (const via of layout.vias) {
        padPositions.push((via.x - 700) * WORLD_SCALE, (450 - via.y) * WORLD_SCALE, z);
      }
      if (padPositions.length > 0) {
        const padGeo = new THREE.BufferGeometry();
        padGeo.setAttribute("position", new THREE.Float32BufferAttribute(padPositions, 3));
        const padMat = new THREE.PointsMaterial({
          size: 0.05,
          map: glowTex,
          color: layerColor,
          transparent: true,
          opacity: layerOpacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
        });
        rig.add(new THREE.Points(padGeo, padMat));
      }
    }

    // signal pulses — a handful of bright sprites racing along real trace
    // paths, so the stack reads as live current rather than a static print
    const pulseCount = isMobile ? 8 : 16;
    const pulseMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: ACCENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const eligible = layerTraces.filter((t) => t.points.length >= 3);
    for (let i = 0; i < Math.min(pulseCount, eligible.length); i++) {
      const t = eligible[Math.floor(Math.random() * eligible.length)];
      const sprite = new THREE.Sprite(pulseMat.clone());
      sprite.scale.setScalar(0.09);
      rig.add(sprite);
      pulses.push({
        points: t.points,
        z: t.z,
        duration: 3200 + Math.random() * 4200,
        phase: Math.random(),
        sprite,
      });
    }

    // drifting unit glyphs at real, varying depth — parallax the 2D version
    // could only fake, here it's the camera's actual perspective doing it
    const motes: Mote[] = [];
    const moteCount = isMobile ? 8 : 18;
    for (let i = 0; i < moteCount; i++) {
      const glyph = MOTE_GLYPHS[Math.floor(Math.random() * MOTE_GLYPHS.length)];
      const mat = new THREE.SpriteMaterial({
        map: getGlyphTex(glyph),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.5,
      });
      const sprite = new THREE.Sprite(mat);
      const z = -Math.random() * layerCount * LAYER_SPACING * WORLD_SCALE;
      sprite.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4.5, z);
      sprite.scale.setScalar(0.28 + Math.random() * 0.16);
      rig.add(sprite);
      motes.push({
        sprite,
        baseY: sprite.position.y,
        vy: 0.12 + Math.random() * 0.16,
        drift: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // pointer + scroll state — outside React, no re-renders in the hot path
    const pointer = { x: 0, y: 0 };
    const pointerSmooth = { x: 0, y: 0 };
    let scrollT = 0;
    let scrollSmooth = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollT = Math.min(1, window.scrollY / max);
    };
    onScroll();

    let width = 0;
    let height = 0;
    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    resize();

    let raf = 0;
    let running = false;
    let startTime = 0;
    const maxDollyZ = (layerCount - 1) * LAYER_SPACING * WORLD_SCALE * 0.72;

    const frame = (now: number) => {
      if (!startTime) startTime = now;
      const liveElapsed = now - startTime;
      // a frozen, still-pretty moment for reduced-motion instead of a dead scene
      const elapsed = reducedMotion ? 1400 : liveElapsed;

      pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.035;
      pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.035;
      scrollSmooth += (scrollT - scrollSmooth) * 0.06;

      if (!reducedMotion) {
        rig.rotation.y = Math.sin(liveElapsed / 14000) * 0.05 + pointerSmooth.x * 0.12;
        rig.rotation.x = pointerSmooth.y * -0.08;
      } else {
        rig.rotation.y = pointerSmooth.x * 0.12;
        rig.rotation.x = pointerSmooth.y * -0.08;
      }
      camera.position.x = pointerSmooth.x * 0.35;
      camera.position.y = -pointerSmooth.y * 0.25;
      camera.position.z = 6.5 - scrollSmooth * maxDollyZ;
      camera.lookAt(0, 0, camera.position.z - 6.5);

      for (const p of pulses) {
        const t = (((elapsed / p.duration) + p.phase) % 1 + 1) % 1;
        const pos = pointAtT(p.points, t);
        p.sprite.position.set((pos.x - 700) * WORLD_SCALE, (450 - pos.y) * WORLD_SCALE, p.z);
        const mat = p.sprite.material as THREE.SpriteMaterial;
        mat.opacity = 0.55 + 0.45 * Math.sin(t * Math.PI);
      }

      for (const m of motes) {
        const t = reducedMotion ? 1400 : liveElapsed;
        m.sprite.position.y = m.baseY + ((t / 1000) * m.vy) % 5.2;
        if (m.sprite.position.y > 2.6) m.sprite.position.y -= 5.2;
        m.sprite.position.x += Math.sin(t / 2600 + m.phase) * 0.0006 * m.drift;
        const mat = m.sprite.material as THREE.SpriteMaterial;
        mat.opacity = 0.3 + 0.3 * (0.5 + 0.5 * Math.sin(t / 1300 + m.phase));
      }

      renderer.render(scene, camera);
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

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      glowTex.dispose();
      glyphTexCache.forEach((t) => t.dispose());
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" className={className} />;
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { generatePcb } from "@/lib/pcb/generate";
import type { PcbLayout, Point } from "@/lib/pcb/types";

/**
 * A real WebGL scene, not a flat picture of one: an exploded-view multi-
 * layer PCB stack floating in depth, the way a datasheet's assembly diagram
 * separates copper layers to show how they route past each other. No other
 * objects share the scene — the board itself is the whole show, so scroll
 * is a straight dive through its copper layers rather than a tour past a
 * sequence of exhibits.
 *
 * As the camera's depth crosses each layer, that layer energizes — brighter,
 * warmer toward turquoise — so passing through reads as entering that
 * layer's depth. And the world itself darkens as you go: the background and
 * fog deepen from navy toward near-black across the full scroll, and the
 * fog closes in slightly, so reaching the bottom of the page feels like
 * having descended somewhere else entirely, not just having scrolled.
 */

const LAYER_COUNT_DESKTOP = 7;
const LAYER_COUNT_MOBILE = 4;
const LAYER_SPACING = 260;
const WORLD_SCALE = 1 / 110;

/** The resting state — one notch darker than before. */
const BG_COLOR = new THREE.Color(0x080c18);
/** Where the world lands by the time you've scrolled to the bottom — nearly black. */
const BG_DEEP_COLOR = new THREE.Color(0x020306);

/** Three-color language, no more: deep night-blue for structure, turquoise for anything "live". */
const DIM = new THREE.Color("#1e2f57");
const DIM_2 = new THREE.Color("#0a0f1e");
const ACCENT = new THREE.Color("#2dd4bf");
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
  ctx.font = "600 48px ui-monospace, 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(45,212,191,0.6)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#7ce8d8";
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

/** One PCB layer's materials, tracked so the layer can energize as the camera passes through its depth. */
interface LayerRecord {
  z: number;
  baseColor: THREE.Color;
  lineMat: THREE.LineBasicMaterial;
  baseLineOpacity: number;
  padMat?: THREE.PointsMaterial;
  basePadOpacity: number;
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
    renderer.setClearColor(BG_COLOR, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(BG_COLOR.getHex(), 4, 15);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 40);
    camera.position.set(0, 0, 6.5);

    // real bloom, not a faked glow sprite — lets pulses and pin/via dots
    // actually flare into the scene around them instead of just being a
    // bright soft circle sitting flat on top of it
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), isMobile ? 0.42 : 0.6, 0.42, 0.2);
    composer.addPass(bloomPass);

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
    const layerRecords: LayerRecord[] = [];

    for (let li = 0; li < layerCount; li++) {
      const layout: PcbLayout = generatePcb({
        width: 1400,
        height: 900,
        density: isMobile ? 0.95 : 1.25,
        seed: 0x9e7a + li * 733,
      });

      const z = -li * LAYER_SPACING * WORLD_SCALE;
      const depthT = li / Math.max(1, layerCount - 1);
      const layerColor = DIM.clone().lerp(DIM_2, depthT);
      // more present than before — the board is the whole scene now, it
      // needs to read clearly rather than fade into a faint backdrop
      const layerOpacity = 0.56 - depthT * 0.32;

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
      let padMat: THREE.PointsMaterial | undefined;
      if (padPositions.length > 0) {
        const padGeo = new THREE.BufferGeometry();
        padGeo.setAttribute("position", new THREE.Float32BufferAttribute(padPositions, 3));
        padMat = new THREE.PointsMaterial({
          size: 0.045,
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

      layerRecords.push({
        z,
        baseColor: layerColor,
        lineMat,
        baseLineOpacity: layerOpacity,
        padMat,
        basePadOpacity: layerOpacity,
      });
    }

    // signal pulses — a handful of bright sprites racing along real trace
    // paths, so the stack reads as live current rather than a static print
    const pulseCount = isMobile ? 10 : 20;
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
      sprite.scale.setScalar(0.08);
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
    const moteCount = isMobile ? 6 : 14;
    for (let i = 0; i < moteCount; i++) {
      const glyph = MOTE_GLYPHS[Math.floor(Math.random() * MOTE_GLYPHS.length)];
      const mat = new THREE.SpriteMaterial({
        map: getGlyphTex(glyph),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.28,
      });
      const sprite = new THREE.Sprite(mat);
      const z = -Math.random() * layerCount * LAYER_SPACING * WORLD_SCALE;
      sprite.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4.5, z);
      sprite.scale.setScalar(0.26 + Math.random() * 0.14);
      rig.add(sprite);
      motes.push({
        sprite,
        baseY: sprite.position.y,
        vy: 0.12 + Math.random() * 0.16,
        drift: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // the camera's full depth budget: past the last physical layer and on
    // into open dark — so the bottom of the page arrives somewhere emptier
    // and darker than the board itself, not just at its last layer
    const stackDepth = (layerCount - 1) * LAYER_SPACING * WORLD_SCALE;
    const totalDepth = stackDepth + 6;

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
      composer.setSize(width, height);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    resize();

    let raf = 0;
    let running = false;
    let startTime = 0;
    const bgScratch = new THREE.Color();

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
      camera.position.z = 6.5 - scrollSmooth * totalDepth;
      camera.lookAt(0, 0, camera.position.z - 6.5);

      // the world itself darkens as you descend — background and fog drift
      // from navy toward near-black, and the fog closes in a little, so the
      // bottom of the page reads as somewhere else entirely, not just a
      // scroll position
      bgScratch.copy(BG_COLOR).lerp(BG_DEEP_COLOR, scrollSmooth);
      renderer.setClearColor(bgScratch, 1);
      scene.fog!.color.copy(bgScratch);
      (scene.fog as THREE.Fog).far = THREE.MathUtils.lerp(15, 10, scrollSmooth);

      // each PCB layer energizes as the camera's depth crosses it — brighter
      // and warmer toward turquoise right at the moment of passing through,
      // so scrolling reads as diving into the board's depths one copper
      // layer at a time, not sliding past a flat, static backdrop
      for (const layer of layerRecords) {
        const w = Math.max(0, 1 - Math.abs(layer.z - camera.position.z) / 1.3);
        layer.lineMat.opacity = layer.baseLineOpacity + w * 0.4;
        layer.lineMat.color.copy(layer.baseColor).lerp(ACCENT, w * 0.55);
        if (layer.padMat) {
          layer.padMat.opacity = layer.basePadOpacity + w * 0.45;
          layer.padMat.color.copy(layer.baseColor).lerp(ACCENT, w * 0.55);
        }
      }

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
        mat.opacity = 0.16 + 0.16 * (0.5 + 0.5 * Math.sin(t / 1300 + m.phase));
      }

      composer.render();
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
      composer.dispose();
      bloomPass.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Points || obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
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

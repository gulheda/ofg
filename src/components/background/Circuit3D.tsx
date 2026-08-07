"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { generatePcb } from "@/lib/pcb/generate";
import type { PcbLayout, Point } from "@/lib/pcb/types";

/**
 * A real WebGL scene, not a flat picture of one: an exploded-view multi-
 * layer PCB stack floating in depth, the way a datasheet's assembly diagram
 * separates copper layers to show how they route past each other. Past the
 * stack, one small wireframe "landmark" object per section drifts at its
 * own depth — an antenna for Hakkımda, an IC for Yetkinlikler, a quadcopter
 * for Projeler, a signal trace for Deneyim, an orbit ring for Eğitim, and
 * three gold portal rings at Contact — so scrolling through the page reads
 * as a single continuous flight past a sequence of real objects, not a
 * static backdrop sitting behind flat panels.
 *
 * Everything stays deliberately dim and desaturated — a muted steel-teal,
 * not neon — except the handful of things that are meant to read as "live":
 * signal pulses, propeller rims, pin-1 dots. Restraint reserves brightness
 * for the moments that should actually catch the eye.
 */

const LAYER_COUNT_DESKTOP = 5;
const LAYER_COUNT_MOBILE = 3;
const LAYER_SPACING = 260;
const WORLD_SCALE = 1 / 110;
const BG_HEX = 0x121212;

const DIM = new THREE.Color("#2c4550");
const DIM_2 = new THREE.Color("#1c2f38");
const ACCENT = new THREE.Color("#5fc8dd");
/** Landmarks read as foreground objects, not board traces — a step brighter than DIM. */
const LM_DIM = new THREE.Color("#5a8698");
const GOLD = new THREE.Color("#f5b242");
const MOTE_GLYPHS = ["Ω", "V", "A", "Hz", "dB", "kΩ", "μF", "0x3F"];

/** Depth spacing (world units) between one section's landmark and the next. */
const SECTION_SPACING = 3.1;
const SECTION_IDS = ["hakkimda", "yetkinlikler", "projeler", "deneyim", "egitim", "iletisim"] as const;

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
  ctx.shadowColor = "rgba(95,200,221,0.6)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#8fd6e8";
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

function circleOutline(radius: number, segments: number, color: THREE.Color, opacity: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity, fog: true }));
}

function dimLine(mat: THREE.LineBasicMaterialParameters) {
  return new THREE.LineBasicMaterial({ transparent: true, fog: true, ...mat });
}

/** Hakkımda — a faceted satellite core with radiating antenna booms. */
function buildAntenna(glowTex: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const core = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.34, 0));
  g.add(new THREE.LineSegments(core, dimLine({ color: LM_DIM, opacity: 0.85 })));
  const booms = [
    new THREE.Vector3(1, 0.6, 0.2),
    new THREE.Vector3(-1, 0.5, -0.3),
    new THREE.Vector3(0.2, -1, 0.4),
  ];
  const tips: number[] = [];
  for (const dir of booms) {
    const end = dir.clone().normalize().multiplyScalar(0.82);
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), end]);
    g.add(new THREE.Line(geo, dimLine({ color: LM_DIM, opacity: 0.82 })));
    tips.push(end.x, end.y, end.z);
  }
  const tipGeo = new THREE.BufferGeometry();
  tipGeo.setAttribute("position", new THREE.Float32BufferAttribute(tips, 3));
  g.add(
    new THREE.Points(
      tipGeo,
      new THREE.PointsMaterial({
        size: 0.075,
        map: glowTex,
        color: ACCENT,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    ),
  );
  return g;
}

/** Yetkinlikler — an IC package: body outline, pin stubs, one pin-1 dot. */
function buildChip(glowTex: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.58, 0.09, 0.4));
  g.add(new THREE.LineSegments(body, dimLine({ color: LM_DIM, opacity: 0.85 })));
  const pinXs = [-0.2, -0.07, 0.07, 0.2];
  for (const side of [1, -1]) {
    for (const x of pinXs) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0, side * 0.2),
        new THREE.Vector3(x, 0, side * 0.32),
      ]);
      g.add(new THREE.Line(geo, dimLine({ color: LM_DIM, opacity: 0.78 })));
    }
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.Float32BufferAttribute([-0.24, 0.05, -0.16], 3));
  g.add(
    new THREE.Points(
      dotGeo,
      new THREE.PointsMaterial({
        size: 0.07,
        map: glowTex,
        color: ACCENT,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    ),
  );
  return g;
}

/** Projeler — a quadcopter: fuselage, four arms, propeller rims. */
function buildDrone(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.13, 0));
  g.add(new THREE.LineSegments(body, dimLine({ color: LM_DIM, opacity: 0.88 })));
  const angles = [45, 135, 225, 315];
  for (const deg of angles) {
    const a = (deg * Math.PI) / 180;
    const end = new THREE.Vector3(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0);
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), end]);
    g.add(new THREE.Line(geo, dimLine({ color: LM_DIM, opacity: 0.82 })));
    const ring = circleOutline(0.14, 16, ACCENT, 0.6);
    ring.position.copy(end);
    g.add(ring);
  }
  return g;
}

/** Deneyim — a live signal trace with one bright pulse riding it. */
function buildSignalWave(glowTex: THREE.Texture) {
  const pts: THREE.Vector3[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const x = -0.85 + (1.7 * i) / n;
    const y = Math.sin((i / n) * Math.PI * 3.2) * 0.22;
    pts.push(new THREE.Vector3(x, y, 0));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.Line(geo, dimLine({ color: LM_DIM, opacity: 0.88 }));
  const group = new THREE.Group();
  group.add(line);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: ACCENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  sprite.scale.setScalar(0.11);
  group.add(sprite);
  return { group, pts, sprite };
}

/** Eğitim — an orbit ring with tick marks, like a seal. */
function buildRing(): THREE.Group {
  const g = new THREE.Group();
  g.add(circleOutline(0.5, 40, DIM, 0.6));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const inner = new THREE.Vector3(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0);
    const outer = new THREE.Vector3(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0);
    const geo = new THREE.BufferGeometry().setFromPoints([inner, outer]);
    g.add(new THREE.Line(geo, dimLine({ color: LM_DIM, opacity: 0.78 })));
  }
  return g;
}

/** İletişim — three concentric gold rings, the same portal motif as the 2D finale. */
function buildPortal(): THREE.Group {
  const g = new THREE.Group();
  g.add(circleOutline(0.4, 48, GOLD, 0.5));
  g.add(circleOutline(0.62, 48, GOLD, 0.32));
  g.add(circleOutline(0.85, 48, GOLD, 0.18));
  return g;
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

interface Landmark {
  group: THREE.Group;
  spinX: number;
  spinY: number;
  x: number;
  y: number;
  z: number;
  wave?: { pts: THREE.Vector3[]; sprite: THREE.Sprite };
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
      const layerColor = DIM.clone().lerp(DIM_2, depthT);
      const layerOpacity = 0.42 - depthT * 0.28;

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

    // one landmark object per section, placed further into the stack than
    // the PCB layers so each comes into frame as the camera dollies past
    // the point in the scroll journey where that section sits
    const stackDepth = (layerCount - 1) * LAYER_SPACING * WORLD_SCALE;
    // depth budget for the whole page's "flight" — independent of section
    // count so it can be shared between the camera dolly and every landmark
    const totalDepth = stackDepth + 22;
    const landmarks: Landmark[] = [];
    const builders: (() => { group: THREE.Group; wave?: Landmark["wave"] })[] = [
      () => ({ group: buildAntenna(glowTex) }),
      () => ({ group: buildChip(glowTex) }),
      () => ({ group: buildDrone() }),
      () => {
        const { group, pts, sprite } = buildSignalWave(glowTex);
        return { group, wave: { pts, sprite } };
      },
      () => ({ group: buildRing() }),
      () => ({ group: buildPortal() }),
    ];
    SECTION_IDS.forEach((_, i) => {
      const built = builders[i]();
      const x = i % 2 === 0 ? 2.3 : -2.3;
      const y = 0.9;
      built.group.position.set(x, y, -stackDepth - (i + 1) * (totalDepth / SECTION_IDS.length));
      built.group.scale.setScalar(i === 5 ? 2.1 : 1.6);
      rig.add(built.group);
      landmarks.push({
        group: built.group,
        spinX: 0.00004 + Math.random() * 0.00003,
        spinY: 0.00006 + Math.random() * 0.00004,
        x,
        y,
        z: built.group.position.z,
        wave: built.wave,
      });
    });

    // each landmark's real depth is derived from where its section actually
    // sits on the page (as a fraction of total scroll height), matching the
    // same fraction → depth mapping the camera dolly uses — so a landmark
    // comes into frame exactly when its own section is in view, not on a
    // guessed even spacing that drifts from the real, uneven section heights
    const placeLandmarks = () => {
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      SECTION_IDS.forEach((id, i) => {
        const el = document.getElementById(id);
        const lm = landmarks[i];
        if (!el || !lm) return;
        // biased toward the section's own top (its heading, ghost numeral
        // and eyebrow — the one part of every section that's never a dense
        // full-width grid) rather than its vertical centre, so the landmark
        // peaks into clear view right as the section title arrives instead
        // of sitting behind a wall of body text or a skill-card grid
        const rect = el.getBoundingClientRect();
        const anchorY = rect.top + window.scrollY + rect.height * 0.16;
        const frac = Math.min(1, Math.max(0, anchorY / scrollMax));
        const z = -frac * totalDepth;
        lm.z = z;
        lm.group.position.z = z;
      });
    };
    placeLandmarks();
    // fonts/images can still reflow the page slightly after first mount —
    // one cheap re-placement once things have settled is enough
    const settleTimer = window.setTimeout(placeLandmarks, 600);

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

      for (const lm of landmarks) {
        lm.group.rotation.x = elapsed * lm.spinX;
        lm.group.rotation.y = elapsed * lm.spinY;
        if (lm.wave) {
          const t = (elapsed / 2600) % 1;
          const idx = Math.min(lm.wave.pts.length - 1, Math.floor(t * lm.wave.pts.length));
          const p = lm.wave.pts[idx];
          lm.wave.sprite.position.set(p.x, p.y, p.z);
        }
      }
      // the last landmark (İletişim's portal) breathes like the closing seal
      const portal = landmarks[landmarks.length - 1];
      if (portal) {
        portal.group.scale.setScalar(2.1 * (1 + 0.06 * Math.sin(elapsed / 1800)));
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
      resizeTimer = window.setTimeout(() => {
        resize();
        placeLandmarks();
      }, 150);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.clearTimeout(settleTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      container.removeChild(renderer.domElement);
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

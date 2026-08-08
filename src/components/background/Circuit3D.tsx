"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { generatePcb } from "@/lib/pcb/generate";
import type { PcbLayout, Point } from "@/lib/pcb/types";

/**
 * A real WebGL scene, not a flat picture of one: an exploded-view multi-
 * layer PCB stack floating in depth, the way a datasheet's assembly diagram
 * separates copper layers to show how they route past each other. A real
 * lit navy slab per layer with live routing and simple chip packages on
 * top of it — the board body is real geometry catching a fixed key light
 * as the stack slowly turns, which is what sells "solid 3D object" over
 * flat wireframe lines alone.
 *
 * As the camera's depth crosses each layer, that layer's routing energizes
 * — brighter, more saturated blue — so passing through reads as entering
 * that layer's depth. The board and chip materials themselves never change
 * color under motion, only the live copper does — a physical slab doesn't
 * change hue because you scrolled past it. And the world itself darkens as
 * you go: background and fog deepen from navy toward near-black across the
 * full scroll, so reaching the bottom feels like having descended
 * somewhere else entirely.
 */

const LAYER_COUNT_DESKTOP = 5;
const LAYER_COUNT_MOBILE = 3;
const LAYER_SPACING = 260;
const WORLD_SCALE = 1 / 110;

/** How far routing/components stand off the slab's face, and how thick the slab itself is. */
const BOARD_THICKNESS = 0.05;
const SURFACE_OFFSET = BOARD_THICKNESS / 2 + 0.012;
const CHIP_RISE = 0.08;

/** The resting state — dark night-blue, darker than before. */
const BG_COLOR = new THREE.Color(0x05091a);
/** Where the world lands by the time you've scrolled to the bottom — nearly black. */
const BG_DEEP_COLOR = new THREE.Color(0x010204);

/** The board substrate itself — a genuine navy blue, not a scene tint. */
const SLAB_NEAR = new THREE.Color("#16234a");
const SLAB_FAR = new THREE.Color("#070c1f");
/** Chip packages — a step brighter, the same royal-blue family as the site's accent. */
const CHIP_COLOR = new THREE.Color("#2c4a8f");
const CHIP_DEEP = new THREE.Color("#0c1638");

/**
 * Traces get real per-net variety instead of one flat tone, all within the
 * one royal-blue family the rest of the site uses — some nets read dim and
 * structural, others closer to the bright accent, but nothing shifts hue.
 */
const TRACE_LOW = new THREE.Color("#24427a");
const TRACE_HIGH = new THREE.Color("#5b8cf0");
const DEEP_FADE = new THREE.Color("#050b1c");
/** Pads/vias sit a step brighter than routing — the "populated" points on an otherwise bare board. */
const PAD_COLOR = new THREE.Color("#3a5fac");
const PAD_DEEP = new THREE.Color("#0d1a3a");
const ACCENT = new THREE.Color("#3b82f6");
const WHITE = new THREE.Color(1, 1, 1);
const MOTE_GLYPHS = ["Ω", "V", "A", "Hz", "dB", "kΩ", "μF", "0x3F"];

function traceColor(tint: number, depthT: number): THREE.Color {
  return TRACE_LOW.clone().lerp(TRACE_HIGH, tint).lerp(DEEP_FADE, depthT * 0.6);
}

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

/**
 * The routing grid pitch, silkscreen-faint, tiled across every slab — the
 * texture detail that makes a board read as a real fabricated object even
 * standing still, not just a flat color with lines floating in front of it.
 */
function buildBoardTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  const pitch = 32;
  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= size; x += pitch) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += pitch) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(size, y + 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  for (let x = pitch / 2; x <= size; x += pitch) {
    for (let y = pitch / 2; y <= size; y += pitch) {
      ctx.beginPath();
      ctx.arc(x, y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
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
  ctx.shadowColor = "rgba(59,130,246,0.6)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#8fb4fb";
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

/** One PCB layer's materials, tracked so its live routing can energize as the camera passes through its depth. */
interface LayerRecord {
  z: number;
  lineMat: THREE.LineBasicMaterial;
  baseLineOpacity: number;
  padColor: THREE.Color;
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

    // GPU cost scales directly with pixel count and effect passes — both
    // are kept deliberately conservative since this renders continuously,
    // full-bleed, behind the entire page
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(BG_COLOR, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));
    // soft shadows are what actually separates a chip from its board —
    // without them, even a lit box reads as pasted onto a flat surface.
    // Desktop only; a shadow pass is real extra cost on top of an already
    // continuously-rendering background.
    const useShadows = !isMobile;
    if (useShadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(BG_COLOR.getHex(), 4, 15);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 40);
    camera.position.set(0, 0, 6.5);

    // a fixed key + fill light, not attached to the rig — as the stack
    // slowly turns (idle drift + pointer parallax), the light stays put in
    // world space so highlights actually slide across the slabs and chip
    // packages, the single strongest "this is solid" cue a wireframe can't
    // give
    scene.add(new THREE.AmbientLight(0x1a2f4a, 0.55));
    const keyLight = new THREE.DirectionalLight(0xdcefff, 1.25);
    keyLight.position.set(4, 6, 7);
    if (useShadows) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0015;
      const shadowCam = keyLight.shadow.camera;
      shadowCam.left = -8;
      shadowCam.right = 8;
      shadowCam.top = 6;
      shadowCam.bottom = -6;
      shadowCam.near = 0.1;
      shadowCam.far = (layerCount - 1) * LAYER_SPACING * WORLD_SCALE + 12;
    }
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x1f3a5f, 0.4);
    fillLight.position.set(-5, -3, -3);
    scene.add(fillLight);

    // bloom's multi-pass blur chain is the single most expensive thing in
    // this scene — skip it on mobile entirely rather than tune it down,
    // and keep it modest on desktop
    const useBloom = !isMobile;
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const baseBloomStrength = 0.32;
    const bloomPass = useBloom ? new UnrealBloomPass(new THREE.Vector2(1, 1), baseBloomStrength, 0.4, 0.26) : null;
    if (bloomPass) composer.addPass(bloomPass);

    const rig = new THREE.Group();
    scene.add(rig);

    const glowTex = buildGlowTexture();
    const boardTex = buildBoardTexture();
    boardTex.repeat.set(1400 * WORLD_SCALE * 1.6, 900 * WORLD_SCALE * 1.6);
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

    const toWorld = (x: number, y: number, z: number): [number, number, number] => [
      (x - 700) * WORLD_SCALE,
      (450 - y) * WORLD_SCALE,
      z,
    ];

    for (let li = 0; li < layerCount; li++) {
      const layout: PcbLayout = generatePcb({
        width: 1400,
        height: 900,
        density: isMobile ? 0.55 : 0.85,
        seed: 0x9e7a + li * 733,
      });

      const z = -li * LAYER_SPACING * WORLD_SCALE;
      const surfaceZ = z + SURFACE_OFFSET;
      const depthT = li / Math.max(1, layerCount - 1);

      // the board itself — a real lit slab, a genuine navy solder-mask
      // color rather than a scene-wide tint, sized to the routed area so
      // it reads as the physical substrate everything else sits on
      const slabColor = SLAB_NEAR.clone().lerp(SLAB_FAR, depthT * 0.7);
      const slabMat = new THREE.MeshStandardMaterial({
        color: slabColor,
        map: boardTex,
        roughness: 0.78,
        metalness: 0.12,
        transparent: true,
        opacity: 0.62 - depthT * 0.22,
      });
      const slabGeo = new THREE.BoxGeometry(1400 * WORLD_SCALE, 900 * WORLD_SCALE, BOARD_THICKNESS);
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(0, 0, z);
      slab.receiveShadow = useShadows;
      rig.add(slab);

      // a faint accent outline tracing the board's edge — the one clean
      // geometric read that says "this is a fabricated panel with a defined
      // boundary," not just routing floating in open space
      const edgeColor = ACCENT.clone().lerp(BG_DEEP_COLOR, depthT * 0.5);
      const edgeGeo = new THREE.EdgesGeometry(slabGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: 0.4 - depthT * 0.2,
        fog: true,
      });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      edges.position.copy(slab.position);
      rig.add(edges);

      // nets — each trace keeps its own tint instead of one flat layer
      // color, so a board reads as many individual routed nets. Riding
      // just above the slab's face, not embedded in it.
      const positions: number[] = [];
      const colors: number[] = [];
      for (const trace of layout.traces) {
        layerTraces.push({ points: trace.points, z: surfaceZ });
        const c = traceColor(trace.tint, depthT);
        for (let i = 1; i < trace.points.length; i++) {
          const a = trace.points[i - 1];
          const b = trace.points[i];
          positions.push(...toWorld(a.x, a.y, surfaceZ), ...toWorld(b.x, b.y, surfaceZ));
          colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
        }
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      lineGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      const layerOpacity = 0.62 - depthT * 0.3;
      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: layerOpacity,
        fog: true,
      });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      rig.add(lines);

      // chip packages — simple solid bodies with a few short pin legs,
      // standing proud of the board surface. Every chip's box is baked
      // with its own transform then merged into one draw call per layer.
      const chipColor = CHIP_COLOR.clone().lerp(CHIP_DEEP, depthT * 0.6);
      const chipGeos: THREE.BufferGeometry[] = [];
      const pinPositions: number[] = [];
      for (const chip of layout.chips) {
        const geo = new THREE.BoxGeometry(chip.w * WORLD_SCALE, chip.h * WORLD_SCALE, CHIP_RISE);
        const cx = (chip.x + chip.w / 2 - 700) * WORLD_SCALE;
        const cy = (450 - (chip.y + chip.h / 2)) * WORLD_SCALE;
        const cz = surfaceZ + CHIP_RISE / 2;
        geo.translate(cx, cy, cz);
        chipGeos.push(geo);
        for (const pin of chip.pins) {
          pinPositions.push(...toWorld(pin.x1, pin.y1, surfaceZ), ...toWorld(pin.x2, pin.y2, surfaceZ));
        }
      }
      if (chipGeos.length > 0) {
        const merged = mergeGeometries(chipGeos, false);
        chipGeos.forEach((g) => g.dispose());
        if (merged) {
          const chipMat = new THREE.MeshStandardMaterial({
            color: chipColor,
            roughness: 0.4,
            metalness: 0.35,
          });
          const chipMesh = new THREE.Mesh(merged, chipMat);
          chipMesh.castShadow = useShadows;
          chipMesh.receiveShadow = useShadows;
          rig.add(chipMesh);
        }
      }
      if (pinPositions.length > 0) {
        const pinGeo = new THREE.BufferGeometry();
        pinGeo.setAttribute("position", new THREE.Float32BufferAttribute(pinPositions, 3));
        rig.add(
          new THREE.LineSegments(
            pinGeo,
            new THREE.LineBasicMaterial({ color: chipColor, transparent: true, opacity: 0.75, fog: true }),
          ),
        );
      }

      // pads/vias — the only other routing detail, a step brighter than
      // the traces themselves, riding the same raised surface
      const padColor = PAD_COLOR.clone().lerp(PAD_DEEP, depthT * 0.6);
      const padOpacity = 0.68 - depthT * 0.3;
      const padPositions: number[] = [];
      for (const pad of layout.pads) {
        padPositions.push(...toWorld(pad.x, pad.y, surfaceZ));
      }
      for (const via of layout.vias) {
        padPositions.push(...toWorld(via.x, via.y, surfaceZ));
      }
      let padMat: THREE.PointsMaterial | undefined;
      if (padPositions.length > 0) {
        const padGeo = new THREE.BufferGeometry();
        padGeo.setAttribute("position", new THREE.Float32BufferAttribute(padPositions, 3));
        padMat = new THREE.PointsMaterial({
          size: 0.045,
          map: glowTex,
          color: padColor,
          transparent: true,
          opacity: padOpacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
        });
        rig.add(new THREE.Points(padGeo, padMat));
      }

      layerRecords.push({
        z: surfaceZ,
        lineMat,
        baseLineOpacity: layerOpacity,
        padColor,
        padMat,
        basePadOpacity: padOpacity,
      });
    }

    // signal pulses — a handful of bright sprites racing along real trace
    // paths, so the stack reads as live current rather than a static print
    const pulseCount = isMobile ? 5 : 10;
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
    const moteCount = isMobile ? 3 : 7;
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
    // a real spring, not an exponential decay — the camera eases toward the
    // target scroll depth with a touch of momentum and settle, the way a
    // directed camera move settles into a shot instead of just arriving
    let scrollSmooth = 0;
    let scrollVelocity = 0;
    const SPRING_STIFFNESS = 0.015;
    const SPRING_DAMPING = 0.82;

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

      if (reducedMotion) {
        scrollSmooth = scrollT;
        scrollVelocity = 0;
      } else {
        scrollVelocity = (scrollVelocity + (scrollT - scrollSmooth) * SPRING_STIFFNESS) * SPRING_DAMPING;
        scrollSmooth += scrollVelocity;
      }
      // how hard the camera is currently moving through the stack — drives
      // every "energy" reaction below, so scrolling fast reads as punching
      // through the board at speed rather than a flat, constant glow
      const speedGlow = Math.min(1, Math.abs(scrollVelocity) * 26);

      if (!reducedMotion) {
        rig.rotation.y = Math.sin(liveElapsed / 14000) * 0.05 + pointerSmooth.x * 0.12;
        rig.rotation.x = pointerSmooth.y * -0.08;
      } else {
        rig.rotation.y = pointerSmooth.x * 0.12;
        rig.rotation.x = pointerSmooth.y * -0.08;
      }
      // a slow independent drift on top of pointer parallax — two mismatched
      // sine periods so the path never repeats predictably, like a camera
      // operator's hand rather than a metronomic loop. Reduced-motion keeps
      // this at zero so the frozen frame stays truly still.
      const driftX = reducedMotion ? 0 : Math.sin(liveElapsed / 9000) * 0.18 + Math.sin(liveElapsed / 3700) * 0.05;
      const driftY = reducedMotion ? 0 : Math.cos(liveElapsed / 11000) * 0.12;

      camera.position.x = pointerSmooth.x * 0.35 + driftX;
      camera.position.y = -pointerSmooth.y * 0.25 + driftY;
      camera.position.z = 6.5 - scrollSmooth * totalDepth;
      camera.lookAt(0, 0, camera.position.z - 6.5);
      // a whisper of roll riding the same drift — barely perceptible, but it
      // breaks the "camera locked to rails" flatness a pure lookAt gives
      if (!reducedMotion) {
        camera.rotateZ(Math.sin(liveElapsed / 8000) * 0.012);
      }

      // the world itself darkens as you descend — background and fog drift
      // from navy toward near-black, and the fog closes in a little, so the
      // bottom of the page reads as somewhere else entirely, not just a
      // scroll position
      const worldT = THREE.MathUtils.clamp(scrollSmooth, 0, 1);
      bgScratch.copy(BG_COLOR).lerp(BG_DEEP_COLOR, worldT);
      renderer.setClearColor(bgScratch, 1);
      scene.fog!.color.copy(bgScratch);
      (scene.fog as THREE.Fog).far = THREE.MathUtils.lerp(15, 10, worldT);

      // bloom itself flares up while the camera is moving fast — the board
      // reads as "powering up" under motion instead of a fixed, static glow.
      // Kept subtle — motion should still read as night-blue, not lit up.
      if (bloomPass) bloomPass.strength = baseBloomStrength + speedGlow * 0.15;

      // only the live copper energizes as the camera's depth crosses a
      // layer — brighter, warmer toward turquoise. The slab itself never
      // changes color under motion, only the routing does; a physical
      // board doesn't shift hue because the camera moved, only the light
      // already on it does that (handled by the fixed key light as the
      // rig slowly turns).
      let nearestCross = 0;
      for (const layer of layerRecords) {
        const raw = Math.max(0, 1 - Math.abs(layer.z - camera.position.z) / 1.3);
        const w = raw * raw * (3 - 2 * raw);
        nearestCross = Math.max(nearestCross, w);
        const surge = w + speedGlow * 0.08;
        layer.lineMat.opacity = layer.baseLineOpacity + surge * 0.28;
        layer.lineMat.color.copy(WHITE).lerp(ACCENT, Math.min(1, surge * 0.28));
        if (layer.padMat) {
          layer.padMat.opacity = layer.basePadOpacity + surge * 0.3;
          layer.padMat.color.copy(layer.padColor).lerp(ACCENT, Math.min(1, surge * 0.28));
        }
      }

      // a wide-angle push right as the camera reaches a layer — the same
      // "flying into it" trick a real flythrough camera uses, so crossing
      // a layer's traces reads as entering them, not just passing a plane
      const targetFov = 50 + nearestCross * 9;
      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov += (targetFov - camera.fov) * 0.12;
        camera.updateProjectionMatrix();
      }

      for (const p of pulses) {
        const t = (((elapsed / p.duration) + p.phase) % 1 + 1) % 1;
        const pos = pointAtT(p.points, t);
        p.sprite.position.set((pos.x - 700) * WORLD_SCALE, (450 - pos.y) * WORLD_SCALE, p.z);
        const mat = p.sprite.material as THREE.SpriteMaterial;
        mat.opacity = 0.55 + 0.45 * Math.sin(t * Math.PI);
        p.sprite.scale.setScalar(0.08 + speedGlow * 0.1);
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
      bloomPass?.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (
          obj instanceof THREE.Points ||
          obj instanceof THREE.Line ||
          obj instanceof THREE.LineSegments ||
          obj instanceof THREE.Mesh
        ) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      glowTex.dispose();
      boardTex.dispose();
      glyphTexCache.forEach((t) => t.dispose());
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" className={className} />;
}

import type { Chip, Pad, Passive, PcbLayout, PcbOptions, Point, Trace, Via } from "./types";

/** Routing grid pitch in CSS px — everything snaps to this, like a real board. */
const PITCH = 15;
const MARGIN = PITCH;

/** Deterministic PRNG (mulberry32) so the board is stable across re-renders. */
function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rng: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)];

const randInt = (rng: () => number, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

/**
 * Replace 90° corners of an orthogonal polyline with smooth rounded
 * corners — a quadratic-bezier arc through each bend instead of a sharp
 * mitred cut, closer to how traces actually get routed on a real board.
 */
function chamfer(waypoints: Point[], cut: number): Point[] {
  if (waypoints.length < 3) return waypoints;
  const ARC_SEGMENTS = 6;
  const out: Point[] = [waypoints[0]];
  for (let i = 1; i < waypoints.length - 1; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];
    const inLen = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const outLen = Math.hypot(next.x - curr.x, next.y - curr.y);
    const c = Math.min(cut, inLen / 2, outLen / 2);
    const inDir = { x: (curr.x - prev.x) / inLen, y: (curr.y - prev.y) / inLen };
    const outDir = { x: (next.x - curr.x) / outLen, y: (next.y - curr.y) / outLen };
    const p1 = { x: curr.x - inDir.x * c, y: curr.y - inDir.y * c };
    const p2 = { x: curr.x + outDir.x * c, y: curr.y + outDir.y * c };
    for (let s = 0; s <= ARC_SEGMENTS; s++) {
      const t = s / ARC_SEGMENTS;
      const mt = 1 - t;
      out.push({
        x: mt * mt * p1.x + 2 * mt * t * curr.x + t * t * p2.x,
        y: mt * mt * p1.y + 2 * mt * t * curr.y + t * t * p2.y,
      });
    }
  }
  out.push(waypoints[waypoints.length - 1]);
  return out;
}

interface RouteResult {
  points: Point[];
  end: Point;
  endDir: Point;
}

/**
 * Route an orthogonal path from `start` heading `dir`, with 1–3 turns.
 * Runs are multiples of the grid pitch; the path is clamped to the board.
 */
function route(
  rng: () => number,
  start: Point,
  dir: Point,
  width: number,
  height: number,
): RouteResult | null {
  const waypoints: Point[] = [start];
  let pos = { ...start };
  let d = { ...dir };
  const turns = randInt(rng, 1, 3);

  for (let i = 0; i <= turns; i++) {
    const len = randInt(rng, 2, 7) * PITCH;
    let next = { x: pos.x + d.x * len, y: pos.y + d.y * len };
    next = {
      x: Math.min(Math.max(next.x, MARGIN), width - MARGIN),
      y: Math.min(Math.max(next.y, MARGIN), height - MARGIN),
    };
    if (Math.hypot(next.x - pos.x, next.y - pos.y) < PITCH) break;
    waypoints.push(next);
    pos = next;
    // turn 90° left or right for the next run
    d = rng() < 0.5 ? { x: d.y, y: -d.x } : { x: -d.y, y: d.x };
  }

  if (waypoints.length < 2) return null;
  const last = waypoints[waypoints.length - 1];
  const prev = waypoints[waypoints.length - 2];
  const segLen = Math.hypot(last.x - prev.x, last.y - prev.y);
  const endDir = { x: (last.x - prev.x) / segLen, y: (last.y - prev.y) / segLen };
  return { points: chamfer(waypoints, PITCH * 0.6), end: last, endDir };
}

function makeChip(rng: () => number, cx: number, cy: number): Chip {
  const cols = randInt(rng, 2, 4);
  const rows = randInt(rng, 2, 3);
  const w = cols * PITCH;
  const h = rows * PITCH;
  const x = Math.round((cx - w / 2) / PITCH) * PITCH;
  const y = Math.round((cy - h / 2) / PITCH) * PITCH;
  const pins: Chip["pins"] = [];
  const pinPitch = 5;
  const stub = 4;

  // pin stubs along left/right edges
  for (let py = y + pinPitch; py <= y + h - pinPitch; py += pinPitch) {
    pins.push({ x1: x, y1: py, x2: x - stub, y2: py });
    pins.push({ x1: x + w, y1: py, x2: x + w + stub, y2: py });
  }
  // and along top/bottom edges
  for (let px = x + pinPitch; px <= x + w - pinPitch; px += pinPitch) {
    pins.push({ x1: px, y1: y, x2: px, y2: y - stub });
    pins.push({ x1: px, y1: y + h, x2: px, y2: y + h + stub });
  }

  return { x, y, w, h, pins, dot: { x: x + 6, y: y + 6 } };
}

/**
 * Generate a PCB-inspired layout: IC footprints with escape routing,
 * free traces with 45° bends, terminating vias/pads, passives and
 * stitching-via clusters.
 */
export function generatePcb(opts: PcbOptions): PcbLayout {
  const { width, height, density, seed } = opts;
  const rng = createRng(seed);
  const layout: PcbLayout = { traces: [], vias: [], pads: [], passives: [], chips: [] };
  const area = width * height;

  const finishTrace = (res: RouteResult, tint: number) => {
    layout.traces.push({ points: res.points, tint });
    const roll = rng();
    if (roll < 0.5) {
      layout.vias.push({ x: res.end.x, y: res.end.y, r: 2 });
    } else if (roll < 0.82) {
      layout.pads.push({ x: res.end.x, y: res.end.y, r: 1.6, square: rng() < 0.35 });
    } else {
      // resistor-like passive sitting on the tail of the last segment
      const bodyLen = 9;
      const cx = res.end.x - res.endDir.x * (bodyLen / 2 + 3);
      const cy = res.end.y - res.endDir.y * (bodyLen / 2 + 3);
      layout.passives.push({
        x: cx,
        y: cy,
        angle: Math.atan2(res.endDir.y, res.endDir.x),
        length: bodyLen,
        width: 4,
      });
      layout.pads.push({ x: res.end.x, y: res.end.y, r: 1.5, square: true });
    }
  };

  // --- IC footprints, roughly one per 300² px region ---
  const chipCount = Math.max(1, Math.round((area / (300 * 300)) * density));
  for (let i = 0; i < chipCount; i++) {
    const cx = MARGIN * 2 + rng() * (width - MARGIN * 4);
    const cy = MARGIN * 2 + rng() * (height - MARGIN * 4);
    const chip = makeChip(rng, cx, cy);
    layout.chips.push(chip);

    // escape-route a handful of pins away from the package
    const escapes = randInt(rng, 3, 5);
    for (let e = 0; e < escapes; e++) {
      const pin = pick(rng, chip.pins);
      const dx = Math.sign(pin.x2 - pin.x1);
      const dy = Math.sign(pin.y2 - pin.y1);
      const start = { x: pin.x2, y: pin.y2 };
      const res = route(rng, start, { x: dx, y: dy }, width, height);
      if (res) finishTrace(res, rng());
    }
  }

  // --- free traces across the board ---
  const traceCount = Math.round((area / 16000) * density);
  for (let i = 0; i < traceCount; i++) {
    const start = {
      x: Math.round((MARGIN + rng() * (width - MARGIN * 2)) / PITCH) * PITCH,
      y: Math.round((MARGIN + rng() * (height - MARGIN * 2)) / PITCH) * PITCH,
    };
    const dir = pick(rng, [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ] as const);
    const res = route(rng, start, { ...dir }, width, height);
    if (!res) continue;
    const tint = rng();
    finishTrace(res, tint);
    // start of a free trace also gets a via or pad — nets connect somewhere
    if (rng() < 0.6) {
      layout.vias.push({ x: start.x, y: start.y, r: 2 });
    } else {
      layout.pads.push({ x: start.x, y: start.y, r: 1.6, square: false });
    }
    // occasionally shadow it with a parallel twin — differential-pair feel
    if (rng() < 0.18) {
      const off = 4;
      layout.traces.push({
        points: res.points.map((p) => ({ x: p.x + off, y: p.y + off })),
        tint,
      });
    }
  }

  // --- stitching via clusters ---
  const clusterCount = Math.round((area / (500 * 500)) * density);
  for (let i = 0; i < clusterCount; i++) {
    const cx = MARGIN + rng() * (width - MARGIN * 2);
    const cy = MARGIN + rng() * (height - MARGIN * 2);
    const n = randInt(rng, 3, 5);
    for (let v = 0; v < n; v++) {
      layout.vias.push({
        x: cx + (rng() - 0.5) * PITCH * 2,
        y: cy + (rng() - 0.5) * PITCH * 2,
        r: 1.5,
      });
    }
  }

  return layout;
}

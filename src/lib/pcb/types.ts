export interface Point {
  x: number;
  y: number;
}

/** A routed copper trace: chamfered polyline with 45° corners. */
export interface Trace {
  points: Point[];
  /** 0..1 — maps to a slight hue variation between blue / cyan / violet. */
  tint: number;
}

/** Plated through-hole via: outer ring + drill hole. */
export interface Via {
  x: number;
  y: number;
  r: number;
}

/** SMD pad terminating a trace. */
export interface Pad {
  x: number;
  y: number;
  r: number;
  square: boolean;
}

/** Two-terminal passive (resistor feel): body centered between its pads. */
export interface Passive {
  x: number;
  y: number;
  /** radians — orientation of the body along its trace segment */
  angle: number;
  length: number;
  width: number;
}

/** IC footprint: body outline + pin stubs on its sides. */
export interface Chip {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Pin stub segments, already laid out in absolute coordinates. */
  pins: { x1: number; y1: number; x2: number; y2: number }[];
  /** Pin-1 indicator dot position. */
  dot: Point;
}

export interface PcbLayout {
  traces: Trace[];
  vias: Via[];
  pads: Pad[];
  passives: Passive[];
  chips: Chip[];
}

export interface PcbOptions {
  width: number;
  height: number;
  /** 1 = desktop density, lower = sparser (mobile uses ~0.4). */
  density: number;
  seed: number;
}

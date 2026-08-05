import type { PcbLayout, Trace } from "./types";

/**
 * Both layers are rendered once per resize into offscreen canvases at full
 * brightness; the animation loop only composites them with varying
 * globalAlpha, which keeps per-frame cost near zero.
 */

function tracePath(ctx: CanvasRenderingContext2D, trace: Trace) {
  ctx.beginPath();
  ctx.moveTo(trace.points[0].x, trace.points[0].y);
  for (let i = 1; i < trace.points.length; i++) {
    ctx.lineTo(trace.points[i].x, trace.points[i].y);
  }
  ctx.stroke();
}

function drawGeometry(
  ctx: CanvasRenderingContext2D,
  layout: PcbLayout,
  strokeFor: (tint: number) => string,
  fill: string,
  lineWidth: number,
) {
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  for (const trace of layout.traces) {
    ctx.strokeStyle = strokeFor(trace.tint);
    tracePath(ctx, trace);
  }

  ctx.strokeStyle = strokeFor(0.5);
  ctx.fillStyle = fill;

  for (const via of layout.vias) {
    // annular ring + open drill hole
    ctx.beginPath();
    ctx.arc(via.x, via.y, via.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(via.x, via.y, via.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const pad of layout.pads) {
    ctx.beginPath();
    if (pad.square) {
      ctx.rect(pad.x - pad.r, pad.y - pad.r, pad.r * 2, pad.r * 2);
    } else {
      ctx.arc(pad.x, pad.y, pad.r, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  for (const p of layout.passives) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.strokeRect(-p.length / 2, -p.width / 2, p.length, p.width);
    ctx.restore();
  }

  for (const chip of layout.chips) {
    ctx.strokeRect(chip.x, chip.y, chip.w, chip.h);
    ctx.beginPath();
    for (const pin of chip.pins) {
      ctx.moveTo(pin.x1, pin.y1);
      ctx.lineTo(pin.x2, pin.y2);
    }
    ctx.stroke();
    // pin-1 indicator
    ctx.beginPath();
    ctx.arc(chip.dot.x, chip.dot.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Muted slate-blue ink for the resting board — reads as a blueprint print, not an RGB keyboard. */
const restShade = (tint: number, alpha: number) => {
  const l = 36 + tint * 16; // 36%–52% lightness, low saturation
  return `hsla(216, 24%, ${l}%, ${alpha})`;
};

/** More saturated, but still restrained — the same board, awake, not neon. */
const litShade = (tint: number, alpha: number) => {
  const l = 46 + tint * 18; // 46%–64%
  return `hsla(217, 58%, ${l}%, ${alpha})`;
};

/**
 * Resting layer — the board's always-visible identity, printed in quiet
 * slate ink. A faint glow pass keeps it from looking flat, without reading
 * as an energised light show.
 */
export function renderBaseLayer(ctx: CanvasRenderingContext2D, layout: PcbLayout) {
  const strokeFor = (tint: number) => restShade(tint, 0.9);

  ctx.save();
  ctx.shadowColor = "rgba(100,120,160,0.5)";
  ctx.shadowBlur = 3;
  ctx.globalAlpha = 0.5;
  drawGeometry(ctx, layout, strokeFor, restShade(0.5, 0.6), 1.15);
  ctx.restore();

  ctx.save();
  drawGeometry(ctx, layout, strokeFor, restShade(0.5, 0.95), 1);
  ctx.restore();
}

/**
 * Accent layer — revealed only through the radial pointer mask, so the
 * board feels like it wakes up under touch instead of shouting constantly.
 */
export function renderLitLayer(ctx: CanvasRenderingContext2D, layout: PcbLayout) {
  const strokeFor = (tint: number) => litShade(tint, 1);

  ctx.save();
  ctx.shadowColor = "rgba(59,116,220,0.7)";
  ctx.shadowBlur = 10;
  drawGeometry(ctx, layout, strokeFor, litShade(0.6, 1), 1.3);
  ctx.restore();

  ctx.save();
  drawGeometry(ctx, layout, strokeFor, "rgba(203,216,240,1)", 1.05);
  ctx.restore();
}

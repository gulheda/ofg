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

/** Single hue, varying only in lightness by net — reads as one serious board, not a string of party lights. */
const shade = (tint: number, alpha: number) => {
  const l = 55 + tint * 24; // 55%–79% lightness
  return `hsla(219, 88%, ${l}%, ${alpha})`;
};

/**
 * Resting layer — this is the board's always-visible identity, not a hairline
 * hint. Two passes: a soft blurred glow underlay, then a crisp bright core,
 * so it reads unmistakably as an energised circuit rather than flat gray art.
 */
export function renderBaseLayer(ctx: CanvasRenderingContext2D, layout: PcbLayout) {
  const strokeFor = (tint: number) => shade(tint, 0.85);

  ctx.save();
  ctx.shadowColor = "rgba(47,111,238,0.9)";
  ctx.shadowBlur = 8;
  ctx.globalAlpha = 0.55;
  drawGeometry(ctx, layout, strokeFor, shade(0.5, 0.65), 1.3);
  ctx.restore();

  ctx.save();
  drawGeometry(ctx, layout, strokeFor, shade(0.5, 0.9), 1);
  ctx.restore();
}

/**
 * Accent layer — the same board, brighter, revealed only through the radial
 * pointer mask so the board feels like it lights up under touch.
 */
export function renderLitLayer(ctx: CanvasRenderingContext2D, layout: PcbLayout) {
  const strokeFor = (tint: number) => shade(tint, 1);

  ctx.save();
  ctx.shadowColor = "rgba(47,111,238,0.95)";
  ctx.shadowBlur = 15;
  drawGeometry(ctx, layout, strokeFor, shade(0.6, 1), 1.4);
  ctx.restore();

  ctx.save();
  drawGeometry(ctx, layout, strokeFor, "rgba(224,234,255,1)", 1.1);
  ctx.restore();
}

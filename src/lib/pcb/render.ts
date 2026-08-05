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

const tintColor = (tint: number, cyan: string, violet: string, blue: string) => {
  if (tint < 0.15) return cyan;
  if (tint > 0.9) return violet;
  return blue;
};

/**
 * Resting layer — this is the board's always-visible identity, not a hairline
 * hint. Two passes: a soft blurred glow underlay, then a crisp bright core,
 * so it reads unmistakably as an energised circuit rather than flat gray art.
 */
export function renderBaseLayer(ctx: CanvasRenderingContext2D, layout: PcbLayout) {
  const strokeFor = (tint: number) =>
    tintColor(tint, "rgba(103,232,249,0.85)", "rgba(167,139,250,0.8)", "rgba(96,165,250,0.9)");

  ctx.save();
  ctx.shadowColor = "rgba(59,130,246,0.9)";
  ctx.shadowBlur = 9;
  ctx.globalAlpha = 0.6;
  drawGeometry(ctx, layout, strokeFor, "rgba(147,197,253,0.7)", 1.3);
  ctx.restore();

  ctx.save();
  drawGeometry(ctx, layout, strokeFor, "rgba(191,219,254,0.9)", 1);
  ctx.restore();
}

/**
 * Accent layer — the same board, brighter and warmer, revealed only through
 * the radial pointer mask so the board feels like it lights up under touch.
 */
export function renderLitLayer(ctx: CanvasRenderingContext2D, layout: PcbLayout) {
  const strokeFor = (tint: number) =>
    tintColor(tint, "rgba(34,211,238,1)", "rgba(167,139,250,1)", "rgba(59,130,246,1)");

  ctx.save();
  ctx.shadowColor = "rgba(59,130,246,0.95)";
  ctx.shadowBlur = 16;
  drawGeometry(ctx, layout, strokeFor, "rgba(96,165,250,1)", 1.4);
  ctx.restore();

  ctx.save();
  drawGeometry(ctx, layout, strokeFor, "rgba(224,242,254,1)", 1.1);
  ctx.restore();
}

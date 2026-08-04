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
) {
  ctx.lineWidth = 1;
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

/** Neutral layer — composited at 3–8% alpha so it whispers, not shouts. */
export function renderBaseLayer(ctx: CanvasRenderingContext2D, layout: PcbLayout) {
  drawGeometry(ctx, layout, () => "rgba(226,232,240,1)", "rgba(226,232,240,0.9)");
}

/**
 * Accent layer — electric blue with faint cyan/violet drift per net.
 * Only ever visible through the radial pointer mask.
 */
export function renderLitLayer(ctx: CanvasRenderingContext2D, layout: PcbLayout) {
  const strokeFor = (tint: number) => {
    if (tint < 0.15) return "rgba(34,211,238,0.95)"; // cyan
    if (tint > 0.9) return "rgba(139,92,246,0.95)"; // violet
    return "rgba(59,130,246,0.95)"; // electric blue
  };
  ctx.save();
  ctx.shadowColor = "rgba(59,130,246,0.55)";
  ctx.shadowBlur = 6;
  drawGeometry(ctx, layout, strokeFor, "rgba(96,165,250,0.95)");
  ctx.restore();
}

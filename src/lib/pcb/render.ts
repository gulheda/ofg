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

/**
 * Muted ink for the resting board — hue drifts across the tint spectrum
 * (steel blue → indigo → soft violet) so the print reads as one considered
 * palette instead of a single flat slate tone repeated everywhere.
 */
const restShade = (tint: number, alpha: number) => {
  const hue = 212 + tint * 34; // 212°–246°: blue through indigo into violet
  const l = 38 + tint * 14; // 38%–52% lightness, low saturation
  return `hsla(${hue}, 30%, ${l}%, ${alpha})`;
};

/** More saturated, but still restrained — the same board, awake, not neon. */
const litShade = (tint: number, alpha: number) => {
  const hue = 214 + tint * 32;
  const l = 48 + tint * 16; // 48%–64%
  return `hsla(${hue}, 62%, ${l}%, ${alpha})`;
};

/**
 * A soft bloom pass underneath the crisp geometry, built by rasterising the
 * board at a fraction of its size and letting the browser's own bitmap
 * upscaling blur it back out — real optical bloom without `ctx.filter =
 * "blur()"`, whose software Gaussian pass over a full-viewport canvas is
 * heavy enough to stall the main thread for hundreds of ms on first paint
 * (this runs once per resize, not per frame, but that first call lands
 * right when the hero's entrance animation is also trying to run).
 */
function withBloom(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  alpha: number,
  draw: (bloomCtx: CanvasRenderingContext2D) => void,
) {
  const sw = Math.max(1, Math.round(width * scale));
  const sh = Math.max(1, Math.round(height * scale));
  const small = document.createElement("canvas");
  small.width = sw;
  small.height = sh;
  const bloomCtx = small.getContext("2d");
  if (!bloomCtx) return;
  bloomCtx.scale(scale, scale);
  draw(bloomCtx);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(small, 0, 0, sw, sh, 0, 0, width, height);
  ctx.restore();
}

/**
 * Resting layer — the board's always-visible identity, printed in quiet
 * ink with a soft bloom underneath so it has depth even before anything
 * lights up under touch, without reading as an energised light show.
 */
export function renderBaseLayer(
  ctx: CanvasRenderingContext2D,
  layout: PcbLayout,
  width: number,
  height: number,
) {
  const strokeFor = (tint: number) => restShade(tint, 0.9);

  withBloom(ctx, width, height, 0.16, 0.4, (bloomCtx) => {
    drawGeometry(bloomCtx, layout, (t) => restShade(t, 1), restShade(0.5, 0.8), 2.4);
  });

  ctx.save();
  ctx.shadowColor = "rgba(110,130,190,0.45)";
  ctx.shadowBlur = 2.5;
  ctx.globalAlpha = 0.55;
  drawGeometry(ctx, layout, strokeFor, restShade(0.5, 0.6), 0.9);
  ctx.restore();

  ctx.save();
  drawGeometry(ctx, layout, strokeFor, restShade(0.5, 0.95), 0.8);
  ctx.restore();
}

/**
 * Accent layer — revealed only through the radial pointer mask, so the
 * board feels like it wakes up under touch instead of shouting constantly.
 */
export function renderLitLayer(
  ctx: CanvasRenderingContext2D,
  layout: PcbLayout,
  width: number,
  height: number,
) {
  const strokeFor = (tint: number) => litShade(tint, 1);

  withBloom(ctx, width, height, 0.18, 0.6, (bloomCtx) => {
    drawGeometry(bloomCtx, layout, (t) => litShade(t, 1), litShade(0.6, 1), 2.6);
  });

  ctx.save();
  ctx.shadowColor = "rgba(80,140,235,0.75)";
  ctx.shadowBlur = 10;
  drawGeometry(ctx, layout, strokeFor, litShade(0.6, 1), 1.0);
  ctx.restore();

  ctx.save();
  drawGeometry(ctx, layout, strokeFor, "rgba(210,220,245,1)", 0.85);
  ctx.restore();
}

import { MotionPhysicsConfig } from '../types/motion';
import {
  clamp,
  computeSquashStretch,
  roundRectPath,
  solveSpring,
} from './physicsEngine';

export interface ExtrudedTextStyle {
  fill: string;
  secondaryFill?: string; // Optional vertical gradient stop
  stroke: string;
  extrudeColor: string;
  extrudeDepth: number;
  strokeWidth: number;
  highlightColor?: string;
  ambientShadow?: boolean;
}

/**
 * Segments Thai strings into visual grapheme clusters so combining vowels
 * (สระอิ อี อึ อือ อุ อู ไม้หันอากาศ) and tone marks (่ ้ ๊ ๋ ์) NEVER detach
 * from their base consonant during per-character staggered animation.
 */
export function segmentThaiGraphemes(text: string): string[] {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  // Fallback combiner for Thai upper/lower vowels and tone marks
  const clusters: string[] = [];
  const thaiCombining = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/;
  for (const ch of Array.from(text)) {
    if (clusters.length > 0 && thaiCombining.test(ch)) {
      clusters[clusters.length - 1] += ch;
    } else {
      clusters.push(ch);
    }
  }
  return clusters;
}

/**
 * Renders 7-Figure Broadcast 3D Extruded Typography with:
 * 1. Soft Ambient Occlusion Contact Shadow
 * 2. Smooth 1.5px-step 3D Extrusion Stack
 * 3. Crisp Heavy Cartoon Stroke
 * 4. Rich Gradient or Solid Fill
 * 5. Top-Left Specular Rim Bevel Highlight
 */
export function drawPremiumExtrudedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: ExtrudedTextStyle
) {
  const {
    fill,
    secondaryFill,
    stroke,
    extrudeColor,
    extrudeDepth,
    strokeWidth,
    highlightColor,
    ambientShadow = true,
  } = style;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.miterLimit = 2;

  // 1. Multi-pass Ambient Occlusion Drop Shadow behind the 3D block
  if (ambientShadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = extrudeDepth * 0.75 + 4;
    ctx.shadowOffsetY = extrudeDepth + 10;
    ctx.fillStyle = extrudeColor;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // 2. Smooth High-Density 3D Extrusion Stack
  const step = 1.5;
  for (let d = extrudeDepth; d >= 1; d -= step) {
    const ox = x + d * 0.68;
    const oy = y + d;
    ctx.strokeStyle = extrudeColor;
    ctx.lineWidth = strokeWidth;
    ctx.strokeText(text, ox, oy);
    ctx.fillStyle = extrudeColor;
    ctx.fillText(text, ox, oy);
  }

  // 3. Primary Heavy Outer Outline
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.strokeText(text, x, y);

  // 4. Specular Rim Bevel Highlight (top-left offset inside the stroke)
  if (highlightColor) {
    ctx.fillStyle = highlightColor;
    ctx.fillText(text, x - 2.2, y - 2.5);
  }

  // 5. Primary Face Fill (Supports lustrous vertical metallic/gold gradient)
  if (secondaryFill) {
    const grad = ctx.createLinearGradient(x, y - 48, x, y + 48);
    grad.addColorStop(0, highlightColor || '#FFFFFF');
    grad.addColorStop(0.28, fill);
    grad.addColorStop(1, secondaryFill);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = fill;
  }
  ctx.fillText(text, x, y);

  ctx.restore();
}

/**
 * Renders Staggered Per-Grapheme Thai Text Animation where each Thai syllable/character
 * springs in sequentially with velocity-based Squash & Stretch and Follow-Through tilt.
 */
export function drawStaggeredThaiText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  phaseElapsed: number,
  physics: MotionPhysicsConfig,
  style: ExtrudedTextStyle,
  options?: {
    dropFromY?: number;
    staggerScale?: number;
    shimmerSweepProgress?: number; // 0 -> 1 glyph-masked specular light sweep
  }
) {
  const graphemes = segmentThaiGraphemes(text);
  if (graphemes.length === 0) return;

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Measure individual grapheme widths and total width for exact centering
  const widths = graphemes.map((g) => ctx.measureText(g).width);
  const totalWidth = widths.reduce((acc, w) => acc + w, 0);
  let cursorX = centerX - totalWidth / 2;

  const staggerStep = physics.staggerDelay * (options?.staggerScale ?? 1);
  const dropDist = options?.dropFromY ?? 55;
  const shimmerP = options?.shimmerSweepProgress ?? -1;
  const hasShimmer = shimmerP > 0.001 && shimmerP < 0.999 && totalWidth > 0;

  // Compute word-space light beam center when shimmer is active
  const beamRadius = Math.max(55, totalWidth * 0.28);
  const sweepSpan = totalWidth + beamRadius * 2.4;
  const wordBeamCenterX =
    centerX - totalWidth / 2 - beamRadius * 1.2 + sweepSpan * shimmerP;

  graphemes.forEach((g, idx) => {
    const w = widths[idx];
    const charElapsed = phaseElapsed - idx * staggerStep;
    const spring = solveSpring(charElapsed, physics);

    if (spring.value > 0.01) {
      const { scaleX, scaleY } = computeSquashStretch(
        spring.velocity,
        physics.enableSquashStretch,
        0.032
      );
      const charCenterX = cursorX + w / 2;
      const offsetY = (1 - spring.value) * dropDist;
      const tilt = clamp(spring.velocity * -0.018, -0.18, 0.18);
      const scale = Math.max(0.01, spring.value);

      ctx.save();
      ctx.translate(charCenterX, centerY + offsetY);
      ctx.scale(scale * scaleX, scale * scaleY);
      ctx.rotate(tilt);

      drawPremiumExtrudedText(ctx, g, -w / 2, 0, {
        ...style,
        ambientShadow: idx % 2 === 0 && style.ambientShadow !== false,
      });

      // Glyph-Exact Shimmering Light Sweep (paints strictly on the letter face via fillText, ZERO bounding box!)
      if (hasShimmer) {
        const localBeamX = wordBeamCenterX - charCenterX;
        const shimmerGrad = ctx.createLinearGradient(
          localBeamX - beamRadius,
          -40,
          localBeamX + beamRadius,
          40
        );
        shimmerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shimmerGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.18)');
        shimmerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.92)');
        shimmerGrad.addColorStop(0.65, 'rgba(254, 240, 138, 0.25)');
        shimmerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = shimmerGrad;
        ctx.fillText(g, -w / 2, 0);
      }

      ctx.restore();
    }

    cursorX += w;
  });

  ctx.restore();
}

/**
 * Draws an Apple-style Anamorphic Specular Light Sweep (Sheen Pass)
 * gliding across a physical banner plate during the Hold Phase.
 */
export function drawSpecularLightSweep(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  sweepProgress: number // 0 -> 1
) {
  if (sweepProgress <= 0 || sweepProgress >= 1) return;

  ctx.save();
  roundRectPath(ctx, x, y, w, h, radius);
  ctx.clip();

  const startX = x - w * 0.45;
  const endX = x + w * 1.45;
  const currentX = startX + (endX - startX) * sweepProgress;

  ctx.translate(currentX, y + h / 2);
  ctx.rotate(-0.38);

  const beamWidth = 110;
  const grad = ctx.createLinearGradient(-beamWidth, 0, beamWidth, 0);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.08)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.32)');
  grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.08)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(-beamWidth, -h * 1.5, beamWidth * 2, h * 3);

  ctx.restore();
}

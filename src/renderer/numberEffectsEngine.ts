import { ColorTheme, NumberTextureMode } from '../types/motion';

let offscreenGlyphCanvas: HTMLCanvasElement | null = null;

function getOffscreenGlyphCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
} {
  if (!offscreenGlyphCanvas) {
    offscreenGlyphCanvas = document.createElement('canvas');
  }
  if (offscreenGlyphCanvas.width < width || offscreenGlyphCanvas.height < height) {
    offscreenGlyphCanvas.width = Math.ceil(width);
    offscreenGlyphCanvas.height = Math.ceil(height);
  }
  const ctx = offscreenGlyphCanvas.getContext('2d');
  if (ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, offscreenGlyphCanvas.width, offscreenGlyphCanvas.height);
  }
  return { canvas: offscreenGlyphCanvas, ctx };
}

/**
 * Renders the Big Rank Number ("5") with 3 Clean, Modern Broadcast Modes:
 * - 'wave_gradient': ลูกคลื่น Gradient — Flowing multi-layer liquid sine-wave gradient masked strictly inside the glyph + glossy specular highlight
 * - 'two_tone': ไล่สีทูโทน — Crisp metallic split two-tone gradient with horizon sheen
 * - 'solid_3d': 3D ทั่วไป — Clean bold 3D extruded number with top-left specular bevel
 */
export function renderStyledRankNumber(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize: number,
  mode: NumberTextureMode,
  theme: ColorTheme,
  time: number
) {
  ctx.save();
  const fontSpec = `700 ${fontSize}px "Chonburi", "Kanit", sans-serif`;
  ctx.font = fontSpec;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.miterLimit = 2;

  const s = fontSize / 182;
  const extrudeDepth = Math.round(19 * s);
  const outerStrokeW = Math.round(26 * s);

  // 1. Soft Ambient Occlusion Drop Shadow behind the 3D Number
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 24 * s;
  ctx.shadowOffsetX = extrudeDepth * 0.72 + 4 * s;
  ctx.shadowOffsetY = extrudeDepth + 10 * s;
  ctx.fillStyle = theme.rankExtrude;
  ctx.fillText(text, 0, 0);
  ctx.restore();

  // 2. Smooth 3D Extrusion Stack
  for (let d = extrudeDepth; d >= 1; d -= 1.5) {
    const ox = d * 0.68;
    const oy = d;
    ctx.strokeStyle = theme.rankExtrude;
    ctx.lineWidth = outerStrokeW;
    ctx.strokeText(text, ox, oy);
    ctx.fillStyle = theme.rankExtrude;
    ctx.fillText(text, ox, oy);
  }

  // 3. Heavy Outer Cartoon Outline
  ctx.strokeStyle = '#09090B';
  ctx.lineWidth = outerStrokeW;
  ctx.strokeText(text, 0, 0);

  // ===========================================================================
  // MODE 3: 3D ทั่วไป (Clean Solid 3D Extruded Number)
  // ===========================================================================
  if (mode === 'solid_3d') {
    // Top-left specular rim highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, -2.5 * s, -2.8 * s);

    // Clean solid color face
    ctx.fillStyle = theme.rankFill;
    ctx.fillText(text, 0, 0);

    ctx.restore();
    return;
  }

  // ===========================================================================
  // MODE 2: ไล่สีทูโทน (Crisp Split Metallic Two-Tone Gradient)
  // ===========================================================================
  if (mode === 'two_tone') {
    // Top-left bright bevel rim
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, -2.5 * s, -2.8 * s);

    const halfH = fontSize * 0.48;
    const twoToneGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
    twoToneGrad.addColorStop(0, '#FFFFFF');
    twoToneGrad.addColorStop(0.18, theme.rankFill);
    twoToneGrad.addColorStop(0.49, theme.rankFill);
    twoToneGrad.addColorStop(0.53, theme.rankSecondary);
    twoToneGrad.addColorStop(1, theme.rankSecondary);

    ctx.fillStyle = twoToneGrad;
    ctx.fillText(text, 0, 0);

    ctx.restore();
    return;
  }

  // ===========================================================================
  // MODE 1: ลูกคลื่น Gradient (Flowing Liquid Wave Gradient + Glossy Highlight)
  // ===========================================================================
  // Top-left bright specular rim behind the main glyph face
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, -2.6 * s, -3.0 * s);

  // Prepare an offscreen buffer scaled for crisp high-DPI wave masking
  const textWidth = Math.max(fontSize * 0.9, ctx.measureText(text).width + fontSize * 0.5);
  const boxW = Math.ceil(textWidth * 2);
  const boxH = Math.ceil(fontSize * 2.2);
  const { canvas: maskCanvas, ctx: mCtx } = getOffscreenGlyphCanvas(boxW, boxH);

  if (!mCtx) {
    // Fallback linear gradient if offscreen context unavailable
    const fallbackGrad = ctx.createLinearGradient(0, -fontSize * 0.45, 0, fontSize * 0.45);
    fallbackGrad.addColorStop(0, theme.rankFill);
    fallbackGrad.addColorStop(1, theme.rankSecondary);
    ctx.fillStyle = fallbackGrad;
    ctx.fillText(text, 0, 0);
    ctx.restore();
    return;
  }

  const cx = boxW / 2;
  const cy = boxH / 2;

  mCtx.save();
  // Step A: Draw the exact glyph mask at (cx, cy)
  mCtx.font = fontSpec;
  mCtx.textAlign = 'center';
  mCtx.textBaseline = 'middle';
  mCtx.fillStyle = '#FFFFFF';
  mCtx.fillText(text, cx, cy);

  // Lock all subsequent drawing strictly inside the number glyph's alpha mask!
  mCtx.globalCompositeOperation = 'source-atop';

  const halfW = textWidth * 0.65;
  const halfH = fontSize * 0.55;

  // Step B: Upper Sky/Gold Base Gradient inside the glyph
  const baseGrad = mCtx.createLinearGradient(cx, cy - halfH, cx, cy + halfH);
  baseGrad.addColorStop(0, '#FFFFFF');
  baseGrad.addColorStop(0.22, theme.rankFill);
  baseGrad.addColorStop(0.75, theme.rankFill);
  baseGrad.addColorStop(1, theme.rankSecondary);
  mCtx.fillStyle = baseGrad;
  mCtx.fillRect(cx - halfW, cy - halfH, halfW * 2, halfH * 2);

  // Step C: Back Flowing Liquid Wave (Wave Layer 1)
  const waveSpanX = halfW * 2.2;
  const startX = cx - halfW * 1.1;
  const steps = 36;
  const stepX = waveSpanX / steps;

  const wave1BaseY = cy - fontSize * 0.06 + Math.sin(time * 2.4) * (fontSize * 0.04);
  const wave1Amp = fontSize * 0.085;
  const wave1Freq = (Math.PI * 2.2) / Math.max(120, textWidth);
  const wave1Speed = time * 4.5;

  mCtx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const px = startX + i * stepX;
    const py =
      wave1BaseY +
      Math.sin((px - cx) * wave1Freq - wave1Speed) * wave1Amp +
      Math.cos((px - cx) * wave1Freq * 0.6 + wave1Speed * 0.7) * (wave1Amp * 0.35);
    if (i === 0) {
      mCtx.moveTo(px, py);
    } else {
      mCtx.lineTo(px, py);
    }
  }
  mCtx.lineTo(startX + waveSpanX, cy + halfH * 1.3);
  mCtx.lineTo(startX, cy + halfH * 1.3);
  mCtx.closePath();

  const wave1Grad = mCtx.createLinearGradient(cx, wave1BaseY - wave1Amp, cx, cy + halfH);
  wave1Grad.addColorStop(0, '#FFFFFF');
  wave1Grad.addColorStop(0.16, theme.rankSecondary);
  wave1Grad.addColorStop(1, theme.rankWaveAccent);
  mCtx.fillStyle = wave1Grad;
  mCtx.fill();

  // Step D: Front Flowing Liquid Wave (Wave Layer 2 — Rich Deep Gradient + Glossy Crest)
  const wave2BaseY = cy + fontSize * 0.1 + Math.cos(time * 2.1) * (fontSize * 0.035);
  const wave2Amp = fontSize * 0.095;
  const wave2Freq = (Math.PI * 2.0) / Math.max(120, textWidth);
  const wave2Speed = time * 3.6 + 1.8;

  mCtx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const px = startX + i * stepX;
    const py =
      wave2BaseY +
      Math.sin((px - cx) * wave2Freq + wave2Speed) * wave2Amp +
      Math.sin((px - cx) * wave2Freq * 1.5 - wave2Speed * 0.8) * (wave2Amp * 0.25);
    if (i === 0) {
      mCtx.moveTo(px, py);
    } else {
      mCtx.lineTo(px, py);
    }
  }
  mCtx.lineTo(startX + waveSpanX, cy + halfH * 1.3);
  mCtx.lineTo(startX, cy + halfH * 1.3);
  mCtx.closePath();

  const wave2Grad = mCtx.createLinearGradient(cx, wave2BaseY - wave2Amp, cx, cy + halfH);
  wave2Grad.addColorStop(0, theme.rankWaveAccent);
  wave2Grad.addColorStop(0.6, theme.rankSecondary);
  wave2Grad.addColorStop(1, '#0F172A');
  mCtx.fillStyle = wave2Grad;
  mCtx.fill();

  // Crisp Luminous Crest Ribbon along Wave 2
  mCtx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const px = startX + i * stepX;
    const py =
      wave2BaseY +
      Math.sin((px - cx) * wave2Freq + wave2Speed) * wave2Amp +
      Math.sin((px - cx) * wave2Freq * 1.5 - wave2Speed * 0.8) * (wave2Amp * 0.25);
    if (i === 0) {
      mCtx.moveTo(px, py);
    } else {
      mCtx.lineTo(px, py);
    }
  }
  mCtx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
  mCtx.lineWidth = Math.max(2.5, 4.5 * s);
  mCtx.stroke();

  // Step E: Top Glossy Jelly/Glass Specular Sheen inside the glyph
  const glossGrad = mCtx.createLinearGradient(cx - halfW * 0.4, cy - halfH, cx + halfW * 0.2, cy);
  glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  glossGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.12)');
  glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  mCtx.fillStyle = glossGrad;
  mCtx.fillRect(cx - halfW, cy - halfH, halfW * 2, halfH);

  mCtx.restore();

  // Composite the masked wave glyph back onto the main canvas at (0, 0)
  ctx.drawImage(maskCanvas, 0, 0, boxW, boxH, -cx, -cy, boxW, boxH);

  ctx.restore();
}

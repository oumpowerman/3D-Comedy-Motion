import { ColorTheme, LogoConfig } from '../types/motion';
import {
  clamp,
  computeSquashStretch,
  drawStar,
  roundRectPath,
  solveSpring,
} from './physicsEngine';
import {
  drawStaggeredThaiText,
} from './typographyEngine';
import { renderStyledRankNumber } from './numberEffectsEngine';
import {
  drawInterviewMic,
  drawRecCamera,
  drawThaiFlagRibbon,
} from './props/stageProps';
import {
  drawClownMascot,
  drawEpMessagePop,
  drawHornSpeaker,
  drawMarigoldGarland,
  drawTinTray,
} from './props/comedyProps';

/**
 * Renders Layer 1: Top ("5 อันดับ") with Flowing Wave Gradient / Two-Tone / Solid 3D
 * and customizable font sizes for both the Rank Number and Top Text
 */
export function renderTopLayer(
  ctx: CanvasRenderingContext2D,
  config: LogoConfig,
  theme: ColorTheme,
  time: number,
  parallaxX: number,
  parallaxY: number
) {
  const numSpring = solveSpring(time, config.physics, 0.95);
  if (numSpring.value <= 0.01) return;

  const { scaleX, scaleY } = computeSquashStretch(
    numSpring.velocity,
    config.physics.enableSquashStretch,
    0.042
  );
  const floatTop = Math.sin(time * 4.2) * 3.5;

  const rankFontSize = config.rankNumberSize || 182;
  const topFontSize = config.topTextSize || 94;
  const topSizeScale = topFontSize / 94;

  ctx.save();
  ctx.translate(parallaxX * 0.45, -164 + floatTop + parallaxY * 0.45);

  // Measure "อันดับ" and Big "5" at their user-configured sizes
  ctx.font = `700 ${topFontSize}px "Chonburi", "Kanit", sans-serif`;
  const topLabelW = ctx.measureText(config.topText).width;
  ctx.font = `700 ${rankFontSize}px "Chonburi", "Kanit", sans-serif`;
  const rankNumW = ctx.measureText(config.rankNumber).width;

  const gapBetween = Math.round(28 * (rankFontSize / 182));
  const totalTopW = rankNumW + gapBetween + topLabelW;
  const startX = -totalTopW / 2;

  // 1A. Big Rank Number ("5") with Wave Gradient, Two-Tone, or Solid 3D
  ctx.save();
  const numCenterX = startX + rankNumW / 2;
  ctx.translate(numCenterX, -10);
  ctx.scale(numSpring.value * scaleX, numSpring.value * scaleY);
  ctx.rotate(-0.11 + numSpring.velocity * -0.02);

  renderStyledRankNumber(
    ctx,
    config.rankNumber,
    rankFontSize,
    config.numberTexture,
    theme,
    time
  );
  ctx.restore();

  // 1B. Top Text ("อันดับ") with Staggered Per-Grapheme Thai Choreography
  ctx.save();
  const labelCenterX = startX + rankNumW + gapBetween + topLabelW / 2;
  ctx.translate(labelCenterX, 6);
  ctx.rotate(-0.03);
  ctx.font = `700 ${topFontSize}px "Chonburi", "Kanit", sans-serif`;

  const topShimmerP =
    config.physics.enableLightSweep && time >= 1.65 && time <= 2.95
      ? clamp((time - 1.65) / 0.85)
      : -1;

  drawStaggeredThaiText(
    ctx,
    config.topText,
    0,
    0,
    time - 0.06,
    config.physics,
    {
      fill: theme.topTextFill,
      stroke: '#09090B',
      extrudeColor: theme.rankSecondary,
      extrudeDepth: Math.max(8, Math.round(14 * topSizeScale)),
      strokeWidth: Math.max(12, Math.round(22 * topSizeScale)),
      highlightColor: '#FFFFFF',
    },
    {
      dropFromY: -50,
      staggerScale: 0.9,
      shimmerSweepProgress: topShimmerP,
    }
  );
  ctx.restore();

  ctx.restore();
}

/**
 * Renders Layer 2: Middle Dynamic Banner [ ... ] with Staggered Thai Text,
 * Glyph-Exact Shimmering Light Sweep, and Side Props
 */
export function renderMiddleBannerAndProps(
  ctx: CanvasRenderingContext2D,
  config: LogoConfig,
  theme: ColorTheme,
  bannerWidth: number,
  bannerHeight: number,
  middleFontSize: number,
  middleFontFamily: string,
  measuredTextWidth: number,
  rawMiddleText: string,
  time: number,
  parallaxX: number,
  parallaxY: number
) {
  const bannerElapsed = time - 0.48;
  const bannerSpring = solveSpring(bannerElapsed, config.physics, 1.0);
  if (bannerSpring.value <= 0.01) return;

  const propsElapsed = time - 0.62;
  const bannerHalfW = bannerWidth / 2;
  const bannerHalfH = bannerHeight / 2;
  const { scaleX: sqX, scaleY: sqY } = computeSquashStretch(
    bannerSpring.velocity,
    config.physics.enableSquashStretch,
    0.025
  );
  const midSizeScale = middleFontSize / 74;

  ctx.save();
  ctx.translate(parallaxX * 0.8, 14 + parallaxY * 0.8);

  // Unrolling Banner Container
  ctx.save();
  ctx.scale(Math.max(0.04, bannerSpring.value * sqX), sqY);

  // Multi-Pass Ambient Occlusion Shadow + Hard 3D Rim
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#09090B';
  roundRectPath(
    ctx,
    -bannerHalfW + 10,
    -bannerHalfH + 14,
    bannerWidth,
    bannerHeight,
    26
  );
  ctx.fill();
  ctx.restore();

  // Banner Gradient Surface
  const bgGrad = ctx.createLinearGradient(0, -bannerHalfH, 0, bannerHalfH);
  bgGrad.addColorStop(0, theme.bannerBgStart);
  bgGrad.addColorStop(1, theme.bannerBgEnd);
  ctx.fillStyle = bgGrad;
  roundRectPath(ctx, -bannerHalfW, -bannerHalfH, bannerWidth, bannerHeight, 26);
  ctx.fill();

  // Heavy Outer Stroke + Inner Metallic Bevel Frame
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  ctx.lineWidth = 6.5;
  ctx.strokeStyle = theme.bannerBorder;
  roundRectPath(
    ctx,
    -bannerHalfW + 10,
    -bannerHalfH + 10,
    bannerWidth - 20,
    bannerHeight - 20,
    18
  );
  ctx.stroke();

  // Temple Fair Chasing Light Bulbs with Glow
  if (config.bannerStyle === 'temple_marquee') {
    const bulbSpacing = 44;
    const topBottomCount = Math.floor((bannerWidth - 40) / bulbSpacing);
    const phaseTick = Math.floor(time * 9);

    for (let i = 0; i <= topBottomCount; i++) {
      const bx =
        -bannerHalfW + 24 + i * ((bannerWidth - 48) / Math.max(1, topBottomCount));
      [-bannerHalfH + 10, bannerHalfH - 10].forEach((by, rowIdx) => {
        const isLit = (i + rowIdx + phaseTick) % 2 === 0;
        ctx.beginPath();
        ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = isLit ? theme.bulbColorOn : theme.bulbColorOff;
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#09090B';
        ctx.stroke();
      });
    }
  }

  // Canvas Scroll Rollers
  if (config.bannerStyle === 'canvas_scroll') {
    [-bannerHalfW - 8, bannerHalfW - 14].forEach((rx) => {
      ctx.fillStyle = '#D97706';
      roundRectPath(ctx, rx, -bannerHalfH - 12, 22, bannerHeight + 24, 8);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#09090B';
      ctx.stroke();
    });
  }

  // Clip & Render Staggered Thai Banner Text with Safe Vowel Clearance & Glyph-Exact Shimmer
  ctx.save();
  roundRectPath(
    ctx,
    -bannerHalfW + 16,
    -bannerHalfH + 8,
    bannerWidth - 32,
    bannerHeight - 16,
    14
  );
  ctx.clip();

  ctx.font = `700 ${middleFontSize}px ${middleFontFamily}`;
  const maxInnerTextW = bannerWidth - 72;
  const textScaleX =
    measuredTextWidth > maxInnerTextW ? maxInnerTextW / measuredTextWidth : 1;
  ctx.scale(textScaleX, 1);

  const midShimmerP =
    config.physics.enableLightSweep && time >= 1.75 && time <= 3.35
      ? ((time - 1.75) % 1.4) / 1.05
      : -1;

  drawStaggeredThaiText(
    ctx,
    rawMiddleText,
    0,
    6,
    time - 0.56,
    config.physics,
    {
      fill: theme.bannerTextFill,
      stroke: '#09090B',
      extrudeColor: '#09090B',
      extrudeDepth: Math.max(5, Math.round(8 * midSizeScale)),
      strokeWidth: Math.max(10, Math.round(16 * midSizeScale)),
      highlightColor: '#FFFFFF',
      ambientShadow: false,
    },
    {
      dropFromY: 44,
      staggerScale: 0.65,
      shimmerSweepProgress: midShimmerP,
    }
  );
  ctx.restore();

  ctx.restore(); // End banner unroll scale

  // Side & Corner Props attached to the Dynamic Banner Edges
  const currentEdgeX = bannerHalfW * Math.min(1.08, bannerSpring.value);

  if (config.props.marigoldGarland) {
    drawMarigoldGarland(
      ctx,
      -currentEdgeX + 18,
      bannerHalfH - 18,
      propsElapsed,
      time,
      config.physics
    );
  }

  if (config.props.interviewMic) {
    drawInterviewMic(
      ctx,
      -currentEdgeX - 56,
      10,
      propsElapsed,
      time,
      config.props.micChannelTag,
      config.physics
    );
  }

  if (config.props.recCamera) {
    drawRecCamera(
      ctx,
      currentEdgeX + 70,
      -14,
      propsElapsed - 0.04,
      time,
      config.physics
    );
  }

  ctx.restore();
}

/**
 * Renders Layer 3: Bottom ("สุดฮา") with High-Impact Slam, Squash & Stretch, and Wiggle
 */
export function renderBottomLayer(
  ctx: CanvasRenderingContext2D,
  config: LogoConfig,
  theme: ColorTheme,
  time: number,
  parallaxX: number,
  parallaxY: number
) {
  const slamElapsed = time - 1.2;
  const slamSpring = solveSpring(slamElapsed, {
    stiffness: config.physics.stiffness * 1.15,
    damping: config.physics.damping * 0.85,
  });
  if (slamSpring.value <= 0.01) return;

  const { scaleX, scaleY } = computeSquashStretch(
    slamSpring.velocity,
    config.physics.enableSquashStretch,
    0.048
  );

  const bottomFontSize = config.bottomTextSize || 116;
  const btmSizeScale = bottomFontSize / 116;

  const dropOffsetY = (1 - slamSpring.value) * -260;
  const wiggleAngle =
    (config.bottomTiltDeg * Math.PI) / 180 +
    (time >= 1.55 ? Math.sin(time * 18) * 0.042 : 0);
  const wiggleScaleX = time >= 1.55 ? 1 + Math.sin(time * 24) * 0.028 : 1;
  const wiggleScaleY = time >= 1.55 ? 1 - Math.sin(time * 24) * 0.028 : 1;

  ctx.save();
  ctx.translate(
    parallaxX * 1.15,
    180 + dropOffsetY + parallaxY * 1.15
  );
  ctx.scale(
    slamSpring.value * scaleX * wiggleScaleX,
    slamSpring.value * scaleY * wiggleScaleY
  );
  ctx.rotate(wiggleAngle);

  // Comic impact stars flanking "สุดฮา"
  ctx.font = `700 ${bottomFontSize}px "Chonburi", "Kanit", sans-serif`;
  const bottomW = ctx.measureText(config.bottomText).width;
  const starOffset = Math.max(150, bottomW * 0.58 + 38);

  drawStar(ctx, -starOffset, 8, 5, 30 * btmSizeScale, 13 * btmSizeScale, '#FACC15', '#09090B', 5);
  drawStar(ctx, starOffset + 8, -12, 5, 28 * btmSizeScale, 12 * btmSizeScale, '#38BDF8', '#09090B', 5);

  // Compute glyph-exact shimmer sweep progress so light ONLY shines on the letters of "สุดฮา", never a rectangular box
  const bottomShimmerP =
    config.physics.enableLightSweep && time >= 2.0 && time <= 3.4
      ? clamp((time - 2.05) / 0.9)
      : -1;

  drawStaggeredThaiText(
    ctx,
    config.bottomText,
    0,
    0,
    slamElapsed,
    config.physics,
    {
      fill: theme.bottomTextFill,
      secondaryFill: theme.bottomTextSecondary,
      stroke: theme.bottomTextStroke,
      extrudeColor: theme.bottomExtrude,
      extrudeDepth: Math.max(10, Math.round(16 * btmSizeScale)),
      strokeWidth: Math.max(14, Math.round(24 * btmSizeScale)),
      highlightColor: '#FFFFFF',
    },
    {
      dropFromY: -90,
      staggerScale: 0.75,
      shimmerSweepProgress: bottomShimmerP,
    }
  );

  ctx.restore();
}

/**
 * Renders the Back Stage Props (Thai Flag Ribbon, Clown Mascot, Tin Tray, Horn Speaker) & Front EP Pop
 */
export function renderBackPropsAndEpBadge(
  ctx: CanvasRenderingContext2D,
  config: LogoConfig,
  theme: ColorTheme,
  bannerWidth: number,
  time: number,
  parallaxX: number,
  parallaxY: number,
  layer: 'back' | 'ep_front'
) {
  if (layer === 'back') {
    ctx.save();
    ctx.translate(parallaxX * 0.25, parallaxY * 0.25);

    if (config.props.thaiFlagRibbon) {
      drawThaiFlagRibbon(
        ctx,
        0,
        -142,
        bannerWidth + 135,
        time,
        time,
        config.physics
      );
    }

    if (config.props.clownMascot) {
      drawClownMascot(ctx, 18, -318, time - 1.28, time, config.physics);
    }

    if (config.props.tinTray) {
      drawTinTray(ctx, 248, -246, time - 1.24, time, config.physics);
    }

    if (config.props.hornSpeaker) {
      drawHornSpeaker(ctx, -274, -232, time - 0.6, time, config.physics);
    }

    ctx.restore();
  } else if (layer === 'ep_front' && config.epEnabled) {
    const bannerHalfW = bannerWidth / 2;
    const epX =
      config.epPosition === 'top_left'
        ? -bannerHalfW + 30
        : config.epPosition === 'top_right'
        ? bannerHalfW - 20
        : bannerHalfW - 10;
    const epY = config.epPosition === 'bottom_right' ? 175 : -248;

    drawEpMessagePop(
      ctx,
      epX + parallaxX * 1.25,
      epY + parallaxY * 1.25,
      config.epText,
      config.epTextSize || 38,
      time - 0.16,
      time,
      theme.epBubbleFill,
      theme.epBubbleText,
      config.epPosition === 'top_left',
      config.physics
    );
  }
}

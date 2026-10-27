import { LogoConfig, resolveActiveTheme } from '../types/motion';
import { clamp, computeCameraRig } from '../renderer/physicsEngine';
import {
  renderBackdropAndAtmosphere,
  renderImpactAndOutEffects,
} from '../renderer/backdropEngine';
import {
  renderBackPropsAndEpBadge,
  renderBottomLayer,
  renderMiddleBannerAndProps,
  renderTopLayer,
} from '../renderer/layersRenderer';

/**
 * Lightweight High-DPI Canvas Orchestrator for the 0.0s – 4.0s Thai Comedy Motion Logo
 * Delegates physics, 3D Thai typography, 2.5D atmosphere, and props to modular sub-engines.
 */
export function renderMotionLogoFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: LogoConfig,
  time: number
) {
  // Enforce crisp vector & font anti-aliasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const theme = resolveActiveTheme(config);
  const camera = computeCameraRig(time, config.physics);

  // 1. Render Backdrop, Volumetric Sunburst & 2.5D Bokeh Orbs
  renderBackdropAndAtmosphere(ctx, width, height, config, theme, camera, time);

  // 2. Compute 2.5D Camera & Aspect-Ratio Scale Matrix
  const baseUnit =
    config.aspectRatio === '9:16'
      ? width / 1080
      : Math.min(width, height) / 1080;
  const totalScale =
    baseUnit * config.logoScale * camera.zoom * camera.outScale;

  const centerX = width / 2 + camera.panX;
  const centerY = height / 2 + config.logoVerticalOffset + camera.panY;

  // 3. Render Main 3-Layer Logo Assembly if visible
  if (camera.outScale > 0.01 && camera.outAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = camera.outAlpha;
    ctx.translate(centerX, centerY);
    ctx.scale(totalScale, totalScale);
    ctx.rotate(camera.tiltRad + camera.outRotate);

    // Measure Dynamic Middle Banner Text using user-selected middleTextSize
    const middleFontFamily = `"${config.middleFont}", "Kanit", sans-serif`;
    const rawMiddleText = config.middleText.trim() || 'ใส่ข้อความตรงนี้...';
    const baseMiddleSize = config.middleTextSize || 74;
    const charCount = Array.from(rawMiddleText).length;
    const middleFontSize =
      charCount > 24
        ? Math.max(40, Math.round(baseMiddleSize - (charCount - 24) * 1.4))
        : baseMiddleSize;

    ctx.font = `700 ${middleFontSize}px ${middleFontFamily}`;
    const measuredTextWidth = ctx.measureText(rawMiddleText).width;

    const maxBannerWidth = config.aspectRatio === '16:9' ? 1180 : 760;
    const bannerWidth = clamp(measuredTextWidth + 148, 480, maxBannerWidth);
    const bannerHeight =
      Math.max(128, Math.round(middleFontSize * 2.0)) +
      config.thaiVowelSafePadding;

    // 3A. Back Layer Props (Flag Ribbon, Laughing Clown, Tin Tray, Horn Speaker)
    renderBackPropsAndEpBadge(
      ctx,
      config,
      theme,
      bannerWidth,
      time,
      camera.parallaxX,
      camera.parallaxY,
      'back'
    );

    // 3B. Layer 1 (Top): "5 อันดับ"
    renderTopLayer(
      ctx,
      config,
      theme,
      time,
      camera.parallaxX,
      camera.parallaxY
    );

    // 3C. Layer 2 (Middle): Dynamic Unrolling Banner [ ... ] + Side Props + Light Sweep
    renderMiddleBannerAndProps(
      ctx,
      config,
      theme,
      bannerWidth,
      bannerHeight,
      middleFontSize,
      middleFontFamily,
      measuredTextWidth,
      rawMiddleText,
      time,
      camera.parallaxX,
      camera.parallaxY
    );

    // 3D. Layer 3 (Bottom): "สุดฮา"
    renderBottomLayer(
      ctx,
      config,
      theme,
      time,
      camera.parallaxX,
      camera.parallaxY
    );

    // 3E. Front Layer: EP Message Pop Badge
    renderBackPropsAndEpBadge(
      ctx,
      config,
      theme,
      bannerWidth,
      time,
      camera.parallaxX,
      camera.parallaxY,
      'ep_front'
    );

    ctx.restore();
  }

  // 4. Render Impact Shockwave Ring (at 1.24s) & Final Starburst Explosion (at 3.64s)
  renderImpactAndOutEffects(
    ctx,
    centerX,
    centerY,
    baseUnit * config.logoScale,
    camera,
    config.physics.enableAmbientBokeh
  );
}

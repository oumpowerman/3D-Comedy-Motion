import { ColorTheme, LogoConfig } from '../types/motion';
import { CameraRigState, drawStar } from './physicsEngine';

interface BokehOrb {
  angle: number;
  distRatio: number;
  size: number;
  speed: number;
  depth: number;
}

const BOKEH_ORBS: BokehOrb[] = [
  { angle: 0.4, distRatio: 0.34, size: 34, speed: 0.4, depth: 0.6 },
  { angle: 1.2, distRatio: 0.42, size: 52, speed: -0.3, depth: 1.2 },
  { angle: 2.1, distRatio: 0.28, size: 26, speed: 0.5, depth: 0.4 },
  { angle: 2.9, distRatio: 0.46, size: 64, speed: 0.25, depth: 1.4 },
  { angle: 3.7, distRatio: 0.38, size: 40, speed: -0.35, depth: 0.8 },
  { angle: 4.5, distRatio: 0.31, size: 28, speed: 0.45, depth: 0.5 },
  { angle: 5.2, distRatio: 0.44, size: 58, speed: -0.28, depth: 1.3 },
  { angle: 5.9, distRatio: 0.36, size: 32, speed: 0.38, depth: 0.7 },
];

/**
 * Renders the Canvas Backdrop, Volumetric Sunburst, 2.5D Bokeh Orbs, and Impact Shockwave Ring
 */
export function renderBackdropAndAtmosphere(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: LogoConfig,
  theme: ColorTheme,
  camera: CameraRigState,
  time: number
) {
  ctx.clearRect(0, 0, width, height);

  if (config.bgMode === 'green') {
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, width, height);
    return;
  }
  if (config.bgMode === 'blue') {
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const cx = width / 2 - camera.parallaxX * 1.4;
  const cy = height / 2 + config.logoVerticalOffset - camera.parallaxY * 1.4;
  const maxR = Math.hypot(width, height);

  if (config.bgMode === 'sunburst') {
    const rayCount = 24;
    const baseAngle = time * 0.32;

    ctx.fillStyle = theme.sunburstB;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    for (let i = 0; i < rayCount; i += 2) {
      const a1 = baseAngle + (i / rayCount) * Math.PI * 2;
      const a2 = baseAngle + ((i + 1) / rayCount) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, a1, a2);
      ctx.closePath();
      ctx.fillStyle = theme.sunburstA;
      ctx.fill();
    }

    // Warm Golden Stage Spotlight + Deep Cinematic Vignette
    const radGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, maxR * 0.72);
    radGrad.addColorStop(0, 'rgba(250, 204, 21, 0.24)');
    radGrad.addColorStop(0.55, 'rgba(15, 23, 42, 0.25)');
    radGrad.addColorStop(1, 'rgba(2, 6, 23, 0.85)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 2.5D Depth-of-Field Bokeh Particles (Active in sunburst or transparent mode)
  if (config.physics.enableAmbientBokeh && config.bgMode === 'sunburst') {
    ctx.save();
    BOKEH_ORBS.forEach((orb, idx) => {
      const currentAngle = orb.angle + time * orb.speed;
      const radius = Math.min(width, height) * orb.distRatio;
      const ox =
        width / 2 +
        Math.cos(currentAngle) * radius -
        camera.parallaxX * orb.depth * 2.2;
      const oy =
        height / 2 +
        config.logoVerticalOffset +
        Math.sin(currentAngle) * radius -
        camera.parallaxY * orb.depth * 2.2;

      const pulseAlpha = 0.12 + 0.08 * Math.sin(time * 3 + idx);
      const orbGrad = ctx.createRadialGradient(ox, oy, 2, ox, oy, orb.size);
      orbGrad.addColorStop(0, `rgba(254, 240, 138, ${pulseAlpha * 1.8})`);
      orbGrad.addColorStop(0.6, `rgba(250, 204, 21, ${pulseAlpha})`);
      orbGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');

      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, orb.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}

/**
 * Renders the Radial Impact Shockwave Ring at 1.24s and the Final 3.5s Starburst Explosion
 */
export function renderImpactAndOutEffects(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  baseScale: number,
  camera: CameraRigState,
  enableBokeh: boolean
) {
  // 1. Impact Shockwave Ring when "สุดฮา" + Tin Tray slam onto screen (1.24s - 1.84s)
  if (enableBokeh && camera.shockwaveProgress > 0 && camera.shockwaveProgress < 1) {
    const p = camera.shockwaveProgress;
    const easeOut = 1 - Math.pow(1 - p, 3);
    const ringRadius = 140 + easeOut * 520;
    const alpha = (1 - p) * 0.65;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(baseScale, baseScale);

    ctx.beginPath();
    ctx.arc(0, 40, ringRadius, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(2, (1 - p) * 28);
    ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
    ctx.stroke();

    ctx.restore();
  }

  // 2. Phase 5 (3.64s - 4.0s): Out Vortex Starburst & High-Velocity Confetti Rays
  if (camera.starburstProgress > 0.01 && camera.starburstProgress < 0.99) {
    const p = camera.starburstProgress;
    const easeOut = 1 - Math.pow(1 - p, 3);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(baseScale, baseScale);

    // High-speed radial streaks
    const rayCount = 16;
    const innerR = easeOut * 240;
    const outerR = easeOut * 640;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(2, (1 - p) * 14);
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - p})`;

    for (let i = 0; i < rayCount; i++) {
      const a = (i / rayCount) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
      ctx.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
      ctx.stroke();
    }

    // Starburst Gems
    const particleCount = 14;
    const burstRadius = easeOut * 540;
    const starSize = Math.max(3, (1 - p) * 46);
    const colors = ['#FACC15', '#EF4444', '#38BDF8', '#FFFFFF', '#EC4899'];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + p * 0.9;
      const dist = burstRadius * (i % 2 === 0 ? 1 : 0.66);
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      drawStar(
        ctx,
        px,
        py,
        5,
        starSize,
        starSize * 0.44,
        colors[i % colors.length],
        '#09090B',
        4
      );
    }

    ctx.restore();
  }
}

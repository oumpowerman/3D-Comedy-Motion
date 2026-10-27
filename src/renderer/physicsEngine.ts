import { MotionPhysicsConfig } from '../types/motion';

export interface SpringState {
  value: number;     // 0 -> 1 (with natural spring overshoot)
  velocity: number;  // Instantaneous velocity for Squash & Stretch and Follow-Through
}

export function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Apple Keynote / CoreAnimation Analytical Damped Harmonic Oscillator Solver
 * Solves m*x'' + c*x' + k*x = k for x(0)=0, x'(0)=0
 * Returns both exact position and instantaneous velocity for secondary motion.
 */
export function solveSpring(
  elapsedSeconds: number,
  physics: Pick<MotionPhysicsConfig, 'stiffness' | 'damping'>,
  mass = 1.0
): SpringState {
  if (elapsedSeconds <= 0) {
    return { value: 0, velocity: 0 };
  }

  const k = physics.stiffness;
  const c = physics.damping;
  const omega0 = Math.sqrt(k / mass);
  const zeta = c / (2 * Math.sqrt(k * mass));
  const t = elapsedSeconds;

  if (zeta < 1) {
    // Under-damped (Snappy & Bouncy / Fluid Overshoot)
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const env = Math.exp(-zeta * omega0 * t);
    const cosTerm = Math.cos(omegaD * t);
    const sinTerm = Math.sin(omegaD * t);

    const value = 1 - env * (cosTerm + ((zeta * omega0) / omegaD) * sinTerm);
    const velocity =
      env *
      (omegaD + (zeta * zeta * omega0 * omega0) / omegaD) *
      sinTerm;
    return { value, velocity };
  } else {
    // Critically damped
    const env = Math.exp(-omega0 * t);
    const value = 1 - env * (1 + omega0 * t);
    const velocity = env * omega0 * omega0 * t;
    return { value, velocity };
  }
}

/**
 * Velocity-driven Squash & Stretch preserving 2D area (scaleX * scaleY ≈ 1)
 */
export function computeSquashStretch(
  velocity: number,
  enabled: boolean,
  intensity = 0.042
): { scaleX: number; scaleY: number } {
  if (!enabled) return { scaleX: 1, scaleY: 1 };
  // Clamp deform factor so text stays legible while feeling alive
  const deform = clamp(velocity * intensity, -0.26, 0.32);
  const scaleY = 1 + deform;
  const scaleX = 1 / Math.max(0.72, scaleY);
  return { scaleX, scaleY };
}

/**
 * Draws a Rounded Rectangle Path cleanly
 */
export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws a Crisp 5-Pointed or Multi-Pointed Starburst
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fill: string,
  stroke = '#09090B',
  lineWidth = 4
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (lineWidth > 0) {
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws Directional Motion Smear / Speed Lines behind fast-moving elements
 */
export function drawMotionSmear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  velocity: number,
  directionAngle: number,
  color = 'rgba(255, 255, 255, 0.55)'
) {
  const speed = Math.abs(velocity);
  if (speed < 1.8) return;

  const streakLen = Math.min(110, speed * 16);
  const alpha = clamp((speed - 1.8) / 8, 0.1, 0.65);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(directionAngle);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';

  [-22, 0, 22].forEach((offsetY, i) => {
    const len = streakLen * (i === 1 ? 1.15 : 0.75);
    ctx.lineWidth = i === 1 ? 7 : 4.5;
    ctx.beginPath();
    ctx.moveTo(-12, offsetY);
    ctx.lineTo(-12 - len, offsetY);
    ctx.stroke();
  });

  ctx.restore();
}

export interface CameraRigState {
  zoom: number;
  panX: number;
  panY: number;
  tiltRad: number;
  parallaxX: number;
  parallaxY: number;
  shockwaveProgress: number; // 0 -> 1 after "สุดฮา" slams down at 1.25s
  outScale: number;
  outRotate: number;
  outAlpha: number;
  starburstProgress: number;
}

/**
 * Computes 2.5D Camera Parallax, Impact Zoom, damped harmonic Screen Shake, and Vortex Out
 */
export function computeCameraRig(
  time: number,
  physics: MotionPhysicsConfig
): CameraRigState {
  // Subtle continuous 2.5D floating camera orbit
  const orbitX = physics.enableParallaxCamera ? Math.sin(time * 2.1) * 14 : 0;
  const orbitY = physics.enableParallaxCamera ? Math.cos(time * 1.7) * 10 : 0;

  // Opening gentle dolly-in (0.0s -> 0.6s) + Impact Zoom Punch when "สุดฮา" lands at 1.25s
  let zoom = 1.0;
  if (physics.enableParallaxCamera) {
    if (time < 0.55) {
      const openSpring = solveSpring(time, { stiffness: 180, damping: 20 });
      zoom = 0.92 + openSpring.value * 0.08;
    } else if (time >= 1.22 && time <= 1.85) {
      const impactElapsed = time - 1.22;
      const punch = Math.exp(-impactElapsed * 8.5) * Math.sin(impactElapsed * 26) * 0.065;
      zoom = 1.0 + punch;
    }
  }

  // Damped harmonic Screen Shake on "สุดฮา" + Tin Tray impact (1.24s - 1.68s)
  let shakeX = 0;
  let shakeY = 0;
  let tiltRad = 0;
  if (time >= 1.24 && time <= 1.68) {
    const dt = time - 1.24;
    const decay = Math.exp(-dt * 9.5);
    shakeX = Math.sin(dt * 92) * 20 * decay;
    shakeY = Math.cos(dt * 115) * 18 * decay;
    tiltRad = Math.sin(dt * 65) * 0.018 * decay;
  }

  const shockwaveProgress =
    time >= 1.24 && time <= 1.84 ? clamp((time - 1.24) / 0.55) : 0;

  // Phase 5 (3.5s - 4.0s): Anticipation Expansion (3.5-3.6s) -> Suction Vortex Inward
  let outScale = 1;
  let outRotate = 0;
  let outAlpha = 1;
  let starburstProgress = 0;

  if (time >= 3.5) {
    const outT = clamp((time - 3.5) / 0.38);
    // Anticipation swell before vortex collapse
    if (outT < 0.24) {
      const swell = outT / 0.24;
      outScale = 1 + Math.sin(swell * Math.PI * 0.5) * 0.11;
      outRotate = -swell * 0.06;
    } else {
      const collapseT = (outT - 0.24) / 0.76;
      const easeIn = collapseT * collapseT * collapseT;
      outScale = Math.max(0, 1.11 * (1 - easeIn));
      outRotate = -0.06 + easeIn * 0.58;
    }
    outAlpha = clamp(1 - (time - 3.76) / 0.18);
    starburstProgress = clamp((time - 3.64) / 0.35);
  }

  return {
    zoom,
    panX: shakeX,
    panY: shakeY,
    tiltRad,
    parallaxX: orbitX,
    parallaxY: orbitY,
    shockwaveProgress,
    outScale,
    outRotate,
    outAlpha,
    starburstProgress,
  };
}

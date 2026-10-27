import { MotionPhysicsConfig } from '../../types/motion';
import {
  computeSquashStretch,
  drawMotionSmear,
  roundRectPath,
  solveSpring,
} from '../physicsEngine';

/**
 * Prop 1: Curved Thai National Flag Ribbon with Silk Specular Highlight & Follow-Through Ends
 */
export function drawThaiFlagRibbon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  elapsed: number,
  time: number,
  physics: MotionPhysicsConfig
) {
  const spring = solveSpring(elapsed, physics, 1.1);
  if (spring.value <= 0.01) return;

  // Secondary delayed spring for the ribbon swallowtail tips (Overlapping Action)
  const tailSpring = solveSpring(elapsed - 0.06, physics, 1.35);

  ctx.save();
  const wave = Math.sin(time * 5.4) * 9 + spring.velocity * 2.5;
  ctx.translate(cx, cy);
  ctx.scale(Math.max(0.02, spring.value), 1);

  const halfW = width * 0.56;
  const ribbonThickness = 96;
  const stripes = [
    { color: '#EF4444', ratio: 1 / 6 },
    { color: '#F8FAFC', ratio: 1 / 6 },
    { color: '#1E3A8A', ratio: 2 / 6 },
    { color: '#F8FAFC', ratio: 1 / 6 },
    { color: '#EF4444', ratio: 1 / 6 },
  ];

  // Ambient Occlusion Shadow + Heavy Outer Stroke
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 14;
  ctx.beginPath();
  ctx.moveTo(-halfW, 45 + wave * 0.5);
  ctx.quadraticCurveTo(0, -148 - wave, halfW, 45 - wave * 0.5);
  ctx.lineWidth = ribbonThickness + 18;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = '#09090B';
  ctx.stroke();
  ctx.restore();

  // Draw the 5 Thai flag stripes
  let offsetAcc = -ribbonThickness / 2;
  stripes.forEach((st) => {
    const segH = ribbonThickness * st.ratio;
    const midOffset = offsetAcc + segH / 2;
    ctx.beginPath();
    ctx.moveTo(-halfW, 45 + midOffset + wave * 0.5);
    ctx.quadraticCurveTo(0, -148 + midOffset - wave, halfW, 45 + midOffset - wave * 0.5);
    ctx.lineWidth = segH + 1.5;
    ctx.strokeStyle = st.color;
    ctx.stroke();
    offsetAcc += segH;
  });

  // Silk Specular Sheen Highlight across the crown of the arch
  ctx.save();
  const sheenGrad = ctx.createLinearGradient(-halfW * 0.6, -120, halfW * 0.6, -120);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  sheenGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.28)');
  sheenGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.28)');
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.beginPath();
  ctx.moveTo(-halfW, 45 + wave * 0.5);
  ctx.quadraticCurveTo(0, -148 - wave, halfW, 45 - wave * 0.5);
  ctx.lineWidth = ribbonThickness;
  ctx.strokeStyle = sheenGrad;
  ctx.stroke();
  ctx.restore();

  // Swallowtail V-cut ends with secondary Follow-Through rotation
  [-1, 1].forEach((dir) => {
    ctx.save();
    ctx.translate(dir * halfW, 45);
    const tailFlutter = (1 - tailSpring.value) * -0.45 + Math.sin(time * 7 + dir) * 0.06;
    ctx.rotate(dir * (0.35 + tailFlutter));
    ctx.fillStyle = '#09090B';
    ctx.beginPath();
    ctx.moveTo(0, -52);
    ctx.lineTo(dir * 40, -32);
    ctx.lineTo(dir * 16, 0);
    ctx.lineTo(dir * 40, 32);
    ctx.lineTo(0, 52);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  ctx.restore();
}

/**
 * Prop 4: Interview Microphone with Secondary Follow-Through & Motion Smear
 */
export function drawInterviewMic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  elapsed: number,
  time: number,
  channelTag: string,
  physics: MotionPhysicsConfig
) {
  const spring = solveSpring(elapsed, physics, 0.95);
  if (spring.value <= 0.01) return;

  // Secondary delayed spring for the mic foam head & channel cube (Overlapping Action)
  const headSpring = solveSpring(elapsed - 0.045, physics, 1.2);
  const { scaleX, scaleY } = computeSquashStretch(
    spring.velocity,
    physics.enableSquashStretch,
    0.035
  );

  const curX = x - (1 - spring.value) * 140;
  const curY = y + Math.sin(time * 5.8) * 4;

  // Directional Motion Smear when popping out from left edge
  if (physics.enableMotionSmear) {
    drawMotionSmear(ctx, curX, curY, spring.velocity, 0, 'rgba(250, 204, 21, 0.5)');
  }

  ctx.save();
  ctx.translate(curX, curY);
  ctx.scale(spring.value * scaleX, spring.value * scaleY);
  // Follow-through lag tilt driven by velocity
  const followTilt = (spring.value - headSpring.value) * 0.65;
  ctx.rotate(0.42 + followTilt);

  // Ambient Drop Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 10;

  // Mic Handle Body
  ctx.fillStyle = '#1E293B';
  roundRectPath(ctx, -18, 10, 36, 122, 10);
  ctx.fill();
  ctx.restore();

  ctx.lineWidth = 8;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Thai Flag Stripe Wrap on handle
  const flagWrapColors = ['#EF4444', '#FFFFFF', '#1E3A8A', '#FFFFFF', '#EF4444'];
  flagWrapColors.forEach((c, idx) => {
    ctx.fillStyle = c;
    ctx.fillRect(-14, 65 + idx * 7, 28, 7);
  });
  ctx.strokeRect(-16, 63, 32, 39);

  // Interview Channel Cube Box with Specular Rim
  const cubeGrad = ctx.createLinearGradient(-42, -18, 42, 34);
  cubeGrad.addColorStop(0, '#FEF08A');
  cubeGrad.addColorStop(0.4, '#FACC15');
  cubeGrad.addColorStop(1, '#EA580C');
  ctx.fillStyle = cubeGrad;
  roundRectPath(ctx, -44, -18, 88, 54, 11);
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Channel Tag Text inside Cube
  const tagText = (channelTag || 'ฮาTV').slice(0, 6);
  ctx.font = '700 22px "Kanit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#09090B';
  ctx.fillText(tagText, 0, 9);

  // Foam Windscreen Head (with secondary spring squash)
  ctx.save();
  ctx.rotate(followTilt * 0.5);
  const headGrad = ctx.createRadialGradient(-12, -64, 6, 0, -52, 42);
  headGrad.addColorStop(0, '#FB7185');
  headGrad.addColorStop(0.45, '#EF4444');
  headGrad.addColorStop(1, '#991B1B');

  ctx.beginPath();
  ctx.arc(0, -52, 41, 0, Math.PI * 2);
  ctx.fillStyle = headGrad;
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Metallic Mesh Ring around Windscreen
  ctx.beginPath();
  ctx.moveTo(-39, -52);
  ctx.quadraticCurveTo(0, -39, 39, -52);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Sound Wave Arcs radiating from Mic
  ctx.strokeStyle = '#FDE047';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  [54, 68].forEach((rad, i) => {
    if (Math.sin(time * 10 + i) > -0.2) {
      ctx.beginPath();
      ctx.arc(0, -52, rad, -Math.PI * 0.35, Math.PI * 0.05);
      ctx.stroke();
    }
  });
  ctx.restore();

  ctx.restore();
}

/**
 * Prop 5: Broadcast Video Camera with Glass Optics Flare, Spring Lens Zoom & REC Tally
 */
export function drawRecCamera(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  elapsed: number,
  time: number,
  physics: MotionPhysicsConfig
) {
  const spring = solveSpring(elapsed, physics, 1.0);
  if (spring.value <= 0.01) return;

  // Secondary delayed spring for the camera zoom barrel (Overlapping Action)
  const lensSpring = solveSpring(elapsed - 0.05, physics, 1.25);
  const { scaleX, scaleY } = computeSquashStretch(
    spring.velocity,
    physics.enableSquashStretch,
    0.032
  );

  const curX = x + (1 - spring.value) * 140;
  const zoomPulse = 1 + Math.sin(time * 5.2) * 0.085 + (lensSpring.value - 1) * 0.25;
  const isRecBlinkOn = Math.sin(time * 9) > -0.15;

  if (physics.enableMotionSmear) {
    drawMotionSmear(ctx, curX, y, spring.velocity, Math.PI, 'rgba(56, 189, 248, 0.5)');
  }

  ctx.save();
  ctx.translate(curX, y);
  ctx.scale(spring.value * scaleX, spring.value * scaleY);
  ctx.rotate(-0.18 + (spring.value - lensSpring.value) * -0.4);

  // Dual Film Reels on Top with rotation
  [-20, 26].forEach((rx, idx) => {
    ctx.save();
    ctx.translate(rx, -48);
    ctx.rotate(time * (idx === 0 ? 2.5 : -2.5));
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#09090B';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();
    ctx.restore();
  });

  // Main Camera Body with Ambient Shadow & Metallic Gradient
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;
  const bodyGrad = ctx.createLinearGradient(0, -34, 0, 34);
  bodyGrad.addColorStop(0, '#334155');
  bodyGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = bodyGrad;
  roundRectPath(ctx, -46, -34, 96, 68, 14);
  ctx.fill();
  ctx.restore();

  ctx.lineWidth = 8;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Zooming Optical Lens Barrel
  ctx.save();
  ctx.scale( Math.max(0.2, zoomPulse), Math.max(0.2, zoomPulse));
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(-46, -20);
  ctx.lineTo(-90, -35);
  ctx.lineTo(-90, 35);
  ctx.lineTo(-46, 20);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Multi-Coated Optical Glass Element + Specular Glint
  const glassGrad = ctx.createLinearGradient(-98, -32, -80, 32);
  glassGrad.addColorStop(0, '#E0F2FE');
  glassGrad.addColorStop(0.45, '#38BDF8');
  glassGrad.addColorStop(1, '#0284C7');
  ctx.beginPath();
  ctx.ellipse(-90, 0, 11, 33, 0, 0, Math.PI * 2);
  ctx.fillStyle = glassGrad;
  ctx.fill();
  ctx.stroke();

  // Optical Lens Glint Spot
  ctx.beginPath();
  ctx.ellipse(-92, -12, 4, 9, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // Broadcast REC Indicator Screen
  ctx.fillStyle = '#09090B';
  roundRectPath(ctx, -34, -18, 72, 34, 8);
  ctx.fill();

  if (isRecBlinkOn) {
    ctx.beginPath();
    ctx.arc(-18, -1, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
  }
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isRecBlinkOn ? '#EF4444' : '#64748B';
  ctx.fillText('REC', -4, 0);

  ctx.restore();
}

import { MotionPhysicsConfig } from '../../types/motion';
import {
  computeSquashStretch,
  drawMotionSmear,
  drawStar,
  roundRectPath,
  solveSpring,
} from '../physicsEngine';

/**
 * Prop 2: Laughing Thai Clown Mascot with Multi-Layer Overlapping Action
 * (Hair tufts, party hat, and jaw each have delayed secondary spring physics!)
 */
export function drawClownMascot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  elapsed: number,
  time: number,
  physics: MotionPhysicsConfig
) {
  const headSpring = solveSpring(elapsed, physics, 1.0);
  if (headSpring.value <= 0.01) return;

  // Secondary delayed springs for hair tufts & hat tip (Overlapping Action / Follow-Through)
  const hairSpring = solveSpring(elapsed - 0.045, physics, 1.25);
  const hatSpring = solveSpring(elapsed - 0.075, physics, 1.4);

  const { scaleX, scaleY } = computeSquashStretch(
    headSpring.velocity,
    physics.enableSquashStretch,
    0.038
  );
  const headWiggle = Math.sin(time * 7.8) * 0.11;
  const jawLaugh = Math.abs(Math.sin(time * 12.5)) * 13;

  ctx.save();
  ctx.translate(cx, cy + (1 - headSpring.value) * 105);
  ctx.scale(headSpring.value * scaleX, headSpring.value * scaleY);
  ctx.rotate(headWiggle);

  // Rainbow Afro Hair Tufts with secondary spring lag
  const hairLagY = (headSpring.value - hairSpring.value) * 28;
  const hairTufts = [
    { x: -64, y: -22, r: 28, c: '#EF4444' },
    { x: -74, y: 8, r: 24, c: '#FACC15' },
    { x: -50, y: -48, r: 26, c: '#3B82F6' },
    { x: 64, y: -22, r: 28, c: '#EF4444' },
    { x: 74, y: 8, r: 24, c: '#FACC15' },
    { x: 50, y: -48, r: 26, c: '#3B82F6' },
  ];
  hairTufts.forEach((h) => {
    ctx.beginPath();
    ctx.arc(h.x, h.y + hairLagY, h.r, 0, Math.PI * 2);
    ctx.fillStyle = h.c;
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#09090B';
    ctx.stroke();
  });

  // Head Base with Warm 3D Radial Shading
  const faceGrad = ctx.createRadialGradient(-14, -18, 10, 0, 0, 60);
  faceGrad.addColorStop(0, '#FEF9C3');
  faceGrad.addColorStop(0.65, '#FDE68A');
  faceGrad.addColorStop(1, '#F59E0B');

  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.fillStyle = faceGrad;
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Mini Temple Fair Party Hat with Follow-Through Whip
  ctx.save();
  const hatWhipAngle = (headSpring.value - hatSpring.value) * 0.55 + Math.sin(time * 9) * 0.06;
  ctx.translate(0, -50);
  ctx.rotate(hatWhipAngle);
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(0, -56);
  ctx.lineTo(26, 0);
  ctx.closePath();
  ctx.fillStyle = '#EC4899';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Pom-pom on hat tip
  ctx.beginPath();
  ctx.arc(0, -60, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#FACC15';
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Laughing Squinting Eyes (^ ^)
  [-24, 24].forEach((ex) => {
    ctx.beginPath();
    ctx.arc(ex, -12, 13, Math.PI * 1.1, Math.PI * 1.9);
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#09090B';
    ctx.stroke();
  });

  // Rosy Cheeks
  [-38, 38].forEach((cxPos) => {
    ctx.beginPath();
    ctx.arc(cxPos, 8, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#FB7185';
    ctx.fill();
  });

  // Wide Open Laughing Mouth
  ctx.beginPath();
  ctx.arc(0, 14, 32 + jawLaugh * 0.32, 0, Math.PI);
  ctx.closePath();
  ctx.fillStyle = '#991B1B';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Tongue
  ctx.beginPath();
  ctx.arc(0, 32, 16, Math.PI, 0);
  ctx.fillStyle = '#FB7185';
  ctx.fill();

  // Glossy Red Clown Nose
  ctx.beginPath();
  ctx.arc(0, 2, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#EF4444';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-5, -4, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.restore();
}

/**
 * Prop 3: Thai Cafe Comedy Tin Tray (ถาดสังกะสีตบมุก) with Brushed Metal Anisotropy & Impact Ring
 */
export function drawTinTray(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  elapsed: number,
  time: number,
  physics: MotionPhysicsConfig
) {
  const spring = solveSpring(elapsed, {
    stiffness: physics.stiffness * 1.25,
    damping: Math.max(10, physics.damping * 0.72),
  });
  if (spring.value <= 0.01) return;

  const { scaleX, scaleY } = computeSquashStretch(
    spring.velocity,
    physics.enableSquashStretch,
    0.045
  );
  const vibrate = Math.sin(time * 32) * (elapsed < 0.45 ? 6 : 1.5);

  if (physics.enableMotionSmear) {
    drawMotionSmear(
      ctx,
      cx,
      cy,
      spring.velocity,
      -Math.PI * 0.35,
      'rgba(254, 240, 138, 0.55)'
    );
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(spring.value * scaleX, spring.value * scaleY);
  ctx.rotate(-0.35 + vibrate * 0.02);

  // Impact Starburst behind the tray ("ป๊าบ!")
  drawStar(ctx, -12, -18, 9, 82, 44, '#FACC15', '#09090B', 5);

  // Outer Rim of Corrugated Tin Tray with Metallic Sheen
  ctx.beginPath();
  ctx.ellipse(0, 0, 70, 52, 0.2, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(-64, -52, 64, 52);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.35, '#CBD5E1');
  grad.addColorStop(0.5, '#64748B');
  grad.addColorStop(0.7, '#F1F5F9');
  grad.addColorStop(1, '#94A3B8');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Inner Dish Indentation
  ctx.beginPath();
  ctx.ellipse(0, 2, 49, 35, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#94A3B8';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Specular Shine Streaks
  ctx.beginPath();
  ctx.moveTo(-28, -14);
  ctx.lineTo(18, 16);
  ctx.moveTo(-12, -22);
  ctx.lineTo(26, 4);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  // Comic "ป๊าบ!" Impact Text
  ctx.font = '700 25px "Kanit", sans-serif';
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = '#09090B';
  ctx.lineWidth = 6;
  ctx.strokeText('ป๊าบ!', -60, -44);
  ctx.fillText('ป๊าบ!', -60, -44);

  ctx.restore();
}

/**
 * Prop 6: Marigold Garland (พวงมาลัยดาวเรือง) with Secondary Pendulum Tassel Follow-Through
 */
export function drawMarigoldGarland(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  elapsed: number,
  time: number,
  physics: MotionPhysicsConfig
) {
  const spring = solveSpring(elapsed, physics, 1.05);
  if (spring.value <= 0.01) return;

  // Delayed secondary spring for bottom marigold tassels (อุบะ)
  const tasselSpring = solveSpring(elapsed - 0.06, physics, 1.35);

  const swing = Math.sin(time * 4.5) * 0.14 + (spring.value - 1) * 0.35;
  const secondarySwing =
    Math.sin(time * 4.5 - 0.55) * 0.2 + (spring.value - tasselSpring.value) * 0.6;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(spring.value, spring.value);
  ctx.rotate(swing);

  // Jasmine & Marigold Loop Ring
  const beads = 10;
  const ringRx = 28;
  const ringRy = 36;
  for (let i = 0; i < beads; i++) {
    const angle = (i / beads) * Math.PI * 2;
    const bx = Math.cos(angle) * ringRx;
    const by = 24 + Math.sin(angle) * ringRy;
    ctx.beginPath();
    ctx.arc(bx, by, 12, 0, Math.PI * 2);
    ctx.fillStyle = i % 3 === 0 ? '#FEF08A' : '#FACC15';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#09090B';
    ctx.stroke();
  }

  // Bottom Uba Tassels with Secondary Pendulum Follow-Through
  ctx.save();
  ctx.translate(0, 56);
  ctx.rotate(secondarySwing);
  [-16, 0, 16].forEach((tx, idx) => {
    const ty = 12 + (idx === 1 ? 14 : 4);
    ctx.beginPath();
    ctx.arc(tx, ty - 12, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#22C55E';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#09090B';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(tx, ty, 13, 0, Math.PI * 2);
    ctx.fillStyle = idx === 1 ? '#EF4444' : '#F97316';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#09090B';
    ctx.stroke();
  });
  ctx.restore();

  ctx.restore();
}

/**
 * Prop 7: Temple Fair Horn Speaker with Acoustic Pressure Rings
 */
export function drawHornSpeaker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  elapsed: number,
  time: number,
  physics: MotionPhysicsConfig
) {
  const spring = solveSpring(elapsed, physics, 1.0);
  if (spring.value <= 0.01) return;

  const pulse = 1 + Math.abs(Math.sin(time * 11)) * 0.1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(spring.value * pulse, spring.value * pulse);
  ctx.rotate(-0.3);

  // Megaphone Cone
  ctx.beginPath();
  ctx.moveTo(20, -12);
  ctx.lineTo(-42, -40);
  ctx.lineTo(-42, 40);
  ctx.lineTo(20, 12);
  ctx.closePath();
  ctx.fillStyle = '#E2E8F0';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Red Accent Lip
  ctx.beginPath();
  ctx.ellipse(-42, 0, 12, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#EF4444';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Rear Driver Cap
  ctx.beginPath();
  ctx.arc(24, 0, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#3B82F6';
  ctx.fill();
  ctx.stroke();

  // Acoustic Sound Wave Ring
  const wavePhase = (time * 3.5) % 1;
  ctx.beginPath();
  ctx.arc(-56 - wavePhase * 32, 0, 18 + wavePhase * 22, Math.PI * 0.65, Math.PI * 1.35);
  ctx.lineWidth = 5 * (1 - wavePhase);
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(250, 204, 21, ${1 - wavePhase})`;
  ctx.stroke();

  ctx.restore();
}

/**
 * EP Message Pop Badge with Glassmorphic Specular Rim & Velocity Squash
 */
export function drawEpMessagePop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  epText: string,
  epFontSize: number,
  elapsed: number,
  time: number,
  fill: string,
  textColor: string,
  isLeft: boolean,
  physics: MotionPhysicsConfig
) {
  if (!epText.trim()) return;
  const spring = solveSpring(elapsed, physics, 0.85);
  if (spring.value <= 0.01) return;

  const { scaleX, scaleY } = computeSquashStretch(
    spring.velocity,
    physics.enableSquashStretch,
    0.04
  );
  const floatY = Math.sin(time * 5.2) * 5;
  const sizeScale = epFontSize / 38;

  ctx.save();
  ctx.translate(x, y + floatY);
  ctx.scale(spring.value * scaleX, spring.value * scaleY);
  ctx.rotate((isLeft ? -0.1 : 0.1) + spring.velocity * 0.015);

  ctx.font = `700 ${epFontSize}px "Kanit", sans-serif`;
  const textW = Math.max(94 * sizeScale, ctx.measureText(epText).width + 46 * sizeScale);
  const boxH = Math.round(68 * sizeScale);
  const rx = -textW / 2;
  const ry = -boxH / 2;
  const cornerR = Math.round(24 * sizeScale);

  // Hard 3D Drop Shadow
  ctx.fillStyle = '#09090B';
  roundRectPath(ctx, rx + 7, ry + 9, textW, boxH, cornerR);
  ctx.fill();

  // Main Chat Message Bubble
  ctx.fillStyle = fill;
  roundRectPath(ctx, rx, ry, textW, boxH, cornerR);
  ctx.fill();
  ctx.lineWidth = Math.max(5, Math.round(7 * sizeScale));
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Top Inner Specular Glass Rim
  ctx.lineWidth = Math.max(2, Math.round(3 * sizeScale));
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  roundRectPath(ctx, rx + 5, ry + 5, textW - 10, boxH * 0.45, Math.max(10, cornerR - 6));
  ctx.stroke();

  // Speech Bubble Pointer Tail
  ctx.beginPath();
  const tailX = isLeft ? rx + 26 * sizeScale : rx + textW - 26 * sizeScale;
  ctx.moveTo(tailX - 12 * sizeScale, ry + boxH - 4);
  ctx.lineTo(tailX + (isLeft ? -14 : 14) * sizeScale, ry + boxH + 20 * sizeScale);
  ctx.lineTo(tailX + 12 * sizeScale, ry + boxH - 4);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = Math.max(5, Math.round(7 * sizeScale));
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // Notification Dot on Corner
  ctx.beginPath();
  ctx.arc(rx + textW - 8, ry + 6, Math.round(11 * sizeScale), 0, Math.PI * 2);
  ctx.fillStyle = '#FACC15';
  ctx.fill();
  ctx.lineWidth = Math.max(4, Math.round(5 * sizeScale));
  ctx.strokeStyle = '#09090B';
  ctx.stroke();

  // EP Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;
  ctx.strokeStyle = '#09090B';
  ctx.lineWidth = Math.max(4, Math.round(6 * sizeScale));
  ctx.strokeText(epText, 0, 2);
  ctx.fillText(epText, 0, 2);

  ctx.restore();
}

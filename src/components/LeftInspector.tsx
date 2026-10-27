import React from 'react';
import {
  CustomPhaseColors,
  getThemeDefaultColors,
  LogoConfig,
  MOTION_PHYSICS_PRESETS,
  MotionPhysicsConfig,
  MotionPresetId,
  ThemeId,
} from '../types/motion';
import { TextLayersSection } from './left-inspector/TextLayersSection';
import { MotionSpringSection } from './left-inspector/MotionSpringSection';
import { EpBadgeSection } from './left-inspector/EpBadgeSection';
import { PhaseColorStudioSection } from './left-inspector/PhaseColorStudioSection';
import { PositionScaleSection } from './left-inspector/PositionScaleSection';

export interface LeftInspectorProps {
  config: LogoConfig;
  onChange: (updater: (prev: LogoConfig) => LogoConfig) => void;
}

export const LeftInspector: React.FC<LeftInspectorProps> = ({ config, onChange }) => {
  const updateField = <K extends keyof LogoConfig>(key: K, value: LogoConfig[K]) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const updateCustomColor = <K extends keyof CustomPhaseColors>(
    key: K,
    hex: CustomPhaseColors[K]
  ) => {
    onChange((prev) => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [key]: hex,
      },
    }));
  };

  const updatePhysics = <K extends keyof MotionPhysicsConfig>(
    key: K,
    value: MotionPhysicsConfig[K]
  ) => {
    onChange((prev) => ({
      ...prev,
      physics: {
        ...prev.physics,
        [key]: value,
      },
    }));
  };

  const handleSelectPhysicsPreset = (presetId: MotionPresetId) => {
    const preset = MOTION_PHYSICS_PRESETS[presetId];
    onChange((prev) => ({
      ...prev,
      physics: {
        ...prev.physics,
        preset: presetId,
        stiffness: preset.stiffness,
        damping: preset.damping,
        staggerDelay: preset.staggerDelay,
      },
    }));
  };

  const handleSelectBaseTheme = (themeId: ThemeId) => {
    const defaultColors = getThemeDefaultColors(themeId);
    onChange((prev) => ({
      ...prev,
      themeId,
      customColors: defaultColors,
    }));
  };

  const handleResetPhaseColorsToTheme = () => {
    const defaultColors = getThemeDefaultColors(config.themeId);
    onChange((prev) => ({
      ...prev,
      customColors: defaultColors,
    }));
  };

  const handleRandomizePhaseColors = () => {
    const randHex = (hMin: number, hMax: number, s: number, l: number) => {
      const h = Math.floor(hMin + Math.random() * (hMax - hMin)) % 360;
      const lNorm = l / 100;
      const a = (s * Math.min(lNorm, 1 - lNorm)) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };

    const baseHue = Math.floor(Math.random() * 360);
    onChange((prev) => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        channelTextFill: randHex(baseHue, baseHue + 35, 96, 78),
        channelTextStroke: randHex(baseHue + 150, baseHue + 200, 90, 44),
        rankFill: randHex(baseHue, baseHue + 30, 95, 60),
        rankSecondary: randHex(baseHue + 140, baseHue + 190, 92, 56),
        rankWaveAccent: randHex(baseHue + 210, baseHue + 260, 92, 55),
        topTextFill: '#FFFFFF',
        epBubbleFill: randHex(baseHue + 160, baseHue + 210, 90, 54),
        epBubbleText: '#FFFFFF',
        bannerTextFill: randHex(baseHue, baseHue + 40, 96, 82),
        bannerBgStart: randHex(baseHue + 180, baseHue + 230, 82, 28),
        bannerBgEnd: randHex(baseHue + 180, baseHue + 230, 86, 12),
        bannerBorder: randHex(baseHue, baseHue + 35, 95, 58),
        bulbColorOn: randHex(baseHue, baseHue + 40, 98, 68),
        bottomTextFill: randHex(baseHue + 15, baseHue + 55, 96, 62),
        bottomTextSecondary: randHex(baseHue + 55, baseHue + 95, 94, 52),
        bottomTextStroke: randHex(baseHue + 170, baseHue + 220, 88, 38),
        sunburstA: randHex(baseHue + 180, baseHue + 240, 75, 24),
        sunburstB: randHex(baseHue + 180, baseHue + 240, 80, 8),
      },
    }));
  };

  const handleResetPosition = () => {
    updateField('logoScale', 1.0);
    updateField('logoVerticalOffset', 0);
  };

  return (
    <aside className="relative w-full lg:w-[350px] xl:w-[380px] shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Section 1: Stacked Text Controls */}
        <TextLayersSection
          config={config}
          updateField={updateField}
          updateCustomColor={updateCustomColor}
        />

        {/* Section 2: 7-Figure Motion Physics Engine Tuner */}
        <MotionSpringSection
          physics={config.physics}
          updatePhysics={updatePhysics}
          onSelectPhysicsPreset={handleSelectPhysicsPreset}
        />

        {/* Section 3: EP Message Pop Badge */}
        <EpBadgeSection
          config={config}
          updateField={updateField}
          updateCustomColor={updateCustomColor}
        />

        {/* Section 4: Per-Phase Full Spectrum Color Studio & Base Theme Templates */}
        <PhaseColorStudioSection
          config={config}
          updateCustomColor={updateCustomColor}
          onSelectBaseTheme={handleSelectBaseTheme}
          onResetPhaseColorsToTheme={handleResetPhaseColorsToTheme}
          onRandomizePhaseColors={handleRandomizePhaseColors}
        />

        {/* Section 5: Position & Scale inside Vertical Video */}
        <PositionScaleSection
          logoScale={config.logoScale}
          logoVerticalOffset={config.logoVerticalOffset}
          updateField={updateField}
          onResetPosition={handleResetPosition}
        />
      </div>
    </aside>
  );
};

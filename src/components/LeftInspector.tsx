import React, { useState } from 'react';
import {
  BannerStyle,
  COLOR_THEMES,
  CustomPhaseColors,
  EpBadgePosition,
  getThemeDefaultColors,
  LogoConfig,
  MOTION_PHYSICS_PRESETS,
  MotionPhysicsConfig,
  MotionPresetId,
  NumberTextureMode,
  ThemeId,
} from '../types/motion';
import {
  Type,
  Palette,
  MessageSquare,
  Sliders,
  Gauge,
  Minus,
  Plus,
  RotateCcw,
  Shuffle,
} from 'lucide-react';

interface LeftInspectorProps {
  config: LogoConfig;
  onChange: (updater: (prev: LogoConfig) => LogoConfig) => void;
}

type ColorPhaseTabId = 'phase1' | 'phase2' | 'phase3' | 'phase4';

interface FontSizeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  onChange: (nextVal: number) => void;
}

const FontSizeControl: React.FC<FontSizeControlProps> = ({
  label,
  value,
  min,
  max,
  step = 2,
  defaultValue,
  onChange,
}) => {
  const clamp = (val: number) => Math.min(max, Math.max(min, val));
  return (
    <div className="bg-slate-900/75 px-2.5 py-2 rounded-lg border border-slate-800/90 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-300 font-medium truncate">{label}</span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onChange(clamp(value - step * 2))}
            disabled={value <= min}
            title="ลดขนาด"
            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center text-slate-200 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            title="คลิกเพื่อรีเซ็ตขนาดมาตรฐาน"
            className="min-w-[44px] text-center font-mono text-xs font-semibold text-amber-300 hover:text-amber-200 tabular-nums"
          >
            {value}px
          </button>
          <button
            type="button"
            onClick={() => onChange(clamp(value + step * 2))}
            disabled={value >= max}
            title="เพิ่มขนาด"
            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center text-slate-200 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-amber-400 cursor-pointer"
      />
    </div>
  );
};

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  const safeHex = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#FACC15';
  return (
    <div className="flex items-center justify-between gap-2 bg-slate-900/85 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
      <label className="text-xs text-slate-300 font-medium truncate cursor-pointer flex-1">
        {label}
      </label>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="text"
          maxLength={7}
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (v.startsWith('#') && v.length <= 7) {
              onChange(v.toUpperCase());
            } else if (!v.startsWith('#') && v.length <= 6) {
              onChange(`#${v.toUpperCase()}`);
            }
          }}
          className="w-[66px] px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-slate-200 uppercase text-center focus:outline-none focus:border-amber-400 tabular-nums"
        />
        <label className="relative w-6 h-6 rounded-md overflow-hidden border border-slate-600 cursor-pointer shrink-0 shadow-inner">
          <input
            type="color"
            value={safeHex}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
          />
          <span
            className="block w-full h-full"
            style={{ backgroundColor: safeHex }}
          />
        </label>
      </div>
    </div>
  );
};

export const LeftInspector: React.FC<LeftInspectorProps> = ({ config, onChange }) => {
  const [activeColorPhase, setActiveColorPhase] = useState<ColorPhaseTabId>('phase1');

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

  return (
    <aside className="relative w-full lg:w-[350px] xl:w-[380px] shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Section 1: Stacked Text Controls */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-400 shrink-0" />
              <h2 className="text-sm font-bold text-slate-100">
                1. โครงสร้างข้อความโลโก้ (Stacked Layout)
              </h2>
            </div>
            <span className="text-xs text-slate-400">ปรับขนาด & สีอิสระ</span>
          </div>

          {/* Layer 0: Channel Title ("เรียงเรื่องลั่น" Overhead Stamp Drop) */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/35">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-amber-300 truncate">
                  ชื่อช่องด้านบน (พุ่งตกทีละตัวแบบตัวปั๊ม)
                </div>
                <div className="text-[11px] text-slate-400">
                  วางเหนือคำว่า 5 อันดับ · ไล่จังหวะทีละตัวอักษร
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={config.channelEnabled}
                  onChange={(e) => updateField('channelEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all relative peer-checked:bg-amber-400" />
              </label>
            </div>

            {config.channelEnabled && (
              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ข้อความชื่อช่อง (เช่น เรียงเรื่องลั่น)
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={config.channelText}
                    onChange={(e) => updateField('channelText', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-amber-500/50 rounded-lg text-sm font-bold text-amber-200 focus:outline-none focus:border-amber-400"
                    placeholder="เรียงเรื่องลั่น"
                  />
                </div>

                <FontSizeControl
                  label="ขนาดชื่อช่องด้านบน"
                  value={config.channelTextSize}
                  min={32}
                  max={96}
                  step={2}
                  defaultValue={54}
                  onChange={(val) => updateField('channelTextSize', val)}
                />

                <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                  <ColorPickerField
                    label='สีตัวอักษรชื่อช่อง ("เรียงเรื่องลั่น")'
                    value={config.customColors.channelTextFill}
                    onChange={(hex) => updateCustomColor('channelTextFill', hex)}
                  />
                  <ColorPickerField
                    label="สีเส้นขอบชื่อช่อง"
                    value={config.customColors.channelTextStroke}
                    onChange={(hex) => updateCustomColor('channelTextStroke', hex)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Layer 1: Top ("5 อันดับ") */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">ชั้นบน (เลขจัดอันดับ + คำนำ)</span>
              <span>0.0 – 0.5s</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">ตัวเลขใหญ่</label>
                <input
                  type="text"
                  maxLength={3}
                  value={config.rankNumber}
                  onChange={(e) => updateField('rankNumber', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400 tabular-nums"
                  placeholder="5"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">ข้อความชั้นบน</label>
                <input
                  type="text"
                  maxLength={14}
                  value={config.topText}
                  onChange={(e) => updateField('topText', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-semibold text-slate-100 focus:outline-none focus:border-amber-400"
                  placeholder="อันดับ"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FontSizeControl
                label="ขนาดตัวเลข"
                value={config.rankNumberSize}
                min={110}
                max={260}
                step={2}
                defaultValue={182}
                onChange={(val) => updateField('rankNumberSize', val)}
              />
              <FontSizeControl
                label="ขนาดคำชั้นบน"
                value={config.topTextSize}
                min={56}
                max={150}
                step={2}
                defaultValue={94}
                onChange={(val) => updateField('topTextSize', val)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-slate-400">เอฟเฟกต์ตัวเลข</label>
                <span className="text-[11px] text-amber-300/90">
                  {config.numberTexture === 'wave_gradient' && 'คลื่นสีไล่ระดับไหลพริ้วในตัวเลข + ไฮไลต์เงาใส'}
                  {config.numberTexture === 'two_tone' && 'ไล่สีทูโทนตัดขอบเงาเมทัลลิกคมชัด'}
                  {config.numberTexture === 'solid_3d' && 'ตัวเลข 3D สีพื้นคลีนคมชัด'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
                {(
                  [
                    { id: 'wave_gradient', label: 'ลูกคลื่น Gradient' },
                    { id: 'two_tone', label: 'ไล่สีทูโทน' },
                    { id: 'solid_3d', label: '3D ทั่วไป' },
                  ] as { id: NumberTextureMode; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateField('numberTexture', item.id)}
                    className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      config.numberTexture === item.id
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Quick Color Pickers for Phase 1 */}
            <div className="pt-1 space-y-1.5">
              <div className="text-[11px] text-slate-400 font-medium">
                จานสีเฟส 1 (เลือกสีได้อิสระทุกเฉด):
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <ColorPickerField
                  label="สีหลักตัวเลข (ส่วนบน)"
                  value={config.customColors.rankFill}
                  onChange={(hex) => updateCustomColor('rankFill', hex)}
                />
                {config.numberTexture !== 'solid_3d' && (
                  <ColorPickerField
                    label={
                      config.numberTexture === 'wave_gradient'
                        ? 'สีคลื่นลูกที่ 1 & เงาคำบน'
                        : 'สีทูโทนส่วนล่าง & เงาคำบน'
                    }
                    value={config.customColors.rankSecondary}
                    onChange={(hex) => updateCustomColor('rankSecondary', hex)}
                  />
                )}
                {config.numberTexture === 'wave_gradient' && (
                  <ColorPickerField
                    label="สีคลื่นลูกที่ 2 (Wave Gradient)"
                    value={config.customColors.rankWaveAccent}
                    onChange={(hex) => updateCustomColor('rankWaveAccent', hex)}
                  />
                )}
                <ColorPickerField
                  label='สีข้อความชั้นบน ("อันดับ")'
                  value={config.customColors.topTextFill}
                  onChange={(hex) => updateCustomColor('topTextFill', hex)}
                />
              </div>
            </div>
          </div>

          {/* Layer 2: Middle Dynamic Banner ("[ ... ]") */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-amber-300">ชั้นกลาง (ป้ายพิมพ์ข้อความ [...])</span>
              <span>0.5 – 1.2s</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                หัวข้อคลิปตลก (เด้งเรียงตัวอักษรไทยอัตโนมัติ)
              </label>
              <input
                type="text"
                maxLength={36}
                value={config.middleText}
                onChange={(e) => updateField('middleText', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-amber-500/50 rounded-lg text-base font-bold text-white focus:outline-none focus:border-amber-400"
                placeholder="พิมพ์ชื่อเรื่อง เช่น เรื่องพีคในวงเหล้า..."
              />
              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
                <span>รวมสระลอยและวรรณยุกต์ไทยเป็นก้อนเดียวเวลาเด้ง</span>
                <span className="font-mono tabular-nums">
                  {Array.from(config.middleText).length}/36
                </span>
              </div>
            </div>

            <FontSizeControl
              label="ขนาดข้อความชั้นกลาง (ป้ายจะขยายตามอัตโนมัติ)"
              value={config.middleTextSize}
              min={42}
              max={116}
              step={2}
              defaultValue={74}
              onChange={(val) => updateField('middleTextSize', val)}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">สไตล์กรอบป้ายกลาง</label>
                <select
                  value={config.bannerStyle}
                  onChange={(e) => updateField('bannerStyle', e.target.value as BannerStyle)}
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="temple_marquee">ป้ายไฟงานวัด</option>
                  <option value="canvas_scroll">ป้ายผ้าใบคลี่กาง</option>
                  <option value="cafe_neon">ป้ายนีออนคาเฟ่</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">ฟอนต์ข้อความกลาง</label>
                <select
                  value={config.middleFont}
                  onChange={(e) =>
                    updateField('middleFont', e.target.value as LogoConfig['middleFont'])
                  }
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Mali">Mali (การ์ตูนหัวกลมกวนๆ)</option>
                  <option value="Itim">Itim (ป้ายร้านค้าอ่านง่าย)</option>
                  <option value="Kanit">Kanit (โมเดิร์นคมชัด)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">ระยะเผื่อสระ/วรรณยุกต์ด้านบน</span>
                <span className="font-mono text-slate-300 tabular-nums">
                  +{config.thaiVowelSafePadding}px
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={52}
                step={2}
                value={config.thaiVowelSafePadding}
                onChange={(e) => updateField('thaiVowelSafePadding', Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Inline Quick Color Pickers for Phase 2 */}
            <div className="pt-1 space-y-1.5">
              <div className="text-[11px] text-slate-400 font-medium">
                จานสีเฟส 2 (ป้ายและข้อความตรงกลาง):
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <ColorPickerField
                  label="สีข้อความในป้ายกลาง"
                  value={config.customColors.bannerTextFill}
                  onChange={(hex) => updateCustomColor('bannerTextFill', hex)}
                />
                <ColorPickerField
                  label="สีพื้นป้ายกลาง (ส่วนบน)"
                  value={config.customColors.bannerBgStart}
                  onChange={(hex) => updateCustomColor('bannerBgStart', hex)}
                />
                <ColorPickerField
                  label="สีพื้นป้ายกลาง (ไล่เฉดส่วนล่าง)"
                  value={config.customColors.bannerBgEnd}
                  onChange={(hex) => updateCustomColor('bannerBgEnd', hex)}
                />
                <ColorPickerField
                  label="สีกรอบป้ายกลาง"
                  value={config.customColors.bannerBorder}
                  onChange={(hex) => updateCustomColor('bannerBorder', hex)}
                />
              </div>
            </div>
          </div>

          {/* Layer 3: Bottom ("สุดฮา") */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">ชั้นล่าง (คำสรุปกระแทกหน้าจอ)</span>
              <span>1.2 – 1.8s</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">ข้อความชั้นล่าง</label>
                <input
                  type="text"
                  maxLength={14}
                  value={config.bottomText}
                  onChange={(e) => updateField('bottomText', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-rose-300 focus:outline-none focus:border-amber-400"
                  placeholder="สุดฮา"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">องศาความเอียง</span>
                  <span className="font-mono text-slate-300 tabular-nums">
                    {config.bottomTiltDeg}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-14}
                  max={14}
                  step={1}
                  value={config.bottomTiltDeg}
                  onChange={(e) => updateField('bottomTiltDeg', Number(e.target.value))}
                  className="w-full mt-2 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <FontSizeControl
              label="ขนาดข้อความชั้นล่าง"
              value={config.bottomTextSize}
              min={70}
              max={170}
              step={2}
              defaultValue={116}
              onChange={(val) => updateField('bottomTextSize', val)}
            />

            {/* Inline Quick Color Pickers for Phase 3 */}
            <div className="pt-1 space-y-1.5">
              <div className="text-[11px] text-slate-400 font-medium">
                จานสีเฟส 3 (คำสรุป "สุดฮา"):
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <ColorPickerField
                  label='สีหลักข้อความล่าง ("สุดฮา")'
                  value={config.customColors.bottomTextFill}
                  onChange={(hex) => updateCustomColor('bottomTextFill', hex)}
                />
                <ColorPickerField
                  label="สีไล่เฉดข้อความล่าง"
                  value={config.customColors.bottomTextSecondary}
                  onChange={(hex) => updateCustomColor('bottomTextSecondary', hex)}
                />
                <ColorPickerField
                  label="สีเส้นขอบข้อความล่าง"
                  value={config.customColors.bottomTextStroke}
                  onChange={(hex) => updateCustomColor('bottomTextStroke', hex)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: 7-Figure Motion Physics Engine Tuner */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400 shrink-0" />
              <h2 className="text-sm font-bold text-slate-100">
                2. ฟิสิกส์การเคลื่อนไหวระดับ 7 หลัก
              </h2>
            </div>
            <span className="text-xs text-emerald-400">Spring Solver</span>
          </div>

          <div className="space-y-2">
            {(Object.keys(MOTION_PHYSICS_PRESETS) as MotionPresetId[]).map((presetKey) => {
              const p = MOTION_PHYSICS_PRESETS[presetKey];
              const isSelected = config.physics.preset === presetKey;
              return (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => handleSelectPhysicsPreset(presetKey)}
                  className={`w-full flex flex-col p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-slate-800/95 border-emerald-400 shadow-sm'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{p.name}</span>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      k:{p.stiffness} · c:{p.damping}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5">{p.subtitle}</span>
                </button>
              );
            })}
          </div>

          {/* Fine-tune Spring Parameters */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">ความตึงสปริง (Stiffness)</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {config.physics.stiffness}
                </span>
              </div>
              <input
                type="range"
                min={140}
                max={420}
                step={10}
                value={config.physics.stiffness}
                onChange={(e) => updatePhysics('stiffness', Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">ความหนืดซับแรง (Damping)</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {config.physics.damping}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={34}
                step={1}
                value={config.physics.damping}
                onChange={(e) => updatePhysics('damping', Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">จังหวะเรียงตัวอักษรไทย (Stagger Delay)</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {(config.physics.staggerDelay * 1000).toFixed(0)}ms
                </span>
              </div>
              <input
                type="range"
                min={0.015}
                max={0.075}
                step={0.005}
                value={config.physics.staggerDelay}
                onChange={(e) => updatePhysics('staggerDelay', Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Section 3: EP Message Pop Badge */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
              <h2 className="text-sm font-bold text-slate-100">
                3. ป้ายตัวเลข EP (Message Pop)
              </h2>
            </div>
            <label className="relative inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.epEnabled}
                onChange={(e) => updateField('epEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all relative peer-checked:bg-sky-500" />
            </label>
          </div>

          {config.epEnabled && (
            <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ข้อความ EP</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={config.epText}
                    onChange={(e) => updateField('epText', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-sky-300 focus:outline-none focus:border-sky-400 tabular-nums"
                    placeholder="EP.01"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ตำแหน่งป้ายเด้ง</label>
                  <select
                    value={config.epPosition}
                    onChange={(e) => updateField('epPosition', e.target.value as EpBadgePosition)}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-sky-400"
                  >
                    <option value="top_right">มุมขวาบน</option>
                    <option value="top_left">มุมซ้ายบน</option>
                    <option value="bottom_right">มุมขวาล่าง</option>
                  </select>
                </div>
              </div>

              <FontSizeControl
                label="ขนาดข้อความและป้าย EP"
                value={config.epTextSize}
                min={24}
                max={60}
                step={2}
                defaultValue={38}
                onChange={(val) => updateField('epTextSize', val)}
              />

              <div className="grid grid-cols-1 gap-1.5">
                <ColorPickerField
                  label="สีพื้นป้าย EP"
                  value={config.customColors.epBubbleFill}
                  onChange={(hex) => updateCustomColor('epBubbleFill', hex)}
                />
                <ColorPickerField
                  label="สีตัวอักษร EP"
                  value={config.customColors.epBubbleText}
                  onChange={(hex) => updateCustomColor('epBubbleText', hex)}
                />
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Per-Phase Full Spectrum Color Studio & Base Theme Templates */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-rose-400 shrink-0" />
              <h2 className="text-sm font-bold text-slate-100">
                4. สตูดิโอผสมสีแยกตามเฟส (Phase Color Mixer)
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRandomizePhaseColors}
                title="สุ่มคู่สีใหม่ทุกเฟส"
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-amber-300 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
              >
                <Shuffle className="w-3 h-3" />
                <span>สุ่มสี</span>
              </button>
              <button
                type="button"
                onClick={handleResetPhaseColorsToTheme}
                title="รีเซ็ตสีตามธีมตั้งต้น"
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>รีเซ็ต</span>
              </button>
            </div>
          </div>

          {/* Phase Selector Tabs for Full Color Customization */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-3">
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              {(
                [
                  { id: 'phase1', label: 'เฟส 1 บน' },
                  { id: 'phase2', label: 'เฟส 2 กลาง' },
                  { id: 'phase3', label: 'เฟส 3 ล่าง' },
                  { id: 'phase4', label: 'ฉากหลัง' },
                ] as { id: ColorPhaseTabId; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveColorPhase(tab.id)}
                  className={`px-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    activeColorPhase === tab.id
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeColorPhase === 'phase1' && (
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400 mb-1">
                  เฟส 1 (0.0 – 0.5s): ชื่อช่อง "เรียงเรื่องลั่น" เลขจัดอันดับ คำนำ & ป้าย EP
                </div>
                <ColorPickerField
                  label='สีตัวอักษรชื่อช่อง ("เรียงเรื่องลั่น")'
                  value={config.customColors.channelTextFill}
                  onChange={(hex) => updateCustomColor('channelTextFill', hex)}
                />
                <ColorPickerField
                  label="สีเส้นขอบชื่อช่อง"
                  value={config.customColors.channelTextStroke}
                  onChange={(hex) => updateCustomColor('channelTextStroke', hex)}
                />
                <ColorPickerField
                  label="สีหลักตัวเลข"
                  value={config.customColors.rankFill}
                  onChange={(hex) => updateCustomColor('rankFill', hex)}
                />
                <ColorPickerField
                  label="สีคลื่นลูกที่ 1 / ทูโทนล่าง"
                  value={config.customColors.rankSecondary}
                  onChange={(hex) => updateCustomColor('rankSecondary', hex)}
                />
                <ColorPickerField
                  label="สีคลื่นลูกที่ 2 (Wave Gradient)"
                  value={config.customColors.rankWaveAccent}
                  onChange={(hex) => updateCustomColor('rankWaveAccent', hex)}
                />
                <ColorPickerField
                  label="สีความลึก 3D ตัวเลข"
                  value={config.customColors.rankExtrude}
                  onChange={(hex) => updateCustomColor('rankExtrude', hex)}
                />
                <ColorPickerField
                  label='สีคำนำชั้นบน ("อันดับ")'
                  value={config.customColors.topTextFill}
                  onChange={(hex) => updateCustomColor('topTextFill', hex)}
                />
                <ColorPickerField
                  label="สีป้าย EP"
                  value={config.customColors.epBubbleFill}
                  onChange={(hex) => updateCustomColor('epBubbleFill', hex)}
                />
                <ColorPickerField
                  label="สีตัวอักษรในป้าย EP"
                  value={config.customColors.epBubbleText}
                  onChange={(hex) => updateCustomColor('epBubbleText', hex)}
                />
              </div>
            )}

            {activeColorPhase === 'phase2' && (
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400 mb-1">
                  เฟส 2 (0.5 – 1.2s): ป้ายข้อความตรงกลาง กรอบป้าย & หลอดไฟวิ่ง
                </div>
                <ColorPickerField
                  label="สีข้อความในป้ายกลาง"
                  value={config.customColors.bannerTextFill}
                  onChange={(hex) => updateCustomColor('bannerTextFill', hex)}
                />
                <ColorPickerField
                  label="สีพื้นป้ายกลาง (ส่วนบน)"
                  value={config.customColors.bannerBgStart}
                  onChange={(hex) => updateCustomColor('bannerBgStart', hex)}
                />
                <ColorPickerField
                  label="สีพื้นป้ายกลาง (ไล่เฉดส่วนล่าง)"
                  value={config.customColors.bannerBgEnd}
                  onChange={(hex) => updateCustomColor('bannerBgEnd', hex)}
                />
                <ColorPickerField
                  label="สีกรอบป้ายกลาง"
                  value={config.customColors.bannerBorder}
                  onChange={(hex) => updateCustomColor('bannerBorder', hex)}
                />
                <ColorPickerField
                  label="สีหลอดไฟงานวัด (ตอนสว่าง)"
                  value={config.customColors.bulbColorOn}
                  onChange={(hex) => updateCustomColor('bulbColorOn', hex)}
                />
                <ColorPickerField
                  label="สีหลอดไฟงานวัด (ตอนสลัว)"
                  value={config.customColors.bulbColorOff}
                  onChange={(hex) => updateCustomColor('bulbColorOff', hex)}
                />
              </div>
            )}

            {activeColorPhase === 'phase3' && (
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400 mb-1">
                  เฟส 3 (1.2 – 1.8s): คำสรุปกระแทกหน้าจอ ("สุดฮา")
                </div>
                <ColorPickerField
                  label='สีหลักข้อความล่าง ("สุดฮา")'
                  value={config.customColors.bottomTextFill}
                  onChange={(hex) => updateCustomColor('bottomTextFill', hex)}
                />
                <ColorPickerField
                  label='สีไล่เฉดข้อความล่าง ("สุดฮา")'
                  value={config.customColors.bottomTextSecondary}
                  onChange={(hex) => updateCustomColor('bottomTextSecondary', hex)}
                />
                <ColorPickerField
                  label="สีเส้นขอบข้อความล่าง"
                  value={config.customColors.bottomTextStroke}
                  onChange={(hex) => updateCustomColor('bottomTextStroke', hex)}
                />
                <ColorPickerField
                  label="สีความลึก 3D ข้อความล่าง"
                  value={config.customColors.bottomExtrude}
                  onChange={(hex) => updateCustomColor('bottomExtrude', hex)}
                />
              </div>
            )}

            {activeColorPhase === 'phase4' && (
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400 mb-1">
                  ฉากหลัง (Sunburst Backdrop): สีรัศมีหมุนด้านหลังโลโก้
                </div>
                <ColorPickerField
                  label="สีรัศมีฉากหลังที่ 1 (โทนสว่าง)"
                  value={config.customColors.sunburstA}
                  onChange={(hex) => updateCustomColor('sunburstA', hex)}
                />
                <ColorPickerField
                  label="สีรัศมีฉากหลังที่ 2 (โทนมืด)"
                  value={config.customColors.sunburstB}
                  onChange={(hex) => updateCustomColor('sunburstB', hex)}
                />
              </div>
            )}
          </div>

          {/* Starter Theme Templates */}
          <div className="space-y-1.5 pt-1">
            <div className="text-xs text-slate-400">
              โทนสีตั้งต้น (คลิกเพื่อโหลดเป็นฐานสี แล้วปรับแยกเฟสต่อได้ทันที):
            </div>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(COLOR_THEMES) as ThemeId[]).map((tId) => {
                const t = COLOR_THEMES[tId];
                const isSelected = config.themeId === tId;
                return (
                  <button
                    key={tId}
                    type="button"
                    onClick={() => handleSelectBaseTheme(tId)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-400 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-slate-100 truncate">{t.name}</div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">{t.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-950"
                        style={{ backgroundColor: t.rankFill }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-slate-950"
                        style={{ backgroundColor: t.rankSecondary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-slate-950"
                        style={{ backgroundColor: t.bannerBgStart }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-slate-950"
                        style={{ backgroundColor: t.bottomTextStroke }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 5: Position & Scale inside Vertical Video */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
              <h2 className="text-sm font-bold text-slate-100">
                5. ขนาดและตำแหน่งจัดวางในคลิป
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                updateField('logoScale', 1.0);
                updateField('logoVerticalOffset', 0);
              }}
              className="text-xs text-slate-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
            >
              รีเซ็ตตรงกลาง
            </button>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">ขนาดโลโก้ (Scale)</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {Math.round(config.logoScale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.65}
                max={1.3}
                step={0.05}
                value={config.logoScale}
                onChange={(e) => updateField('logoScale', Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">ตำแหน่งแนวตั้ง (Y-Offset)</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {config.logoVerticalOffset > 0
                    ? `+${config.logoVerticalOffset}px`
                    : `${config.logoVerticalOffset}px`}
                </span>
              </div>
              <input
                type="range"
                min={-320}
                max={320}
                step={10}
                value={config.logoVerticalOffset}
                onChange={(e) => updateField('logoVerticalOffset', Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
};

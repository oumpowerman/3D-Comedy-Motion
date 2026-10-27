import React, { useState } from 'react';
import {
  COLOR_THEMES,
  CustomPhaseColors,
  LogoConfig,
  ThemeId,
} from '../../types/motion';
import { ColorPickerField } from './LeftInspectorPrimitives';
import { Palette, RotateCcw, Shuffle } from 'lucide-react';

export type ColorPhaseTabId = 'phase1' | 'phase2' | 'phase3' | 'phase4';

export interface PhaseColorStudioSectionProps {
  config: LogoConfig;
  updateCustomColor: <K extends keyof CustomPhaseColors>(
    key: K,
    hex: CustomPhaseColors[K]
  ) => void;
  onSelectBaseTheme: (themeId: ThemeId) => void;
  onResetPhaseColorsToTheme: () => void;
  onRandomizePhaseColors: () => void;
}

export const PhaseColorStudioSection: React.FC<PhaseColorStudioSectionProps> = ({
  config,
  updateCustomColor,
  onSelectBaseTheme,
  onResetPhaseColorsToTheme,
  onRandomizePhaseColors,
}) => {
  const [activeColorPhase, setActiveColorPhase] = useState<ColorPhaseTabId>('phase1');

  return (
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
            onClick={onRandomizePhaseColors}
            title="สุ่มคู่สีใหม่ทุกเฟส"
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-amber-300 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
          >
            <Shuffle className="w-3 h-3" />
            <span>สุ่มสี</span>
          </button>
          <button
            type="button"
            onClick={onResetPhaseColorsToTheme}
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
                onClick={() => onSelectBaseTheme(tId)}
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
  );
};

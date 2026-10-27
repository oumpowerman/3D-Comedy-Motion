import React from 'react';
import { CustomPhaseColors, EpBadgePosition, LogoConfig } from '../../types/motion';
import { ColorPickerField, FontSizeControl } from './LeftInspectorPrimitives';
import { MessageSquare } from 'lucide-react';

export interface EpBadgeSectionProps {
  config: LogoConfig;
  updateField: <K extends keyof LogoConfig>(key: K, value: LogoConfig[K]) => void;
  updateCustomColor: <K extends keyof CustomPhaseColors>(
    key: K,
    hex: CustomPhaseColors[K]
  ) => void;
}

export const EpBadgeSection: React.FC<EpBadgeSectionProps> = ({
  config,
  updateField,
  updateCustomColor,
}) => {
  return (
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
  );
};

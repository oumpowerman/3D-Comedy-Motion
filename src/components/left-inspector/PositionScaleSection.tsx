import React from 'react';
import { LogoConfig } from '../../types/motion';
import { Sliders } from 'lucide-react';

export interface PositionScaleSectionProps {
  logoScale: number;
  logoVerticalOffset: number;
  updateField: <K extends keyof LogoConfig>(key: K, value: LogoConfig[K]) => void;
  onResetPosition: () => void;
}

export const PositionScaleSection: React.FC<PositionScaleSectionProps> = ({
  logoScale,
  logoVerticalOffset,
  updateField,
  onResetPosition,
}) => {
  return (
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
          onClick={onResetPosition}
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
              {Math.round(logoScale * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.65}
            max={1.3}
            step={0.05}
            value={logoScale}
            onChange={(e) => updateField('logoScale', Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">ตำแหน่งแนวตั้ง (Y-Offset)</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {logoVerticalOffset > 0
                ? `+${logoVerticalOffset}px`
                : `${logoVerticalOffset}px`}
            </span>
          </div>
          <input
            type="range"
            min={-320}
            max={320}
            step={10}
            value={logoVerticalOffset}
            onChange={(e) => updateField('logoVerticalOffset', Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
};

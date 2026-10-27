import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface FontSizeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  onChange: (nextVal: number) => void;
}

export const FontSizeControl: React.FC<FontSizeControlProps> = ({
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

export interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
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

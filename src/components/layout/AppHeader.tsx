import React from 'react';
import { SavedCustomPreset } from '../../utils/presetStorage';

export interface AppHeaderProps {
  presets: SavedCustomPreset[];
  activePresetId: string | null;
  currentMiddleText: string;
  isRecording: boolean;
  recordingProgress: number;
  onApplyPreset: (preset: SavedCustomPreset) => void;
  onRestart: () => void;
  onExportMov: (forceTransparent: boolean) => void;
}

export function AppHeader({
  presets,
  activePresetId,
  currentMiddleText,
  isRecording,
  recordingProgress,
  onApplyPreset,
  onRestart,
  onExportMov,
}: AppHeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between gap-8 px-6 bg-slate-900 border-b border-slate-800 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onRestart();
        }}
        className="text-lg font-bold tracking-tight text-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
      >
        ฮาจัดสตูดิโอ
      </a>

      {/* Zone 2: Top 4 editable user presets as single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        {presets.slice(0, 4).map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApplyPreset(preset)}
            className={`hover:text-amber-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              activePresetId === preset.id ||
              currentMiddleText === preset.config.middleText
                ? 'text-amber-400 font-semibold'
                : ''
            }`}
          >
            {preset.name}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1 primary action (One-Click Transparent .MOV Download) */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          disabled={isRecording}
          onClick={() => onExportMov(true)}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          {isRecording
            ? `กำลังเรนเดอร์ ${Math.round(recordingProgress * 100)}%`
            : 'ดาวน์โหลด .MOV (ไม่มีพื้นหลัง)'}
        </button>
      </div>
    </header>
  );
}

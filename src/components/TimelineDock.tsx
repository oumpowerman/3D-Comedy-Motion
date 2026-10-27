import React from 'react';
import { LoopMode, TIMELINE_PHASES, TimelinePhase } from '../types/motion';
import { Play, Pause, RotateCcw, Repeat, Volume2 } from 'lucide-react';

interface TimelineDockProps {
  currentTime: number;
  isPlaying: boolean;
  loopMode: LoopMode;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onRestart: () => void;
  onChangeLoopMode: (mode: LoopMode) => void;
}

export const TimelineDock: React.FC<TimelineDockProps> = ({
  currentTime,
  isPlaying,
  loopMode,
  onTogglePlay,
  onSeek,
  onRestart,
  onChangeLoopMode,
}) => {
  const activePhase: TimelinePhase =
    TIMELINE_PHASES.find(
      (p) => currentTime >= p.startTime && currentTime <= p.endTime
    ) || TIMELINE_PHASES[0];

  return (
    <div className="w-full h-[140px] bg-slate-900 border-t border-slate-800 px-5 shrink-0 overflow-hidden flex flex-col justify-center">
      <div className="max-w-5xl w-full mx-auto space-y-2.5">
        {/* Row 1: Fixed-Height Playback Controls + Phase Buttons + Loop Switch */}
        <div className="h-9 flex items-center justify-between gap-3 flex-nowrap overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onTogglePlay}
              className="h-8 px-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>หยุดชั่วคราว</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>เล่นอนิเมชั่น</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onRestart}
              className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-colors shrink-0"
              title="เริ่มเล่นใหม่ตั้งแต่ 0.0s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-8 px-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 tabular-nums flex items-center whitespace-nowrap shrink-0">
              <span className="text-amber-400 font-bold">{currentTime.toFixed(2)}s</span>
              <span className="text-slate-500 ml-1">/ 4.00s</span>
            </div>
          </div>

          {/* Phase Quick-Jump Buttons (Single-line horizontal scroll if narrow) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
            {TIMELINE_PHASES.map((phase) => {
              const isActive = activePhase.id === phase.id;
              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => onSeek(phase.startTime + 0.05)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 border-amber-400 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: phase.accentColor }}
                  />
                  <span className="font-mono tabular-nums">{phase.timeRange}</span>
                  <span className="hidden xl:inline">{phase.title}</span>
                </button>
              );
            })}
          </div>

          {/* Loop Mode Switch */}
          <div className="h-8 flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => onChangeLoopMode('full_4s')}
              className={`h-6 px-2.5 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                loopMode === 'full_4s'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              วนลูป 4.0s
            </button>
            <button
              type="button"
              onClick={() => onChangeLoopMode('hold_loop')}
              className={`h-6 px-2.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                loopMode === 'hold_loop'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Repeat className="w-3 h-3" />
              <span>ค้างโชว์</span>
            </button>
          </div>
        </div>

        {/* Row 2: Fixed-Height Interactive Multi-Segment Timeline Scrubber Bar */}
        <div className="relative h-5 flex items-center">
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            {TIMELINE_PHASES.map((phase) => {
              const widthPct = ((phase.endTime - phase.startTime) / 4.0) * 100;
              return (
                <div
                  key={phase.id}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: phase.accentColor,
                    opacity: activePhase.id === phase.id ? 0.85 : 0.28,
                  }}
                  className="h-full border-r border-slate-950 last:border-r-0 transition-opacity"
                />
              );
            })}
          </div>

          <input
            type="range"
            min={0}
            max={4}
            step={0.01}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Timeline Scrubber"
          />

          <div
            className="pointer-events-none absolute top-0 bottom-0 w-4 -ml-2 flex flex-col items-center justify-center"
            style={{ left: `${(currentTime / 4.0) * 100}%` }}
          >
            <div className="w-3.5 h-4.5 rounded bg-white border-2 border-slate-950 shadow" />
          </div>
        </div>

        {/* Row 3: Locked Single-Line Phase Details Strip (Zero Height Reflow) */}
        <div
          className="h-9 flex items-center justify-between gap-4 px-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs overflow-hidden"
          title={`${activePhase.layerDesc} — ${activePhase.motionDesc}`}
        >
          <div className="flex items-center gap-2 text-slate-300 min-w-0 flex-1 overflow-hidden whitespace-nowrap">
            <span className="font-bold text-amber-300 shrink-0 tabular-nums">
              ช่วงที่ {activePhase.index} ({activePhase.timeRange})
            </span>
            <span aria-hidden="true" className="text-slate-600 shrink-0">
              ·
            </span>
            <span className="font-semibold text-slate-100 shrink-0">
              {activePhase.layerDesc}
            </span>
            <span aria-hidden="true" className="text-slate-600 shrink-0">
              ·
            </span>
            <span className="text-slate-400 truncate min-w-0 flex-1">
              {activePhase.motionDesc}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-300 font-medium whitespace-nowrap shrink-0">
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span>{activePhase.sfxDesc}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

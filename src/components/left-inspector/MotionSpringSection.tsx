import React from 'react';
import {
  MOTION_PHYSICS_PRESETS,
  MotionPhysicsConfig,
  MotionPresetId,
} from '../../types/motion';
import { Gauge } from 'lucide-react';

export interface MotionSpringSectionProps {
  physics: MotionPhysicsConfig;
  updatePhysics: <K extends keyof MotionPhysicsConfig>(
    key: K,
    value: MotionPhysicsConfig[K]
  ) => void;
  onSelectPhysicsPreset: (presetId: MotionPresetId) => void;
}

export const MotionSpringSection: React.FC<MotionSpringSectionProps> = ({
  physics,
  updatePhysics,
  onSelectPhysicsPreset,
}) => {
  return (
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
          const isSelected = physics.preset === presetKey;
          return (
            <button
              key={presetKey}
              type="button"
              onClick={() => onSelectPhysicsPreset(presetKey)}
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
              {physics.stiffness}
            </span>
          </div>
          <input
            type="range"
            min={140}
            max={420}
            step={10}
            value={physics.stiffness}
            onChange={(e) => updatePhysics('stiffness', Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">ความหนืดซับแรง (Damping)</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {physics.damping}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={34}
            step={1}
            value={physics.damping}
            onChange={(e) => updatePhysics('damping', Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">จังหวะเรียงตัวอักษรไทย (Stagger Delay)</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {(physics.staggerDelay * 1000).toFixed(0)}ms
            </span>
          </div>
          <input
            type="range"
            min={0.015}
            max={0.075}
            step={0.005}
            value={physics.staggerDelay}
            onChange={(e) => updatePhysics('staggerDelay', Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
};

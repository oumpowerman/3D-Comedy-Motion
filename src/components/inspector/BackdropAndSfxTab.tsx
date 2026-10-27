import React from 'react';
import { motion } from 'motion/react';
import {
  AspectRatioMode,
  BackgroundMode,
  SfxConfig,
} from '../../types/motion';
import { soundEngine } from '../../utils/soundEngine';
import {
  cardItemVariants,
  InspectorSectionHeader,
  tabPanelVariants,
} from './InspectorPrimitives';
import {
  Smartphone,
  Monitor,
  Square,
  Volume2,
  VolumeX,
  Play,
} from 'lucide-react';

export interface BackdropAndSfxTabProps {
  aspectRatio: AspectRatioMode;
  bgMode: BackgroundMode;
  sfxConfig: SfxConfig;
  onChangeAspectRatio: (ar: AspectRatioMode) => void;
  onChangeBgMode: (bg: BackgroundMode) => void;
  onUpdateSfx: <K extends keyof SfxConfig>(key: K, value: SfxConfig[K]) => void;
}

export const BackdropAndSfxTab: React.FC<BackdropAndSfxTabProps> = ({
  aspectRatio,
  bgMode,
  sfxConfig,
  onChangeAspectRatio,
  onChangeBgMode,
  onUpdateSfx,
}) => {
  const sfxItems: {
    key: keyof Omit<SfxConfig, 'masterEnabled' | 'masterVolume'>;
    time: string;
    label: string;
    testFn: () => void;
  }[] = [
    {
      key: 'phase1Boing',
      time: '0.0s',
      label: 'ฟึ่บ! + เด้งดึ๋ง (Boing)',
      testFn: () => soundEngine.playPhase1Boing(),
    },
    {
      key: 'phase2UnrollPop',
      time: '0.5s',
      label: 'รูดป้ายผ้า + ป๊อป (Pop!)',
      testFn: () => soundEngine.playPhase2UnrollPop(),
    },
    {
      key: 'phase3TraySmash',
      time: '1.2s',
      label: 'ตีถาดสังกะสี (ป๊าบ!)',
      testFn: () => soundEngine.playPhase3TraySmash(),
    },
    {
      key: 'phase4DrumJoke',
      time: '1.8s',
      label: 'กลองตบมุก (ตึง โป๊ะ!)',
      testFn: () => soundEngine.playPhase4DrumJoke(),
    },
    {
      key: 'phase5SwooshOut',
      time: '3.5s',
      label: 'ดูดรวบแตกดาวกระจาย',
      testFn: () => soundEngine.playPhase5SwooshOut(),
    },
  ];

  return (
    <motion.div
      variants={tabPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-5"
    >
      {/* Aspect Ratio Selector with Sliding Active Pill */}
      <motion.section variants={cardItemVariants} className="space-y-2">
        <label className="block text-xs font-bold text-slate-200">
          1. สัดส่วนหน้าจอวิดีโอ (Aspect Ratio)
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 relative">
          {(
            [
              { id: '9:16', label: '9:16 แนวตั้ง', icon: Smartphone },
              { id: '16:9', label: '16:9 แนวนอน', icon: Monitor },
              { id: '1:1', label: '1:1 จัตุรัส', icon: Square },
            ] as {
              id: AspectRatioMode;
              label: string;
              icon: React.FC<{ className?: string }>;
            }[]
          ).map((ar) => {
            const Icon = ar.icon;
            const active = aspectRatio === ar.id;
            return (
              <button
                key={ar.id}
                type="button"
                onClick={() => onChangeAspectRatio(ar.id)}
                className={`relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 z-10 ${
                  active
                    ? 'text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeAspectRatioIndicator"
                    className="absolute inset-0 bg-sky-500 rounded-lg -z-10"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{ar.label}</span>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* Background Mode Selector Cards */}
      <motion.section variants={cardItemVariants} className="space-y-2">
        <label className="block text-xs font-bold text-slate-200">
          2. พื้นหลังพรีวิวและส่งออก (Background Mode)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                id: 'transparent',
                label: 'ไม่มีพื้นหลัง (โปร่งใส)',
                swatch:
                  'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:6px_6px] bg-slate-800',
              },
              {
                id: 'sunburst',
                label: 'รัศมีงานวัดหมุน',
                swatch: 'bg-amber-500',
              },
              {
                id: 'green',
                label: 'Green Screen',
                swatch: 'bg-[#00FF00]',
              },
              {
                id: 'blue',
                label: 'Blue Screen',
                swatch: 'bg-[#0000FF]',
              },
            ] as { id: BackgroundMode; label: string; swatch: string }[]
          ).map((bg) => (
            <motion.button
              key={bg.id}
              variants={cardItemVariants}
              whileHover={{ y: -2, scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onChangeBgMode(bg.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                bgMode === bg.id
                  ? 'bg-slate-800 border-amber-400 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border border-slate-950 shrink-0 ${bg.swatch}`}
              />
              <span className="truncate">{bg.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Comedy Sound Effects (SFX) Staggered Cards */}
      <motion.section
        variants={cardItemVariants}
        className="space-y-2.5 pt-2 border-t border-slate-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {sfxConfig.masterEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <h3 className="text-xs font-bold text-slate-100">
              3. เสียงเอฟเฟกต์ตบมุกอัตโนมัติ (SFX)
            </h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sfxConfig.masterEnabled}
              onChange={(e) => onUpdateSfx('masterEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all relative peer-checked:bg-emerald-500" />
          </label>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 whitespace-nowrap">
              ระดับเสียงรวม
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={sfxConfig.masterVolume}
              onChange={(e) => {
                const v = Number(e.target.value);
                onUpdateSfx('masterVolume', v);
                soundEngine.setVolume(v);
              }}
              className="flex-1 accent-emerald-400 cursor-pointer"
            />
            <span className="font-mono text-xs text-slate-200 tabular-nums w-9 text-right">
              {Math.round(sfxConfig.masterVolume * 100)}%
            </span>
          </div>

          <div className="space-y-1.5">
            {sfxItems.map((sfxItem) => (
              <motion.div
                key={sfxItem.key}
                variants={cardItemVariants}
                whileHover={{ x: 2 }}
                className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800/80"
              >
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer min-w-0">
                  <input
                    type="checkbox"
                    checked={sfxConfig[sfxItem.key]}
                    onChange={(e) => onUpdateSfx(sfxItem.key, e.target.checked)}
                    className="rounded accent-emerald-400"
                  />
                  <span className="font-mono text-amber-400 tabular-nums shrink-0">
                    {sfxItem.time}
                  </span>
                  <span className="truncate">{sfxItem.label}</span>
                </label>

                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={sfxItem.testFn}
                  className="px-2 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>ฟัง</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

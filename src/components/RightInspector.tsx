import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AspectRatioMode,
  BackgroundMode,
  LogoConfig,
  MotionPhysicsConfig,
  PropsConfig,
  resolveActiveTheme,
  SfxConfig,
} from '../types/motion';
import { SavedCustomPreset } from '../utils/presetStorage';
import { soundEngine } from '../utils/soundEngine';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Video,
  Camera,
  Layers,
  Smartphone,
  Monitor,
  Square,
  Play,
  Wand2,
  Bookmark,
  Plus,
  Trash2,
  Check,
  Cloud,
  LogIn,
  LogOut,
  RefreshCw,
  Pencil,
  Save,
} from 'lucide-react';

type RightTabId = 'presets' | 'props_polish' | 'stage_sfx';

interface RightInspectorProps {
  config: LogoConfig;
  onChange: (updater: (prev: LogoConfig) => LogoConfig) => void;
  presets: SavedCustomPreset[];
  activePresetId: string | null;
  onApplyPreset: (preset: SavedCustomPreset) => void;
  onSaveNewPreset: (name: string) => void;
  onUpdatePreset: (presetId: string) => void;
  onRenamePreset: (presetId: string, newName: string) => void;
  onDeletePreset: (presetId: string) => void;
  userEmail: string | null;
  isSyncingCloud: boolean;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
  isRecording: boolean;
  recordingProgress: number;
  onStartRecording: (forceTransparent?: boolean) => void;
  onDownloadPng: (forceTransparent?: boolean) => void;
}

const tabPanelVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 340,
      damping: 28,
      staggerChildren: 0.042,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.985,
    transition: {
      duration: 0.14,
      ease: 'easeOut' as const,
    },
  },
};

const cardItemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 380,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -6,
    transition: {
      duration: 0.14,
    },
  },
};

export const RightInspector: React.FC<RightInspectorProps> = ({
  config,
  onChange,
  presets,
  activePresetId,
  onApplyPreset,
  onSaveNewPreset,
  onUpdatePreset,
  onRenamePreset,
  onDeletePreset,
  userEmail,
  isSyncingCloud,
  onSignInGoogle,
  onSignOutGoogle,
  isRecording,
  recordingProgress,
  onStartRecording,
  onDownloadPng,
}) => {
  const [activeTab, setActiveTab] = useState<RightTabId>('presets');
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');
  const [justSavedPresetId, setJustSavedPresetId] = useState<string | null>(null);

  const updateProp = <K extends keyof PropsConfig>(key: K, value: PropsConfig[K]) => {
    onChange((prev) => ({
      ...prev,
      props: {
        ...prev.props,
        [key]: value,
      },
    }));
  };

  const updateSfx = <K extends keyof SfxConfig>(key: K, value: SfxConfig[K]) => {
    onChange((prev) => ({
      ...prev,
      sfx: {
        ...prev.sfx,
        [key]: value,
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

  const propItems: {
    key: keyof Omit<PropsConfig, 'micChannelTag'>;
    label: string;
    shortDesc: string;
  }[] = [
    { key: 'thaiFlagRibbon', label: 'ริบบิ้นธงชาติไทย', shortDesc: 'พาดโค้งด้านหลัง' },
    { key: 'clownMascot', label: 'ตัวตลกหัวเราะ', shortDesc: 'โผล่หลังเลข 5' },
    { key: 'tinTray', label: 'ถาดสังกะสีตบมุก', shortDesc: 'เด้งประกาย ป๊าบ!' },
    { key: 'interviewMic', label: 'ไมค์สัมภาษณ์', shortDesc: 'ยื่นจากขอบซ้าย' },
    { key: 'recCamera', label: 'กล้องไฟ REC', shortDesc: 'ซูมจากขอบขวา' },
    { key: 'marigoldGarland', label: 'พวงมาลัยดาวเรือง', shortDesc: 'คล้องมุมซ้ายล่าง' },
    { key: 'hornSpeaker', label: 'ลำโพงฮอร์นงานวัด', shortDesc: 'กระจายเสียงซ้ายบน' },
  ];

  const cinemaPolishItems: {
    key: keyof Pick<
      MotionPhysicsConfig,
      | 'enableLightSweep'
      | 'enableParallaxCamera'
      | 'enableSquashStretch'
      | 'enableMotionSmear'
      | 'enableAmbientBokeh'
      | 'supersampling'
    >;
    label: string;
  }[] = [
    { key: 'enableLightSweep', label: 'แสงพาด Light Sweep' },
    { key: 'enableParallaxCamera', label: 'กล้อง 2.5D Parallax' },
    { key: 'enableSquashStretch', label: 'ยืดหด Squash & Stretch' },
    { key: 'enableMotionSmear', label: 'เส้นความเร็ว Smear' },
    { key: 'enableAmbientBokeh', label: 'ละออง Bokeh & Shockwave' },
    { key: 'supersampling', label: 'ความคมชัด 1.5x HD' },
  ];

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

  const activePropsCount = propItems.filter((p) => config.props[p.key]).length;

  const tabs: {
    id: RightTabId;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'presets', label: `Preset (${presets.length})`, icon: Bookmark },
    { id: 'props_polish', label: `พร็อพ (${activePropsCount}/7)`, icon: Sparkles },
    { id: 'stage_sfx', label: 'ฉาก & เสียง', icon: Layers },
  ];

  const handleCreatePresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newPresetName.trim() || config.middleText || 'ตั้งค่าของฉัน';
    onSaveNewPreset(label);
    setNewPresetName('');
  };

  return (
    <aside className="relative w-full lg:w-[360px] xl:w-[390px] shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Top Segmented Tab Bar with Framer Motion Sliding Pill Indicator */}
      <div className="p-3 bg-slate-950/70 border-b border-slate-800 shrink-0">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 z-10 ${
                  isSelected
                    ? 'text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="rightInspectorActiveTabIndicator"
                    className="absolute inset-0 bg-amber-400 rounded-lg shadow-sm -z-10"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 32,
                    }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Middle Tab Content with AnimatePresence & Staggered Cards */}
      <div className="relative flex-1 overflow-y-auto p-4 min-h-0">
        <AnimatePresence mode="wait">
          {/* =============================================================== */}
          {/* TAB 1: PRESET DATABASE & AUTO-SAVE MANAGER                      */}
          {/* =============================================================== */}
          {activeTab === 'presets' && (
            <motion.div
              key="tab-presets"
              variants={tabPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {/* Auto-Save & Cloud Database Sync Card */}
              <motion.div
                variants={cardItemVariants}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-100 truncate">
                      ระบบจำค่าอัตโนมัติ (DB Sync)
                    </span>
                  </div>
                  {userEmail ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={onSignOutGoogle}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>ออกจากระบบ</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={onSignInGoogle}
                      className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>ซิงค์ Cloud DB</span>
                    </motion.button>
                  )}
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>
                    {userEmail
                      ? `เชื่อมต่อฐานข้อมูล: ${userEmail}`
                      : 'บันทึกอัตโนมัติในเครื่อง (เปิดใหม่กลับมาค่าเดิมเสมอ)'}
                  </span>
                  {isSyncingCloud && (
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                  )}
                </div>
              </motion.div>

              {/* Save Current Settings as New Preset Form */}
              <motion.form
                variants={cardItemVariants}
                onSubmit={handleCreatePresetSubmit}
                className="space-y-2"
              >
                <label className="block text-xs font-semibold text-slate-300">
                  บันทึกการตั้งค่าปัจจุบันเก็บไว้ในคลัง Preset
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={40}
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder={`เช่น ${config.middleText.slice(0, 18) || 'ตั้งค่าประจำช่อง'}...`}
                    className="flex-1 min-w-0 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>บันทึกใหม่</span>
                  </motion.button>
                </div>
              </motion.form>

               {/* Visual Preset Cards Grid with Layout & Stagger Animations */}
              <motion.div variants={cardItemVariants} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>คลิกการ์ดเพื่อใช้งาน · คลิกชื่อเพื่อเปลี่ยนชื่อ</span>
                </div>

                <motion.div layout className="space-y-2">
                  <AnimatePresence initial={false}>
                    {presets.map((preset) => {
                      const pTheme = resolveActiveTheme(preset.config);
                      const isActive =
                        activePresetId === preset.id ||
                        (preset.config.middleText === config.middleText &&
                          preset.config.themeId === config.themeId &&
                          preset.config.epText === config.epText);
                      const isRenaming = editingPresetId === preset.id;
                      const isJustSaved = justSavedPresetId === preset.id;

                      return (
                        <motion.div
                          layout
                          key={preset.id}
                          variants={cardItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          whileHover={{ y: -2, scale: 1.006 }}
                          transition={{
                            layout: { type: 'spring', stiffness: 360, damping: 30 },
                          }}
                          onClick={() => {
                            if (!isRenaming) {
                              onApplyPreset(preset);
                            }
                          }}
                          className={`group/card relative p-3 rounded-xl border transition-colors cursor-pointer select-none ${
                            isActive
                              ? 'bg-slate-800/90 border-amber-400 shadow-sm'
                              : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              {isRenaming ? (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (editingNameValue.trim()) {
                                      onRenamePreset(preset.id, editingNameValue);
                                    }
                                    setEditingPresetId(null);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1.5 mb-1"
                                >
                                  <input
                                    type="text"
                                    maxLength={40}
                                    autoFocus
                                    value={editingNameValue}
                                    onFocus={(e) => e.currentTarget.select()}
                                    onChange={(e) => setEditingNameValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') {
                                        e.stopPropagation();
                                        setEditingPresetId(null);
                                      }
                                    }}
                                    onBlur={() => {
                                      if (editingNameValue.trim()) {
                                        onRenamePreset(preset.id, editingNameValue);
                                      }
                                      setEditingPresetId(null);
                                    }}
                                    className="w-full px-2 py-1 bg-slate-950 border border-amber-400 rounded-md text-xs font-bold text-white focus:outline-none"
                                  />
                                </form>
                              ) : (
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="flex items-center -space-x-1 shrink-0">
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-slate-950"
                                      style={{ backgroundColor: pTheme.rankFill }}
                                    />
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-slate-950"
                                      style={{ backgroundColor: pTheme.bannerBgStart }}
                                    />
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-slate-950"
                                      style={{ backgroundColor: pTheme.bottomTextStroke }}
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPresetId(preset.id);
                                      setEditingNameValue(preset.name);
                                    }}
                                    title="คลิกเพื่อเปลี่ยนชื่อ Preset"
                                    className="text-xs font-bold text-slate-100 hover:text-amber-300 hover:underline decoration-amber-400/60 underline-offset-2 truncate text-left transition-colors"
                                  >
                                    {preset.name}
                                  </button>

                                  {isActive && (
                                    <span
                                      title="กำลังใช้งาน Preset นี้อยู่"
                                      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 shrink-0"
                                    >
                                      <Check className="w-3 h-3" />
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="mt-1.5 text-xs text-slate-300 truncate font-medium">
                                {preset.config.rankNumber} {preset.config.topText}{' '}
                                <span className="text-amber-300 font-bold">
                                  “{preset.config.middleText}”
                                </span>{' '}
                                {preset.config.bottomText}
                              </div>

                              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono tabular-nums">
                                <span>{preset.config.epText}</span>
                                <span aria-hidden="true">·</span>
                                <span>{preset.config.aspectRatio}</span>
                                <span aria-hidden="true">·</span>
                                <span>{preset.updatedAtLabel}</span>
                              </div>
                            </div>

                            {/* Contextual Icon Action Bar: visible on hover or when active */}
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`flex items-center gap-1 shrink-0 transition-opacity duration-150 ${
                                isActive || isJustSaved || isRenaming
                                  ? 'opacity-100'
                                  : 'opacity-0 group-hover/card:opacity-100 focus-within:opacity-100'
                              }`}
                            >
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => {
                                  onUpdatePreset(preset.id);
                                  setJustSavedPresetId(preset.id);
                                  window.setTimeout(() => {
                                    setJustSavedPresetId((prev) =>
                                      prev === preset.id ? null : prev
                                    );
                                  }, 1200);
                                }}
                                className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                                  isJustSaved
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-slate-900/90 hover:bg-slate-700 text-slate-300 hover:text-sky-300'
                                }`}
                                title="บันทึกค่าปัจจุบันทับลงใน Preset นี้"
                              >
                                {isJustSaved ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <Save className="w-3.5 h-3.5" />
                                )}
                              </motion.button>

                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => {
                                  setEditingPresetId(preset.id);
                                  setEditingNameValue(preset.name);
                                }}
                                className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors shrink-0"
                                title="เปลี่ยนชื่อ Preset"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </motion.button>

                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => onDeletePreset(preset.id)}
                                className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                                title="ลบ Preset นี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: COMPACT PROPS GRID & 7-FIGURE CINEMA POLISH              */}
          {/* =============================================================== */}
          {activeTab === 'props_polish' && (
            <motion.div
              key="tab-props-polish"
              variants={tabPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-5"
            >
              {/* 7 Thai Comedy Props in a clean 2-column staggered grid */}
              <motion.section variants={cardItemVariants} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-slate-100">
                      พร็อพตลกไทยบนป้าย ({activePropsCount}/7)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const allOn = propItems.every((p) => config.props[p.key]);
                      onChange((prev) => ({
                        ...prev,
                        props: {
                          ...prev.props,
                          thaiFlagRibbon: !allOn,
                          clownMascot: !allOn,
                          tinTray: !allOn,
                          interviewMic: !allOn,
                          recCamera: !allOn,
                          marigoldGarland: !allOn,
                          hornSpeaker: !allOn,
                        },
                      }));
                    }}
                    className="text-xs text-amber-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    เปิด/ปิดทั้งหมด
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {propItems.map((item) => {
                    const checked = config.props[item.key];
                    return (
                      <motion.button
                        key={item.key}
                        variants={cardItemVariants}
                        whileHover={{ y: -2, scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => updateProp(item.key, !checked)}
                        className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                          checked
                            ? 'bg-slate-800/90 border-amber-400/80 text-slate-100 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-65'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="text-xs font-bold truncate">
                            {item.label}
                          </span>
                          <motion.span
                            animate={{
                              scale: checked ? [1, 1.35, 1] : 1,
                              backgroundColor: checked ? '#fbbf24' : '#334155',
                            }}
                            transition={{ duration: 0.25 }}
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 truncate mt-1">
                          {item.shortDesc}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence initial={false}>
                  {config.props.interviewMic && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                        <label className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                          ชื่อช่องบนหัวไมค์:
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={config.props.micChannelTag}
                          onChange={(e) =>
                            updateProp('micChannelTag', e.target.value)
                          }
                          className="w-28 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-amber-300 text-center focus:outline-none focus:border-amber-400"
                          placeholder="ฮาTV"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>

              {/* 7-Figure Cinema Polish Effects in a compact 2-column staggered grid */}
              <motion.section
                variants={cardItemVariants}
                className="space-y-2.5 pt-2 border-t border-slate-800"
              >
                <div className="flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-slate-100">
                    เอฟเฟกต์ความคมชัดระดับ 7 หลัก (Cinema Polish)
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {cinemaPolishItems.map((item) => {
                    const checked = config.physics[item.key];
                    return (
                      <motion.button
                        key={item.key}
                        variants={cardItemVariants}
                        whileHover={{ y: -2, scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => updatePhysics(item.key, !checked)}
                        className={`px-3 py-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between gap-2 transition-colors ${
                          checked
                            ? 'bg-sky-500/15 border-sky-400/70 text-sky-200 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        <motion.span
                          animate={{
                            scale: checked ? [1, 1.35, 1] : 1,
                            backgroundColor: checked ? '#38bdf8' : '#334155',
                          }}
                          transition={{ duration: 0.25 }}
                          className="w-2 h-2 rounded-full shrink-0"
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            </motion.div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: STAGE ASPECT RATIO, BACKGROUND & COMEDY SFX              */}
          {/* =============================================================== */}
          {activeTab === 'stage_sfx' && (
            <motion.div
              key="tab-stage-sfx"
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
                    const active = config.aspectRatio === ar.id;
                    return (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() =>
                          onChange((prev) => ({ ...prev, aspectRatio: ar.id }))
                        }
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
                      onClick={() =>
                        onChange((prev) => ({ ...prev, bgMode: bg.id }))
                      }
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        config.bgMode === bg.id
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
                    {config.sfx.masterEnabled ? (
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
                      checked={config.sfx.masterEnabled}
                      onChange={(e) =>
                        updateSfx('masterEnabled', e.target.checked)
                      }
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
                      value={config.sfx.masterVolume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        updateSfx('masterVolume', v);
                        soundEngine.setVolume(v);
                      }}
                      className="flex-1 accent-emerald-400 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-slate-200 tabular-nums w-9 text-right">
                      {Math.round(config.sfx.masterVolume * 100)}%
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
                            checked={config.sfx[sfxItem.key]}
                            onChange={(e) =>
                              updateSfx(sfxItem.key, e.target.checked)
                            }
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
          )}
        </AnimatePresence>
      </div>

      {/* Pinned Bottom Export Dock — Always Accessible with 1-Click Transparent Export */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold text-slate-200">
            ส่งออกไฟล์นำไปตัดต่อทันที
          </span>
          <span className="font-mono tabular-nums">
            {config.aspectRatio} · 60fps
          </span>
        </div>

        {/* Primary Button 1: One-Click Transparent Video Export (No Background) */}
        <motion.button
          whileHover={{ scale: isRecording ? 1 : 1.015 }}
          whileTap={{ scale: isRecording ? 1 : 0.98 }}
          type="button"
          disabled={isRecording}
          onClick={() => onStartRecording(true)}
          className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
            isRecording
              ? 'bg-rose-600 text-white cursor-wait'
              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
          }`}
        >
          <Video className="w-4 h-4 shrink-0" />
          <span>
            {isRecording
              ? `กำลังเรคคอร์ดวิดีโอ... ${Math.round(recordingProgress * 100)}%`
              : 'ดาวน์โหลดวิดีโอ ไม่มีพื้นหลัง (Alpha WebM 4.0s)'}
          </span>
        </motion.button>

        {/* Secondary Row: Transparent PNG + Record with Selected Backdrop */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: isRecording ? 1 : 1.02 }}
            whileTap={{ scale: isRecording ? 1 : 0.97 }}
            type="button"
            disabled={isRecording}
            onClick={() => onDownloadPng(true)}
            className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            title="ดาวน์โหลดภาพนิ่ง PNG แบบเจาะพื้นหลังโปร่งใส 100%"
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span>PNG ไม่มีพื้นหลัง</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: isRecording ? 1 : 1.02 }}
            whileTap={{ scale: isRecording ? 1 : 0.97 }}
            type="button"
            disabled={isRecording}
            onClick={() => onStartRecording(false)}
            className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            title="เรคคอร์ดวิดีโอพร้อมฉากหลังตามที่เลือกไว้ด้านบน"
          >
            <Video className="w-3.5 h-3.5 shrink-0" />
            <span>วิดีโอรวมฉากหลัง</span>
          </motion.button>
        </div>
      </div>
    </aside>
  );
};

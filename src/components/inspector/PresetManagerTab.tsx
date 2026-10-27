import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LogoConfig, resolveActiveTheme } from '../../types/motion';
import { SavedCustomPreset } from '../../utils/presetStorage';
import {
  cardItemVariants,
  InspectorCard,
  tabPanelVariants,
} from './InspectorPrimitives';
import {
  Cloud,
  LogIn,
  LogOut,
  RefreshCw,
  Plus,
  Check,
  Save,
  Pencil,
  Trash2,
} from 'lucide-react';

export interface PresetManagerTabProps {
  presets: SavedCustomPreset[];
  activePresetId: string | null;
  currentConfig: LogoConfig;
  userEmail: string | null;
  isSyncingCloud: boolean;
  onApplyPreset: (preset: SavedCustomPreset) => void;
  onSaveNewPreset: (name: string) => void;
  onUpdatePreset: (presetId: string) => void;
  onRenamePreset: (presetId: string, newName: string) => void;
  onDeletePreset: (presetId: string) => void;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
}

export const PresetManagerTab: React.FC<PresetManagerTabProps> = ({
  presets,
  activePresetId,
  currentConfig,
  userEmail,
  isSyncingCloud,
  onApplyPreset,
  onSaveNewPreset,
  onUpdatePreset,
  onRenamePreset,
  onDeletePreset,
  onSignInGoogle,
  onSignOutGoogle,
}) => {
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');
  const [justSavedPresetId, setJustSavedPresetId] = useState<string | null>(null);

  const handleCreatePresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newPresetName.trim() || currentConfig.middleText || 'ตั้งค่าของฉัน';
    onSaveNewPreset(label);
    setNewPresetName('');
  };

  return (
    <motion.div
      variants={tabPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      {/* Auto-Save & Cloud Database Sync Card */}
      <InspectorCard className="space-y-2.5">
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
      </InspectorCard>

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
            placeholder={`เช่น ${currentConfig.middleText.slice(0, 18) || 'ตั้งค่าประจำช่อง'}...`}
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
                (preset.config.middleText === currentConfig.middleText &&
                  preset.config.themeId === currentConfig.themeId &&
                  preset.config.epText === currentConfig.epText);
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
                        {preset.config.channelEnabled && preset.config.channelText ? (
                          <span className="text-slate-400 mr-1">
                            [{preset.config.channelText}]
                          </span>
                        ) : null}
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
  );
};

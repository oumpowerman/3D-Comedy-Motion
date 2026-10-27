import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AspectRatioMode,
  BackgroundMode,
  LogoConfig,
  MotionPhysicsConfig,
  PropsConfig,
  SfxConfig,
} from '../types/motion';
import { SavedCustomPreset } from '../utils/presetStorage';
import { Bookmark, Layers, Sparkles } from 'lucide-react';
import { PresetManagerTab } from './inspector/PresetManagerTab';
import { PropsAndPhysicsTab } from './inspector/PropsAndPhysicsTab';
import { BackdropAndSfxTab } from './inspector/BackdropAndSfxTab';
import { ExportDock } from './inspector/ExportDock';

export type RightTabId = 'presets' | 'props_polish' | 'stage_sfx';

export interface RightInspectorProps {
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
  onExportMov: (forceTransparent?: boolean) => void;
  onDownloadPng: (forceTransparent?: boolean) => void;
}

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
  onExportMov,
  onDownloadPng,
}) => {
  const [activeTab, setActiveTab] = useState<RightTabId>('presets');

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

  const handleToggleAllProps = () => {
    const allOn =
      config.props.interviewMic &&
      config.props.recCamera &&
      config.props.marigoldGarland &&
      config.props.hornSpeaker;

    onChange((prev) => ({
      ...prev,
      props: {
        ...prev.props,
        interviewMic: !allOn,
        recCamera: !allOn,
        marigoldGarland: !allOn,
        hornSpeaker: !allOn,
      },
    }));
  };

  const activePropsCount = [
    config.props.interviewMic,
    config.props.recCamera,
    config.props.marigoldGarland,
    config.props.hornSpeaker,
  ].filter(Boolean).length;

  const tabs: {
    id: RightTabId;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'presets', label: `Preset (${presets.length})`, icon: Bookmark },
    { id: 'props_polish', label: `พร็อพ (${activePropsCount}/4)`, icon: Sparkles },
    { id: 'stage_sfx', label: 'ฉาก & เสียง', icon: Layers },
  ];

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
          {activeTab === 'presets' && (
            <PresetManagerTab
              key="tab-presets"
              presets={presets}
              activePresetId={activePresetId}
              currentConfig={config}
              userEmail={userEmail}
              isSyncingCloud={isSyncingCloud}
              onApplyPreset={onApplyPreset}
              onSaveNewPreset={onSaveNewPreset}
              onUpdatePreset={onUpdatePreset}
              onRenamePreset={onRenamePreset}
              onDeletePreset={onDeletePreset}
              onSignInGoogle={onSignInGoogle}
              onSignOutGoogle={onSignOutGoogle}
            />
          )}

          {activeTab === 'props_polish' && (
            <PropsAndPhysicsTab
              key="tab-props-polish"
              propsConfig={config.props}
              physicsConfig={config.physics}
              onUpdateProp={updateProp}
              onUpdatePhysics={updatePhysics}
              onToggleAllProps={handleToggleAllProps}
            />
          )}

          {activeTab === 'stage_sfx' && (
            <BackdropAndSfxTab
              key="tab-stage-sfx"
              aspectRatio={config.aspectRatio}
              bgMode={config.bgMode}
              sfxConfig={config.sfx}
              onChangeAspectRatio={(ar: AspectRatioMode) =>
                onChange((prev) => ({ ...prev, aspectRatio: ar }))
              }
              onChangeBgMode={(bg: BackgroundMode) =>
                onChange((prev) => ({ ...prev, bgMode: bg }))
              }
              onUpdateSfx={updateSfx}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Pinned Bottom Export Dock — Always Accessible */}
      <ExportDock
        aspectRatio={config.aspectRatio}
        isRecording={isRecording}
        recordingProgress={recordingProgress}
        onExportMov={onExportMov}
        onStartRecording={onStartRecording}
        onDownloadPng={onDownloadPng}
      />
    </aside>
  );
};

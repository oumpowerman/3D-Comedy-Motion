import React, { useCallback, useState } from 'react';
import { LogoConfig } from './types/motion';
import { loadLocalActiveConfig } from './utils/presetStorage';
import { useAnimationTimeline } from './hooks/useAnimationTimeline';
import { useExportStudio } from './hooks/useExportStudio';
import { usePresetSync } from './hooks/usePresetSync';
import { AppHeader } from './components/layout/AppHeader';
import { CanvasStage, FUNNY_THAI_TOPICS } from './components/layout/CanvasStage';
import { LeftInspector } from './components/LeftInspector';
import { RightInspector } from './components/RightInspector';
import { TimelineDock } from './components/TimelineDock';

export default function App() {
  const [config, setConfig] = useState<LogoConfig>(() =>
    loadLocalActiveConfig()
  );
  const [isFullscreenStage, setIsFullscreenStage] = useState<boolean>(false);

  // 1. Animation Timeline Hook (RAF 60fps Loop, Playhead, SFX, Canvas Ref)
  const timeline = useAnimationTimeline({ config });

  // 2. Export Studio Hook (MOV Alpha 32-bit, WebM Recorder, PNG Snapshot, Toasts)
  const exportStudio = useExportStudio({ config, timeline });

  // 3. Cloud Firestore & Local Preset Sync Hook (Auth, Presets CRUD)
  const presetSync = usePresetSync({
    config,
    setConfig,
    onAfterApplyPreset: timeline.resetPlayhead,
    showToast: exportStudio.showToast,
  });

  // Randomize funny Thai topic
  const handleRandomizeTopic = useCallback(() => {
    const candidates = FUNNY_THAI_TOPICS.filter((t) => t !== config.middleText);
    const randomTopic =
      candidates[Math.floor(Math.random() * candidates.length)] ||
      FUNNY_THAI_TOPICS[0];
    setConfig((prev) => ({
      ...prev,
      middleText: randomTopic,
    }));
    timeline.resetPlayhead();
  }, [config.middleText, timeline]);

  const { width: canvasW, height: canvasH } = timeline.getCanvasResolution();

  return (
    <div className="relative h-screen w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* 1. App Header Bar */}
      <AppHeader
        presets={presetSync.presets}
        activePresetId={presetSync.activePresetId}
        currentMiddleText={config.middleText}
        isRecording={timeline.isRecording}
        recordingProgress={timeline.recordingProgress}
        onApplyPreset={presetSync.handleApplySavedPreset}
        onRestart={timeline.handleRestart}
        onExportMov={exportStudio.handleExportMov}
      />

      {/* 2. Main 3-Column Studio Workspace */}
      <div className="relative flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Inspector: Typography, Motion Springs, EP Badge, Colors, Transform */}
        {!isFullscreenStage && (
          <LeftInspector config={config} onChange={setConfig} />
        )}

        {/* Center Stage + Timeline Dock */}
        <CanvasStage
          config={config}
          onChangeConfig={setConfig}
          canvasRef={timeline.canvasRef}
          canvasW={canvasW}
          canvasH={canvasH}
          currentTime={timeline.currentTime}
          isFullscreenStage={isFullscreenStage}
          onToggleFullscreen={() => setIsFullscreenStage((prev) => !prev)}
          isRecording={timeline.isRecording}
          recordingForceTransparent={timeline.recordingForceTransparent}
          exportToast={exportStudio.exportToast}
          onRandomizeTopic={handleRandomizeTopic}
        >
          <TimelineDock
            currentTime={timeline.currentTime}
            isPlaying={timeline.isPlaying}
            loopMode={timeline.loopMode}
            onTogglePlay={() => timeline.setIsPlaying((p) => !p)}
            onSeek={timeline.handleSeek}
            onRestart={timeline.handleRestart}
            onChangeLoopMode={(mode) => {
              timeline.setLoopMode(mode);
              timeline.setIsPlaying(true);
            }}
          />
        </CanvasStage>

        {/* Right Inspector: Presets Tab, Props Tab, SFX Tab, Export Dock */}
        {!isFullscreenStage && (
          <RightInspector
            config={config}
            onChange={setConfig}
            presets={presetSync.presets}
            activePresetId={presetSync.activePresetId}
            onApplyPreset={presetSync.handleApplySavedPreset}
            onSaveNewPreset={presetSync.handleSaveNewPreset}
            onUpdatePreset={presetSync.handleUpdatePreset}
            onRenamePreset={presetSync.handleRenamePreset}
            onDeletePreset={presetSync.handleDeletePreset}
            userEmail={presetSync.userEmail}
            isSyncingCloud={presetSync.isSyncingCloud}
            onSignInGoogle={presetSync.handleSignInGoogle}
            onSignOutGoogle={presetSync.handleSignOutGoogle}
            isRecording={timeline.isRecording}
            recordingProgress={timeline.recordingProgress}
            onStartRecording={exportStudio.handleStartRecording}
            onExportMov={exportStudio.handleExportMov}
            onDownloadPng={exportStudio.handleDownloadPng}
          />
        )}
      </div>
    </div>
  );
}

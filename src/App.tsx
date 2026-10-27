import React, { useEffect, useRef, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import {
  getThemeDefaultColors,
  LogoConfig,
  LoopMode,
  PRESET_TEMPLATES,
  PresetTemplate,
} from './types/motion';
import { renderMotionLogoFrame } from './utils/canvasRenderer';
import { soundEngine } from './utils/soundEngine';
import {
  deletePresetFromFirestore,
  loadLocalActiveConfig,
  loadLocalCustomPresets,
  loadWorkspaceFromFirestore,
  SavedCustomPreset,
  saveLocalActiveConfig,
  saveLocalCustomPresetsOnly,
  savePresetToFirestore,
  subscribeUserPresets,
  syncWorkspaceToFirestore,
} from './utils/presetStorage';
import { LeftInspector } from './components/LeftInspector';
import { RightInspector } from './components/RightInspector';
import { TimelineDock } from './components/TimelineDock';
import {
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Video,
  CheckCircle2,
  Shuffle,
} from 'lucide-react';

const FUNNY_THAI_TOPICS = [
  'เรื่องพีคในวงเหล้า',
  'มุกตบถาดตลกคาเฟ่',
  'คำตอบกวนโอ๊ยหน้าไมค์',
  'ท่าเต้นหน้าฮ้านหมอลำ',
  'ประโยคเด็ดเมียหลวงสายลุย',
  'วีรกรรมสมัยเรียนมัธยม',
  'ข้ออ้างคนจะหนีเที่ยว',
  'เหตุการณ์ไม่คาดฝันงานวัด',
];

export default function App() {
  const [config, setConfig] = useState<LogoConfig>(() => loadLocalActiveConfig());
  const [presets, setPresets] = useState<SavedCustomPreset[]>(() =>
    loadLocalCustomPresets()
  );
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [loopMode, setLoopMode] = useState<LoopMode>('full_4s');
  const [isFullscreenStage, setIsFullscreenStage] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeRef = useRef<number>(0);
  const lastFramePerfRef = useRef<number | null>(null);
  const triggeredPhasesRef = useRef<Set<number>>(new Set());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingForceTransparentRef = useRef<boolean>(false);
  const hasLoadedInitialCloudWorkspaceRef = useRef<boolean>(false);

  const showToast = useCallback((message: string, duration = 4000) => {
    setExportToast(message);
    setTimeout(() => setExportToast(null), duration);
  }, []);

  // 1. Listen to Firebase Auth State & Sync Workspace + Presets from Firestore DB
  useEffect(() => {
    let unsubPresets: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubPresets) {
        unsubPresets();
        unsubPresets = null;
      }

      if (user) {
        setUserEmail(user.email || 'ผู้ใช้ที่ล็อกอิน');
        setIsSyncingCloud(true);

        try {
          const cloudConfig = await loadWorkspaceFromFirestore(user.uid);
          if (cloudConfig) {
            hasLoadedInitialCloudWorkspaceRef.current = true;
            setConfig(cloudConfig);
            saveLocalActiveConfig(cloudConfig);
          } else {
            // Seed current local config to Firestore on first sign-in
            await syncWorkspaceToFirestore(loadLocalActiveConfig());
            hasLoadedInitialCloudWorkspaceRef.current = true;
          }
        } catch {
          // Handled by structured Firestore error handler
        } finally {
          setIsSyncingCloud(false);
        }

        // Subscribe to real-time Custom Presets from Firestore
        unsubPresets = subscribeUserPresets(user.uid, (cloudPresets) => {
          const builtIns = loadLocalCustomPresets().filter((p) => p.isBuiltIn);
          const merged = [...cloudPresets, ...builtIns];
          setPresets(merged);
          saveLocalCustomPresetsOnly(cloudPresets);
        });
      } else {
        setUserEmail(null);
        hasLoadedInitialCloudWorkspaceRef.current = false;
        setPresets(loadLocalCustomPresets());
      }
    });

    return () => {
      unsubAuth();
      if (unsubPresets) unsubPresets();
    };
  }, []);

  // 2. Auto-save every config change locally immediately + debounced sync to Firestore DB
  useEffect(() => {
    saveLocalActiveConfig(config);

    if (!auth.currentUser || !hasLoadedInitialCloudWorkspaceRef.current) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSyncingCloud(true);
        await syncWorkspaceToFirestore(config);
      } catch {
        // Handled by structured error handler
      } finally {
        setIsSyncingCloud(false);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [config]);

  // Google Sign-In / Sign-Out handlers for Cloud DB Sync
  const handleSignInGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('เชื่อมต่อฐานข้อมูล Cloud DB และซิงค์การตั้งค่าเรียบร้อยแล้ว');
    } catch {
      showToast('ยกเลิกการล็อกอิน ระบบยังคงบันทึกค่าอัตโนมัติในเครื่องของคุณ');
    }
  };

  const handleSignOutGoogle = async () => {
    await signOut(auth);
    showToast('ออกจากระบบ Cloud DB แล้ว การตั้งค่าในเครื่องยังอยู่ครบ');
  };

  // Preset Database CRUD Handlers
  const handleApplySavedPreset = (preset: SavedCustomPreset) => {
    setConfig(preset.config);
    setActivePresetId(preset.id);
    triggeredPhasesRef.current.clear();
    timeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(true);
    showToast(`โหลดการตั้งค่า Preset "${preset.name}" เรียบร้อยแล้ว`, 2800);
  };

  const handleSaveNewPreset = async (name: string) => {
    const newId = `preset_${Date.now()}`;
    const newPreset: SavedCustomPreset = {
      id: newId,
      name: name.trim() || config.middleText || 'Preset ใหม่',
      config: { ...config },
      updatedAtLabel: auth.currentUser ? 'ซิงค์บน Cloud DB' : 'บันทึกในเครื่อง',
      isBuiltIn: false,
      isCloudSynced: Boolean(auth.currentUser),
    };

    const nextPresets = [
      newPreset,
      ...presets.filter((p) => p.id !== newId),
    ];
    setPresets(nextPresets);
    saveLocalCustomPresetsOnly(nextPresets);
    setActivePresetId(newId);

    if (auth.currentUser) {
      setIsSyncingCloud(true);
      try {
        await savePresetToFirestore(newId, newPreset.name, config, true);
      } finally {
        setIsSyncingCloud(false);
      }
    }
    showToast(`บันทึก Preset "${newPreset.name}" เก็บไว้เรียบร้อยแล้ว`);
  };

  const handleUpdatePreset = async (presetId: string) => {
    const target = presets.find((p) => p.id === presetId);
    if (!target || target.isBuiltIn) return;

    const updatedPreset: SavedCustomPreset = {
      ...target,
      config: { ...config },
      updatedAtLabel: auth.currentUser ? 'อัปเดตบน Cloud DB' : 'อัปเดตล่าสุด',
    };

    const nextPresets = presets.map((p) =>
      p.id === presetId ? updatedPreset : p
    );
    setPresets(nextPresets);
    saveLocalCustomPresetsOnly(nextPresets);
    setActivePresetId(presetId);

    if (auth.currentUser) {
      setIsSyncingCloud(true);
      try {
        await savePresetToFirestore(presetId, target.name, config, false);
      } finally {
        setIsSyncingCloud(false);
      }
    }
    showToast(`อัปเดตการตั้งค่าปัจจุบันทับ Preset "${target.name}" แล้ว`);
  };

  const handleDeletePreset = async (presetId: string) => {
    const target = presets.find((p) => p.id === presetId);
    if (!target || target.isBuiltIn) return;

    const nextPresets = presets.filter((p) => p.id !== presetId);
    setPresets(nextPresets);
    saveLocalCustomPresetsOnly(nextPresets);
    if (activePresetId === presetId) {
      setActivePresetId(null);
    }

    if (auth.currentUser) {
      setIsSyncingCloud(true);
      try {
        await deletePresetFromFirestore(presetId);
      } finally {
        setIsSyncingCloud(false);
      }
    }
    showToast(`ลบ Preset "${target.name}" เรียบร้อยแล้ว`, 2800);
  };

  // Compute exact pixel dimensions based on selected Aspect Ratio & Supersampling
  const getCanvasResolution = useCallback(() => {
    const scaleMult = config.physics.supersampling ? 1.25 : 1.0;
    if (config.aspectRatio === '16:9') {
      return {
        width: Math.round(1920 * scaleMult),
        height: Math.round(1080 * scaleMult),
      };
    }
    if (config.aspectRatio === '1:1') {
      return {
        width: Math.round(1080 * scaleMult),
        height: Math.round(1080 * scaleMult),
      };
    }
    return {
      width: Math.round(1080 * scaleMult),
      height: Math.round(1920 * scaleMult),
    };
  }, [config.aspectRatio, config.physics.supersampling]);

  // Trigger procedural comedy SFX when playhead crosses phase thresholds
  const checkAndTriggerSfx = useCallback(
    (prevT: number, nextT: number) => {
      if (!config.sfx.masterEnabled) return;
      const triggered = triggeredPhasesRef.current;

      if (prevT <= 0.05 && nextT >= 0.01 && !triggered.has(1)) {
        triggered.add(1);
        soundEngine.playPhase1Boing(config.sfx);
      }
      if (prevT < 0.5 && nextT >= 0.5 && !triggered.has(2)) {
        triggered.add(2);
        soundEngine.playPhase2UnrollPop(config.sfx);
      }
      if (prevT < 1.2 && nextT >= 1.2 && !triggered.has(3)) {
        triggered.add(3);
        soundEngine.playPhase3TraySmash(config.sfx);
      }
      if (prevT < 1.8 && nextT >= 1.8 && !triggered.has(4)) {
        triggered.add(4);
        soundEngine.playPhase4DrumJoke(config.sfx);
      }
      if (prevT < 3.5 && nextT >= 3.5 && !triggered.has(5)) {
        triggered.add(5);
        soundEngine.playPhase5SwooshOut(config.sfx);
      }
    },
    [config.sfx]
  );

  // Main 60fps Animation Loop
  useEffect(() => {
    let rafId: number;

    const tick = (now: number) => {
      if (lastFramePerfRef.current === null) {
        lastFramePerfRef.current = now;
      }
      const dt = Math.min(0.05, (now - lastFramePerfRef.current) / 1000);
      lastFramePerfRef.current = now;

      if (isPlaying || isRecording) {
        const prevT = timeRef.current;
        let nextT = prevT + dt;

        if (isRecording) {
          setRecordingProgress(Math.min(1, nextT / 4.0));
          if (nextT >= 4.0) {
            nextT = 4.0;
            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state === 'recording'
            ) {
              mediaRecorderRef.current.stop();
            }
          } else {
            checkAndTriggerSfx(prevT, nextT);
          }
        } else if (loopMode === 'hold_loop') {
          if (nextT >= 3.5 || nextT < 1.8) {
            nextT = 1.8;
            triggeredPhasesRef.current.delete(4);
          }
          checkAndTriggerSfx(prevT, nextT);
        } else {
          if (nextT >= 4.0) {
            nextT = 0.0;
            triggeredPhasesRef.current.clear();
          }
          checkAndTriggerSfx(prevT, nextT);
        }

        timeRef.current = nextT;
        setCurrentTime(nextT);
      }

      // Draw current frame onto Supersampled High-DPI Canvas
      // If recording in Force-Transparent mode, render with bgMode: 'transparent'
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const effectiveConfig =
            isRecording && recordingForceTransparentRef.current
              ? { ...config, bgMode: 'transparent' as const }
              : config;
          renderMotionLogoFrame(
            ctx,
            canvas.width,
            canvas.height,
            effectiveConfig,
            timeRef.current
          );
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [config, isPlaying, isRecording, loopMode, checkAndTriggerSfx]);

  // Apply Top Bar Preset Template
  const handleSelectTopPreset = (preset: PresetTemplate) => {
    setConfig((prev) => ({
      ...prev,
      rankNumber: preset.rankNumber,
      topText: preset.topText,
      middleText: preset.middleText,
      bottomText: preset.bottomText,
      epText: preset.epText,
      themeId: preset.themeId,
      customColors: getThemeDefaultColors(preset.themeId),
      bannerStyle: preset.bannerStyle,
    }));
    setActivePresetId(`builtin_${preset.id}`);
    triggeredPhasesRef.current.clear();
    timeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Randomize funny Thai topic
  const handleRandomizeTopic = () => {
    const candidates = FUNNY_THAI_TOPICS.filter((t) => t !== config.middleText);
    const randomTopic =
      candidates[Math.floor(Math.random() * candidates.length)] ||
      FUNNY_THAI_TOPICS[0];
    setConfig((prev) => ({
      ...prev,
      middleText: randomTopic,
    }));
    triggeredPhasesRef.current.clear();
    timeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Seek manually on timeline
  const handleSeek = (targetTime: number) => {
    if (isRecording) return;
    setIsPlaying(false);
    triggeredPhasesRef.current.clear();
    timeRef.current = targetTime;
    setCurrentTime(targetTime);
  };

  // Restart from 0.0s
  const handleRestart = () => {
    if (isRecording) return;
    triggeredPhasesRef.current.clear();
    timeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Export High-Resolution PNG Snapshot (Supports 1-Click Transparent PNG!)
  const handleDownloadPng = (forceTransparent = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const targetTime =
      timeRef.current < 1.5 || timeRef.current > 3.5 ? 2.2 : timeRef.current;
    timeRef.current = targetTime;
    setCurrentTime(targetTime);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const exportConfig = forceTransparent
        ? { ...config, bgMode: 'transparent' as const }
        : config;
      renderMotionLogoFrame(
        ctx,
        canvas.width,
        canvas.height,
        exportConfig,
        targetTime
      );
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const safeName = (config.middleText || 'thai-comedy-logo').replace(/\s+/g, '-');
    const suffix = forceTransparent ? 'transparent' : config.bgMode;
    link.download = `5-อันดับ-${safeName}-${config.epText}-${suffix}.png`;
    link.href = dataUrl;
    link.click();

    // Immediately restore current preview frame if user had another background selected
    if (ctx && forceTransparent && config.bgMode !== 'transparent') {
      renderMotionLogoFrame(
        ctx,
        canvas.width,
        canvas.height,
        config,
        targetTime
      );
    }

    showToast(
      forceTransparent
        ? 'ดาวน์โหลดไฟล์ PNG พื้นหลังโปร่งใส (ไม่มีพื้นหลัง) เรียบร้อยแล้ว'
        : 'บันทึกไฟล์ภาพ PNG ความละเอียดสูงเรียบร้อยแล้ว'
    );
  };

  // Record 4.0s Video with Synced Procedural Audio (Supports 1-Click Alpha Transparent WebM!)
  const handleStartRecording = (forceTransparent = false) => {
    const canvas = canvasRef.current;
    if (!canvas || isRecording) return;

    try {
      recordingForceTransparentRef.current = forceTransparent;
      triggeredPhasesRef.current.clear();
      timeRef.current = 0;
      setCurrentTime(0);
      setRecordingProgress(0);
      setIsRecording(true);
      setIsPlaying(true);

      const canvasStream = canvas.captureStream(60);
      const audioStream = soundEngine.getRecordingAudioStream();

      const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
      if (audioStream && config.sfx.masterEnabled) {
        combinedTracks.push(...audioStream.getAudioTracks());
      }
      const combinedStream = new MediaStream(combinedTracks);

      // When exporting transparent alpha video, prioritize WebM VP9/VP8 which support Alpha channel
      const isAlphaExport = forceTransparent || config.bgMode === 'transparent';
      const mimeCandidates = isAlphaExport
        ? [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
          ]
        : [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4',
          ];
      const selectedMime =
        mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = new MediaRecorder(
        combinedStream,
        selectedMime
          ? { mimeType: selectedMime, videoBitsPerSecond: 16_000_000 }
          : { videoBitsPerSecond: 16_000_000 }
      );

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: selectedMime || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = (config.middleText || 'thai-comedy-logo').replace(/\s+/g, '-');
        const bgTag = isAlphaExport ? 'no-bg-alpha' : config.bgMode;
        a.href = url;
        a.download = `motion-5-อันดับ-${safeName}-${config.epText}-${bgTag}.${ext}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);

        recordingForceTransparentRef.current = false;
        setIsRecording(false);
        setRecordingProgress(0);
        showToast(
          isAlphaExport
            ? `ดาวน์โหลดวิดีโอไม่มีพื้นหลัง (${ext.toUpperCase()} Alpha) พร้อมเสียงสำเร็จแล้ว`
            : `ส่งออกไฟล์วิดีโอ (${ext.toUpperCase()}) พร้อมเสียงเอฟเฟกต์สำเร็จแล้ว`,
          4500
        );
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      triggeredPhasesRef.current.add(1);
      soundEngine.playPhase1Boing(config.sfx);
    } catch {
      recordingForceTransparentRef.current = false;
      setIsRecording(false);
      showToast('เบราว์เซอร์ไม่รองรับการอัดวิดีโอโดยตรง กรุณาใช้ปุ่ม PNG ไม่มีพื้นหลัง');
    }
  };

  const { width: canvasW, height: canvasH } = getCanvasResolution();
  const isShowingCheckerboard =
    config.bgMode === 'transparent' ||
    (isRecording && recordingForceTransparentRef.current);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar Contract: Strictly 3 zones separated by gap-8 */}
      <header className="h-14 flex items-center justify-between gap-8 px-6 bg-slate-900 border-b border-slate-800 shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleRestart();
          }}
          className="text-lg font-bold tracking-tight text-amber-400 whitespace-nowrap shrink-0"
        >
          ฮาจัดสตูดิโอ
        </a>

        {/* Zone 2: 4 concise single-line preset navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectTopPreset(preset)}
              className={`hover:text-amber-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                config.middleText === preset.middleText
                  ? 'text-amber-400 font-semibold'
                  : ''
              }`}
            >
              {preset.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action (One-Click Transparent Video Download) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={isRecording}
            onClick={() => handleStartRecording(true)}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            {isRecording
              ? `กำลังเรคคอร์ด ${Math.round(recordingProgress * 100)}%`
              : 'ดาวน์โหลดวิดีโอ (ไม่มีพื้นหลัง)'}
          </button>
        </div>
      </header>

      {/* Main 3-Column Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Inspector: 3-Layer Typography, 7-Figure Physics Tuner, EP Badge, Color Themes */}
        {!isFullscreenStage && (
          <LeftInspector config={config} onChange={setConfig} />
        )}

        {/* Center Stage + Timeline Dock */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-950 relative overflow-hidden">
          {/* Quick Inline Topic Bar & Viewport Toolbar (Locked 56px Height) */}
          <div className="h-14 px-5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0 overflow-hidden">
            {/* Fast Middle Text Editor right above Canvas */}
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-xl">
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap shrink-0">
                {config.rankNumber} {config.topText}
              </span>
              <input
                type="text"
                maxLength={36}
                value={config.middleText}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, middleText: e.target.value }))
                }
                className="flex-1 min-w-[140px] px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                placeholder="พิมพ์ข้อความตรงกลาง..."
              />
              <span className="text-xs font-semibold text-rose-400 whitespace-nowrap shrink-0">
                {config.bottomText}
              </span>
              <button
                type="button"
                onClick={handleRandomizeTopic}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                title="สุ่มหัวข้อคลิปตลกไทย"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">สุ่มหัวข้อ</span>
              </button>
            </div>

            {/* Stage Overlay Controls & Quick Background Toggle */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    bgMode:
                      prev.bgMode === 'transparent' ? 'sunburst' : 'transparent',
                  }))
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                  config.bgMode === 'transparent'
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {config.bgMode === 'transparent'
                  ? 'โหมด: ไม่มีพื้นหลัง (Alpha)'
                  : 'สลับดูแบบไม่มีพื้นหลัง'}
              </button>

              {config.aspectRatio === '9:16' && (
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      showSafeZone: !prev.showSafeZone,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    config.showSafeZone
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {config.showSafeZone ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">ไกด์ TikTok</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsFullscreenStage((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                {isFullscreenStage ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>แสดงแผงเครื่องมือ</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ขยายจอ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {exportToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 text-xs font-semibold shadow-lg whitespace-nowrap">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{exportToast}</span>
            </div>
          )}

          {/* Rigid Center Viewport Stage (Zero Reflow / Locked Dimensions) */}
          <div className="flex-1 min-h-0 flex items-center justify-center p-5 overflow-hidden relative">
            <div
              className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center shrink-0 ${
                isShowingCheckerboard
                  ? 'bg-[conic-gradient(#1e293b_90deg,#0f172a_90deg_180deg,#1e293b_180deg_270deg,#0f172a_270deg)] [background-size:24px_24px]'
                  : 'bg-slate-950'
              }`}
              style={{
                aspectRatio:
                  config.aspectRatio === '9:16'
                    ? '9 / 16'
                    : config.aspectRatio === '16:9'
                    ? '16 / 9'
                    : '1 / 1',
                height:
                  config.aspectRatio === '9:16'
                    ? '100%'
                    : config.aspectRatio === '1:1'
                    ? 'min(100%, 520px)'
                    : 'auto',
                width:
                  config.aspectRatio === '16:9' ? 'min(100%, 760px)' : 'auto',
                maxHeight: '100%',
                maxWidth: '100%',
              }}
            >
              <canvas
                ref={canvasRef}
                width={canvasW}
                height={canvasH}
                className="w-full h-full object-contain block"
              />

              {/* TikTok / Reels / Shorts Vertical Safe Zone Guide Overlay */}
              {config.showSafeZone && config.aspectRatio === '9:16' && (
                <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-sky-400/40 flex flex-col justify-between p-3 text-[11px] font-mono text-sky-200/80">
                  <div className="h-12 bg-slate-950/55 border border-sky-400/30 rounded-lg flex items-center justify-center">
                    พื้นที่แถบค้นหาด้านบน (TikTok / Reels Top UI)
                  </div>

                  <div className="flex justify-end pr-1">
                    <div className="w-12 h-48 bg-slate-950/55 border border-sky-400/30 rounded-lg flex flex-col items-center justify-around py-2 text-[10px]">
                      <span>โปรไฟล์</span>
                      <span>ไลก์</span>
                      <span>คอมเมนต์</span>
                      <span>แชร์</span>
                    </div>
                  </div>

                  <div className="h-24 bg-slate-950/55 border border-sky-400/30 rounded-lg flex items-center justify-center text-center px-2">
                    พื้นที่ชื่อช่อง แคปชั่น และแผ่นเสียงด้านล่าง
                  </div>
                </div>
              )}

              {/* Recording Indicator Overlay */}
              {isRecording && (
                <div className="pointer-events-none absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-rose-600/90 text-white text-xs font-bold flex items-center gap-2">
                  <Video className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums">
                    REC {currentTime.toFixed(1)}s / 4.0s
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom 4.0s Animation Timeline Dock */}
          <TimelineDock
            currentTime={currentTime}
            isPlaying={isPlaying}
            loopMode={loopMode}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onSeek={handleSeek}
            onRestart={handleRestart}
            onChangeLoopMode={(mode) => {
              setLoopMode(mode);
              setIsPlaying(true);
            }}
          />
        </main>

        {/* Right Inspector: 3 Clean Tabs (Preset DB, Props & Polish, Stage & SFX) + Pinned Transparent Export Dock */}
        {!isFullscreenStage && (
          <RightInspector
            config={config}
            onChange={setConfig}
            presets={presets}
            activePresetId={activePresetId}
            onApplyPreset={handleApplySavedPreset}
            onSaveNewPreset={handleSaveNewPreset}
            onUpdatePreset={handleUpdatePreset}
            onDeletePreset={handleDeletePreset}
            userEmail={userEmail}
            isSyncingCloud={isSyncingCloud}
            onSignInGoogle={handleSignInGoogle}
            onSignOutGoogle={handleSignOutGoogle}
            isRecording={isRecording}
            recordingProgress={recordingProgress}
            onStartRecording={handleStartRecording}
            onDownloadPng={handleDownloadPng}
          />
        )}
      </div>
    </div>
  );
}

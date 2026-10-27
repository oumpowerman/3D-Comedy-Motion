import { useCallback, useEffect, useRef, useState } from 'react';
import { LogoConfig, LoopMode } from '../types/motion';
import { renderMotionLogoFrame } from '../utils/canvasRenderer';
import { soundEngine } from '../utils/soundEngine';

export interface UseAnimationTimelineProps {
  config: LogoConfig;
}

export function useAnimationTimeline({ config }: UseAnimationTimelineProps) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [loopMode, setLoopMode] = useState<LoopMode>('full_4s');

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [recordingForceTransparent, setRecordingForceTransparent] =
    useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeRef = useRef<number>(0);
  const lastFramePerfRef = useRef<number | null>(null);
  const triggeredPhasesRef = useRef<Set<number>>(new Set());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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

      const isLiveMediaRecording =
        isRecording &&
        mediaRecorderRef.current !== null &&
        mediaRecorderRef.current.state === 'recording';

      if (isPlaying || isLiveMediaRecording) {
        const prevT = timeRef.current;
        let nextT = prevT + dt;

        if (isLiveMediaRecording) {
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
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const effectiveConfig =
            isRecording && recordingForceTransparent
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
  }, [
    config,
    isPlaying,
    isRecording,
    recordingForceTransparent,
    loopMode,
    checkAndTriggerSfx,
  ]);

  // Seek manually on timeline
  const handleSeek = useCallback(
    (targetTime: number) => {
      if (isRecording) return;
      setIsPlaying(false);
      triggeredPhasesRef.current.clear();
      timeRef.current = targetTime;
      setCurrentTime(targetTime);
    },
    [isRecording]
  );

  // Restart from 0.0s
  const handleRestart = useCallback(() => {
    if (isRecording) return;
    triggeredPhasesRef.current.clear();
    timeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(true);
  }, [isRecording]);

  // Reset playhead for preset apply or topic randomize
  const resetPlayhead = useCallback(() => {
    triggeredPhasesRef.current.clear();
    timeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  return {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    loopMode,
    setLoopMode,
    isRecording,
    setIsRecording,
    recordingProgress,
    setRecordingProgress,
    recordingForceTransparent,
    setRecordingForceTransparent,
    canvasRef,
    timeRef,
    triggeredPhasesRef,
    mediaRecorderRef,
    getCanvasResolution,
    handleSeek,
    handleRestart,
    resetPlayhead,
  };
}

export type AnimationTimelineReturn = ReturnType<typeof useAnimationTimeline>;

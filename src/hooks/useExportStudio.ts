import { useCallback, useState } from 'react';
import { LogoConfig } from '../types/motion';
import { renderMotionLogoFrame } from '../utils/canvasRenderer';
import { exportQuickTimeMov } from '../utils/movExporter';
import { soundEngine } from '../utils/soundEngine';
import { AnimationTimelineReturn } from './useAnimationTimeline';

export interface UseExportStudioProps {
  config: LogoConfig;
  timeline: AnimationTimelineReturn;
}

export function useExportStudio({ config, timeline }: UseExportStudioProps) {
  const [exportToast, setExportToast] = useState<string | null>(null);

  const showToast = useCallback((message: string, duration = 4000) => {
    setExportToast(message);
    setTimeout(() => setExportToast(null), duration);
  }, []);

  // Export High-Resolution PNG Snapshot (Supports 1-Click Transparent PNG!)
  const handleDownloadPng = useCallback(
    (forceTransparent = true) => {
      const canvas = timeline.canvasRef.current;
      if (!canvas) return;

      const targetTime =
        timeline.timeRef.current < 1.5 || timeline.timeRef.current > 3.5
          ? 2.2
          : timeline.timeRef.current;
      timeline.timeRef.current = targetTime;
      timeline.setCurrentTime(targetTime);

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
      const safeName = (config.middleText || 'thai-comedy-logo').replace(
        /\s+/g,
        '-'
      );
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
    },
    [config, showToast, timeline]
  );

  // Record 4.0s Video with Synced Procedural Audio (Supports 1-Click Alpha Transparent WebM!)
  const handleStartRecording = useCallback(
    (forceTransparent = false) => {
      const canvas = timeline.canvasRef.current;
      if (!canvas || timeline.isRecording) return;

      try {
        timeline.setRecordingForceTransparent(forceTransparent);
        timeline.triggeredPhasesRef.current.clear();
        timeline.timeRef.current = 0;
        timeline.setCurrentTime(0);
        timeline.setRecordingProgress(0);
        timeline.setIsRecording(true);
        timeline.setIsPlaying(true);

        const canvasStream = canvas.captureStream(60);
        const audioStream = soundEngine.getRecordingAudioStream();

        const combinedTracks: MediaStreamTrack[] = [
          ...canvasStream.getVideoTracks(),
        ];
        if (audioStream && config.sfx.masterEnabled) {
          combinedTracks.push(...audioStream.getAudioTracks());
        }
        const combinedStream = new MediaStream(combinedTracks);

        // When exporting transparent alpha video, prioritize WebM VP9/VP8 which support Alpha channel
        const isAlphaExport =
          forceTransparent || config.bgMode === 'transparent';
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
          const safeName = (config.middleText || 'thai-comedy-logo').replace(
            /\s+/g,
            '-'
          );
          const bgTag = isAlphaExport ? 'no-bg-alpha' : config.bgMode;
          a.href = url;
          a.download = `motion-5-อันดับ-${safeName}-${config.epText}-${bgTag}.${ext}`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 10000);

          timeline.setRecordingForceTransparent(false);
          timeline.setIsRecording(false);
          timeline.setRecordingProgress(0);
          showToast(
            isAlphaExport
              ? `ดาวน์โหลดวิดีโอไม่มีพื้นหลัง (${ext.toUpperCase()} Alpha) พร้อมเสียงสำเร็จแล้ว`
              : `ส่งออกไฟล์วิดีโอ (${ext.toUpperCase()}) พร้อมเสียงเอฟเฟกต์สำเร็จแล้ว`,
            4500
          );
        };

        timeline.mediaRecorderRef.current = recorder;
        recorder.start(100);
        timeline.triggeredPhasesRef.current.add(1);
        soundEngine.playPhase1Boing(config.sfx);
      } catch {
        timeline.setRecordingForceTransparent(false);
        timeline.setIsRecording(false);
        showToast(
          'เบราว์เซอร์ไม่รองรับการอัดวิดีโอโดยตรง กรุณาใช้ปุ่ม .MOV หรือ PNG'
        );
      }
    },
    [config, showToast, timeline]
  );

  // Export Genuine QuickTime .MOV Video (32-bit RGBA Alpha or with Backdrop + Synced PCM Audio)
  const handleExportMov = useCallback(
    async (forceTransparent = true) => {
      if (timeline.isRecording) return;
      const { width, height } = timeline.getCanvasResolution();

      try {
        timeline.setRecordingForceTransparent(forceTransparent);
        timeline.setIsPlaying(false);
        timeline.setIsRecording(true);
        timeline.setRecordingProgress(0);

        const isAlphaExport =
          forceTransparent || config.bgMode === 'transparent';
        showToast(
          isAlphaExport
            ? 'กำลังเรนเดอร์ไฟล์ .MOV พื้นหลังโปร่งใส (32-bit Alpha) พร้อมเสียง...'
            : 'กำลังเรนเดอร์ไฟล์ .MOV ความละเอียดสูงพร้อมเสียง...',
          3500
        );

        const movBlob = await exportQuickTimeMov({
          config,
          width,
          height,
          forceTransparent,
          fps: 30,
          durationSeconds: 4.0,
          onProgress: (progress, frameTime) => {
            timeline.setRecordingProgress(progress);
            timeline.timeRef.current = frameTime;
            timeline.setCurrentTime(frameTime);
          },
        });

        const url = URL.createObjectURL(movBlob);
        const a = document.createElement('a');
        const safeName = (config.middleText || 'thai-comedy-logo').replace(
          /\s+/g,
          '-'
        );
        const bgTag = isAlphaExport ? 'alpha-nobg' : config.bgMode;
        a.href = url;
        a.download = `motion-5-อันดับ-${safeName}-${config.epText}-${bgTag}.mov`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);

        showToast(
          isAlphaExport
            ? 'ดาวน์โหลดไฟล์ .MOV ไม่มีพื้นหลัง (32-bit RGBA Alpha) พร้อมเสียงสำเร็จแล้ว!'
            : 'ดาวน์โหลดไฟล์วิดีโอ .MOV พร้อมเสียงเอฟเฟกต์สำเร็จแล้ว!',
          4500
        );
      } catch {
        showToast('เกิดข้อผิดพลาดในการสร้างไฟล์ .MOV กรุณาลองใหม่อีกครั้ง');
      } finally {
        timeline.setRecordingForceTransparent(false);
        timeline.setIsRecording(false);
        timeline.setRecordingProgress(0);
        timeline.timeRef.current = 0;
        timeline.setCurrentTime(0);
        timeline.setIsPlaying(true);
      }
    },
    [config, showToast, timeline]
  );

  return {
    exportToast,
    showToast,
    handleDownloadPng,
    handleStartRecording,
    handleExportMov,
  };
}

import React from 'react';
import { motion } from 'motion/react';
import { AspectRatioMode } from '../../types/motion';
import { Camera, Video } from 'lucide-react';

export interface ExportDockProps {
  aspectRatio: AspectRatioMode;
  isRecording: boolean;
  recordingProgress: number;
  onExportMov: (forceTransparent?: boolean) => void;
  onStartRecording: (forceTransparent?: boolean) => void;
  onDownloadPng: (forceTransparent?: boolean) => void;
}

export const ExportDock: React.FC<ExportDockProps> = ({
  aspectRatio,
  isRecording,
  recordingProgress,
  onExportMov,
  onStartRecording,
  onDownloadPng,
}) => {
  return (
    <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2 shrink-0">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span className="font-semibold text-slate-200">
          ส่งออกไฟล์นำไปตัดต่อทันที (.MOV / .WebM / .PNG)
        </span>
        <span className="font-mono tabular-nums">{aspectRatio}</span>
      </div>

      {/* Primary Button 1: One-Click QuickTime .MOV Transparent Video Export (32-bit RGBA Alpha) */}
      <motion.button
        whileHover={{ scale: isRecording ? 1 : 1.015 }}
        whileTap={{ scale: isRecording ? 1 : 0.98 }}
        type="button"
        disabled={isRecording}
        onClick={() => onExportMov(true)}
        className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
          isRecording
            ? 'bg-rose-600 text-white cursor-wait'
            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
        }`}
        title="ส่งออกไฟล์ QuickTime .MOV โปร่งใส 32-bit RGBA (Alpha) พร้อมเสียงเอฟเฟกต์ สำหรับ Premiere / Final Cut / CapCut / DaVinci"
      >
        <Video className="w-4 h-4 shrink-0" />
        <span>
          {isRecording
            ? `กำลังเรนเดอร์วิดีโอ... ${Math.round(recordingProgress * 100)}%`
            : 'ดาวน์โหลด .MOV ไม่มีพื้นหลัง (Alpha 4.0s)'}
        </span>
      </motion.button>

      {/* Row 2: Transparent WebM + .MOV with Selected Backdrop */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          whileHover={{ scale: isRecording ? 1 : 1.02 }}
          whileTap={{ scale: isRecording ? 1 : 0.97 }}
          type="button"
          disabled={isRecording}
          onClick={() => onStartRecording(true)}
          className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          title="เรคคอร์ดวิดีโอ WebM แบบเจาะพื้นหลังโปร่งใส (Alpha)"
        >
          <Video className="w-3.5 h-3.5 shrink-0" />
          <span>.WebM ไม่มีพื้นหลัง</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: isRecording ? 1 : 1.02 }}
          whileTap={{ scale: isRecording ? 1 : 0.97 }}
          type="button"
          disabled={isRecording}
          onClick={() => onExportMov(false)}
          className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          title="ส่งออกไฟล์ QuickTime .MOV พร้อมฉากหลังที่เลือกไว้"
        >
          <Video className="w-3.5 h-3.5 shrink-0" />
          <span>.MOV รวมฉากหลัง</span>
        </motion.button>
      </div>

      {/* Row 3: Transparent PNG + WebM/MP4 with Selected Backdrop */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          whileHover={{ scale: isRecording ? 1 : 1.02 }}
          whileTap={{ scale: isRecording ? 1 : 0.97 }}
          type="button"
          disabled={isRecording}
          onClick={() => onDownloadPng(true)}
          className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          title="ดาวน์โหลดภาพนิ่ง PNG แบบเจาะพื้นหลังโปร่งใส 100%"
        >
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span>.PNG ไม่มีพื้นหลัง</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: isRecording ? 1 : 1.02 }}
          whileTap={{ scale: isRecording ? 1 : 0.97 }}
          type="button"
          disabled={isRecording}
          onClick={() => onStartRecording(false)}
          className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          title="เรคคอร์ดวิดีโอ WebM/MP4 พร้อมฉากหลังตามที่เลือกไว้ด้านบน"
        >
          <Video className="w-3.5 h-3.5 shrink-0" />
          <span>.WebM รวมฉากหลัง</span>
        </motion.button>
      </div>
    </div>
  );
};

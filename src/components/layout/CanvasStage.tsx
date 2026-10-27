import React from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Shuffle,
  Video,
} from 'lucide-react';
import { LogoConfig } from '../../types/motion';

export const FUNNY_THAI_TOPICS = [
  'เรื่องพีคในวงเหล้า',
  'มุกตบถาดตลกคาเฟ่',
  'คำตอบกวนโอ๊ยหน้าไมค์',
  'ท่าเต้นหน้าฮ้านหมอลำ',
  'ประโยคเด็ดเมียหลวงสายลุย',
  'วีรกรรมสมัยเรียนมัธยม',
  'ข้ออ้างคนจะหนีเที่ยว',
  'เหตุการณ์ไม่คาดฝันงานวัด',
];

export interface CanvasStageProps {
  config: LogoConfig;
  onChangeConfig: React.Dispatch<React.SetStateAction<LogoConfig>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasW: number;
  canvasH: number;
  currentTime: number;
  isFullscreenStage: boolean;
  onToggleFullscreen: () => void;
  isRecording: boolean;
  recordingForceTransparent: boolean;
  exportToast: string | null;
  onRandomizeTopic: () => void;
  children?: React.ReactNode; // For TimelineDock
}

export function CanvasStage({
  config,
  onChangeConfig,
  canvasRef,
  canvasW,
  canvasH,
  currentTime,
  isFullscreenStage,
  onToggleFullscreen,
  isRecording,
  recordingForceTransparent,
  exportToast,
  onRandomizeTopic,
  children,
}: CanvasStageProps) {
  const isShowingCheckerboard =
    config.bgMode === 'transparent' ||
    (isRecording && recordingForceTransparent);

  return (
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
              onChangeConfig((prev) => ({ ...prev, middleText: e.target.value }))
            }
            className="flex-1 min-w-[140px] px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
            placeholder="พิมพ์ข้อความตรงกลาง..."
          />
          <span className="text-xs font-semibold text-rose-400 whitespace-nowrap shrink-0">
            {config.bottomText}
          </span>
          <button
            type="button"
            onClick={onRandomizeTopic}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
              onChangeConfig((prev) => ({
                ...prev,
                bgMode:
                  prev.bgMode === 'transparent' ? 'sunburst' : 'transparent',
              }))
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                onChangeConfig((prev) => ({
                  ...prev,
                  showSafeZone: !prev.showSafeZone,
                }))
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            onClick={onToggleFullscreen}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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

      {/* Bottom Timeline Dock */}
      {children}
    </main>
  );
}

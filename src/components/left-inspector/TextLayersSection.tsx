import React from 'react';
import {
  BannerStyle,
  CustomPhaseColors,
  LogoConfig,
  NumberTextureMode,
} from '../../types/motion';
import { FontSizeControl, ColorPickerField } from './LeftInspectorPrimitives';
import { Type } from 'lucide-react';

export interface TextLayersSectionProps {
  config: LogoConfig;
  updateField: <K extends keyof LogoConfig>(key: K, value: LogoConfig[K]) => void;
  updateCustomColor: <K extends keyof CustomPhaseColors>(
    key: K,
    hex: CustomPhaseColors[K]
  ) => void;
}

export const TextLayersSection: React.FC<TextLayersSectionProps> = ({
  config,
  updateField,
  updateCustomColor,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-amber-400 shrink-0" />
          <h2 className="text-sm font-bold text-slate-100">
            1. โครงสร้างข้อความโลโก้ (Stacked Layout)
          </h2>
        </div>
        <span className="text-xs text-slate-400">ปรับขนาด & สีอิสระ</span>
      </div>

      {/* Layer 0: Channel Title ("เรียงเรื่องลั่น" Overhead Stamp Drop) */}
      <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/35">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-bold text-amber-300 truncate">
              ชื่อช่องด้านบน (พุ่งตกทีละตัวแบบตัวปั๊ม)
            </div>
            <div className="text-[11px] text-slate-400">
              วางเหนือคำว่า 5 อันดับ · ไล่จังหวะทีละตัวอักษร
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.channelEnabled}
              onChange={(e) => updateField('channelEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all relative peer-checked:bg-amber-400" />
          </label>
        </div>

        {config.channelEnabled && (
          <div className="space-y-2.5 pt-1">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                ข้อความชื่อช่อง (เช่น เรียงเรื่องลั่น)
              </label>
              <input
                type="text"
                maxLength={24}
                value={config.channelText}
                onChange={(e) => updateField('channelText', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-amber-500/50 rounded-lg text-sm font-bold text-amber-200 focus:outline-none focus:border-amber-400"
                placeholder="เรียงเรื่องลั่น"
              />
            </div>

            <FontSizeControl
              label="ขนาดชื่อช่องด้านบน"
              value={config.channelTextSize}
              min={32}
              max={96}
              step={2}
              defaultValue={54}
              onChange={(val) => updateField('channelTextSize', val)}
            />

            <div className="grid grid-cols-1 gap-1.5 pt-0.5">
              <ColorPickerField
                label='สีตัวอักษรชื่อช่อง ("เรียงเรื่องลั่น")'
                value={config.customColors.channelTextFill}
                onChange={(hex) => updateCustomColor('channelTextFill', hex)}
              />
              <ColorPickerField
                label="สีเส้นขอบชื่อช่อง"
                value={config.customColors.channelTextStroke}
                onChange={(hex) => updateCustomColor('channelTextStroke', hex)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Layer 1: Top ("5 อันดับ") */}
      <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200">ชั้นบน (เลขจัดอันดับ + คำนำ)</span>
          <span>0.0 – 0.5s</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-xs text-slate-400 mb-1">ตัวเลขใหญ่</label>
            <input
              type="text"
              maxLength={3}
              value={config.rankNumber}
              onChange={(e) => updateField('rankNumber', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400 tabular-nums"
              placeholder="5"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1">ข้อความชั้นบน</label>
            <input
              type="text"
              maxLength={14}
              value={config.topText}
              onChange={(e) => updateField('topText', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-semibold text-slate-100 focus:outline-none focus:border-amber-400"
              placeholder="อันดับ"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FontSizeControl
            label="ขนาดตัวเลข"
            value={config.rankNumberSize}
            min={110}
            max={260}
            step={2}
            defaultValue={182}
            onChange={(val) => updateField('rankNumberSize', val)}
          />
          <FontSizeControl
            label="ขนาดคำชั้นบน"
            value={config.topTextSize}
            min={56}
            max={150}
            step={2}
            defaultValue={94}
            onChange={(val) => updateField('topTextSize', val)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs text-slate-400">เอฟเฟกต์ตัวเลข</label>
            <span className="text-[11px] text-amber-300/90">
              {config.numberTexture === 'wave_gradient' && 'คลื่นสีไล่ระดับไหลพริ้วในตัวเลข + ไฮไลต์เงาใส'}
              {config.numberTexture === 'two_tone' && 'ไล่สีทูโทนตัดขอบเงาเมทัลลิกคมชัด'}
              {config.numberTexture === 'solid_3d' && 'ตัวเลข 3D สีพื้นคลีนคมชัด'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
            {(
              [
                { id: 'wave_gradient', label: 'ลูกคลื่น Gradient' },
                { id: 'two_tone', label: 'ไล่สีทูโทน' },
                { id: 'solid_3d', label: '3D ทั่วไป' },
              ] as { id: NumberTextureMode; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField('numberTexture', item.id)}
                className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  config.numberTexture === item.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inline Quick Color Pickers for Phase 1 */}
        <div className="pt-1 space-y-1.5">
          <div className="text-[11px] text-slate-400 font-medium">
            จานสีเฟส 1 (เลือกสีได้อิสระทุกเฉด):
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <ColorPickerField
              label="สีหลักตัวเลข (ส่วนบน)"
              value={config.customColors.rankFill}
              onChange={(hex) => updateCustomColor('rankFill', hex)}
            />
            {config.numberTexture !== 'solid_3d' && (
              <ColorPickerField
                label={
                  config.numberTexture === 'wave_gradient'
                    ? 'สีคลื่นลูกที่ 1 & เงาคำบน'
                    : 'สีทูโทนส่วนล่าง & เงาคำบน'
                }
                value={config.customColors.rankSecondary}
                onChange={(hex) => updateCustomColor('rankSecondary', hex)}
              />
            )}
            {config.numberTexture === 'wave_gradient' && (
              <ColorPickerField
                label="สีคลื่นลูกที่ 2 (Wave Gradient)"
                value={config.customColors.rankWaveAccent}
                onChange={(hex) => updateCustomColor('rankWaveAccent', hex)}
              />
            )}
            <ColorPickerField
              label='สีข้อความชั้นบน ("อันดับ")'
              value={config.customColors.topTextFill}
              onChange={(hex) => updateCustomColor('topTextFill', hex)}
            />
          </div>
        </div>
      </div>

      {/* Layer 2: Middle Dynamic Banner ("[ ... ]") */}
      <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-amber-300">ชั้นกลาง (ป้ายพิมพ์ข้อความ [...])</span>
          <span>0.5 – 1.2s</span>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            หัวข้อคลิปตลก (เด้งเรียงตัวอักษรไทยอัตโนมัติ)
          </label>
          <input
            type="text"
            maxLength={36}
            value={config.middleText}
            onChange={(e) => updateField('middleText', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-amber-500/50 rounded-lg text-base font-bold text-white focus:outline-none focus:border-amber-400"
            placeholder="พิมพ์ชื่อเรื่อง เช่น เรื่องพีคในวงเหล้า..."
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
            <span>รวมสระลอยและวรรณยุกต์ไทยเป็นก้อนเดียวเวลาเด้ง</span>
            <span className="font-mono tabular-nums">
              {Array.from(config.middleText).length}/36
            </span>
          </div>
        </div>

        <FontSizeControl
          label="ขนาดข้อความชั้นกลาง (ป้ายจะขยายตามอัตโนมัติ)"
          value={config.middleTextSize}
          min={42}
          max={116}
          step={2}
          defaultValue={74}
          onChange={(val) => updateField('middleTextSize', val)}
        />

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs text-slate-400 mb-1">สไตล์กรอบป้ายกลาง</label>
            <select
              value={config.bannerStyle}
              onChange={(e) => updateField('bannerStyle', e.target.value as BannerStyle)}
              className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="temple_marquee">ป้ายไฟงานวัด</option>
              <option value="canvas_scroll">ป้ายผ้าใบคลี่กาง</option>
              <option value="cafe_neon">ป้ายนีออนคาเฟ่</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">ฟอนต์ข้อความกลาง</label>
            <select
              value={config.middleFont}
              onChange={(e) =>
                updateField('middleFont', e.target.value as LogoConfig['middleFont'])
              }
              className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="Mali">Mali (การ์ตูนหัวกลมกวนๆ)</option>
              <option value="Itim">Itim (ป้ายร้านค้าอ่านง่าย)</option>
              <option value="Kanit">Kanit (โมเดิร์นคมชัด)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">ระยะเผื่อสระ/วรรณยุกต์ด้านบน</span>
            <span className="font-mono text-slate-300 tabular-nums">
              +{config.thaiVowelSafePadding}px
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={52}
            step={2}
            value={config.thaiVowelSafePadding}
            onChange={(e) => updateField('thaiVowelSafePadding', Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Inline Quick Color Pickers for Phase 2 */}
        <div className="pt-1 space-y-1.5">
          <div className="text-[11px] text-slate-400 font-medium">
            จานสีเฟส 2 (ป้ายและข้อความตรงกลาง):
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <ColorPickerField
              label="สีข้อความในป้ายกลาง"
              value={config.customColors.bannerTextFill}
              onChange={(hex) => updateCustomColor('bannerTextFill', hex)}
            />
            <ColorPickerField
              label="สีพื้นป้ายกลาง (ส่วนบน)"
              value={config.customColors.bannerBgStart}
              onChange={(hex) => updateCustomColor('bannerBgStart', hex)}
            />
            <ColorPickerField
              label="สีพื้นป้ายกลาง (ไล่เฉดส่วนล่าง)"
              value={config.customColors.bannerBgEnd}
              onChange={(hex) => updateCustomColor('bannerBgEnd', hex)}
            />
            <ColorPickerField
              label="สีกรอบป้ายกลาง"
              value={config.customColors.bannerBorder}
              onChange={(hex) => updateCustomColor('bannerBorder', hex)}
            />
          </div>
        </div>
      </div>

      {/* Layer 3: Bottom ("สุดฮา") */}
      <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200">ชั้นล่าง (คำสรุปกระแทกหน้าจอ)</span>
          <span>1.2 – 1.8s</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs text-slate-400 mb-1">ข้อความชั้นล่าง</label>
            <input
              type="text"
              maxLength={14}
              value={config.bottomText}
              onChange={(e) => updateField('bottomText', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-rose-300 focus:outline-none focus:border-amber-400"
              placeholder="สุดฮา"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">องศาความเอียง</span>
              <span className="font-mono text-slate-300 tabular-nums">
                {config.bottomTiltDeg}°
              </span>
            </div>
            <input
              type="range"
              min={-14}
              max={14}
              step={1}
              value={config.bottomTiltDeg}
              onChange={(e) => updateField('bottomTiltDeg', Number(e.target.value))}
              className="w-full mt-2 accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        <FontSizeControl
          label="ขนาดข้อความชั้นล่าง"
          value={config.bottomTextSize}
          min={70}
          max={170}
          step={2}
          defaultValue={116}
          onChange={(val) => updateField('bottomTextSize', val)}
        />

        {/* Inline Quick Color Pickers for Phase 3 */}
        <div className="pt-1 space-y-1.5">
          <div className="text-[11px] text-slate-400 font-medium">
            จานสีเฟส 3 (คำสรุป "สุดฮา"):
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <ColorPickerField
              label='สีหลักข้อความล่าง ("สุดฮา")'
              value={config.customColors.bottomTextFill}
              onChange={(hex) => updateCustomColor('bottomTextFill', hex)}
            />
            <ColorPickerField
              label="สีไล่เฉดข้อความล่าง"
              value={config.customColors.bottomTextSecondary}
              onChange={(hex) => updateCustomColor('bottomTextSecondary', hex)}
            />
            <ColorPickerField
              label="สีเส้นขอบข้อความล่าง"
              value={config.customColors.bottomTextStroke}
              onChange={(hex) => updateCustomColor('bottomTextStroke', hex)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

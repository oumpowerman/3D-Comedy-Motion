import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MotionPhysicsConfig, PropsConfig } from '../../types/motion';
import {
  cardItemVariants,
  InspectorSectionHeader,
  tabPanelVariants,
} from './InspectorPrimitives';
import { Sparkles, Wand2 } from 'lucide-react';

export interface PropsAndPhysicsTabProps {
  propsConfig: PropsConfig;
  physicsConfig: MotionPhysicsConfig;
  onUpdateProp: <K extends keyof PropsConfig>(key: K, value: PropsConfig[K]) => void;
  onUpdatePhysics: <K extends keyof MotionPhysicsConfig>(
    key: K,
    value: MotionPhysicsConfig[K]
  ) => void;
  onToggleAllProps: () => void;
}

export const PropsAndPhysicsTab: React.FC<PropsAndPhysicsTabProps> = ({
  propsConfig,
  physicsConfig,
  onUpdateProp,
  onUpdatePhysics,
  onToggleAllProps,
}) => {
  const propItems: {
    key: keyof Omit<PropsConfig, 'micChannelTag'>;
    label: string;
    shortDesc: string;
  }[] = [
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

  const activePropsCount = propItems.filter((p) => propsConfig[p.key]).length;

  return (
    <motion.div
      variants={tabPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-5"
    >
      {/* 4 Thai Comedy Props in a clean 2-column staggered grid */}
      <motion.section variants={cardItemVariants} className="space-y-2.5">
        <InspectorSectionHeader
          icon={Sparkles}
          iconColor="text-amber-400"
          title={`พร็อพประกอบป้าย (${activePropsCount}/4)`}
          actionSlot={
            <button
              type="button"
              onClick={onToggleAllProps}
              className="text-xs text-amber-400 hover:underline whitespace-nowrap shrink-0"
            >
              เปิด/ปิดทั้งหมด
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-2">
          {propItems.map((item) => {
            const checked = propsConfig[item.key];
            return (
              <motion.button
                key={item.key}
                variants={cardItemVariants}
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => onUpdateProp(item.key, !checked)}
                className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                  checked
                    ? 'bg-slate-800/90 border-amber-400/80 text-slate-100 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-65'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-xs font-bold truncate">{item.label}</span>
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
          {propsConfig.interviewMic && (
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
                  value={propsConfig.micChannelTag}
                  onChange={(e) => onUpdateProp('micChannelTag', e.target.value)}
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
        <InspectorSectionHeader
          icon={Wand2}
          iconColor="text-sky-400"
          title="เอฟเฟกต์ความคมชัดระดับ 7 หลัก (Cinema Polish)"
        />

        <div className="grid grid-cols-2 gap-2">
          {cinemaPolishItems.map((item) => {
            const checked = physicsConfig[item.key];
            return (
              <motion.button
                key={item.key}
                variants={cardItemVariants}
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => onUpdatePhysics(item.key, !checked)}
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
  );
};

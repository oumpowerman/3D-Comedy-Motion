export type AspectRatioMode = '9:16' | '16:9' | '1:1';
export type BackgroundMode = 'transparent' | 'green' | 'blue' | 'sunburst';
export type BannerStyle = 'temple_marquee' | 'canvas_scroll' | 'cafe_neon';
export type ThemeId = 'temple_fair' | 'cafe_comedy' | 'sai_yor_neon' | 'local_news';
export type EpBadgePosition = 'top_right' | 'top_left' | 'bottom_right';
export type NumberTextureMode = 'wave_gradient' | 'two_tone' | 'solid_3d';
export type LoopMode = 'full_4s' | 'hold_loop';
export type MotionPresetId = 'apple_fluid' | 'broadcast_snappy' | 'cafe_slapstick';

export interface MotionPhysicsConfig {
  preset: MotionPresetId;
  stiffness: number;           // 120 - 420 (Spring tension)
  damping: number;             // 10 - 36 (Spring friction)
  staggerDelay: number;        // 0.015 - 0.08s per Thai grapheme cluster
  enableSquashStretch: boolean;
  enableMotionSmear: boolean;
  enableParallaxCamera: boolean;
  enableLightSweep: boolean;
  enableAmbientBokeh: boolean;
  supersampling: boolean;      // 1.5x Supersampled Anti-Aliasing
}

export const MOTION_PHYSICS_PRESETS: Record<
  MotionPresetId,
  {
    name: string;
    subtitle: string;
    stiffness: number;
    damping: number;
    staggerDelay: number;
  }
> = {
  apple_fluid: {
    name: 'Apple Fluid (สมูธระดับคีย์โน้ต)',
    subtitle: 'สปริงนุ่มลึก สมดุลความเร็วไร้รอยต่อ + Follow-Through',
    stiffness: 210,
    damping: 19,
    staggerDelay: 0.035,
  },
  broadcast_snappy: {
    name: 'Broadcast 7-Figure (คมกระชับระดับทีวี)',
    subtitle: 'ดีดตัวไว หยุดคมกริบ จังหวะตัวอักษรเรียงคลื่นชัดเจน',
    stiffness: 310,
    damping: 22,
    staggerDelay: 0.042,
  },
  cafe_slapstick: {
    name: 'Cafe Slapstick (เด้งดึ๋งตลกคาเฟ่)',
    subtitle: 'โอเวอร์ชู้ตสุดตัว ยืดหด Squash & Stretch จัดจ้าน',
    stiffness: 360,
    damping: 14,
    staggerDelay: 0.05,
  },
};

export interface CustomPhaseColors {
  // Phase 1: Top Layer ("5 อันดับ" + Rank Wave + EP Badge)
  rankFill: string;
  rankSecondary: string;
  rankWaveAccent: string;
  rankExtrude: string;
  topTextFill: string;
  epBubbleFill: string;
  epBubbleText: string;

  // Phase 2: Middle Layer (Dynamic Banner [ ... ])
  bannerTextFill: string;
  bannerBgStart: string;
  bannerBgEnd: string;
  bannerBorder: string;
  bulbColorOn: string;
  bulbColorOff: string;

  // Phase 3: Bottom Layer ("สุดฮา" Slam)
  bottomTextFill: string;
  bottomTextSecondary: string;
  bottomTextStroke: string;
  bottomExtrude: string;

  // Phase 4: Sunburst Stage Backdrop
  sunburstA: string;
  sunburstB: string;
}

export interface ColorTheme extends CustomPhaseColors {
  id: ThemeId;
  name: string;
  subtitle: string;
}

export interface PropsConfig {
  thaiFlagRibbon: boolean;
  tinTray: boolean;
  marigoldGarland: boolean;
  hornSpeaker: boolean;
  interviewMic: boolean;
  micChannelTag: string;
  recCamera: boolean;
  clownMascot: boolean;
}

export interface SfxConfig {
  masterEnabled: boolean;
  masterVolume: number;
  phase1Boing: boolean;      // 0.0s: ฟึ่บ + เด้งดึ๋ง (Boing)
  phase2UnrollPop: boolean;  // 0.5s: รูดม้วนผ้า + ป๊อป (Pop!)
  phase3TraySmash: boolean;  // 1.2s: ตีถาดสังกะสี (ป๊าบ!) + หัวเราะ/สปริง
  phase4DrumJoke: boolean;   // 1.8s: กลองตบมุก (ตึง โป๊ะ!)
  phase5SwooshOut: boolean;  // 3.5s: วิ้งดูดรวบ + ดาวกระจาย
}

export interface LogoConfig {
  // Layer 1: Top ("5 อันดับ")
  rankNumber: string;
  rankNumberSize: number;      // Default 182 (110 - 260)
  topText: string;
  topTextSize: number;         // Default 94 (56 - 150)
  numberTexture: NumberTextureMode;

  // Layer 2: Middle Dynamic Banner ("[ ... ]")
  middleText: string;
  middleTextSize: number;      // Default 74 (42 - 116)
  middleFont: 'Mali' | 'Itim' | 'Kanit';
  bannerStyle: BannerStyle;
  thaiVowelSafePadding: number;

  // Layer 3: Bottom ("สุดฮา")
  bottomText: string;
  bottomTextSize: number;      // Default 116 (70 - 170)
  bottomTiltDeg: number;

  // EP Message Pop Badge
  epEnabled: boolean;
  epText: string;
  epTextSize: number;          // Default 38 (24 - 60)
  epPosition: EpBadgePosition;

  // Visual Theme, Per-Phase Custom Colors & Layout
  themeId: ThemeId;
  customColors: CustomPhaseColors;
  aspectRatio: AspectRatioMode;
  bgMode: BackgroundMode;
  logoScale: number;
  logoVerticalOffset: number;
  showSafeZone: boolean;

  // High-End 7-Figure Motion Physics & Polish
  physics: MotionPhysicsConfig;

  // Props & SFX
  props: PropsConfig;
  sfx: SfxConfig;
}

export interface TimelinePhase {
  id: string;
  index: number;
  title: string;
  timeRange: string;
  startTime: number;
  endTime: number;
  layerDesc: string;
  motionDesc: string;
  sfxDesc: string;
  accentColor: string;
}

export const TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: 'phase_1',
    index: 1,
    title: 'เปิดตัว 5 อันดับ + ธงไทย',
    timeRange: '0.0 – 0.5s',
    startTime: 0.0,
    endTime: 0.5,
    layerDesc: 'พื้นหลังธงชาติ + คำว่า "5 อันดับ" + ป้าย EP',
    motionDesc: 'ริบบิ้นธงชาติสะบัดกางออก พร้อมคำว่า "5 อันดับ" เด้งเรียงตัวแบบ Staggered Spring และป้าย EP เด้ง Message Pop',
    sfxDesc: 'เสียง ฟึ่บ! ตามด้วยเสียงเด้ง ดึ๋ง! (Boing)',
    accentColor: '#FACC15',
  },
  {
    id: 'phase_2',
    index: 2,
    title: 'กางป้ายข้อความ + ไมค์ & กล้อง',
    timeRange: '0.5 – 1.2s',
    startTime: 0.5,
    endTime: 1.2,
    layerDesc: 'กล่องข้อความ [ ... ] + ไมค์สัมภาษณ์ & กล้อง REC',
    motionDesc: 'ป้ายข้อความตรงกลางกางออกพร้อมตัวอักษรไทยเด้งเป็นคลื่น ขณะที่ไมค์และกล้องดีดตัวแบบ Follow-Through',
    sfxDesc: 'เสียงรูดม้วนกระดาษ + เสียงการ์ตูนโผล่ (Pop!)',
    accentColor: '#38BDF8',
  },
  {
    id: 'phase_3',
    index: 3,
    title: 'ตบมุก "สุดฮา" + ถาดสังกะสี & ตัวตลก',
    timeRange: '1.2 – 1.8s',
    startTime: 1.2,
    endTime: 1.8,
    layerDesc: 'คำว่า "สุดฮา" + ตัวตลก & ถาดสังกะสี',
    motionDesc: 'คำว่า "สุดฮา" พุ่งกระแทกพร้อมคลื่น Shockwave & 2.5D Impact Zoom ตัวตลกและถาดสังกะสีเด้งทะลุขึ้นมาจากหลังป้าย',
    sfxDesc: 'เสียงตีถาดสังกะสี (ป๊าบ!) + เสียงสปริงตลก',
    accentColor: '#F43F5E',
  },
  {
    id: 'phase_4',
    index: 4,
    title: 'ค้างโชว์โลโก้ + แสงพาด Specular Sweep',
    timeRange: '1.8 – 3.5s',
    startTime: 1.8,
    endTime: 3.5,
    layerDesc: 'ทุกเลเยอร์ทำงานประสานกัน (Loop Hold + Light Sweep)',
    motionDesc: 'ลำแสง Specular พาดผ่านตัวอักษร 3D กล้องเคลื่อนแบบ 2.5D Parallax ไฟ REC กะพริบ และคำว่า "สุดฮา" สั่นดุ๊กดิ๊ก',
    sfxDesc: 'เสียงกลองตบมุก (ตึง โป๊ะ!)',
    accentColor: '#10B981',
  },
  {
    id: 'phase_5',
    index: 5,
    title: 'ดูดรวบแตกดาวกระจาย (Out)',
    timeRange: '3.5 – 4.0s',
    startTime: 3.5,
    endTime: 4.0,
    layerDesc: 'ทุกเลเยอร์ (Out Transition)',
    motionDesc: 'ทุกอย่างหมุนดูดรวบเข้าจุดศูนย์กลางแบบ Anticipation Vortex แล้วแตกออกเป็นดาวกระจายและเส้นแสงความเร็ว',
    sfxDesc: 'เสียง วิ้ง! หรือเสียงดูด (Swoosh Out)',
    accentColor: '#A855F7',
  },
];

export const COLOR_THEMES: Record<ThemeId, ColorTheme> = {
  temple_fair: {
    id: 'temple_fair',
    name: 'งานวัดไทย (Temple Fair)',
    subtitle: 'เหลืองทอง แดงชาด น้ำเงิน ขอบดำหนา',
    rankFill: '#FACC15',
    rankSecondary: '#EF4444',
    rankWaveAccent: '#F97316',
    rankExtrude: '#09090B',
    topTextFill: '#FFFFFF',
    bannerBgStart: '#1E3A8A',
    bannerBgEnd: '#0F172A',
    bannerBorder: '#FACC15',
    bannerTextFill: '#FEF08A',
    bulbColorOn: '#FDE047',
    bulbColorOff: '#78350F',
    bottomTextFill: '#FACC15',
    bottomTextSecondary: '#F59E0B',
    bottomTextStroke: '#DC2626',
    bottomExtrude: '#09090B',
    epBubbleFill: '#EF4444',
    epBubbleText: '#FFFFFF',
    sunburstA: '#7C2D12',
    sunburstB: '#270E04',
  },
  cafe_comedy: {
    id: 'cafe_comedy',
    name: 'ตลกคาเฟ่ยุค 90 (Retro Cafe)',
    subtitle: 'ชมพูบานเย็น เหลืองสด ฟ้าเทอร์ควอยซ์',
    rankFill: '#FDE047',
    rankSecondary: '#EC4899',
    rankWaveAccent: '#06B6D4',
    rankExtrude: '#09090B',
    topTextFill: '#67E8F9',
    bannerBgStart: '#9D174D',
    bannerBgEnd: '#4C0519',
    bannerBorder: '#22D3EE',
    bannerTextFill: '#FFFFFF',
    bulbColorOn: '#67E8F9',
    bulbColorOff: '#164E63',
    bottomTextFill: '#F472B6',
    bottomTextSecondary: '#FB7185',
    bottomTextStroke: '#1E1B4B',
    bottomExtrude: '#09090B',
    epBubbleFill: '#06B6D4',
    epBubbleText: '#09090B',
    sunburstA: '#4C1D95',
    sunburstB: '#0F0728',
  },
  sai_yor_neon: {
    id: 'sai_yor_neon',
    name: 'นีออนสายย่อ (Sai Yor Neon)',
    subtitle: 'เขียวมะนาว ม่วงเข้ม ชมพูฮอตพิงก์',
    rankFill: '#A3E635',
    rankSecondary: '#F43F5E',
    rankWaveAccent: '#A855F7',
    rankExtrude: '#09090B',
    topTextFill: '#FFFFFF',
    bannerBgStart: '#3B0764',
    bannerBgEnd: '#1E1B4B',
    bannerBorder: '#A3E635',
    bannerTextFill: '#ECFCCB',
    bulbColorOn: '#F43F5E',
    bulbColorOff: '#4C0519',
    bottomTextFill: '#FDE047',
    bottomTextSecondary: '#A3E635',
    bottomTextStroke: '#7C3AED',
    bottomExtrude: '#09090B',
    epBubbleFill: '#F43F5E',
    epBubbleText: '#FFFFFF',
    sunburstA: '#311042',
    sunburstB: '#090414',
  },
  local_news: {
    id: 'local_news',
    name: 'ข่าวชาวบ้านสุดป่วน (Viral News)',
    subtitle: 'แดงด่วนพิเศษ เหลืองคาดดำ น้ำเงินเข้ม',
    rankFill: '#EF4444',
    rankSecondary: '#FACC15',
    rankWaveAccent: '#2563EB',
    rankExtrude: '#09090B',
    topTextFill: '#FEF08A',
    bannerBgStart: '#FEF08A',
    bannerBgEnd: '#FACC15',
    bannerBorder: '#09090B',
    bannerTextFill: '#09090B',
    bulbColorOn: '#EF4444',
    bulbColorOff: '#450A0A',
    bottomTextFill: '#FFFFFF',
    bottomTextSecondary: '#FDE047',
    bottomTextStroke: '#DC2626',
    bottomExtrude: '#09090B',
    epBubbleFill: '#2563EB',
    epBubbleText: '#FFFFFF',
    sunburstA: '#7F1D1D',
    sunburstB: '#0F172A',
  },
};

export function getThemeDefaultColors(themeId: ThemeId): CustomPhaseColors {
  const t = COLOR_THEMES[themeId] || COLOR_THEMES.temple_fair;
  return {
    rankFill: t.rankFill,
    rankSecondary: t.rankSecondary,
    rankWaveAccent: t.rankWaveAccent,
    rankExtrude: t.rankExtrude,
    topTextFill: t.topTextFill,
    epBubbleFill: t.epBubbleFill,
    epBubbleText: t.epBubbleText,
    bannerTextFill: t.bannerTextFill,
    bannerBgStart: t.bannerBgStart,
    bannerBgEnd: t.bannerBgEnd,
    bannerBorder: t.bannerBorder,
    bulbColorOn: t.bulbColorOn,
    bulbColorOff: t.bulbColorOff,
    bottomTextFill: t.bottomTextFill,
    bottomTextSecondary: t.bottomTextSecondary,
    bottomTextStroke: t.bottomTextStroke,
    bottomExtrude: t.bottomExtrude,
    sunburstA: t.sunburstA,
    sunburstB: t.sunburstB,
  };
}

export function resolveActiveTheme(config: LogoConfig): ColorTheme {
  const base = COLOR_THEMES[config.themeId] || COLOR_THEMES.temple_fair;
  return {
    ...base,
    ...(config.customColors || {}),
  };
}

export interface PresetTemplate {
  id: string;
  label: string;
  middleText: string;
  epText: string;
  rankNumber: string;
  topText: string;
  bottomText: string;
  themeId: ThemeId;
  bannerStyle: BannerStyle;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'around_us',
    label: 'เรื่องพีคใกล้ตัว',
    rankNumber: '5',
    topText: 'อันดับ',
    middleText: 'เรื่องพีคในวงเหล้า',
    bottomText: 'สุดฮา',
    epText: 'EP.01',
    themeId: 'temple_fair',
    bannerStyle: 'temple_marquee',
  },
  {
    id: 'cafe_legend',
    label: 'มุกตลกคาเฟ่',
    rankNumber: '5',
    topText: 'อันดับ',
    middleText: 'มุกตบถาดตลกคาเฟ่',
    bottomText: 'สุดฮา',
    epText: 'EP.12',
    themeId: 'cafe_comedy',
    bannerStyle: 'canvas_scroll',
  },
  {
    id: 'street_interview',
    label: 'สัมภาษณ์ข้างทาง',
    rankNumber: '5',
    topText: 'อันดับ',
    middleText: 'คำตอบกวนโอ๊ยหน้าไมค์',
    bottomText: 'สุดฮา',
    epText: 'EP.45',
    themeId: 'local_news',
    bannerStyle: 'temple_marquee',
  },
  {
    id: 'temple_dance',
    label: 'ตัวตึงงานวัด',
    rankNumber: '5',
    topText: 'อันดับ',
    middleText: 'ท่าเต้นหน้าฮ้านหมอลำ',
    bottomText: 'สุดฮา',
    epText: 'EP.99',
    themeId: 'sai_yor_neon',
    bannerStyle: 'cafe_neon',
  },
];

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  rankNumber: '5',
  rankNumberSize: 182,
  topText: 'อันดับ',
  topTextSize: 94,
  numberTexture: 'wave_gradient',
  middleText: 'เรื่องพีคใกล้ตัวคนไทย',
  middleTextSize: 74,
  middleFont: 'Mali',
  bannerStyle: 'temple_marquee',
  thaiVowelSafePadding: 28,
  bottomText: 'สุดฮา',
  bottomTextSize: 116,
  bottomTiltDeg: -5,
  epEnabled: true,
  epText: 'EP.01',
  epTextSize: 38,
  epPosition: 'top_right',
  themeId: 'temple_fair',
  customColors: getThemeDefaultColors('temple_fair'),
  aspectRatio: '9:16',
  bgMode: 'sunburst',
  logoScale: 1.0,
  logoVerticalOffset: 0,
  showSafeZone: false,
  physics: {
    preset: 'broadcast_snappy',
    stiffness: 310,
    damping: 22,
    staggerDelay: 0.042,
    enableSquashStretch: true,
    enableMotionSmear: true,
    enableParallaxCamera: true,
    enableLightSweep: true,
    enableAmbientBokeh: true,
    supersampling: true,
  },
  props: {
    thaiFlagRibbon: true,
    tinTray: true,
    marigoldGarland: true,
    hornSpeaker: true,
    interviewMic: true,
    micChannelTag: 'ฮาTV',
    recCamera: true,
    clownMascot: true,
  },
  sfx: {
    masterEnabled: true,
    masterVolume: 0.75,
    phase1Boing: true,
    phase2UnrollPop: true,
    phase3TraySmash: true,
    phase4DrumJoke: true,
    phase5SwooshOut: true,
  },
};

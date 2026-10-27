import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  DEFAULT_LOGO_CONFIG,
  getThemeDefaultColors,
  LogoConfig,
  PRESET_TEMPLATES,
  ThemeId,
} from '../types/motion';

export interface SavedCustomPreset {
  id: string;
  name: string;
  config: LogoConfig;
  updatedAtLabel: string;
  isBuiltIn?: boolean;
  isCloudSynced?: boolean;
}

const LOCAL_ACTIVE_CONFIG_KEY = 'thai_comedy_active_workspace_v3';
const LOCAL_CUSTOM_PRESETS_KEY = 'thai_comedy_custom_presets_v3';

/**
 * Merges a partial or stored config safely with DEFAULT_LOGO_CONFIG
 */
export function normalizeLogoConfig(raw: Partial<LogoConfig> | null | undefined): LogoConfig {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_LOGO_CONFIG;
  }
  const rawMode = (raw as { numberTexture?: string }).numberTexture;
  const normalizedMode: LogoConfig['numberTexture'] =
    rawMode === 'wave_gradient' || rawMode === 'two_tone' || rawMode === 'solid_3d'
      ? rawMode
      : rawMode === 'thai_gold'
      ? 'two_tone'
      : 'wave_gradient';

  const validThemes: ThemeId[] = ['temple_fair', 'cafe_comedy', 'sai_yor_neon', 'local_news'];
  const activeThemeId: ThemeId =
    raw.themeId && validThemes.includes(raw.themeId) ? raw.themeId : DEFAULT_LOGO_CONFIG.themeId;

  const baseThemeColors = getThemeDefaultColors(activeThemeId);

  return {
    ...DEFAULT_LOGO_CONFIG,
    ...raw,
    themeId: activeThemeId,
    numberTexture: normalizedMode,
    customColors: {
      ...baseThemeColors,
      ...(raw.customColors || {}),
    },
    physics: {
      ...DEFAULT_LOGO_CONFIG.physics,
      ...(raw.physics || {}),
    },
    props: {
      ...DEFAULT_LOGO_CONFIG.props,
      ...(raw.props || {}),
    },
    sfx: {
      ...DEFAULT_LOGO_CONFIG.sfx,
      ...(raw.sfx || {}),
    },
  };
}

/**
 * Sanitizes a LogoConfig into the exact schema required by firebase-blueprint.json & firestore.rules
 */
function buildValidatedFirestorePayload(ownerId: string, config: LogoConfig) {
  const safeRank = String(config.rankNumber || '5').slice(0, 10);
  const safeTop = String(config.topText || 'อันดับ').slice(0, 40);
  const safeMiddle = String(config.middleText || '').slice(0, 120);
  const safeBottom = String(config.bottomText || 'สุดฮา').slice(0, 40);
  const safeEp = String(config.epText || 'EP.01').slice(0, 24);

  const validThemes = ['temple_fair', 'cafe_comedy', 'sai_yor_neon', 'local_news'];
  const safeTheme = validThemes.includes(config.themeId)
    ? config.themeId
    : 'temple_fair';

  const validBanners = ['temple_marquee', 'canvas_scroll', 'cafe_neon'];
  const safeBanner = validBanners.includes(config.bannerStyle)
    ? config.bannerStyle
    : 'temple_marquee';

  const validRatios = ['9:16', '16:9', '1:1'];
  const safeRatio = validRatios.includes(config.aspectRatio)
    ? config.aspectRatio
    : '9:16';

  const validBgModes = ['transparent', 'green', 'blue', 'sunburst'];
  const safeBgMode = validBgModes.includes(config.bgMode)
    ? config.bgMode
    : 'sunburst';

  return {
    ownerId: ownerId.slice(0, 128),
    rankNumber: safeRank,
    topText: safeTop,
    middleText: safeMiddle,
    bottomText: safeBottom,
    epText: safeEp,
    themeId: safeTheme,
    bannerStyle: safeBanner,
    aspectRatio: safeRatio,
    bgMode: safeBgMode,
    configPayload: {
      rankNumberSize: config.rankNumberSize,
      topTextSize: config.topTextSize,
      middleTextSize: config.middleTextSize,
      bottomTextSize: config.bottomTextSize,
      epTextSize: config.epTextSize,
      numberTexture: config.numberTexture,
      customColors: config.customColors,
      middleFont: config.middleFont,
      thaiVowelSafePadding: config.thaiVowelSafePadding,
      bottomTiltDeg: config.bottomTiltDeg,
      epEnabled: config.epEnabled,
      epPosition: config.epPosition,
      logoScale: config.logoScale,
      logoVerticalOffset: config.logoVerticalOffset,
      showSafeZone: config.showSafeZone,
      physics: config.physics,
      props: config.props,
      sfx: config.sfx,
    },
  };
}

/**
 * Reconstructs a full LogoConfig from a Firestore document
 */
export function parseFirestoreDocToConfig(data: Record<string, unknown>): LogoConfig {
  const payload = (data.configPayload as Record<string, unknown>) || {};
  return normalizeLogoConfig({
    rankNumber: typeof data.rankNumber === 'string' ? data.rankNumber : '5',
    topText: typeof data.topText === 'string' ? data.topText : 'อันดับ',
    middleText: typeof data.middleText === 'string' ? data.middleText : '',
    bottomText: typeof data.bottomText === 'string' ? data.bottomText : 'สุดฮา',
    epText: typeof data.epText === 'string' ? data.epText : 'EP.01',
    themeId: (data.themeId as LogoConfig['themeId']) || 'temple_fair',
    bannerStyle: (data.bannerStyle as LogoConfig['bannerStyle']) || 'temple_marquee',
    aspectRatio: (data.aspectRatio as LogoConfig['aspectRatio']) || '9:16',
    bgMode: (data.bgMode as LogoConfig['bgMode']) || 'sunburst',
    ...(payload as Partial<LogoConfig>),
  });
}

/**
 * Loads the user's last active configuration from local storage on initial boot
 */
export function loadLocalActiveConfig(): LogoConfig {
  try {
    const raw =
      localStorage.getItem(LOCAL_ACTIVE_CONFIG_KEY) ||
      localStorage.getItem('thai_comedy_motion_config_v2');
    if (raw) {
      return normalizeLogoConfig(JSON.parse(raw));
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_LOGO_CONFIG;
}

/**
 * Saves the active configuration to local storage immediately
 */
export function saveLocalActiveConfig(config: LogoConfig): void {
  try {
    localStorage.setItem(LOCAL_ACTIVE_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

/**
 * Syncs the user's active workspace configuration to Firestore (/workspaces/{userId})
 */
export async function syncWorkspaceToFirestore(config: LogoConfig): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const path = `workspaces/${user.uid}`;
  try {
    const basePayload = buildValidatedFirestorePayload(user.uid, config);
    await setDoc(doc(db, 'workspaces', user.uid), {
      ...basePayload,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches the user's active workspace configuration from Firestore (/workspaces/{userId})
 */
export async function loadWorkspaceFromFirestore(
  userId: string
): Promise<LogoConfig | null> {
  const path = `workspaces/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'workspaces', userId));
    if (snap.exists()) {
      return parseFirestoreDocToConfig(snap.data() as Record<string, unknown>);
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function getInitialStarterPresets(): SavedCustomPreset[] {
  return PRESET_TEMPLATES.map((t) => ({
    id: `preset_${t.id}`,
    name: t.label,
    updatedAtLabel: 'พร้อมแก้ไข/บันทึกทับ',
    isBuiltIn: false,
    isCloudSynced: false,
    config: normalizeLogoConfig({
      rankNumber: t.rankNumber,
      topText: t.topText,
      middleText: t.middleText,
      bottomText: t.bottomText,
      epText: t.epText,
      themeId: t.themeId,
      bannerStyle: t.bannerStyle,
    }),
  }));
}

/**
 * Returns user's saved presets from local storage, seeding editable starter presets only on first ever visit
 */
export function loadLocalCustomPresets(): SavedCustomPreset[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_PRESETS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as SavedCustomPreset[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => ({
          ...p,
          isBuiltIn: false,
          config: normalizeLogoConfig(p.config),
        }));
      }
    }
  } catch {
    // ignore
  }
  const initial = getInitialStarterPresets();
  saveLocalCustomPresetsOnly(initial);
  return initial;
}

export function saveLocalCustomPresetsOnly(customPresets: SavedCustomPreset[]): void {
  try {
    localStorage.setItem(
      LOCAL_CUSTOM_PRESETS_KEY,
      JSON.stringify(customPresets.map((p) => ({ ...p, isBuiltIn: false })))
    );
  } catch {
    // ignore
  }
}

function getUserScopedPresetDocId(userId: string, presetId: string): string {
  const cleanUser = userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
  const cleanPreset = presetId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  if (cleanPreset.startsWith(`${cleanUser}_`)) {
    return cleanPreset;
  }
  return `${cleanUser}_${cleanPreset}`;
}

/**
 * Saves or updates a Preset in Firestore (/presets/{presetId}) while strictly respecting create vs update rules
 */
export async function savePresetToFirestore(
  presetId: string,
  name: string,
  config: LogoConfig,
  _isNew?: boolean
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const scopedId = getUserScopedPresetDocId(user.uid, presetId);
  const path = `presets/${scopedId}`;
  const safeName = (name.trim() || config.middleText || 'Preset ใหม่').slice(0, 60);
  const basePayload = buildValidatedFirestorePayload(user.uid, config);

  let existsInCloud = false;
  try {
    const existingDoc = await getDoc(doc(db, 'presets', scopedId));
    existsInCloud = existingDoc.exists();

    if (!existsInCloud) {
      await setDoc(doc(db, 'presets', scopedId), {
        ...basePayload,
        name: safeName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = existingDoc.data();
      await setDoc(doc(db, 'presets', scopedId), {
        ...basePayload,
        name: safeName,
        createdAt: existingData?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      existsInCloud ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

/**
 * Deletes a Custom Preset from Firestore (/presets/{presetId})
 */
export async function deletePresetFromFirestore(presetId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const scopedId = getUserScopedPresetDocId(user.uid, presetId);
  const path = `presets/${scopedId}`;
  try {
    const snap = await getDoc(doc(db, 'presets', scopedId));
    if (snap.exists()) {
      await deleteDoc(doc(db, 'presets', scopedId));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to the authenticated user's Custom Presets in Firestore
 */
export function subscribeUserPresets(
  userId: string,
  onUpdate: (cloudPresets: SavedCustomPreset[]) => void
): () => void {
  const path = 'presets';
  const q = query(collection(db, 'presets'), where('ownerId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: SavedCustomPreset[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        list.push({
          id: docSnap.id,
          name: typeof data.name === 'string' ? data.name : 'Preset ที่บันทึก',
          config: parseFirestoreDocToConfig(data),
          updatedAtLabel: 'ซิงค์บน Cloud DB',
          isBuiltIn: false,
          isCloudSynced: true,
        });
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { LogoConfig } from '../types/motion';
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
} from '../utils/presetStorage';

export interface UsePresetSyncProps {
  config: LogoConfig;
  setConfig: React.Dispatch<React.SetStateAction<LogoConfig>>;
  onAfterApplyPreset?: (preset: SavedCustomPreset) => void;
  showToast: (message: string, duration?: number) => void;
}

export function usePresetSync({
  config,
  setConfig,
  onAfterApplyPreset,
  showToast,
}: UsePresetSyncProps) {
  const [presets, setPresets] = useState<SavedCustomPreset[]>(() =>
    loadLocalCustomPresets()
  );
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  const hasLoadedInitialCloudWorkspaceRef = useRef<boolean>(false);

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
        let seededInitialPresets = false;
        unsubPresets = subscribeUserPresets(user.uid, (cloudPresets) => {
          if (cloudPresets.length > 0) {
            setPresets(cloudPresets);
            saveLocalCustomPresetsOnly(cloudPresets);
          } else {
            const localCurrent = loadLocalCustomPresets();
            setPresets(localCurrent);
            if (!seededInitialPresets) {
              seededInitialPresets = true;
              Promise.all(
                localCurrent.map((p) =>
                  savePresetToFirestore(p.id, p.name, p.config, true)
                )
              ).catch(() => {
                // Handled by structured Firestore error handler
              });
            }
          }
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
  }, [setConfig]);

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
  const handleSignInGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('เชื่อมต่อฐานข้อมูล Cloud DB และซิงค์การตั้งค่าเรียบร้อยแล้ว');
    } catch {
      showToast('ยกเลิกการล็อกอิน ระบบยังคงบันทึกค่าอัตโนมัติในเครื่องของคุณ');
    }
  }, [showToast]);

  const handleSignOutGoogle = useCallback(async () => {
    await signOut(auth);
    showToast('ออกจากระบบ Cloud DB แล้ว การตั้งค่าในเครื่องยังอยู่ครบ');
  }, [showToast]);

  // Preset CRUD Handlers
  const handleApplySavedPreset = useCallback(
    (preset: SavedCustomPreset) => {
      setConfig(preset.config);
      setActivePresetId(preset.id);
      if (onAfterApplyPreset) {
        onAfterApplyPreset(preset);
      }
      showToast(`โหลดการตั้งค่า Preset "${preset.name}" เรียบร้อยแล้ว`, 2800);
    },
    [onAfterApplyPreset, setConfig, showToast]
  );

  const handleSaveNewPreset = useCallback(
    async (name: string) => {
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
    },
    [config, presets, showToast]
  );

  const handleUpdatePreset = useCallback(
    async (presetId: string) => {
      const target = presets.find((p) => p.id === presetId);
      if (!target) return;

      const updatedPreset: SavedCustomPreset = {
        ...target,
        isBuiltIn: false,
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
      showToast(
        `บันทึกการตั้งค่าปัจจุบันทับ Preset "${target.name}" เรียบร้อยแล้ว`
      );
    },
    [config, presets, showToast]
  );

  const handleRenamePreset = useCallback(
    async (presetId: string, newName: string) => {
      const target = presets.find((p) => p.id === presetId);
      const trimmed = newName.trim();
      if (!target || !trimmed) return;

      const updatedPreset: SavedCustomPreset = {
        ...target,
        name: trimmed,
        isBuiltIn: false,
        updatedAtLabel: auth.currentUser ? 'อัปเดตบน Cloud DB' : 'แก้ไขชื่อแล้ว',
      };

      const nextPresets = presets.map((p) =>
        p.id === presetId ? updatedPreset : p
      );
      setPresets(nextPresets);
      saveLocalCustomPresetsOnly(nextPresets);

      if (auth.currentUser) {
        setIsSyncingCloud(true);
        try {
          await savePresetToFirestore(presetId, trimmed, target.config, false);
        } finally {
          setIsSyncingCloud(false);
        }
      }
      showToast(`เปลี่ยนชื่อ Preset เป็น "${trimmed}" เรียบร้อยแล้ว`, 2500);
    },
    [presets, showToast]
  );

  const handleDeletePreset = useCallback(
    async (presetId: string) => {
      const target = presets.find((p) => p.id === presetId);
      if (!target) return;

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
      showToast(`ลบ Preset "${target.name}" เรียบร้อยแล้ว`, 2500);
    },
    [activePresetId, presets, showToast]
  );

  return {
    presets,
    activePresetId,
    setActivePresetId,
    userEmail,
    isSyncingCloud,
    handleSignInGoogle,
    handleSignOutGoogle,
    handleApplySavedPreset,
    handleSaveNewPreset,
    handleUpdatePreset,
    handleRenamePreset,
    handleDeletePreset,
  };
}

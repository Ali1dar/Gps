import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandMMKV } from '../storage/mmkv';
import type { FollowMode, MapStyleKey } from '../types/location';

interface SettingsState {
  mapStyle: MapStyleKey;
  followMode: FollowMode;
  setMapStyle: (s: MapStyleKey) => void;
  setFollowMode: (m: FollowMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mapStyle: 'dark',
      followMode: 'follow',
      setMapStyle: (mapStyle) => set({ mapStyle }),
      setFollowMode: (followMode) => set({ followMode }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => zustandMMKV),
      partialize: (s) => ({ mapStyle: s.mapStyle }),
    },
  ),
);

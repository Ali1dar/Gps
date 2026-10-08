import { create } from 'zustand';
import { storage } from '../storage/mmkv';
import type { LocationFix, PermissionLevel } from '../types/location';

const LAST_KNOWN_KEY = 'lastKnownPosition';
const PERSIST_EVERY_MS = 5000;

export interface LastKnown {
  longitude: number;
  latitude: number;
  headingDeg: number;
}

function readLastKnown(): LastKnown | null {
  try {
    const raw = storage.getString(LAST_KNOWN_KEY);
    return raw ? (JSON.parse(raw) as LastKnown) : null;
  } catch {
    return null;
  }
}

interface LocationState {
  /** Latest filtered fix. Components should NOT subscribe to this directly; use selectors. */
  fix: LocationFix | null;
  /** Persisted so a cold start can place the camera instantly, before GPS locks. */
  lastKnown: LastKnown | null;
  permission: PermissionLevel;
  tracking: boolean;
  setFix: (fix: LocationFix) => void;
  setPermission: (p: PermissionLevel) => void;
  setTracking: (t: boolean) => void;
}

let lastPersistAt = 0;

export const useLocationStore = create<LocationState>((set) => ({
  fix: null,
  lastKnown: readLastKnown(),
  permission: 'unknown',
  tracking: false,
  setFix: (fix) => {
    set({ fix });
    const now = Date.now();
    if (now - lastPersistAt > PERSIST_EVERY_MS) {
      lastPersistAt = now;
      const snapshot: LastKnown = {
        longitude: fix.longitude,
        latitude: fix.latitude,
        headingDeg: fix.headingDeg,
      };
      storage.set(LAST_KNOWN_KEY, JSON.stringify(snapshot));
    }
  },
  setPermission: (permission) => set({ permission }),
  setTracking: (tracking) => set({ tracking }),
}));

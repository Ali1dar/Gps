import type { LocationObject } from 'expo-location';
import { useLocationStore } from '../../store/locationStore';
import { locationProcessor } from './LocationProcessor';

/** Single entry point for raw samples (foreground watcher AND background task). */
export function ingestLocation(raw: LocationObject): void {
  const fix = locationProcessor.process(raw);
  if (fix) useLocationStore.getState().setFix(fix);
}

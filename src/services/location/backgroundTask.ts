import type { LocationObject } from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from './constants';
import { ingestLocation } from './ingest';

// Imported from index.ts so it is defined before React mounts (required by expo-task-manager).
TaskManager.defineTask<{ locations: LocationObject[] }>(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.warn('[location-task]', error.message);
    return;
  }
  data?.locations?.forEach(ingestLocation);
});

import * as Location from 'expo-location';
import { useLocationStore } from '../../store/locationStore';
import type { PermissionLevel } from '../../types/location';
import { LOCATION_TASK_NAME } from './constants';
import { ingestLocation } from './ingest';
import { locationProcessor } from './LocationProcessor';

class LocationService {
  private positionSub: Location.LocationSubscription | null = null;
  private headingSub: Location.LocationSubscription | null = null;
  private starting = false;

  /** Foreground first, then background (Android 11+ requires them as two separate prompts). */
  async requestPermissions(): Promise<PermissionLevel> {
    const { setPermission } = useLocationStore.getState();

    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== 'granted') {
      setPermission('denied');
      return 'denied';
    }
    setPermission('foreground');

    const bg = await Location.requestBackgroundPermissionsAsync();
    const level: PermissionLevel = bg.status === 'granted' ? 'background' : 'foreground';
    setPermission(level);
    return level;
  }

  /** Idempotent. Safe to call on every app foreground. */
  async start(): Promise<void> {
    if (this.positionSub || this.starting) return;
    this.starting = true;
    try {
      let level = useLocationStore.getState().permission;
      if (level === 'unknown' || level === 'denied') level = await this.requestPermissions();
      if (level === 'denied') return;

      // Seed instantly from the OS cache so the camera does not wait for a GPS lock.
      const cached = await Location.getLastKnownPositionAsync({ maxAge: 60_000, requiredAccuracy: 100 });
      if (cached) ingestLocation(cached);

      // Compass feeds the processor only (no store write) - it fires far too often for React.
      this.headingSub = await Location.watchHeadingAsync((h) => {
        locationProcessor.setCompass(h.trueHeading >= 0 ? h.trueHeading : h.magHeading);
      });

      this.positionSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
          mayShowUserSettingsDialog: true,
        },
        ingestLocation,
      );
      useLocationStore.getState().setTracking(true);
    } finally {
      this.starting = false;
    }
  }

  stop(): void {
    this.positionSub?.remove();
    this.headingSub?.remove();
    this.positionSub = null;
    this.headingSub = null;
    locationProcessor.reset();
    useLocationStore.getState().setTracking(false);
  }

  /** Keeps tracking with the screen off / app backgrounded (foreground service on Android). */
  async startBackground(): Promise<boolean> {
    if (useLocationStore.getState().permission !== 'background') return false;
    if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)) return true;

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000,
      distanceInterval: 5,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      activityType: Location.ActivityType.AutomotiveNavigation,
      foregroundService: {
        notificationTitle: 'GeoDrive is navigating',
        notificationBody: 'Tracking your location for guidance and alerts',
        notificationColor: '#4F8CFF',
      },
    });
    return true;
  }

  async stopBackground(): Promise<void> {
    if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  }
}

export const locationService = new LocationService();

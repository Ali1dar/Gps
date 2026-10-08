import type { LocationObject } from 'expo-location';
import type { LocationFix } from '../../types/location';
import { clamp, haversineMeters, shortestAngleDelta, smoothAngle } from './geo';

/** Samples worse than this are discarded (tunnels, cold GPS, urban canyons). */
const MAX_ACCURACY_M = 50;
/** Anything implying more than ~324 km/h between samples is a GPS teleport. */
const MAX_PLAUSIBLE_MPS = 90;
const SPEED_ALPHA = 0.4;
/** Below this we treat the vehicle as stopped and zero the speed. */
const STATIONARY_MPS = 0.6;
/** GPS course is only trustworthy above walking pace; below it use the compass. */
const COURSE_MIN_SPEED_MPS = 2;
const HEADING_ALPHA = 0.25;
const HEADING_DEADBAND_DEG = 1.5;
/** While stopped, ignore position changes smaller than this to stop the puck drifting. */
const STATIONARY_DRIFT_M = 3;

/**
 * Pure, stateful filter: raw GPS samples in, smoothed `LocationFix` out (or null = drop).
 * Shared by the foreground watcher and the background task so both behave identically.
 */
export class LocationProcessor {
  private last: LocationFix | null = null;
  private compassDeg: number | null = null;

  setCompass(deg: number | null): void {
    this.compassDeg = deg;
  }

  reset(): void {
    this.last = null;
  }

  process(raw: LocationObject): LocationFix | null {
    const { coords, timestamp } = raw;
    const prev = this.last;

    if (coords.accuracy != null && coords.accuracy > MAX_ACCURACY_M) return null;
    if (prev && timestamp <= prev.timestamp) return null; // out-of-order / duplicate

    let distanceM = 0;
    let dtSec = 0;
    if (prev) {
      distanceM = haversineMeters(prev.latitude, prev.longitude, coords.latitude, coords.longitude);
      dtSec = (timestamp - prev.timestamp) / 1000;
      if (dtSec > 0 && distanceM / dtSec > MAX_PLAUSIBLE_MPS) return null;
    }

    // --- Speed: prefer the chip's Doppler speed, fall back to distance / time -------------
    const rawSpeed =
      coords.speed != null && coords.speed >= 0 ? coords.speed : dtSec > 0 ? distanceM / dtSec : 0;
    const blended = prev ? prev.speedMps + (rawSpeed - prev.speedMps) * SPEED_ALPHA : rawSpeed;
    const isMoving = blended >= STATIONARY_MPS;
    const speedMps = isMoving ? blended : 0;

    // --- Drift suppression while stopped ---------------------------------------------------
    if (prev && !isMoving && !prev.isMoving && distanceM < STATIONARY_DRIFT_M) return null;

    // --- Heading: GPS course when driving, compass when slow/stopped, then smooth ----------
    const course = coords.heading != null && coords.heading >= 0 ? coords.heading : null;
    let target: number | null = null;
    if (course != null && speedMps >= COURSE_MIN_SPEED_MPS) target = course;
    else if (this.compassDeg != null) target = this.compassDeg;

    let headingDeg = prev?.headingDeg ?? target ?? 0;
    if (!prev && target != null) {
      headingDeg = target;
    } else if (target != null && Math.abs(shortestAngleDelta(headingDeg, target)) >= HEADING_DEADBAND_DEG) {
      headingDeg = smoothAngle(headingDeg, target, HEADING_ALPHA);
    }

    const fix: LocationFix = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      speedMps: clamp(speedMps, 0, MAX_PLAUSIBLE_MPS),
      headingDeg,
      isMoving,
      timestamp,
    };
    this.last = fix;
    return fix;
  }
}

export const locationProcessor = new LocationProcessor();

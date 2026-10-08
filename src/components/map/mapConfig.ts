import { clamp } from '../../services/location/geo';

/** Camera animation length; matches the 1 Hz GPS cadence so motion is continuous. */
export const CAMERA_ANIM_MS = 1000;
export const DEFAULT_CENTER: [number, number] = [44.3661, 33.3152]; // Baghdad [lon, lat]

/** Zoom out as speed rises so you always see enough road ahead. Quantised to avoid jitter. */
export function zoomForSpeed(speedMps: number): number {
  const zoom = clamp(17.6 - speedMps * 0.07, 15.2, 17.6);
  return Math.round(zoom * 10) / 10;
}

/** Tilt more when moving for a driver's-eye view; flatter when stopped. */
export function pitchForSpeed(speedMps: number): number {
  return speedMps < 1 ? 45 : 60;
}

export const STYLE_URLS = {
  dark: 'mapbox://styles/mapbox/navigation-night-v1',
  light: 'mapbox://styles/mapbox/navigation-day-v1',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const;

export const BUILDING_COLORS = {
  dark: '#2a3140',
  light: '#d5d9e0',
  satellite: '#8a8f98',
} as const;

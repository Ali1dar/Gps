const EARTH_RADIUS_M = 6371000;

export const toRad = (deg: number) => (deg * Math.PI) / 180;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const normalizeDeg = (deg: number) => ((deg % 360) + 360) % 360;

export function haversineMeters(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Signed shortest rotation from `from` to `to`, in (-180, 180]. */
export function shortestAngleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

/** Low-pass filter for angles that handles the 359 -> 1 wrap-around correctly. */
export function smoothAngle(prev: number, next: number, alpha: number): number {
  return normalizeDeg(prev + shortestAngleDelta(prev, next) * alpha);
}

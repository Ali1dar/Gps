export type PermissionLevel = 'unknown' | 'denied' | 'foreground' | 'background';
export type MapStyleKey = 'dark' | 'light' | 'satellite';
export type FollowMode = 'follow' | 'free';

/** A filtered, smoothed position fix. This is the only location shape the UI sees. */
export interface LocationFix {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  /** Smoothed ground speed in metres/second (0 when stationary). */
  speedMps: number;
  /** Smoothed heading, degrees clockwise from true north, [0, 360). */
  headingDeg: number;
  isMoving: boolean;
  /** Epoch ms of the underlying GPS sample. */
  timestamp: number;
}

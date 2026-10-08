import { Platform } from 'react-native';

export const ENV = {
  MAPBOX_PUBLIC_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '',
  REALTIME_URL: process.env.EXPO_PUBLIC_REALTIME_URL ?? '',
  IS_ANDROID: Platform.OS === 'android',
} as const;

if (!ENV.MAPBOX_PUBLIC_TOKEN && __DEV__) {
  console.warn('[env] EXPO_PUBLIC_MAPBOX_TOKEN is not set - the map will not load.');
}

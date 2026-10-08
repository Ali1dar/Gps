import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'GeoDrive AI',
  slug: 'geodrive-ai',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  extra: {
    eas: {
      projectId: '68915315-2b71-4dcf-bcd8-90f786e2d74c',
    },
  },
  android: {
    package: 'com.geodrive.ai',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_LOCATION',
      'POST_NOTIFICATIONS',
    ],
  },
  ios: {
    bundleIdentifier: 'com.geodrive.ai',
    infoPlist: { UIBackgroundModes: ['location'] },
  },
  plugins: [
    [
      '@rnmapbox/maps',
      { RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN },
    ],
    [
      'expo-location',
      {
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
        locationAlwaysAndWhenInUsePermission:
          'GeoDrive needs your location while driving, even with the screen off, to guide you.',
        locationWhenInUsePermission: 'GeoDrive needs your location to show you on the map.',
      },
    ],
  ],
};

export default config;

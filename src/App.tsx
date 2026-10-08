import React, { useEffect } from 'react';
import { AppState, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MapScreen } from './screens/MapScreen';
import { locationService } from './services/location/LocationService';

export default function App() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await locationService.start();
      if (!cancelled) await locationService.startBackground();
    })().catch((e) => console.warn('[bootstrap]', e));

    // Re-arm the foreground watcher when returning to the app (it is idempotent).
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') locationService.start().catch(() => {});
    });

    return () => {
      cancelled = true;
      sub.remove();
      locationService.stop();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <MapScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

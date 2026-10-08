import { useKeepAwake } from 'expo-keep-awake';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapStyleSwitcher } from '../components/map/MapStyleSwitcher';
import { NavigationMap } from '../components/map/NavigationMap';
import { useLocationStore } from '../store/locationStore';
import { useSettingsStore } from '../store/settingsStore';

/** Re-renders only when the whole-number km/h changes, not on every GPS tick. */
function SpeedHud() {
  const kmh = useLocationStore((s) => Math.round((s.fix?.speedMps ?? 0) * 3.6));
  return (
    <View style={styles.speed}>
      <Text style={styles.speedValue}>{kmh}</Text>
      <Text style={styles.speedUnit}>km/h</Text>
    </View>
  );
}

function RecenterButton() {
  const followMode = useSettingsStore((s) => s.followMode);
  const setFollowMode = useSettingsStore((s) => s.setFollowMode);
  if (followMode === 'follow') return null;
  return (
    <Pressable style={styles.recenter} onPress={() => setFollowMode('follow')} accessibilityRole="button">
      <Text style={styles.recenterText}>Recenter</Text>
    </Pressable>
  );
}

function PermissionBanner() {
  const permission = useLocationStore((s) => s.permission);
  if (permission === 'denied') {
    return (
      <View style={[styles.banner, styles.bannerError]}>
        <Text style={styles.bannerText}>Location permission is off. Enable it in system settings.</Text>
      </View>
    );
  }
  if (permission === 'foreground') {
    return (
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Allow "all the time" location to keep guiding with the screen off.</Text>
      </View>
    );
  }
  return null;
}

export function MapScreen() {
  useKeepAwake();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <NavigationMap />
      <View style={[styles.top, { top: insets.top + 8 }]} pointerEvents="box-none">
        <MapStyleSwitcher />
      </View>
      <View style={[styles.bottomLeft, { bottom: insets.bottom + 24 }]} pointerEvents="box-none">
        <SpeedHud />
      </View>
      <View style={[styles.bottomRight, { bottom: insets.bottom + 24 }]} pointerEvents="box-none">
        <RecenterButton />
      </View>
      <View style={[styles.bannerWrap, { top: insets.top + 64 }]} pointerEvents="none">
        <PermissionBanner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e1118' },
  top: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bottomLeft: { position: 'absolute', left: 16 },
  bottomRight: { position: 'absolute', right: 16 },
  speed: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(18,22,30,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedValue: { color: '#fff', fontSize: 26, fontWeight: '700', fontVariant: ['tabular-nums'] },
  speedUnit: { color: '#8b94a5', fontSize: 11, marginTop: -2 },
  recenter: { backgroundColor: '#4F8CFF', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24 },
  recenterText: { color: '#fff', fontWeight: '700' },
  bannerWrap: { position: 'absolute', left: 16, right: 16 },
  banner: { backgroundColor: 'rgba(18,22,30,0.9)', padding: 12, borderRadius: 12 },
  bannerError: { backgroundColor: 'rgba(160,40,40,0.92)' },
  bannerText: { color: '#fff', fontSize: 13 },
});

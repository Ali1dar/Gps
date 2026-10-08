import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import type { MapStyleKey } from '../../types/location';

const OPTIONS: { key: MapStyleKey; label: string }[] = [
  { key: 'dark', label: 'Night' },
  { key: 'light', label: 'Day' },
  { key: 'satellite', label: 'Sat' },
];

function MapStyleSwitcherBase() {
  const mapStyle = useSettingsStore((s) => s.mapStyle);
  const setMapStyle = useSettingsStore((s) => s.setMapStyle);

  return (
    <View style={styles.row}>
      {OPTIONS.map((o) => {
        const active = o.key === mapStyle;
        return (
          <Pressable
            key={o.key}
            onPress={() => setMapStyle(o.key)}
            style={[styles.pill, active && styles.pillActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const MapStyleSwitcher = memo(MapStyleSwitcherBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18,22,30,0.85)',
    borderRadius: 22,
    padding: 4,
    gap: 4,
  },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  pillActive: { backgroundColor: '#4F8CFF' },
  label: { color: '#aab2c0', fontSize: 13, fontWeight: '600' },
  labelActive: { color: '#fff' },
});

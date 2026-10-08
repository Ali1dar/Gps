import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TripBarProps {
  durationMinutes: number;
  distanceKm: string;
  eta: string;
  onEndNavigation: () => void;
}

export const TripBar: React.FC<TripBarProps> = ({
  durationMinutes,
  distanceKm,
  eta,
  onEndNavigation,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.durationText}>{durationMinutes} د</Text>
        <Text style={styles.subText}>
          {distanceKm} كم • الوصول {eta}
        </Text>
      </View>
      <TouchableOpacity style={styles.endButton} onPress={onEndNavigation}>
        <Text style={styles.endButtonText}>خروج</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    zIndex: 100,
  },
  infoContainer: {
    flex: 1,
  },
  durationText: {
    color: '#22C55E',
    fontSize: 26,
    fontWeight: 'bold',
  },
  subText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  endButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

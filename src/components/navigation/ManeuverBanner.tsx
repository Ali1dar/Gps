import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ManeuverBannerProps {
  instruction: string;
  distanceToNextManeuver: string;
  maneuverType?: string;
}

export const ManeuverBanner: React.FC<ManeuverBannerProps> = ({
  instruction,
  distanceToNextManeuver,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>⬆️</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.distanceText}>{distanceToNextManeuver}</Text>
        <Text style={styles.instructionText} numberOfLines={2}>
          {instruction || 'واصل السير على الطريق الرئيسي'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  distanceText: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructionText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
});

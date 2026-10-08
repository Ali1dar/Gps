import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { realtimeService } from '../../services/realtime/RealtimeService';

interface ReportBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  currentLocation: { latitude: number; longitude: number } | null;
}

const hazardTypes = [
  { id: 'police', label: 'شرطة', icon: '👮‍♂️', color: '#3B82F6' },
  { id: 'accident', label: 'حادث', icon: '💥', color: '#EF4444' },
  { id: 'hazard', label: 'خطر بالطريق', icon: '⚠️', color: '#F59E0B' },
  { id: 'camera', label: 'كاميرا سرعة', icon: '📷', color: '#8B5CF6' },
  { id: 'traffic_jam', label: 'زحام مروري', icon: '🚗', color: '#EC4899' },
];

export const ReportBottomSheet: React.FC<ReportBottomSheetProps> = ({
  visible,
  onClose,
  currentLocation,
}) => {
  const [loading, setLoading] = useState(false);

  const handleReportSelect = async (type: string) => {
    if (!currentLocation) {
      Alert.alert('تنبيه', 'جاري تحديد موقعك الحالي، يرجى الانتظار قليلاً...');
      return;
    }

    try {
      setLoading(true);
      
      // إرسال البلاغ عبر خدمة الـ WebSocket
      await realtimeService.createReport({
        type: type as any,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });

      Alert.alert('تم بنجاح', 'شكراً لك، تم إرسال البلاغ وتنبيه السائقين القريبين.');
      onClose();
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'فشل إرسال البلاغ، تحقق من الاتصال.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.handleBar} />
          <Text style={styles.title}>إبلاغ عن عائق أو حادث</Text>
          
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loaderText}>جاري بث البلاغ...</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {hazardTypes.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.reportButton, { backgroundColor: item.color + '20', borderColor: item.color }]}
                  onPress={() => handleReportSelect(item.id)}
                >
                  <Text style={styles.icon}>{item.icon}</Text>
                  <Text style={[styles.label, { color: item.color }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loaderContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { usePermission } from '@hooks/usePermission';
import { useSettingsStore } from '@store/settingsStore';

interface PermissionScreenProps {
  onComplete: () => void;
}

export default function PermissionScreen({
  onComplete,
}: PermissionScreenProps) {
  const { hasPermission, isLoading, requestPermission } = usePermission();
  const { setPermissionGranted, setPermissionSkipped } = useSettingsStore();

  // Auto-advance if permission is already granted
  useEffect(() => {
    if (hasPermission && !isLoading) {
      setPermissionGranted(true);
      onComplete();
    }
  }, [hasPermission, isLoading, setPermissionGranted, onComplete]);

  const handleGrantAccess = () => {
    requestPermission();
  };

  const handleSkip = () => {
    setPermissionSkipped(true);
    onComplete();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>One more thing...</Text>
        <Text style={styles.subtitle}>
          To provide you with insights, we need access to your phone usage data
        </Text>

        {/* Explanation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionIcon}>📊</Text>
          <Text style={styles.sectionTitle}>Why we need usage access</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>
              • Track your phone usage automatically
            </Text>
            <Text style={styles.bulletPoint}>
              • Correlate habits with screen time
            </Text>
            <Text style={styles.bulletPoint}>
              • Provide personalized insights
            </Text>
          </View>
        </View>

        {/* Privacy Assurance */}
        <View style={styles.privacySection}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyTitle}>All data stays on your device</Text>
          <Text style={styles.privacyText}>
            We never collect or transmit your data. Everything is stored locally
            and privately.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGrantAccess}
          activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Grant Access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkip}
          activeOpacity={0.8}>
          <Text style={styles.secondaryButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <Text style={styles.skipNote}>
          You can enable this later in Settings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  bulletList: {
    gap: 12,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  privacySection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  privacyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  skipNote: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

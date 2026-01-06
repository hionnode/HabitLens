import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { usePermission } from '@hooks/usePermission';
import { usageStatsService } from '@services/usageStatsService';
import type { UsageInfo } from '@types/index';

export default function HomeScreen() {
  const { hasPermission } = usePermission();
  const [usageData, setUsageData] = useState<UsageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTodayUsage = useCallback(async () => {
    if (!hasPermission) return;

    try {
      setIsLoading(true);
      const data = await usageStatsService.getTodayUsage();
      // Sort by usage time descending
      const sorted = data.sort(
        (a, b) => b.totalTimeInForeground - a.totalTimeInForeground
      );
      setUsageData(sorted.slice(0, 10)); // Top 10 apps
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission]);

  useEffect(() => {
    if (hasPermission) {
      loadTodayUsage();
    }
  }, [hasPermission, loadTodayUsage]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Home Screen</Text>
        <Text style={styles.subtext}>Habit tracking will go here</Text>

        {hasPermission ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Usage</Text>
              <TouchableOpacity onPress={loadTodayUsage}>
                <Text style={styles.refreshButton}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : usageData.length > 0 ? (
              <View style={styles.usageList}>
                {usageData.map(app => (
                  <View key={app.packageName} style={styles.usageItem}>
                    <View style={styles.usageInfo}>
                      <Text style={styles.appName}>{app.appName}</Text>
                      <Text style={styles.packageName}>{app.packageName}</Text>
                    </View>
                    <Text style={styles.usageTime}>
                      {formatTime(app.totalTimeInForeground)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No usage data available</Text>
            )}
          </View>
        ) : (
          <View style={styles.noPermissionBox}>
            <Text style={styles.noPermissionText}>
              📊 Grant usage access to see your screen time data
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  usageList: {
    gap: 12,
  },
  usageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  usageInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  packageName: {
    fontSize: 12,
    color: '#64748B',
  },
  usageTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
  },
  noDataText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  noPermissionBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noPermissionText: {
    fontSize: 14,
    color: '#92400E',
  },
});

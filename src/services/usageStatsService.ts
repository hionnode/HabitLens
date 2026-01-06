import { NativeModules } from 'react-native';
import type { UsageInfo, AppInfo } from '@types/index';

const { UsageStatsModule } = NativeModules;

/**
 * Service wrapper for UsageStatsModule native module
 * Provides type-safe access to Android UsageStatsManager API
 */
class UsageStatsService {
  /**
   * Check if usage access permission is granted
   */
  async hasPermission(): Promise<boolean> {
    try {
      return await UsageStatsModule.hasPermission();
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Open system settings for user to grant usage access permission
   * User must manually enable permission in Settings -> Apps -> Special Access -> Usage Access
   */
  requestPermission(): void {
    try {
      UsageStatsModule.requestPermission();
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  }

  /**
   * Get usage statistics for a time range
   * @param startTime Start of time range
   * @param endTime End of time range
   * @returns Array of usage info objects
   */
  async getUsageStats(startTime: Date, endTime: Date): Promise<UsageInfo[]> {
    try {
      const stats = await UsageStatsModule.getUsageStats(
        startTime.getTime(),
        endTime.getTime()
      );
      return stats as UsageInfo[];
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }

  /**
   * Get app display name and category from package name
   * @param packageName Package identifier (e.g., com.instagram.android)
   * @returns App info with name and category
   */
  async getAppInfo(packageName: string): Promise<AppInfo> {
    try {
      const info = await UsageStatsModule.getAppInfo(packageName);
      return info as AppInfo;
    } catch (error) {
      console.error(`Error getting app info for ${packageName}:`, error);
      throw error;
    }
  }

  /**
   * Helper: Get usage stats for today (midnight to now)
   */
  async getTodayUsage(): Promise<UsageInfo[]> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    return this.getUsageStats(startOfDay, now);
  }

  /**
   * Helper: Get usage stats for yesterday
   */
  async getYesterdayUsage(): Promise<UsageInfo[]> {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    return this.getUsageStats(yesterday, endOfYesterday);
  }

  /**
   * Helper: Get usage stats for the past N days
   * @param days Number of days to look back
   */
  async getPastDaysUsage(days: number): Promise<UsageInfo[]> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return this.getUsageStats(startDate, now);
  }

  /**
   * Helper: Get usage stats for a specific date
   * @param date The date to get stats for
   */
  async getDateUsage(date: Date): Promise<UsageInfo[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getUsageStats(startOfDay, endOfDay);
  }
}

// Export singleton instance
export const usageStatsService = new UsageStatsService();

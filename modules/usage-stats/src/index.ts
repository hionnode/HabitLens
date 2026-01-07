import { requireNativeModule } from 'expo-modules-core';
import type { UsageInfo, AppInfo } from '@/types';

// Import the native module
const UsageStatsNativeModule = requireNativeModule('UsageStats');

/**
 * Check if usage access permission is granted
 */
export async function hasPermission(): Promise<boolean> {
    return await UsageStatsNativeModule.hasPermission();
}

/**
 * Open system settings for user to grant usage access permission
 */
export function requestPermission(): void {
    UsageStatsNativeModule.requestPermission();
}

/**
 * Get usage statistics for a time range
 */
export async function getUsageStats(
    startTime: number,
    endTime: number
): Promise<UsageInfo[]> {
    return await UsageStatsNativeModule.getUsageStats(startTime, endTime);
}

/**
 * Get app display name and category from package name
 */
export async function getAppInfo(packageName: string): Promise<AppInfo> {
    return await UsageStatsNativeModule.getAppInfo(packageName);
}

/**
 * Helper: Get usage stats for today (midnight to now)
 */
export async function getTodayUsage(): Promise<UsageInfo[]> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    return getUsageStats(startOfDay.getTime(), now.getTime());
}

/**
 * Helper: Get usage stats for yesterday
 */
export async function getYesterdayUsage(): Promise<UsageInfo[]> {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);
    return getUsageStats(yesterday.getTime(), endOfYesterday.getTime());
}

/**
 * Helper: Get usage stats for the past N days
 */
export async function getPastDaysUsage(days: number): Promise<UsageInfo[]> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    return getUsageStats(startDate.getTime(), now.getTime());
}

/**
 * Helper: Get usage stats for a specific date
 */
export async function getDateUsage(date: Date): Promise<UsageInfo[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return getUsageStats(startOfDay.getTime(), endOfDay.getTime());
}

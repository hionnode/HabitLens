import { NativeModules } from 'react-native';

const { UsageStatsModule } = NativeModules;

export const usageStatsService = {
    async hasPermission(): Promise<boolean> {
        return await UsageStatsModule.hasPermission();
    },

    requestPermission(): void {
        UsageStatsModule.requestPermission();
    },

    async getUsageStats(startTime: Date, endTime: Date): Promise<unknown[]> {
        return await UsageStatsModule.getUsageStats(
            startTime.getTime(),
            endTime.getTime()
        );
    },
};

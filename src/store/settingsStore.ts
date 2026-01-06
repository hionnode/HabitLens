import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usageStatsService } from '@services/usageStatsService';

interface SettingsStore {
  // Permission state
  permissionGranted: boolean;
  permissionSkipped: boolean;

  // App settings
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';

  // Actions
  setPermissionGranted: (granted: boolean) => void;
  setPermissionSkipped: (skipped: boolean) => void;
  checkPermission: () => Promise<boolean>;
  setOnboardingComplete: (complete: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Persistence
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

const SETTINGS_STORAGE_KEY = '@habitlens_settings';

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state
  permissionGranted: false,
  permissionSkipped: false,
  onboardingComplete: false,
  notificationsEnabled: true,
  theme: 'system',

  // Permission actions
  setPermissionGranted: granted => {
    set({ permissionGranted: granted });
    get().saveSettings();
  },

  setPermissionSkipped: skipped => {
    set({ permissionSkipped: skipped });
    get().saveSettings();
  },

  checkPermission: async () => {
    const granted = await usageStatsService.hasPermission();
    set({ permissionGranted: granted });
    get().saveSettings();
    return granted;
  },

  // App settings actions
  setOnboardingComplete: complete => {
    set({ onboardingComplete: complete });
    get().saveSettings();
  },

  setNotificationsEnabled: enabled => {
    set({ notificationsEnabled: enabled });
    get().saveSettings();
  },

  setTheme: theme => {
    set({ theme });
    get().saveSettings();
  },

  // Persistence
  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        set(settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },

  saveSettings: async () => {
    try {
      const state = get();
      const toSave = {
        permissionGranted: state.permissionGranted,
        permissionSkipped: state.permissionSkipped,
        onboardingComplete: state.onboardingComplete,
        notificationsEnabled: state.notificationsEnabled,
        theme: state.theme,
      };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
}));

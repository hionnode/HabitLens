// Type definitions for HabitLens

export interface UsageInfo {
  packageName: string;
  appName: string;
  totalTimeInForeground: number; // milliseconds
  lastTimeUsed: number; // Unix timestamp
  firstTimeUsed: number; // Unix timestamp
  launchCount: number;
}

export interface AppInfo {
  appName: string;
  category: string;
}

export type AppCategory = 'productive' | 'neutral' | 'sink';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  order: number;
  targetDays: number[];
  reminderTime: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: Date;
  isBackfilled: boolean;
  createdAt: Date;
}

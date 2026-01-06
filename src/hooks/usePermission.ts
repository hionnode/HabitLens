import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usageStatsService } from '@services/usageStatsService';

interface UsePermissionReturn {
  hasPermission: boolean;
  isLoading: boolean;
  error: Error | null;
  checkPermission: () => Promise<boolean>;
  requestPermission: () => void;
}

/**
 * Custom hook for managing usage access permission
 * Automatically checks permission on mount and when app resumes from background
 */
export function usePermission(): UsePermissionReturn {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const granted = await usageStatsService.hasPermission();
      setHasPermission(granted);
      return granted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(() => {
    try {
      usageStatsService.requestPermission();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Re-check permission when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [checkPermission]);

  return {
    hasPermission,
    isLoading,
    error,
    checkPermission,
    requestPermission,
  };
}

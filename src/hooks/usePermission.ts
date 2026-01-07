import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usageStatsService } from '@/lib/usageStats';

interface UsePermissionReturn {
  hasPermission: boolean;
  isLoading: boolean;
  error: Error | null;
  checkPermission: () => Promise<boolean>;
  requestPermission: () => void;
}

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
      const permissionError =
        err instanceof Error ? err : new Error('Unknown error');
      setError(permissionError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(() => {
    try {
      usageStatsService.requestPermission();
    } catch (err) {
      const requestError =
        err instanceof Error ? err : new Error('Unknown error');
      setError(requestError);
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

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

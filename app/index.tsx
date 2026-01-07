import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/stores/settingsStore';

export default function Index() {
  const { permissionGranted, permissionSkipped } = useSettingsStore();

  // Route to permission screen if not granted/skipped
  if (!permissionGranted && !permissionSkipped) {
    return <Redirect href="/(onboarding)/permission" />;
  }

  // Otherwise go to main tabs
  return <Redirect href="/(tabs)" />;
}

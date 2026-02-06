import { Platform } from 'react-native';
import * as Application from 'expo-application';

const EXPECTED_BUNDLE_IDS: Record<string, string> = {
  ios: 'com.levisine.Quiz',
  android: 'com.levisine.Quiz',
};

export function verifyBundleId(): boolean {
  const expected = EXPECTED_BUNDLE_IDS[Platform.OS];
  if (!expected) return true;

  const actual = Application.applicationId;
  if (actual && actual !== expected) {
    console.warn(`[Security] Unexpected bundle ID: ${actual}`);
    return false;
  }
  return true;
}

export function isDebugBuild(): boolean {
  if (__DEV__) {
    console.warn('[Security] Running in debug mode');
    return true;
  }
  return false;
}

export function runIntegrityChecks(): void {
  verifyBundleId();
  isDebugBuild();
}

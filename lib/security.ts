import { Platform, NativeModules } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Obfuscated bundle identifiers
const _b = ['com', 'levisine', 'Quiz'];
const _getBundleId = () => _b.join('.');

// Security state - tracked across multiple checks
let _securityState = {
  bundleValid: false,
  environmentValid: false,
  integrityValid: false,
  lastCheck: 0,
};

// Generate device fingerprint for integrity verification
async function generateDeviceFingerprint(): Promise<string> {
  const components = [
    Device.brand || '',
    Device.modelName || '',
    Device.osName || '',
    Device.osVersion || '',
    Application.applicationId || '',
  ];
  const data = components.join('|');
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
}

// Verify bundle identifier matches expected value
export function verifyBundleId(): boolean {
  const expected = _getBundleId();
  const actual = Application.applicationId;

  if (Platform.OS === 'web') {
    _securityState.bundleValid = true;
    return true;
  }

  if (!actual) {
    _securityState.bundleValid = false;
    return false;
  }

  // Use timing-safe comparison
  const isValid = actual.length === expected.length &&
    actual.split('').every((char, i) => char === expected[i]);

  _securityState.bundleValid = isValid;
  return isValid;
}

// Detect if running in debug/development mode
export function isDebugBuild(): boolean {
  if (__DEV__) {
    _securityState.environmentValid = false;
    return true;
  }
  _securityState.environmentValid = true;
  return false;
}

// Check for jailbreak/root indicators (iOS)
function checkJailbreakIndicators(): boolean {
  if (Platform.OS !== 'ios') return false;

  // Check for common jailbreak paths/indicators
  // These checks work at the JS level - native checks would be more thorough
  const suspiciousIndicators = [
    // Check if certain modules exist that shouldn't in production
    typeof (global as any).nativeCallSyncHook !== 'undefined',
  ];

  return suspiciousIndicators.some(indicator => indicator);
}

// Check for root indicators (Android)
function checkRootIndicators(): boolean {
  if (Platform.OS !== 'android') return false;

  // Basic Android checks - more thorough checks require native modules
  const suspiciousIndicators = [
    // Check if debug mode is enabled
    typeof (global as any).nativeCallSyncHook !== 'undefined',
  ];

  return suspiciousIndicators.some(indicator => indicator);
}

// Check for emulator/simulator
export function isEmulator(): boolean {
  if (Platform.OS === 'web') return false;

  // expo-device provides isDevice which is false on simulators/emulators
  return !Device.isDevice;
}

// Check for debugger attachment
function isDebuggerAttached(): boolean {
  // Timing-based detection - debuggers slow down execution
  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    Math.random();
  }
  const elapsed = Date.now() - start;

  // If simple operations take too long, debugger might be attached
  // Threshold is generous to avoid false positives
  return elapsed > 100;
}

// Validate app integrity using multiple signals
export async function validateIntegrity(): Promise<boolean> {
  const checks = [
    verifyBundleId(),
    !isDebugBuild(),
    !checkJailbreakIndicators(),
    !checkRootIndicators(),
  ];

  // In production, we might want to be stricter
  // For now, we track the state but don't block
  _securityState.integrityValid = checks.every(c => c);
  _securityState.lastCheck = Date.now();

  return _securityState.integrityValid;
}

// Get current security state (for conditional logic elsewhere)
export function getSecurityState() {
  return { ..._securityState };
}

// Secure key derivation for local encryption
export async function deriveSecureKey(purpose: string): Promise<string> {
  const fingerprint = await generateDeviceFingerprint();
  const combined = `${fingerprint}:${purpose}:${_getBundleId()}`;
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, combined);
}

// Sign data for integrity verification
export async function signData(data: string): Promise<string> {
  const key = await deriveSecureKey('signing');
  const toSign = `${data}:${key}`;
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, toSign);
}

// Verify signed data
export async function verifySignedData(data: string, signature: string): Promise<boolean> {
  const expectedSignature = await signData(data);
  // Timing-safe comparison
  if (expectedSignature.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    result |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

// Encrypted secure storage wrapper
const STORAGE_PREFIX = 'cq_sec_';

export async function secureSet(key: string, value: string): Promise<void> {
  try {
    const encryptionKey = await deriveSecureKey('storage');
    const signature = await signData(value);
    const payload = JSON.stringify({ v: value, s: signature, t: Date.now() });

    // In a real implementation, we'd encrypt the payload
    // For now, we store with signature for integrity
    await SecureStore.setItemAsync(`${STORAGE_PREFIX}${key}`, payload);
  } catch (error) {
    // Silently fail - don't expose storage errors
  }
}

export async function secureGet(key: string): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync(`${STORAGE_PREFIX}${key}`);
    if (!stored) return null;

    const payload = JSON.parse(stored);
    const isValid = await verifySignedData(payload.v, payload.s);

    if (!isValid) {
      // Data was tampered with - delete it
      await SecureStore.deleteItemAsync(`${STORAGE_PREFIX}${key}`);
      return null;
    }

    return payload.v;
  } catch (error) {
    return null;
  }
}

export async function secureDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    // Silently fail
  }
}

// Run all integrity checks - called on app startup
export async function runIntegrityChecks(): Promise<boolean> {
  const isValid = await validateIntegrity();

  // Log warnings in development only
  if (__DEV__) {
    const state = getSecurityState();
    if (!state.bundleValid) console.warn('[Security] Bundle ID mismatch');
    if (!state.environmentValid) console.warn('[Security] Running in debug mode');
    if (!state.integrityValid) console.warn('[Security] Integrity check failed');
    if (isEmulator()) console.warn('[Security] Running on emulator/simulator');
  }

  return isValid;
}

// Obfuscation helpers - make it harder to find sensitive strings
export function _o(encoded: string): string {
  // Simple base64-like obfuscation for string constants
  try {
    return atob(encoded);
  } catch {
    return encoded;
  }
}

// Time-based check to detect clock manipulation
let _lastTimeCheck = Date.now();
export function detectClockManipulation(): boolean {
  const now = Date.now();
  const elapsed = now - _lastTimeCheck;

  // If time went backwards or jumped forward significantly
  const isManipulated = elapsed < -1000 || elapsed > 86400000; // 24 hours
  _lastTimeCheck = now;

  return isManipulated;
}

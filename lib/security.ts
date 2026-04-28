import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';

// ----- Bundle identifier (single source of truth: app.json) -----

function getExpectedBundleId(): string {
  const cfg =
    Constants.expoConfig ?? (Constants.manifest2 as unknown as typeof Constants.expoConfig);
  if (Platform.OS === 'ios') {
    return cfg?.ios?.bundleIdentifier ?? '';
  }
  if (Platform.OS === 'android') {
    return cfg?.android?.package ?? '';
  }
  return '';
}

// ----- Security state -----

const _securityState = {
  bundleValid: false,
  environmentValid: false,
  integrityValid: false,
  lastCheck: 0,
};

// ----- Device fingerprint -----

async function generateDeviceFingerprint(): Promise<string> {
  const components = [
    Device.brand || '',
    Device.modelName || '',
    Device.osName || '',
    Device.osVersion || '',
    Application.applicationId || '',
  ];
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, components.join('|'));
}

// ----- Bundle ID verification -----

export function verifyBundleId(): boolean {
  if (Platform.OS === 'web') {
    _securityState.bundleValid = true;
    return true;
  }

  const expected = getExpectedBundleId();
  const actual = Application.applicationId;

  if (!expected || !actual) {
    _securityState.bundleValid = false;
    return false;
  }

  if (actual.length !== expected.length) {
    _securityState.bundleValid = false;
    return false;
  }

  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  _securityState.bundleValid = diff === 0;
  return diff === 0;
}

// ----- Build / environment checks -----

export function isDebugBuild(): boolean {
  if (__DEV__) {
    _securityState.environmentValid = false;
    return true;
  }
  _securityState.environmentValid = true;
  return false;
}

function checkJailbreakIndicators(): boolean {
  if (Platform.OS !== 'ios') return false;
  return typeof (global as { nativeCallSyncHook?: unknown }).nativeCallSyncHook !== 'undefined';
}

function checkRootIndicators(): boolean {
  if (Platform.OS !== 'android') return false;
  return typeof (global as { nativeCallSyncHook?: unknown }).nativeCallSyncHook !== 'undefined';
}

export function isEmulator(): boolean {
  if (Platform.OS === 'web') return false;
  return !Device.isDevice;
}

// ----- Integrity validation -----

export async function validateIntegrity(): Promise<boolean> {
  const checks = [
    verifyBundleId(),
    !isDebugBuild(),
    !checkJailbreakIndicators(),
    !checkRootIndicators(),
  ];
  _securityState.integrityValid = checks.every(Boolean);
  _securityState.lastCheck = Date.now();
  return _securityState.integrityValid;
}

export function getSecurityState(): typeof _securityState {
  return { ..._securityState };
}

// ----- HMAC signing with per-install secret -----

const HMAC_SECRET_KEY = 'cq_hmac_secret_v1';
let _hmacSecretCache: Uint8Array | null = null;

async function getOrCreateHmacSecret(): Promise<Uint8Array> {
  if (_hmacSecretCache) return _hmacSecretCache;

  const stored = await SecureStore.getItemAsync(HMAC_SECRET_KEY);
  if (stored) {
    _hmacSecretCache = hexToBytes(stored);
    return _hmacSecretCache;
  }

  const bytes = await Crypto.getRandomBytesAsync(32);
  const fresh = new Uint8Array(bytes);
  await SecureStore.setItemAsync(HMAC_SECRET_KEY, bytesToHex(fresh));
  _hmacSecretCache = fresh;
  return fresh;
}

export async function deriveSecureKey(purpose: string): Promise<string> {
  const fingerprint = await generateDeviceFingerprint();
  const expected = getExpectedBundleId();
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${fingerprint}:${purpose}:${expected}`
  );
}

export async function signData(data: string): Promise<string> {
  const secret = await getOrCreateHmacSecret();
  const sig = hmac(sha256, secret, utf8ToBytes(data));
  return bytesToHex(sig);
}

export async function verifySignedData(data: string, signature: string): Promise<boolean> {
  const expected = await signData(data);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

// ----- Signed storage wrapper -----

const STORAGE_PREFIX = 'cq_sec_';

export async function secureSet(key: string, value: string): Promise<void> {
  try {
    const signature = await signData(value);
    const payload = JSON.stringify({ v: value, s: signature, t: Date.now() });
    await SecureStore.setItemAsync(`${STORAGE_PREFIX}${key}`, payload);
  } catch (error) {
    if (__DEV__) console.warn('[security] secureSet failed', error);
  }
}

export async function secureGet(key: string): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync(`${STORAGE_PREFIX}${key}`);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as { v: string; s: string; t: number };
    const ok = await verifySignedData(parsed.v, parsed.s);
    if (!ok) {
      await SecureStore.deleteItemAsync(`${STORAGE_PREFIX}${key}`);
      return null;
    }
    return parsed.v;
  } catch (error) {
    if (__DEV__) console.warn('[security] secureGet failed', error);
    return null;
  }
}

export async function secureDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    if (__DEV__) console.warn('[security] secureDelete failed', error);
  }
}

// ----- Startup integrity log (dev only) -----

export async function runIntegrityChecks(): Promise<boolean> {
  const isValid = await validateIntegrity();
  if (__DEV__) {
    const state = getSecurityState();
    if (!state.bundleValid) console.warn('[Security] Bundle ID mismatch');
    if (!state.environmentValid) console.warn('[Security] Running in debug mode');
    if (!state.integrityValid) console.warn('[Security] Integrity check failed');
    if (isEmulator()) console.warn('[Security] Running on emulator/simulator');
  }
  return isValid;
}

// ----- Clock manipulation detection -----

let _lastTimeCheck = Date.now();

export function detectClockManipulation(): boolean {
  const now = Date.now();
  const elapsed = now - _lastTimeCheck;
  const isManipulated = elapsed < -1000 || elapsed > 86400000;
  _lastTimeCheck = now;
  return isManipulated;
}

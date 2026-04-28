import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesError,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import Constants from 'expo-constants';
import { secureSet, secureGet, secureDelete, validateIntegrity } from './security';

const ENTITLEMENT_ID = 'pro';
const CACHE_KEY = 'ent_v2'; // versioned: bump when payload shape changes
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const VALIDATION_INTERVAL_MS = 60 * 1000;

let _lastValidation = 0;
let _validationCount = 0;

function getApiKey(): string {
  const extra = Constants.expoConfig?.extra;
  if (Platform.OS === 'ios') {
    return (extra?.revenueCatAppleApiKey as string) ?? '';
  }
  return (extra?.revenueCatGoogleApiKey as string) ?? '';
}

export function isPurchasesConfigured(): boolean {
  return getApiKey().length > 0;
}

export async function initPurchases(): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) {
    if (__DEV__) console.warn('[purchases] RevenueCat API key not configured');
    return;
  }

  try {
    Purchases.configure({ apiKey });
  } catch (error) {
    if (__DEV__) console.error('[purchases] configure failed:', error);
  }
}

async function validateEntitlement(customerInfo: CustomerInfo): Promise<boolean> {
  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) return false;
  if (entitlement.identifier !== ENTITLEMENT_ID) return false;
  if (entitlement.isActive !== true) return false;
  if (entitlement.expirationDate && new Date(entitlement.expirationDate) <= new Date()) {
    return false;
  }
  return true;
}

export async function checkProAccess(): Promise<boolean> {
  if (!isPurchasesConfigured()) {
    return getCachedEntitlement();
  }

  const now = Date.now();
  if (now - _lastValidation < VALIDATION_INTERVAL_MS && _validationCount > 10) {
    return getCachedEntitlement();
  }
  _lastValidation = now;
  _validationCount++;

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = await validateEntitlement(customerInfo);
    await cacheEntitlement(isPro, customerInfo.originalAppUserId);
    return isPro;
  } catch (error) {
    if (__DEV__) console.warn('[purchases] checkProAccess failed, using cache:', error);
    return getCachedEntitlement();
  }
}

export type PurchaseResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'cancelled'
        | 'pending'
        | 'network'
        | 'not_allowed'
        | 'product_unavailable'
        | 'integrity'
        | 'unknown';
      message?: string;
    };

export async function purchasePro(): Promise<PurchaseResult> {
  try {
    const integrityValid = await validateIntegrity();
    if (!integrityValid && !__DEV__) {
      return { ok: false, reason: 'integrity', message: 'Device integrity check failed' };
    }

    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    if (!pkg) {
      return { ok: false, reason: 'product_unavailable', message: 'No products available' };
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = await validateEntitlement(customerInfo);
    await cacheEntitlement(isPro, customerInfo.originalAppUserId);
    return isPro ? { ok: true } : { ok: false, reason: 'unknown' };
  } catch (e: unknown) {
    return classifyPurchaseError(e);
  }
}

function classifyPurchaseError(e: unknown): PurchaseResult {
  const err = e as PurchasesError & { userCancelled?: boolean };
  if (err?.userCancelled) return { ok: false, reason: 'cancelled' };

  switch (err?.code) {
    case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
      return { ok: false, reason: 'cancelled' };
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return { ok: false, reason: 'pending', message: err.message };
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
      return { ok: false, reason: 'network', message: err.message };
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
    case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
      return { ok: false, reason: 'not_allowed', message: err.message };
    case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
      return { ok: false, reason: 'product_unavailable', message: err.message };
    default:
      return { ok: false, reason: 'unknown', message: err?.message };
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = await validateEntitlement(customerInfo);
    await cacheEntitlement(isPro, customerInfo.originalAppUserId);
    return isPro;
  } catch (error) {
    if (__DEV__) console.warn('[purchases] restorePurchases failed:', error);
    return false;
  }
}

export async function getOfferings() {
  try {
    return await Purchases.getOfferings();
  } catch {
    return null;
  }
}

async function cacheEntitlement(isPro: boolean, userId?: string): Promise<void> {
  const payload = JSON.stringify({
    isPro,
    userIdHash: userId ? hashUserId(userId) : null,
    cachedAt: Date.now(),
    schemaVersion: 1,
  });
  await secureSet(CACHE_KEY, payload);
}

async function getCachedEntitlement(): Promise<boolean> {
  try {
    const data = await secureGet(CACHE_KEY);
    if (!data) return false;
    const parsed = JSON.parse(data) as { isPro: boolean; cachedAt: number };
    if (Date.now() - parsed.cachedAt > CACHE_MAX_AGE_MS) {
      await secureDelete(CACHE_KEY);
      return false;
    }
    return parsed.isPro === true;
  } catch {
    return false;
  }
}

function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}

export async function clearEntitlementCache(): Promise<void> {
  await secureDelete(CACHE_KEY);
  _validationCount = 0;
}

export async function getCacheStatus(): Promise<{
  hasCachedValue: boolean;
  cacheAge: number | null;
}> {
  if (!__DEV__) return { hasCachedValue: false, cacheAge: null };
  try {
    const data = await secureGet(CACHE_KEY);
    if (!data) return { hasCachedValue: false, cacheAge: null };
    const parsed = JSON.parse(data) as { cachedAt: number };
    return { hasCachedValue: true, cacheAge: Date.now() - parsed.cachedAt };
  } catch {
    return { hasCachedValue: false, cacheAge: null };
  }
}

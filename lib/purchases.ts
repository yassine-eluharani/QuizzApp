import { Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import Constants from 'expo-constants';
import { secureSet, secureGet, secureDelete, getSecurityState, validateIntegrity } from './security';

// Obfuscated entitlement identifier
const _e = [0x70, 0x72, 0x6f]; // 'pro'
const _getEntitlementId = () => String.fromCharCode(..._e);

// Cache keys - obfuscated
const _ck = [0x65, 0x6e, 0x74]; // 'ent'
const _getCacheKey = () => String.fromCharCode(..._ck);

// Validation state tracking
let _lastValidation = 0;
let _validationCount = 0;
const VALIDATION_INTERVAL = 60000; // 1 minute minimum between validations

function getApiKey(): string {
  const extra = Constants.expoConfig?.extra;
  if (Platform.OS === 'ios') {
    return extra?.revenueCatAppleApiKey ?? '';
  }
  return extra?.revenueCatGoogleApiKey ?? '';
}

export async function initPurchases(): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) {
    if (__DEV__) {
      console.warn('RevenueCat API key not configured');
    }
    return;
  }

  try {
    Purchases.configure({ apiKey });
  } catch (error) {
    // Silent fail in production
    if (__DEV__) {
      console.error('Failed to configure RevenueCat:', error);
    }
  }
}

// Validate entitlement with multiple checks
async function validateEntitlement(customerInfo: CustomerInfo): Promise<boolean> {
  const entitlementId = _getEntitlementId();

  // Primary check - entitlement exists and is active
  const entitlement = customerInfo.entitlements.active[entitlementId];
  if (!entitlement) return false;

  // Secondary check - verify entitlement properties
  const hasIdentifier = entitlement.identifier === entitlementId;
  const isActive = entitlement.isActive === true;

  // Tertiary check - verify expiration (if applicable)
  const notExpired = !entitlement.expirationDate ||
    new Date(entitlement.expirationDate) > new Date();

  return hasIdentifier && isActive && notExpired;
}

export async function checkProAccess(): Promise<boolean> {
  const now = Date.now();

  // Rate limit validation checks to prevent abuse detection
  if (now - _lastValidation < VALIDATION_INTERVAL && _validationCount > 10) {
    // Too many checks in short time - return cached value
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
    // Network error or RevenueCat unavailable - use cache
    return getCachedEntitlement();
  }
}

export async function purchasePro(): Promise<boolean> {
  try {
    // Validate app integrity before allowing purchase
    const integrityValid = await validateIntegrity();
    if (!integrityValid && !__DEV__) {
      // In production, block purchases on compromised devices
      // This protects both the user and revenue
      throw new Error('Device integrity check failed');
    }

    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    if (!pkg) {
      if (__DEV__) {
        console.warn('No packages available');
      }
      return false;
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = await validateEntitlement(customerInfo);
    await cacheEntitlement(isPro, customerInfo.originalAppUserId);
    return isPro;
  } catch (e: any) {
    if (e.userCancelled) return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = await validateEntitlement(customerInfo);
    await cacheEntitlement(isPro, customerInfo.originalAppUserId);
    return isPro;
  } catch (error) {
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

// Secure cache with integrity verification
async function cacheEntitlement(isPro: boolean, userId?: string): Promise<void> {
  const cacheKey = _getCacheKey();
  const payload = JSON.stringify({
    p: isPro ? 1 : 0, // Obfuscated pro status
    u: userId ? hashUserId(userId) : null,
    t: Date.now(),
    v: 1, // Version for future migrations
  });

  await secureSet(cacheKey, payload);
}

async function getCachedEntitlement(): Promise<boolean> {
  try {
    const cacheKey = _getCacheKey();
    const data = await secureGet(cacheKey);

    if (!data) return false;

    const parsed = JSON.parse(data);

    // Validate cache age (max 7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.t > maxAge) {
      await secureDelete(cacheKey);
      return false;
    }

    // Return pro status (1 = true, 0 = false)
    return parsed.p === 1;
  } catch {
    return false;
  }
}

// Hash user ID for privacy in cache
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Clear cached entitlement (for logout/reset scenarios)
export async function clearEntitlementCache(): Promise<void> {
  const cacheKey = _getCacheKey();
  await secureDelete(cacheKey);
  _validationCount = 0;
}

// Get cache status for debugging (dev only)
export async function getCacheStatus(): Promise<{
  hasCachedValue: boolean;
  cacheAge: number | null;
}> {
  if (!__DEV__) {
    return { hasCachedValue: false, cacheAge: null };
  }

  try {
    const cacheKey = _getCacheKey();
    const data = await secureGet(cacheKey);

    if (!data) {
      return { hasCachedValue: false, cacheAge: null };
    }

    const parsed = JSON.parse(data);
    return {
      hasCachedValue: true,
      cacheAge: Date.now() - parsed.t,
    };
  } catch {
    return { hasCachedValue: false, cacheAge: null };
  }
}

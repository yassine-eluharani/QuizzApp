import { Platform } from 'react-native';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const ENTITLEMENT_ID = 'pro';
const CACHE_KEY = 'cloudprep_pro_entitlement';

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
    console.warn('RevenueCat API key not configured');
    return;
  }
  Purchases.configure({ apiKey });
}

export async function checkProAccess(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    await cacheEntitlement(isPro);
    return isPro;
  } catch {
    return getCachedEntitlement();
  }
}

export async function purchasePro(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    if (!pkg) {
      console.warn('No packages available');
      return false;
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    await cacheEntitlement(isPro);
    return isPro;
  } catch (e: any) {
    if (e.userCancelled) return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    await cacheEntitlement(isPro);
    return isPro;
  } catch {
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

async function cacheEntitlement(isPro: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify({ isPro, timestamp: Date.now() }));
  } catch {}
}

async function getCachedEntitlement(): Promise<boolean> {
  try {
    const data = await SecureStore.getItemAsync(CACHE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.isPro === true;
    }
  } catch {}
  return false;
}

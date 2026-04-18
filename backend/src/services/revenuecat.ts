import axios from 'axios';
import { config } from '../config';

interface RCEntitlement {
  expires_date: string | null;
  product_identifier: string;
}

interface RCSubscriber {
  entitlements: Record<string, RCEntitlement>;
}

interface RCResponse {
  subscriber: RCSubscriber;
}

/**
 * Returns true if the given RevenueCat app user ID has an active "pro" entitlement.
 * Lifetime purchases have expires_date = null, which counts as active.
 */
export async function hasPro(appUserId: string): Promise<boolean> {
  try {
    const { data } = await axios.get<RCResponse>(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      {
        headers: {
          Authorization: `Bearer ${config.revenueCatSecretKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    const entitlement = data.subscriber.entitlements[config.revenueCatEntitlementId];
    if (!entitlement) return false;

    // expires_date is null for lifetime purchases (never expires)
    // For subscriptions, check it's in the future
    if (entitlement.expires_date === null) return true;
    return new Date(entitlement.expires_date) > new Date();
  } catch {
    return false;
  }
}

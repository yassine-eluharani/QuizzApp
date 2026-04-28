import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as PurchasesLib from '@/lib/purchases';
import {
  runIntegrityChecks,
  validateIntegrity,
  getSecurityState,
  detectClockManipulation,
} from '@/lib/security';

interface PurchaseContextType {
  isPro: boolean;
  isLoading: boolean;
  isPurchasesConfigured: boolean;
  purchasePro: () => Promise<import('@/lib/purchases').PurchaseResult>;
  restorePurchases: () => Promise<boolean>;
  showPaywall: () => void;
  hidePaywall: () => void;
  paywallVisible: boolean;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

// Integrity check interval (5 minutes)
const INTEGRITY_CHECK_INTERVAL = 5 * 60 * 1000;

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastIntegrityCheck = useRef(0);
  const integrityCheckCount = useRef(0);

  // Run periodic integrity validation
  const performIntegrityCheck = useCallback(async () => {
    const now = Date.now();

    // Don't check too frequently
    if (now - lastIntegrityCheck.current < INTEGRITY_CHECK_INTERVAL) {
      return;
    }

    lastIntegrityCheck.current = now;
    integrityCheckCount.current++;

    // Check for clock manipulation
    if (detectClockManipulation()) {
      // Clock was manipulated - re-validate pro status
      const pro = await PurchasesLib.checkProAccess();
      setIsPro(pro);
      return;
    }

    // Periodic integrity validation
    const isValid = await validateIntegrity();

    // In production, if integrity fails repeatedly, we could take action
    // For now, we just re-validate the pro status
    if (!isValid && integrityCheckCount.current > 3) {
      const pro = await PurchasesLib.checkProAccess();
      setIsPro(pro);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      // Run initial integrity checks
      await runIntegrityChecks();

      // Initialize purchases
      await PurchasesLib.initPurchases();

      // Check pro access
      const pro = await PurchasesLib.checkProAccess();

      if (mounted) {
        setIsPro(pro);
        setIsLoading(false);
        lastIntegrityCheck.current = Date.now();
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Re-check on app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        // App came to foreground - re-validate
        await performIntegrityCheck();

        const pro = await PurchasesLib.checkProAccess();
        setIsPro(pro);
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [performIntegrityCheck]);

  // Periodic integrity checks while app is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (appState.current === 'active') {
        performIntegrityCheck();
      }
    }, INTEGRITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [performIntegrityCheck]);

  const purchasePro = useCallback(async () => {
    // The lower-level purchasePro handles its own integrity check and never throws.
    void getSecurityState; // (kept import for future telemetry hooks)
    const result = await PurchasesLib.purchasePro();
    if (result.ok) {
      setIsPro(true);
      setPaywallVisible(false);
    }
    return result;
  }, []);

  const restorePurchases = useCallback(async () => {
    const result = await PurchasesLib.restorePurchases();
    if (result) {
      setIsPro(true);
      setPaywallVisible(false);
    }
    return result;
  }, []);

  const showPaywall = useCallback(() => setPaywallVisible(true), []);
  const hidePaywall = useCallback(() => setPaywallVisible(false), []);

  const isPurchasesConfigured = PurchasesLib.isPurchasesConfigured();

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      isPro,
      isLoading,
      isPurchasesConfigured,
      purchasePro,
      restorePurchases,
      showPaywall,
      hidePaywall,
      paywallVisible,
    }),
    [
      isPro,
      isLoading,
      isPurchasesConfigured,
      purchasePro,
      restorePurchases,
      showPaywall,
      hidePaywall,
      paywallVisible,
    ]
  );

  return <PurchaseContext.Provider value={contextValue}>{children}</PurchaseContext.Provider>;
}

export function usePurchase() {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within PurchaseProvider');
  }
  return context;
}

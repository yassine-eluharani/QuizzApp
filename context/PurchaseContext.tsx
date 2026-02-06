import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as PurchasesLib from '@/lib/purchases';
import { runIntegrityChecks } from '@/lib/security';

interface PurchaseContextType {
  isPro: boolean;
  isLoading: boolean;
  purchasePro: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  showPaywall: () => void;
  hidePaywall: () => void;
  paywallVisible: boolean;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    runIntegrityChecks();
    (async () => {
      await PurchasesLib.initPurchases();
      const pro = await PurchasesLib.checkProAccess();
      setIsPro(pro);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        const pro = await PurchasesLib.checkProAccess();
        setIsPro(pro);
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, []);

  const purchasePro = useCallback(async () => {
    const result = await PurchasesLib.purchasePro();
    if (result) {
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

  return (
    <PurchaseContext.Provider
      value={{ isPro, isLoading, purchasePro, restorePurchases, showPaywall, hidePaywall, paywallVisible }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  const context = useContext(PurchaseContext);
  if (!context) throw new Error('usePurchase must be used within PurchaseProvider');
  return context;
}

import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import Button from '@/components/ui/Button';
import { usePurchase } from '@/context/PurchaseContext';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import type { PurchaseResult } from '@/lib/purchases';

const FEATURES = [
  { icon: 'book' as const, text: 'Additional quizzes across every certification' },
  { icon: 'school' as const, text: 'Practice Exam mode with realistic timers' },
  { icon: 'bookmark' as const, text: 'Unlimited bookmarks' },
  { icon: 'infinite' as const, text: 'Lifetime access — one-time purchase' },
];

const FAILURE_COPY: Record<
  Exclude<Extract<PurchaseResult, { ok: false }>['reason'], 'cancelled'>,
  { title: string; body: string }
> = {
  pending: {
    title: 'Payment Pending',
    body: "Your payment is being processed. We'll unlock Pro automatically once it completes.",
  },
  network: {
    title: 'Network Problem',
    body: "Couldn't reach the store. Check your connection and try again.",
  },
  not_allowed: {
    title: 'Purchase Not Allowed',
    body: 'In-app purchases may be restricted on this device. Check your device settings or try a different account.',
  },
  product_unavailable: {
    title: 'Product Unavailable',
    body: "CloudPrep Pro isn't available right now. Please try again later.",
  },
  integrity: {
    title: 'Device Check Failed',
    body: "We couldn't verify the app's integrity. Please reinstall from the App Store / Play Store and try again.",
  },
  unknown: {
    title: 'Purchase Failed',
    body: 'Something went wrong. Please try again.',
  },
};

export default function Paywall() {
  const { paywallVisible, hidePaywall, purchasePro, restorePurchases, isPurchasesConfigured } =
    usePurchase();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    if (!isPurchasesConfigured) {
      Alert.alert(
        'Purchases Unavailable',
        "In-app purchases aren't configured in this build. Please update the app."
      );
      return;
    }
    setLoading(true);
    try {
      const result = await purchasePro();
      if (result.ok || result.reason === 'cancelled') return;
      const copy = FAILURE_COPY[result.reason];
      Alert.alert(copy.title, copy.body);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert('Restored', 'Your Pro access has been restored.');
      } else {
        Alert.alert(
          'No Purchases Found',
          "We couldn't find any previous purchases for this account."
        );
      }
    } catch {
      Alert.alert('Restore Failed', 'Something went wrong. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal visible={paywallVisible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={hidePaywall}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close paywall"
            hitSlop={12}
          >
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isPurchasesConfigured ? 'rocket' : 'sparkles'}
              size={48}
              color={Colors.primary}
            />
          </View>

          <ThemedText variant="heading" style={styles.title}>
            {isPurchasesConfigured ? 'CloudPrep Pro' : 'Pro — Coming Soon'}
          </ThemedText>
          <ThemedText variant="body" style={styles.subtitle}>
            {isPurchasesConfigured
              ? 'Unlock everything and ace your cloud certification'
              : 'For now the first quiz of every certification is free. More quizzes and Practice Exam mode arrive with Pro in a future update.'}
          </ThemedText>

          <View style={styles.featureList}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={20} color={Colors.primary} />
                </View>
                <ThemedText variant="bodyLarge" style={styles.featureText}>
                  {feature.text}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            {isPurchasesConfigured ? (
              <>
                <Button
                  title="Unlock CloudPrep Pro"
                  onPress={handlePurchase}
                  loading={loading}
                  size="lg"
                />
                <TouchableOpacity
                  onPress={handleRestore}
                  disabled={restoring}
                  style={styles.restoreButton}
                  accessibilityRole="button"
                  accessibilityLabel="Restore previous purchases"
                >
                  <ThemedText variant="body" color={Colors.textSecondary}>
                    {restoring ? 'Restoring...' : 'Restore Purchases'}
                  </ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <Button title="Got it" onPress={hidePaywall} size="lg" />
            )}
            <TouchableOpacity
              onPress={hidePaywall}
              style={styles.dismissButton}
              accessibilityRole="button"
              accessibilityLabel="Dismiss paywall"
            >
              <ThemedText variant="caption" color={Colors.textMuted}>
                {isPurchasesConfigured ? 'Not now' : 'Close'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Theme.spacing.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Theme.spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.xl,
  },
  featureList: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  featureText: {
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.md,
    marginBottom: Theme.spacing.md,
  },
  bannerText: {
    flex: 1,
    color: Colors.textSecondary,
  },
  actions: {
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  },
});

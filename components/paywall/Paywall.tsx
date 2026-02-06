import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import Button from '@/components/ui/Button';
import { usePurchase } from '@/context/PurchaseContext';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

const FEATURES = [
  { icon: 'book' as const, text: 'All 19 quizzes across 4 platforms' },
  { icon: 'school' as const, text: 'Practice Exam mode with timers' },
  { icon: 'bookmark' as const, text: 'Unlimited bookmarks' },
  { icon: 'infinite' as const, text: 'Lifetime access — one-time purchase' },
];

export default function Paywall() {
  const { paywallVisible, hidePaywall, purchasePro, restorePurchases } = usePurchase();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const success = await purchasePro();
      if (!success) {
        // User cancelled — do nothing
      }
    } catch {
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
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
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases for this account.');
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
          <TouchableOpacity onPress={hidePaywall} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="rocket" size={48} color={Colors.primary} />
          </View>

          <ThemedText variant="heading" style={styles.title}>
            CloudPrep Pro
          </ThemedText>
          <ThemedText variant="body" style={styles.subtitle}>
            Unlock everything and ace your cloud certification
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
            <Button
              title="Unlock CloudPrep Pro"
              onPress={handlePurchase}
              loading={loading}
              size="lg"
            />
            <TouchableOpacity onPress={handleRestore} disabled={restoring} style={styles.restoreButton}>
              <ThemedText variant="body" color={Colors.textSecondary}>
                {restoring ? 'Restoring...' : 'Restore Purchases'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={hidePaywall} style={styles.dismissButton}>
              <ThemedText variant="caption" color={Colors.textMuted}>
                Not now
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

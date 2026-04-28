import React, { useRef, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Dimensions, TouchableOpacity, ViewToken } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import ThemedText from '@/components/ui/ThemedText';

const { width } = Dimensions.get('window');

interface Step {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: 'trophy',
    title: 'Master Cloud Certifications',
    description:
      'Practice with real exam-style questions for AWS, Azure, and GCP certifications. Build confidence before your big day.',
  },
  {
    icon: 'stats-chart',
    title: 'Track Your Progress',
    description:
      'Monitor your streaks, bookmark tricky questions, and see detailed performance stats to focus your study time.',
  },
  {
    icon: 'rocket',
    title: 'Ready to Start?',
    description:
      'Jump into practice quizzes, take full-length mock exams, and review your answers. Your cloud career starts here.',
  },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: Props) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goToNext = () => {
    if (currentIndex < steps.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      onComplete();
    }
  };

  const renderItem = ({ item }: { item: Step }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={72} color={Colors.primary} />
      </View>
      <ThemedText style={styles.title}>{item.title}</ThemedText>
      <ThemedText style={styles.description}>{item.description}</ThemedText>
    </View>
  );

  const isLast = currentIndex === steps.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={goToNext} activeOpacity={0.8}>
          <ThemedText style={styles.buttonText}>{isLast ? 'Get Started' : 'Next'}</ThemedText>
        </TouchableOpacity>

        {!isLast && (
          <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
            <ThemedText style={styles.skipText}>Skip</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  description: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Theme.spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xxl,
    borderRadius: Theme.radius.lg,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  skipButton: {
    marginTop: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  skipText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
  },
});

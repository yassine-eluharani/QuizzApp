import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import LogoLoader, { LOGO_LOADER_MS } from '@/components/ui/LogoLoader';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { EASE_OUT } from '@/lib/motion';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <LogoLoader size={112} />
      <Animated.Text
        entering={FadeIn.delay(LOGO_LOADER_MS - 100)
          .duration(400)
          .easing(EASE_OUT)}
        style={styles.title}
      >
        Bubbled
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: Theme.spacing.lg,
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
  },
});

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ThemedViewProps extends ViewProps {
  variant?: 'background' | 'surface' | 'surfaceLight';
}

export default function ThemedView({ variant = 'background', style, ...props }: ThemedViewProps) {
  const bgColor = variant === 'surface' ? Colors.surface
    : variant === 'surfaceLight' ? Colors.surfaceLight
    : Colors.background;

  return <View style={[{ backgroundColor: bgColor }, style]} {...props} />;
}

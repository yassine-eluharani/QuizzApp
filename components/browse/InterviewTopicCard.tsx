import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import ThemedText from '@/components/ui/ThemedText';
import Badge from '@/components/ui/Badge';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface InterviewTopicCardProps {
  name: string;
  icon: IoniconName;
  color: string;
  quizQuestionCount: number;
  qaCount: number;
  onPress: () => void;
}

export default function InterviewTopicCard({
  name,
  icon,
  color,
  quizQuestionCount,
  qaCount,
  onPress,
}: InterviewTopicCardProps) {
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={`${name} interview prep`}>
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.content}>
          <ThemedText variant="title">{name}</ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </View>
      <View style={styles.footer}>
        <Badge text={`${qaCount} interview Q&A`} color={color} />
        <ThemedText variant="caption">{quizQuestionCount} quiz questions</ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

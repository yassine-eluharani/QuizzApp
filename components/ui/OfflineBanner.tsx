import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

export default function OfflineBanner(): React.ReactElement | null {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const update = (state: NetInfoState) => {
      if (!mounted) return;
      const isOffline = state.isConnected === false || state.isInternetReachable === false;
      setOffline(isOffline);
    };

    NetInfo.fetch().then(update);
    const unsub = NetInfo.addEventListener(update);
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  if (!offline) return null;

  return (
    <View
      style={styles.banner}
      accessibilityRole="alert"
      accessibilityLabel="You are offline. Pro features and updates may be unavailable."
    >
      <Text style={styles.text}>Offline — some features may be limited</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.warning ?? '#F59E0B',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    alignItems: 'center',
    ...Platform.select({
      ios: { paddingTop: Theme.spacing.xs },
      default: {},
    }),
  },
  text: {
    color: '#1F1500',
    fontSize: 12,
    fontWeight: '600',
  },
});

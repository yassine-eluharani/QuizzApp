import '../global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as NativeSplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { PurchaseProvider } from '@/context/PurchaseContext';
import Paywall from '@/components/paywall/Paywall';
import { Colors } from '@/constants/Colors';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { OnboardingScreen } from '@/components/ui/OnboardingScreen';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

NativeSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      NativeSplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <PurchaseProvider>
        <StatusBar style="light" />
        <RootNavigator />
        <Paywall />
      </PurchaseProvider>
    </AppProvider>
  );
}

function RootNavigator() {
  const { isLoaded, hasCompletedOnboarding, completeOnboarding } = useAppContext();

  if (!isLoaded) {
    return <SplashScreen />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="platform/[platformId]"
        options={{ title: '', headerBackTitle: 'Browse' }}
      />
      <Stack.Screen
        name="certification/[certId]"
        options={{ title: '', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="quiz/[quizId]"
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="exam/[certId]"
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="review/[attemptId]"
        options={{ title: 'Review', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}

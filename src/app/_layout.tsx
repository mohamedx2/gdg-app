import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/features/auth/auth-provider';
import { initNotifications } from '@/lib/notifications';
import { useTheme } from '@/theme';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

export default function RootLayout() {
  const theme = useTheme();
  const [loaded, error] = useFonts({
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style={theme.isDark ? 'light' : 'dark'} />
          {loaded || error ? (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="events/[id]" />
              <Stack.Screen name="ticket/[id]" />
              <Stack.Screen name="resource/[id]" />
              <Stack.Screen name="community/[id]" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="achievements" />
              <Stack.Screen name="squads" />
              <Stack.Screen name="quests" />
              <Stack.Screen name="presence" />
              <Stack.Screen name="quiz" />
              <Stack.Screen name="ideas" />
              <Stack.Screen name="decisions" />
              <Stack.Screen name="stats" />
              <Stack.Screen name="memories" />
              <Stack.Screen name="animations" />
              <Stack.Screen name="tasks" />
              <Stack.Screen name="messages" />
              <Stack.Screen name="messages/[id]" />
              <Stack.Screen name="settings/index" />
              <Stack.Screen name="settings/notifications" />
              <Stack.Screen name="settings/appearance" />
              <Stack.Screen name="admin/index" />
              <Stack.Screen name="admin/check-in" />
              <Stack.Screen name="admin/roles" />
            </Stack>
          ) : null}
          <NotificationBridge />
          <ToastProvider />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

/** Forwards notification taps to the matching screen (deep link). */
function NotificationBridge() {
  const router = useRouter();

  useEffect(() => {
    void initNotifications((deepLink) => {
      if (deepLink) {
        router.push(deepLink as Href);
      }
    });
  }, [router]);

  return null;
}
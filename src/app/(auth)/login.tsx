import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { KeyboardShift } from '@/components/animations';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { FormTextField } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { loginSchema, LoginValues } from '@/features/auth/schemas';
import { useTheme } from '@/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setErrorText(null);
    try {
      await signIn(values.email, values.password);
      router.replace('/(spaces)');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Sign in failed. Try again.');
      setSubmitting(false);
    }
  });

  const onGoogle = async () => {
    setSubmitting(true);
    setErrorText(null);
    try {
      await signInWithGoogle();
      router.replace('/(spaces)');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Google sign in failed.');
      setSubmitting(false);
    }
  };

  return (
    <KeyboardShift style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <YStack paddingTop={insets.top + 4} paddingHorizontal={4}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
      </YStack>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
        <YStack gap={8}>
          <Text variant="headlineLg" weight="bold">
            Welcome back 👋
          </Text>
          <Text variant="bodyMd" muted>
            Sign in to your GDG EPI account to keep building.
          </Text>
        </YStack>

        <GoogleButton onPress={onGoogle} disabled={submitting} />

        <XStack alignItems="center" gap={12}>
          <YStack flex={1} height={1} backgroundColor="outlineVariant" />
          <Text variant="codeSm" muted>OR</Text>
          <YStack flex={1} height={1} backgroundColor="outlineVariant" />
        </XStack>

        <YStack gap={14}>
          <FormTextField<LoginValues>
            name="email"
            control={control}
            label="Email"
            placeholder="you@epi.dev"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FormTextField<LoginValues>
            name="password"
            control={control}
            label="Password"
            placeholder="••••••••"
            icon="lock"
            secureTextEntry
            autoCapitalize="none"
          />
        </YStack>

        {errorText ? (
          <XStack alignItems="center" gap={6} padding={10} borderRadius={8} backgroundColor="errorContainer">
            <Icon name="errorOutline" size={16} color="onErrorContainer" />
            <Text variant="bodySm" color="onErrorContainer" style={{ flex: 1 }}>
              {errorText}
            </Text>
          </XStack>
        ) : null}

        <Button label="Sign in" onPress={onSubmit} loading={submitting} iconRight="arrowForward" />

        <XStack justifyContent="center" alignItems="center" gap={4} paddingTop={4}>
          <Text variant="bodySm" muted>
            New to the chapter?
          </Text>
          <Text variant="bodySm" primary onPress={() => router.replace('/(auth)/register')} accessibilityRole="link">
            Create an account
          </Text>
        </XStack>
      </ScrollView>
    </KeyboardShift>
  );
}

function GoogleButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  const theme = useTheme();
  return (
    <PressableScale onPress={onPress} disabled={disabled} style={{ height: 48, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <YStack position="absolute" left={16}>
        <XStack gap={2}>
          <YStack width={7} height={7} borderRadius={3.5} backgroundColor="#4285F4" />
          <YStack width={7} height={7} borderRadius={3.5} backgroundColor="#EA4335" />
        </XStack>
        <XStack gap={2} marginTop={2}>
          <YStack width={7} height={7} borderRadius={3.5} backgroundColor="#FBBC04" />
          <YStack width={7} height={7} borderRadius={3.5} backgroundColor="#34A853" />
        </XStack>
      </YStack>
      <Text variant="labelLg" color="primary">
        Continue with Google
      </Text>
    </PressableScale>
  );
}

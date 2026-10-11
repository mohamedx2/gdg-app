import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { FormTextField } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { registerSchema, RegisterValues } from '@/features/auth/schemas';
import { useTheme } from '@/theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [agreeError, setAgreeError] = useState(false);

  const { control, handleSubmit } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setErrorText(null);
    try {
      await signUp(values.name, values.email, values.password);
      router.replace('/(tabs)');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Registration failed. Try again.');
      setSubmitting(false);
    }
  });

  const onPressCreate = () => {
    if (!terms) {
      setAgreeError(true);
      return;
    }
    void onSubmit();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 4 }}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 8 }}>
          <Text variant="headlineLg" weight="bold">
            Join the chapter 🚀
          </Text>
          <Text variant="bodyMd" muted>
            Create your builder profile in under a minute.
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          <FormTextField<RegisterValues>
            name="name"
            control={control}
            label="Full name"
            placeholder="Mariem Ben Ali"
            icon="account"
            autoCapitalize="words"
          />
          <FormTextField<RegisterValues>
            name="email"
            control={control}
            label="Email"
            placeholder="you@epi-tic.tn"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FormTextField<RegisterValues>
            name="password"
            control={control}
            label="Password"
            placeholder="Min. 8 characters"
            icon="lock"
            secureTextEntry
            autoCapitalize="none"
          />
          <FormTextField<RegisterValues>
            name="confirmPassword"
            control={control}
            label="Confirm password"
            placeholder="Repeat your password"
            icon="lock"
            secureTextEntry
            autoCapitalize="none"
          />
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <PressableScale
              onPress={() => {
                setTerms(!terms);
                if (agreeError) setAgreeError(false);
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Accept community guidelines"
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: terms ? theme.colors.primaryContainer : theme.colors.outline,
                backgroundColor: terms ? theme.colors.primaryContainer : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              {terms ? <Icon name="check" size={14} color="onPrimary" /> : null}
            </PressableScale>
            <Text variant="bodySm" style={{ flex: 1 }}>
              I agree to the <Text variant="bodySm" primary>community guidelines</Text> and the code of conduct.
            </Text>
          </View>
          {agreeError ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="errorOutline" size={14} color="error" />
              <Text variant="bodySm" color="error">
                You must accept the community guidelines
              </Text>
            </View>
          ) : null}
        </View>

        {errorText ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 8, backgroundColor: theme.colors.errorContainer }}>
            <Icon name="errorOutline" size={16} color="onErrorContainer" />
            <Text variant="bodySm" color="onErrorContainer" style={{ flex: 1 }}>
              {errorText}
            </Text>
          </View>
        ) : null}

        <Button label="Create account" onPress={onPressCreate} loading={submitting} iconRight="arrowForward" />

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
          <Text variant="bodySm" muted>
            Already have an account?
          </Text>
          <Text variant="bodySm" primary onPress={() => router.replace('/(auth)/login')} accessibilityRole="link">
            Sign in
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
import React, { memo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { Button } from './Button';
import { Gradient } from './Gradient';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[{ alignItems: 'center', padding: 28, gap: 12 }, style]}>
      <View style={{ width: 76, height: 76, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        <Gradient token="brand" style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: -18, right: -14, width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.14)' }}
        />
        <Icon name={icon} size={34} color="#FFFFFF" />
      </View>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text variant="titleMd" weight="bold" style={{ textAlign: 'center' }}>
          {title}
        </Text>
        {message ? (
          <Text variant="bodyMd" muted style={{ textAlign: 'center', maxWidth: 260 }}>
            {message}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} compact />
      ) : null}
    </View>
  );
});

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState = memo(function ErrorState({
  message = 'Something went wrong. Check your connection and try again.',
  onRetry,
  compact,
  style,
}: ErrorStateProps) {
  const theme = useTheme();
  return (
    <View style={[{ alignItems: 'center', padding: compact ? 16 : 28, gap: 12 }, style]}>
      <View
        style={{
          width: compact ? 48 : 64,
          height: compact ? 48 : 64,
          borderRadius: compact ? 24 : 32,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.errorContainer,
        }}
      >
        <Icon name="errorOutline" size={compact ? 22 : 30} color="onErrorContainer" />
      </View>
      {!compact ? (
        <Text variant="titleSm" weight="semibold" style={{ textAlign: 'center' }}>
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <Button label="Try again" onPress={onRetry} variant="container" compact />
      ) : null}
    </View>
  );
});
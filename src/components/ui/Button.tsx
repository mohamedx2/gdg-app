import React, { memo } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import { Gradient } from './Gradient';
import { Icon, IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'container' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  height?: number;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

const variantStyles: Record<ButtonVariant, {
  bg: ColorToken | 'transparent';
  text: ColorToken;
  borderWidth: number;
}> = {
  primary: { bg: 'primaryContainer', text: 'onPrimary', borderWidth: 0 },
  container: { bg: 'surfaceContainerHigh', text: 'primary', borderWidth: 0 },
  outline: { bg: 'surfaceContainerLowest', text: 'onSurface', borderWidth: 1 },
  ghost: { bg: 'transparent', text: 'primary', borderWidth: 0 },
  danger: { bg: 'errorContainer', text: 'onErrorContainer', borderWidth: 0 },
};

export const Button = memo(function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  disabled,
  loading,
  fullWidth = true,
  height = 52,
  compact,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const tokens = variantStyles[variant];
  const isGradient = variant === 'primary';
  const backgroundColor = tokens.bg === 'transparent' ? 'transparent' : theme.colors[tokens.bg];
  const textColor = isGradient ? '#FFFFFF' : theme.colors[tokens.text];
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: compact ? 4 : 6,
          height: compact ? 44 : height,
          paddingHorizontal: compact ? 16 : 22,
          borderRadius: theme.radius.full,
          overflow: 'hidden',
          backgroundColor: isGradient ? 'transparent' : backgroundColor,
          borderWidth: tokens.borderWidth,
          borderColor: theme.colors.outlineVariant,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: isDisabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {isGradient ? (
        <Gradient token="brand" style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      ) : null}
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={compact ? 18 : 20} color={textColor} /> : null}
          <Text variant="labelLg" style={{ textAlign: 'center', color: textColor }}>
            {label}
          </Text>
          {iconRight ? <Icon name={iconRight} size={compact ? 16 : 18} color={textColor} /> : null}
        </>
      )}
    </PressableScale>
  );
});

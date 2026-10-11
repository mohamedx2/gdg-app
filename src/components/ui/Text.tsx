import React, { memo } from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import { fonts, typography, TypographyToken } from '@/theme/typography';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';
type Family = 'body' | 'heading' | 'mono';

const weightMap: Record<Weight, string> = {
  regular: fonts.body,
  medium: fonts.bodyMedium,
  semibold: fonts.bodySemibold,
  bold: fonts.bodyBold,
};

const familyMap: Record<Family, string> = {
  body: fonts.body,
  heading: fonts.headingBold,
  mono: fonts.mono,
};

interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TypographyToken;
  color?: ColorToken;
  weight?: Weight;
  family?: Family;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  size?: number;
  muted?: boolean;
  primary?: boolean;
  secondary?: boolean;
  tertiary?: boolean;
  error?: boolean;
  lineHeight?: number;
  style?: RNTextProps['style'];
}

const TextInner = memo(function Text({
  variant = 'bodyMd',
  color,
  weight,
  family,
  align,
  size,
  muted,
  primary,
  secondary,
  tertiary,
  error,
  lineHeight,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const base = typography[variant];

  let resolvedColor: string;
  if (color) resolvedColor = theme.colors[color];
  else if (primary) resolvedColor = theme.colors.primary;
  else if (secondary) resolvedColor = theme.colors.secondary;
  else if (tertiary) resolvedColor = theme.colors.tertiary;
  else if (error) resolvedColor = theme.colors.error;
  else if (muted) resolvedColor = theme.colors.onSurfaceVariant;
  else resolvedColor = theme.colors[base.color as ColorToken];

  const textStyle: TextStyle = {
    ...base,
    color: resolvedColor,
    textAlign: align,
    fontSize: size ?? base.fontSize,
    lineHeight: lineHeight ?? base.lineHeight,
    fontFamily: weight ? weightMap[weight] : family ? familyMap[family] : (base.fontFamily ?? familyMap.body),
    fontWeight: undefined,
  };

  return <RNText {...rest} style={[textStyle, style]} />;
});

export const Text = TextInner;
export type { TextProps };
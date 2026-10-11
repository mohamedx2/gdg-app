import React, { memo, useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { Controller, FieldValues, Path, UseControllerProps } from 'react-hook-form';
import { useTheme } from '@/theme';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  icon?: IconName;
  trailing?: React.ReactNode;
}

export const Input = memo(function Input({
  label,
  error,
  icon,
  trailing,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.error
    : focused
      ? theme.colors.primaryContainer
      : theme.colors.outlineVariant;

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 48,
          borderRadius: theme.radius.md,
          borderWidth: focused ? 2 : 1,
          borderColor,
          backgroundColor: theme.colors.surfaceContainerLowest,
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        {icon ? <Icon name={icon} size={20} color={focused ? 'primaryContainer' : 'onSurfaceVariant'} /> : null}
        <TextInput
          {...rest}
          placeholder={rest.placeholder}
          placeholderTextColor={theme.colors.outline}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            {
              flex: 1,
              height: '100%',
              fontFamily: theme.typography.bodyMd.fontFamily,
              fontSize: 14,
              color: theme.colors.onSurface,
            },
          ]}
        />
        {trailing}
      </View>
      {error ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="errorOutline" size={14} color="error" />
          <Text variant="bodySm" color="error">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

interface FormTextFieldProps<T extends FieldValues>
  extends UseControllerProps<T>,
    Omit<InputProps, 'error' | 'value' | 'onChangeText' | 'onBlur' | 'defaultValue'> {
  name: Path<T>;
  rules?: UseControllerProps<T>['rules'];
}

/** RHF-wired text field — validation handled by a Zod resolver upstream. */
export function FormTextField<T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  ...inputProps
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <Input
          {...inputProps}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message as string | undefined}
        />
      )}
    />
  );
}
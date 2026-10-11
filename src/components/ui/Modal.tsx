import React, { memo } from 'react';
import { KeyboardAvoidingView, Modal, Platform, View, DimensionValue } from 'react-native';

import { useTheme } from '@/theme';
import { IconButton } from './IconButton';
import { Text } from './Text';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Restrict body height so long dialogs scroll naturally. */
  maxHeight?: number | string;
}

export const ModalSheet = memo(function ModalSheet({
  visible,
  onClose,
  title,
  children,
  maxHeight = '82%',
}: ModalSheetProps) {
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' }}
      >
        <View
          style={{
            width: '100%',
            maxHeight: maxHeight as DimensionValue,
            borderRadius: theme.radius.card,
            backgroundColor: theme.colors.surfaceContainerLowest,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: 20,
              paddingRight: 6,
              height: 52,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.outlineVariant,
            }}
          >
            {title ? (
              <Text variant="titleMd" weight="bold">
                {title}
              </Text>
            ) : (
              <View />
            )}
            <IconButton name="close" onPress={onClose} accessibilityLabel="Close" />
          </View>
          <View style={{ padding: 20 }}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});
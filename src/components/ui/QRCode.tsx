import React, { memo } from 'react';
import { View } from 'react-native';
import QRCodeSvg from 'react-native-qrcode-svg';

interface QRCodeProps {
  value: string;
  size?: number;
  /** Quiet-zone padding, kept white for reliable scanning. */
  padding?: number;
}

/** QR code on a white frame — always dark modules on white for scanner contrast. */
export const QRCode = memo(function QRCode({ value, size = 208, padding = 16 }: QRCodeProps) {
  return (
    <View style={{ padding, backgroundColor: '#FFFFFF', borderRadius: 16 }}>
      <QRCodeSvg value={value} size={size} color="#0B1120" backgroundColor="#FFFFFF" />
    </View>
  );
});

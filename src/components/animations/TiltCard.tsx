import React, { memo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  useReducedMotion,
} from 'react-native-reanimated';

interface TiltCardProps {
  children: React.ReactNode;
  /** Maximum tilt in degrees at full sensor deflection. */
  intensity?: number;
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Subtly tilts its content with the device orientation using
 * {@link useAnimatedSensor}. Inert when reduced motion is on or the sensor is
 * unavailable (e.g. most browsers, devices without a gyroscope).
 */
export const TiltCard = memo(function TiltCard({
  children,
  intensity = 10,
  enabled = true,
  style,
}: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const rotation = useAnimatedSensor(SensorType.ROTATION, { interval: 80 });
  const active = enabled && !reduceMotion && rotation.isAvailable;

  const animatedStyle = useAnimatedStyle(() => {
    if (!active) return {};
    const value = rotation.sensor.value as { roll: number; pitch: number };
    const degrees = (radians: number) => (radians * 180) / Math.PI;
    const clamp = (deg: number) => Math.max(-intensity, Math.min(intensity, deg));
    return {
      transform: [
        { perspective: 900 },
        { rotateX: `${clamp(degrees(value.pitch))}deg` },
        { rotateY: `${clamp(degrees(value.roll))}deg` },
      ],
    };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
});

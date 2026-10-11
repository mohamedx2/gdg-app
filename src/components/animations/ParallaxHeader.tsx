import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

interface ParallaxHeaderProps {
  uri?: string;
  /** Scroll offset from {@link useParallaxScroll}. */
  scrollOffset: SharedValue<number>;
  height?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Cover image that translates + scales as the page scrolls. */
export const ParallaxHeader = memo(function ParallaxHeader({
  uri,
  scrollOffset,
  height = 280,
  children,
  style,
}: ParallaxHeaderProps) {
  const imageStyle = useAnimatedStyle(() => {
    const y = scrollOffset.value;
    const translateY = y > 0 ? y * 0.5 : y;
    const scale = y > 0 ? 1 + y / height : 1;
    return { transform: [{ translateY }, { scale }] };
  });

  return (
    <View style={[{ height, overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
        {uri ? (
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : null}
      </Animated.View>
      <LinearGradient
        colors={['rgba(11,17,32,0.05)', 'rgba(11,17,32,0.85)']}
        style={StyleSheet.absoluteFill}
      />
      {children ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'flex-end', padding: 16 },
});

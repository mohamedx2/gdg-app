import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AnimatedNumber,
  AnimatedSkeleton,
  FadeIn,
  Marquee,
  ParallaxHeader,
  Shimmer,
  Stagger,
  SwipeableRow,
  TiltCard,
  TypewriterText,
  useParallaxScroll,
} from '@/components/animations';
import { Button } from '@/components/ui/Button';
import { Gradient } from '@/components/ui/Gradient';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { SectionHeader } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

const SKILLS = ['Flutter', 'Firebase', 'Kotlin', 'TensorFlow', 'Cloud Run', 'Compose', 'Gemini'];

export default function AnimationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { ref, scrollOffset } = useParallaxScroll();
  const [count, setCount] = useState(1280);
  const [typedKey, setTypedKey] = useState(0);
  const [rows, setRows] = useState(['Design the recap deck', 'Publish the event photos', 'Ship the mobile build']);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Motion kit
        </Text>
      </View>

      <ScrollView
        ref={ref}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <ParallaxHeader uri="https://picsum.photos/seed/gdg-epi/1200/800" scrollOffset={scrollOffset} height={240}>
          <FadeIn direction="up">
            <Text variant="headlineMd" weight="bold" style={{ color: '#FFFFFF' }}>
              Reanimated examples
            </Text>
            <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Scroll — the cover drifts and scales.
            </Text>
          </FadeIn>
        </ParallaxHeader>

        <View style={{ padding: 16, gap: 24 }}>
          <View style={{ gap: 12 }}>
            <SectionHeader title="Numbers" subtitle="AnimatedNumber counts up" accent="primary" />
            <View style={{ padding: 20, borderRadius: theme.radius.card, backgroundColor: theme.colors.primaryContainer, alignItems: 'center', gap: 4 }}>
              <AnimatedNumber value={count} variant="headlineXl" color="onPrimaryContainer" />
              <Text variant="bodySm" color="onPrimaryContainer" style={{ opacity: 0.8 }}>
                community points
              </Text>
            </View>
            <Button label="Add 275 points" variant="container" onPress={() => setCount((value) => value + 275)} />
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Typewriter" subtitle="Character reveal with cursor" accent="secondary" />
            <View style={{ padding: 16, borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant, minHeight: 72 }}>
              <TypewriterText key={typedKey} text="Build with AI, ship to production." variant="bodyLg" cursor speed={45} />
            </View>
            <Button label="Replay typing" variant="container" onPress={() => setTypedKey((key) => key + 1)} />
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Loading" subtitle="Shimmer & skeleton" accent="tertiary" />
            <View style={{ gap: 10, padding: 16, borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant }}>
              <AnimatedSkeleton height={16} width="70%" />
              <AnimatedSkeleton height={12} />
              <AnimatedSkeleton height={12} width="40%" />
            </View>
            <View style={{ height: 56, borderRadius: theme.radius.card, overflow: 'hidden', backgroundColor: theme.colors.surfaceContainerHigh }}>
              <Shimmer />
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Stagger" subtitle="Sequenced list entrances" accent="primary" />
            <View style={{ gap: 10 }}>
              {['Welcome new members', 'Host the Flutter workshop', 'Open-source the starter kit'].map((label, index) => (
                <Stagger key={label} index={index}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant }}>
                    <Icon name="bolt" size={18} color="primary" />
                    <Text variant="labelLg" style={{ flex: 1 }}>
                      {label}
                    </Text>
                  </View>
                </Stagger>
              ))}
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Marquee" subtitle="Infinite horizontal scroll" accent="secondary" />
            <Marquee speed={45}>
              {SKILLS.map((skill) => (
                <View key={skill} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: theme.colors.secondaryContainer }}>
                  <Text variant="labelMd" weight="medium" color="onSecondaryContainer">
                    {skill}
                  </Text>
                </View>
              ))}
            </Marquee>
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Gestures" subtitle="Swipe right to complete" accent="tertiary" />
            <View style={{ gap: 10 }}>
              {rows.map((label, index) => (
                <Stagger key={label} index={index} exit>
                  <SwipeableRow
                    onSwipeRight={() => setRows((current) => current.filter((item) => item !== label))}
                    renderRightActions={() => (
                      <View style={{ width: 88, height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceContainerHigh }}>
                        <Icon name="schedule" size={20} color="onSurfaceVariant" />
                      </View>
                    )}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant }}>
                      <Icon name="taskAlt" size={18} color="primary" />
                      <Text variant="labelLg" style={{ flex: 1 }}>
                        {label}
                      </Text>
                    </View>
                  </SwipeableRow>
                </Stagger>
              ))}
              {rows.length === 0 ? (
                <Button label="Reset tasks" variant="container" onPress={() => setRows(['Design the recap deck', 'Publish the event photos', 'Ship the mobile build'])} />
              ) : null}
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Sensor" subtitle="Tilts with device rotation" accent="primary" />
            <TiltCard intensity={12} style={{ borderRadius: theme.radius.card, overflow: 'hidden' }}>
              <Gradient token="aurora" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={{ padding: 24, alignItems: 'center', gap: 6 }}>
                  <Icon name="autoAwesome" size={28} color="#FFFFFF" />
                  <Text variant="titleMd" weight="bold" style={{ color: '#FFFFFF' }}>
                    Tilt me
                  </Text>
                  <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    Move your phone to see the effect
                  </Text>
                </View>
              </Gradient>
            </TiltCard>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

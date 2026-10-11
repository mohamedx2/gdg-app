import { router } from 'expo-router';
import React, { memo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useUiConfig } from '@/hooks/use-content';
import type { WelcomeSlide } from '@/constants/content';
import { useTheme } from '@/theme';

const GDG_DOTS = ['#EA4335', '#4285F4', '#FBBC04', '#34A853'];

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { continueAsGuest } = useAuth();
  const { welcomeSlides: SLIDES } = useUiConfig();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isLast = page === SLIDES.length - 1;

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(next, SLIDES.length - 1));
    scrollRef.current?.scrollTo({ x: clamped * 375, animated: true });
    setPage(clamped);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.colors.surfaceContainerHigh }}>
          {GDG_DOTS.map((color, index) => (
            <View key={index} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
          ))}
          <Text variant="codeSm" weight="medium" style={{ marginLeft: 4 }}>
            EPI Sousse, Tunisia
          </Text>
        </View>
        <Text variant="labelMd" muted onPress={() => goTo(SLIDES.length - 1)} accessibilityRole="button">
          Skip
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(event) => {
          setPage(Math.round(event.nativeEvent.contentOffset.x / 375));
        }}
      >
        {SLIDES.map((slide, index) => (
          <OnboardingSlide
            key={slide.title}
            slide={slide}
            width={375}
            activeLang={index === 0 ? 'python' : undefined}
          />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 20 }}>
        {SLIDES.map((_slide, index) => (
          <View
            key={index}
            style={{
              width: index === page ? 28 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: index === page ? theme.colors.primaryContainer : theme.colors.outlineVariant,
            }}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {!isLast ? (
          <Button label="Join GDG EPI" onPress={() => goTo(page + 1)} iconRight="arrowForward" />
        ) : (
          <Animated.View entering={FadeInDown.duration(240)}>
            <Button label="Get Started with GDG" onPress={() => router.push('/(auth)/register')} iconRight="arrowForward" />
          </Animated.View>
        )}
        <Button
          label="Continue as guest"
          variant="ghost"
          height={44}
          onPress={() => void continueAsGuest()}
        />
        <View style={{ paddingTop: 12, alignItems: 'center', gap: 6 }}>
          <Text variant="bodySm" muted>
            Already a member?
          </Text>
          <Text variant="labelMd" primary onPress={() => router.push('/(auth)/login')} accessibilityRole="link">
            Sign in
          </Text>
        </View>
      </View>
    </View>
  );
}

const OnboardingSlide = memo(function OnboardingSlide({
  slide,
  width,
  activeLang,
}: {
  slide: WelcomeSlide;
  width: number;
  activeLang?: string;
}) {
  const theme = useTheme();

  return (
    <View style={{ width, flexGrow: 1, paddingHorizontal: 16, gap: 16 }}>
      {activeLang ? <TerminalCard width={width - 32} /> : <MentorCard width={width - 32} />}
      <View style={{ gap: 10, paddingHorizontal: 4 }}>
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: theme.colors[slide.badgeBg],
          }}
        >
          <Text variant="codeSm" color={slide.badgeText} weight="semibold" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {slide.badge}
          </Text>
        </View>
        <Text variant="headlineXlMobile" weight="bold">
          {slide.title}
        </Text>
        <Text variant="bodyLg">{slide.body}</Text>
      </View>
    </View>
  );
});

function TerminalCard({ width }: { width: number }) {
  const theme = useTheme();
  const [lang, setLang] = useState<'python' | 'flutter' | 'react'>('python');

  const runtimes: Record<string, string> = {
    python: 'Python 3.12 • Google Cloud SDK',
    flutter: 'Flutter 3.24 • Dart 3.5',
    react: 'React 19 • TypeScript',
  };

  const snippet =
    lang === 'python'
      ? `from gdg_epi import StudentDeveloper

lead = StudentDeveloper(campus="EPI Sousse")
lead.join_track("AI & Cloud")
lead.build_next_gen()
# Ready for Google Solution Challenge 2025`
      : lang === 'flutter'
        ? `class GDGApp extends StatelessWidget {
  build() => CampusHub(
    chapter: 'EPI Sousse',
    students: InfiniteInnovators(),
  );
}`
        : `export default function GDGHub() {
  const [events] = useEPIChapter();
  return <DevCommunity campus="EPI Sousse" />;
}`;

  return (
    <View style={{ backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.radius.card, padding: 16, gap: 12, shadowColor: theme.colors.inverseSurface, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="terminal" size={18} color="primary" />
          </View>
          <View>
            <Text variant="labelLg">GDG Interactive Console</Text>
            <Text variant="codeSm" muted>live_sandbox.sh</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerLow, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.tertiaryContainer }} />
          <Text variant="codeSm" weight="semibold">Active Hub</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, backgroundColor: theme.colors.surfaceContainerLow, padding: 4, borderRadius: 8 }}>
        {(['python', 'flutter', 'react'] as const).map((item) => (
          <View
            key={item}
            style={{
              flex: 1,
              paddingVertical: 5,
              borderRadius: 6,
              backgroundColor: lang === item ? theme.colors.surfaceContainerLowest : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text
              variant="codeSm"
              weight="semibold"
              primary={lang === item}
              muted={lang !== item}
              onPress={() => setLang(item)}
              accessibilityRole="button"
            >
              {item === 'python' ? 'Python' : item === 'flutter' ? 'Flutter' : 'React'}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: theme.colors.terminal, borderRadius: 8, padding: 12, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.2)' }}>
          <Text variant="codeSm" style={{ color: '#94A3B8' }}>{runtimes[lang]}</Text>
          <Icon name="terminal" size={14} color="#94A3B8" />
        </View>
        <Text variant="codeSm" family="mono" style={{ lineHeight: 20 }}>
          {snippet}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
        <AvatarStack
          items={[
            { name: 'Mariem Ben Ali' },
            { name: 'Yasmine Trabelsi' },
            { name: 'Rayen Gharbi' },
          ]}
          size={28}
        />
        <Text variant="labelMd" muted weight="medium">
          +420 builders in Sousse
        </Text>
      </View>
    </View>
  );
}

function MentorCard({ width }: { width: number }) {
  const theme = useTheme();
  return (
    <View style={{ width, backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.radius.card, padding: 16, gap: 12, shadowColor: theme.colors.inverseSurface, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: theme.colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="hub" size={20} color="primary" />
          </View>
          <View>
            <Text variant="labelLg">EPI Alumni & GDE Network</Text>
            <Text variant="codeSm" muted>Direct 1-on-1 Office Hours</Text>
          </View>
        </View>
        <Icon name="rocketLaunch" size={22} color="primary" />
      </View>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerLow }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Avatar name="Ahmed K." size={36} />
            <View>
              <Text variant="labelLg">Ahmed K.</Text>
              <Text variant="bodySm" muted>Staff SRE • Ex-GDG EPI Lead</Text>
            </View>
          </View>
          <Text variant="codeSm" primary weight="medium">Cloud Track</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerLow }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Avatar name="Salma M." size={36} />
            <View>
              <Text variant="labelLg">Salma M.</Text>
              <Text variant="bodySm" muted>ML Researcher • Google Dev Expert</Text>
            </View>
          </View>
          <Text variant="codeSm" tertiary weight="medium">TensorFlow</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerHigh }}>
        <Icon name="verifiedUser" size={18} color="primary" />
        <Text variant="bodySm" muted>
          Exclusive campus fast-track for Google Summer of Code.
        </Text>
      </View>
    </View>
  );
}
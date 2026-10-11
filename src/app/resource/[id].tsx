import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { TagPill } from '@/components/ui/Chip';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useResource, useResourceProgress, useSetResourceProgress, useToggleBookmark } from '@/hooks/use-resources';
import { useUiStore } from '@/stores/ui.store';
import { formatCount } from '@/utils/format';
import { useTheme } from '@/theme';

export default function ResourceDetailScreen() {
  const theme = useTheme();
  const { resourceTypes: RESOURCE_TYPES, difficulties: DIFFICULTIES } = useTaxonomy();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const toast = useUiStore((state) => state.toast);

  const { data: resource, isPending, isError, error, refetch } = useResource(params.id);
  const { data: progress } = useResourceProgress(params.id);
  const { mutateAsync: setProgress } = useSetResourceProgress();
  const { mutateAsync: toggleBookmark } = useToggleBookmark();
  const [busy, setBusy] = useState(false);

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
        <BackButton />
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      </View>
    );
  }

  if (isPending || !resource) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 8 }}>
          <BackButton />
        </View>
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={160} radius={12} />
          <Skeleton height={20} width="70%" />
          <Skeleton height={120} radius={12} />
        </View>
      </View>
    );
  }

  const type = RESOURCE_TYPES[resource.type];
  const difficulty = DIFFICULTIES[resource.difficulty];

  const onOpen = async () => {
    try {
      await Linking.openURL(resource.url);
      await setProgress({ resourceId: resource.id, progress: 'started' });
      toast('Marked as started', 'neutral');
    } catch {
      toast('Could not open this link', 'error');
    }
  };

  const onMarkComplete = async () => {
    setBusy(true);
    try {
      await setProgress({ resourceId: resource.id, progress: progress === 'completed' ? 'started' : 'completed' });
      toast(progress === 'completed' ? 'Progress updated' : `Completed! +${resource.points} XP`, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const onShare = async () => {
    try {
      await Share.share({ message: `${resource.title} — ${resource.url}` });
    } catch {
      // share dismissed
    }
  };

  const onBookmark = async () => {
    try {
      await toggleBookmark({ resourceId: resource.id, title: resource.title });
    } catch {
      toast('Could not update bookmark', 'error');
    }
  };

  const completed = progress === 'completed';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 180, backgroundColor: theme.colors.surfaceContainerHigh }}>
          <Image source={{ uri: resource.coverImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
          <View style={{ position: 'absolute', top: insets.top + 4, left: 12, flexDirection: 'row', gap: 8 }}>
            <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" color="onPrimary" backgroundColor="overlay" />
          </View>
          <View style={{ position: 'absolute', top: insets.top + 4, right: 12, flexDirection: 'row', gap: 8 }}>
            <IconButton name="bookmark" onPress={onBookmark} accessibilityLabel="Bookmark resource" color="onPrimary" backgroundColor="overlay" />
            <IconButton name="share" onPress={onShare} accessibilityLabel="Share resource" color="onPrimary" backgroundColor="overlay" />
          </View>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <TagPill label={type.label} color={type.color} dot />
            <TagPill label={difficulty.label} color={difficulty.color} />
            <TagPill label={resource.category} color="secondary" radius="full" />
          </View>
          <Text variant="headlineMd" weight="bold">
            {resource.title}
          </Text>
          <Text variant="bodySm" muted>
            {resource.summary}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <MetaTile icon="account" label="Author" value={resource.author} />
            <MetaTile icon="timer" label="Duration" value={`${Math.round(resource.durationMins / 60)}h ${resource.durationMins % 60}m`} />
            <MetaTile icon="stars" label="Reward" value={`+${formatCount(resource.points)} XP`} />
          </View>

          {resource.technologies.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {resource.technologies.map((tech) => (
                <TagPill key={tech} label={tech} color="primary" radius="full" />
              ))}
            </View>
          ) : null}

          <View style={{ gap: 6 }}>
            <Text variant="titleMd" weight="bold">What you&apos;ll learn</Text>
            <Text variant="bodyMd">{resource.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 12, right: 12, bottom: insets.bottom + 10, gap: 8 }}>
        <Button label="Start learning" onPress={onOpen} icon="playCircle" iconRight="openInNew" />
        {progress !== 'none' ? (
          <Button
            label={completed ? 'Mark not completed' : 'Mark as completed'}
            variant="container"
            onPress={onMarkComplete}
            loading={busy}
            icon={completed ? 'history' : 'checkCircle'}
          />
        ) : null}
      </View>
    </View>
  );
}

function BackButton() {
  const router = useRouter();
  return <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />;
}

function MetaTile({ icon, label, value }: { icon: 'account' | 'timer' | 'stars'; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: theme.radius.base, backgroundColor: theme.colors.surfaceContainerLow }}>
      <Icon name={icon} size={16} color="primary" />
      <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</Text>
      <Text variant="labelSm" weight="semibold" numberOfLines={1} style={{ paddingHorizontal: 4 }}>{value}</Text>
    </View>
  );
}
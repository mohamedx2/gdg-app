import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Share } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { TagPill } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useResource, useResourceProgress, useSetResourceProgress, useToggleBookmark } from '@/hooks/use-resources';
import { useUiStore } from '@/stores/ui.store';
import { formatCount } from '@/utils/format';

export default function ResourceDetailScreen() {
  const { resourceTypes: RESOURCE_TYPES, difficulties: DIFFICULTIES } = useTaxonomy();
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
      <Sheet title="Resource">
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      </Sheet>
    );
  }

  if (isPending || !resource) {
    return (
      <Sheet title="Resource">
        <YStack gap={12}>
          <Skeleton height={160} radius={12} />
          <Skeleton height={20} width="70%" />
          <Skeleton height={120} radius={12} />
        </YStack>
      </Sheet>
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
    <Sheet
      showHandle={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      footer={
        <YStack gap={8}>
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
        </YStack>
      }
    >
      <YStack height={180} backgroundColor="surfaceContainerHigh">
        <Image source={{ uri: resource.coverImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
        <YStack position="absolute" top={12} left={12}>
          <IconButton name="close" onPress={() => router.back()} accessibilityLabel="Close" color="onPrimary" backgroundColor="overlay" />
        </YStack>
        <YStack position="absolute" top={12} right={12} gap={8}>
          <IconButton name="bookmark" onPress={onBookmark} accessibilityLabel="Bookmark resource" color="onPrimary" backgroundColor="overlay" />
          <IconButton name="share" onPress={onShare} accessibilityLabel="Share resource" color="onPrimary" backgroundColor="overlay" />
        </YStack>
      </YStack>

      <YStack padding={16} gap={14}>
        <XStack alignItems="center" gap={6} flexWrap="wrap">
          <TagPill label={type.label} color={type.color} dot />
          <TagPill label={difficulty.label} color={difficulty.color} />
          <TagPill label={resource.category} color="secondary" radius="full" />
        </XStack>
        <Text variant="headlineMd" weight="bold">
          {resource.title}
        </Text>
        <Text variant="bodySm" muted>
          {resource.summary}
        </Text>

        <XStack gap={8}>
          <MetaTile icon="account" label="Author" value={resource.author} />
          <MetaTile icon="timer" label="Duration" value={`${Math.round(resource.durationMins / 60)}h ${resource.durationMins % 60}m`} />
          <MetaTile icon="stars" label="Reward" value={`+${formatCount(resource.points)} XP`} />
        </XStack>

        {resource.technologies.length ? (
          <XStack flexWrap="wrap" gap={8}>
            {resource.technologies.map((tech) => (
              <TagPill key={tech} label={tech} color="primary" radius="full" />
            ))}
          </XStack>
        ) : null}

        <YStack gap={6}>
          <Text variant="titleMd" weight="bold">What you&apos;ll learn</Text>
          <Text variant="bodyMd">{resource.description}</Text>
        </YStack>
      </YStack>
    </Sheet>
  );
}

function MetaTile({ icon, label, value }: { icon: 'account' | 'timer' | 'stars'; label: string; value: string }) {
  return (
    <YStack flex={1} alignItems="center" gap={4} paddingVertical={10} borderRadius="base" backgroundColor="surfaceContainerLow">
      <Icon name={icon} size={16} color="primary" />
      <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</Text>
      <Text variant="labelSm" weight="semibold" numberOfLines={1} style={{ paddingHorizontal: 4 }}>{value}</Text>
    </YStack>
  );
}

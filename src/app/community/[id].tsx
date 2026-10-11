import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Pill, TagPill } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { MEMBER_ROLES } from '@/constants/taxonomy';
import { useMember, useToggleConnection } from '@/hooks/use-members';
import { useUiStore } from '@/stores/ui.store';
import { formatCount } from '@/utils/format';
import { useTheme } from '@/theme';
import type { Project } from '@/types';

export default function MemberDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const toast = useUiStore((state) => state.toast);

  const { data: member, isPending, isError, error, refetch } = useMember(params.id);
  const { mutateAsync: toggleConnection } = useToggleConnection();
  const [busy, setBusy] = useState(false);

  const onConnect = async () => {
    if (!member) return;
    setBusy(true);
    try {
      const connected = await toggleConnection({ memberId: member.id });
      toast(connected ? `Connection request sent to ${member.name.split(' ')[0]}` : 'Connection removed', connected ? 'success' : 'neutral');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not toggle connection', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
        <BackButton />
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      </View>
    );
  }

  if (isPending || !member) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16, gap: 16 }}>
        <BackButton />
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Skeleton width={88} height={88} radius={44} />
          <Skeleton height={18} width="45%" />
          <Skeleton height={14} width="60%" />
        </View>
        <Skeleton height={120} radius={12} />
      </View>
    );
  }

  const roleMeta = MEMBER_ROLES[member.role];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 8 }}>
        <BackButton />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Avatar uri={member.avatar} name={member.name} size={92} online={member.online} />
          <Text variant="headlineMd" weight="bold">
            {member.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Pill label={roleMeta.label} color={roleMeta.chipColor} dot />
            <TagPill label={`${member.eventsAttended} events`} color="secondary" />
          </View>
          <Text variant="bodyMd" muted style={{ textAlign: 'center', paddingHorizontal: 8 }}>
            {member.headline}
          </Text>
        </View>

        <StatsRow
          items={[
            { label: 'Events', value: formatCount(member.eventsAttended) },
            { label: 'Badges', value: String(member.badges) },
            { label: 'Points', value: formatCount(member.points) },
            { label: 'Mutual', value: String(member.mutualEvents) },
          ]}
        />

        <View style={{ gap: 8 }}>
          <Text variant="titleMd" weight="bold">About</Text>
          <Text variant="bodyMd">{member.bio}</Text>
        </View>

        {member.skills.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {member.skills.map((skill) => (
              <TagPill key={skill} label={skill} color="primary" radius="full" />
            ))}
          </View>
        ) : null}

        {member.projects.length ? (
          <View style={{ gap: 10 }}>
            <Text variant="titleMd" weight="bold">Projects</Text>
            {member.projects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </View>
        ) : null}

        {member.socials.github || member.socials.linkedin || member.socials.portfolio ? (
          <View style={{ gap: 8 }}>
            <Text variant="titleMd" weight="bold">Links</Text>
            {member.socials.github ? <LinkRow icon="terminal" label="GitHub" url={member.socials.github} /> : null}
            {member.socials.linkedin ? <LinkRow icon="link" label="LinkedIn" url={member.socials.linkedin} /> : null}
            {member.socials.portfolio ? <LinkRow icon="publicIcon" label="Portfolio" url={`https://${member.socials.portfolio}`} /> : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={{ position: 'absolute', left: 12, right: 12, bottom: insets.bottom + 10 }}>
        <Button label="Connect" onPress={onConnect} loading={busy} icon="personAdd" />
      </View>
    </View>
  );
}

function BackButton() {
  const router = useRouter();
  return <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />;
}

function StatsRow({ items }: { items: { label: string; value: string }[] }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {items.map((item) => (
        <View key={item.label} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 10, borderRadius: theme.radius.base, backgroundColor: theme.colors.surfaceContainerLow }}>
          <Text variant="titleMd" weight="bold">{item.value}</Text>
          <Text variant="codeSm" muted>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const theme = useTheme();
  return (
    <View style={{ padding: 12, borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerLowest, gap: 6, borderWidth: 1, borderColor: theme.colors.outlineVariant }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="labelLg" weight="bold">{project.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="star" size={13} color="warning" />
          <Text variant="codeSm" muted>{project.stars}</Text>
        </View>
      </View>
      <Text variant="bodySm" muted numberOfLines={2}>{project.description}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
        {project.tech.slice(0, 4).map((tech) => (
          <TagPill key={tech} label={tech} color="primary" radius="full" />
        ))}
      </View>
    </View>
  );
}

function LinkRow({ icon, label, url }: { icon: 'terminal' | 'link' | 'publicIcon'; label: string; url: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: theme.radius.base, backgroundColor: theme.colors.surfaceContainerLow }}>
      <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color="primary" />
      </View>
      <Text variant="bodyMd" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
        {url}
      </Text>
      <Icon name="openInNew" size={15} color="secondary" />
    </View>
  );
}
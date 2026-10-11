import { router } from 'expo-router';
import React, { memo } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import type { ActivityItem } from '@/types';
import { formatRelativeTime } from '@/utils/date';
import { formatCount } from '@/utils/format';
import { Avatar } from './ui/Avatar';
import { Icon } from './ui/Icon';
import { PressableScale } from './ui/PressableScale';
import { Text } from './ui/Text';

const KINDS: Record<ActivityItem['kind'], { icon: 'check' | 'stars' | 'terminal' | 'groups'; color: 'tertiary' | 'primary' | 'secondary' | 'success' }> = {
  rsvp: { icon: 'check', color: 'tertiary' },
  badge: { icon: 'stars', color: 'primary' },
  project: { icon: 'terminal', color: 'secondary' },
  join: { icon: 'groups', color: 'success' },
};

export const ActivityCard = memo(function ActivityCard({ item }: { item: ActivityItem }) {
  const theme = useTheme();
  const kind = KINDS[item.kind];

  return (
    <PressableScale
      onPress={() => (item.targetId ? router.push(`/community/${item.targetId}`) : undefined)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderRadius: theme.radius.card,
        padding: 12,
        shadowColor: theme.colors.inverseSurface,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      <Avatar name={item.actor} size={38} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodySm" numberOfLines={2}>
          <Text variant="bodySm" weight="semibold" color="onSurface">
            {item.actor}
          </Text>{' '}
          {item.action}
          {item.target ? (
            <>
              {' '}
              <Text variant="bodySm" weight="semibold" color="primary">
                {item.target}
              </Text>
            </>
          ) : null}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name={kind.icon} size={12} color={kind.color} />
            {item.stars ? (
              <Text variant="codeSm" muted>
                {formatCount(item.stars)} stars
              </Text>
            ) : null}
            <Text variant="bodySm" muted>
              {formatRelativeTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
      {item.targetId ? <Icon name="chevronRight" size={16} color="secondary" /> : null}
    </PressableScale>
  );
});
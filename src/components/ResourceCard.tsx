import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { memo } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import type { Resource } from '@/types';
import { useTaxonomy } from '@/hooks/use-content';
import { formatCount } from '@/utils/format';
import { Gradient } from './ui/Gradient';
import { Icon, IconName } from './ui/Icon';
import { PressableScale } from './ui/PressableScale';
import { TagPill } from './ui/Chip';
import { Text } from './ui/Text';

interface ResourceCardProps {
  resource: Resource;
  horizontal?: boolean;
}

const TYPE_ICON: Record<Resource['type'], IconName> = {
  codelab: 'terminal',
  article: 'article',
  video: 'playCircle',
  course: 'school',
};

/** Card for the resource library (compact vertical / horizontal variants). */
export const ResourceCard = memo(function ResourceCard({ resource, horizontal }: ResourceCardProps) {
  const theme = useTheme();
  const taxonomy = useTaxonomy();
  const type = taxonomy.resourceTypes[resource.type];
  const difficulty = taxonomy.difficulties[resource.difficulty];
  const imageHeight = horizontal ? 84 : 108;

  return (
    <PressableScale
      onPress={() => router.push(`/resource/${resource.id}`)}
      style={{
        width: horizontal ? 230 : undefined,
        flex: horizontal ? undefined : 1,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderRadius: theme.radius.card,
        overflow: 'hidden',
        shadowColor: theme.colors.inverseSurface,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View style={{ width: '100%', height: imageHeight }}>
        <Image
          source={{ uri: resource.coverImage }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={160}
        />
        <Gradient
          colors={['rgba(11,17,32,0)', 'rgba(11,17,32,0.45)']}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' }}
        />
        <View
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 30,
            height: 30,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15,23,42,0.5)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.28)',
          }}
        >
          <Icon name={TYPE_ICON[resource.type]} size={16} color="#FFFFFF" />
        </View>
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TagPill label={type.label} color={type.color} dot />
          <TagPill label={difficulty.label} color={difficulty.color} />
        </View>
        <Text variant="titleSm" weight="semibold" numberOfLines={2}>
          {resource.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="account" size={12} color="secondary" />
          <Text variant="bodySm" muted numberOfLines={1} style={{ flexShrink: 1 }}>
            {resource.author}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="codeSm" muted>
              {Math.round(resource.durationMins / 60)}h {resource.durationMins % 60}m
            </Text>
            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: theme.colors.outline }} />
            <Text variant="codeSm" primary weight="medium">
              +{formatCount(resource.points)} XP
            </Text>
          </View>
          <Icon name="openInNew" size={14} color="secondary" />
        </View>
      </View>
    </PressableScale>
  );
});
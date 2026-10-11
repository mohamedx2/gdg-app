import { MaterialIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';

type IconName = keyof typeof glyphs;

/** Semantic → Material Icons glyph map (validated against the glyphMap). */
const glyphs = {
  home: 'home',
  event: 'event',
  groups: 'groups',
  terminal: 'terminal',
  account: 'account-circle',
  search: 'search',
  tune: 'tune',
  bookmark: 'bookmark',
  bookmarkBorder: 'bookmark-border',
  calendarToday: 'calendar-today',
  calendarMonth: 'calendar-month',
  location: 'location-on',
  schedule: 'schedule',
  verified: 'verified',
  register: 'how-to-reg',
  checkCircle: 'check-circle',
  chevronRight: 'chevron-right',
  arrowForward: 'arrow-forward',
  militaryTech: 'military-tech',
  campaign: 'campaign',
  flag: 'flag',
  stars: 'stars',
  code: 'code',
  work: 'work',
  emojiEvents: 'emoji-events',
  personAdd: 'person-add',
  group: 'group',
  groupAdd: 'group-add',
  rocketLaunch: 'rocket-launch',
  fire: 'local-fire-department',
  lightbulb: 'lightbulb',
  manageSearch: 'manage-search',
  cloudDone: 'cloud-done',
  meetingRoom: 'meeting-room',
  domain: 'domain',
  timer: 'timer',
  share: 'share',
  openInNew: 'open-in-new',
  copy: 'content-copy',
  check: 'check',
  star: 'star',
  menuBook: 'menu-book',
  restaurant: 'restaurant',
  language: 'language',
  editNote: 'edit-note',
  map: 'map',
  notifications: 'notifications',
  notificationsActive: 'notifications-active',
  settings: 'settings',
  school: 'school',
  playCircle: 'play-circle',
  article: 'article',
  wbSunny: 'wb-sunny',
  mic: 'mic',
  trophy: 'emoji-events',
  edit: 'edit',
  trash: 'delete',
  add: 'add',
  keyboardArrowDown: 'keyboard-arrow-down',
  moreVert: 'more-vert',
  arrowBack: 'arrow-back',
  close: 'close',
  info: 'info',
  errorOutline: 'error-outline',
  people: 'people',
  person: 'person',
  eventNote: 'event-note',
  flashOn: 'flash-on',
  api: 'api',
  storage: 'storage',
  android: 'android',
  widget: 'widgets',
  verifiedUser: 'verified-user',
  link: 'link',
  publicIcon: 'public',
  hub: 'hub',
  avTimer: 'av-timer',
  insights: 'insights',
  barChart: 'bar-chart',
  celebration: 'celebration',
  autoAwesome: 'auto-awesome',
  thumbUp: 'thumb-up',
  history: 'history',
  eventRepeat: 'repeat',
  locationCity: 'location-city',
  help: 'help',
  forum: 'forum',
  lock: 'lock',
  mail: 'mail',
  visibility: 'visibility',
  wc: 'wc',
  delete: 'delete',
  logout: 'logout',
  pushPin: 'push-pin',
  editCalendar: 'edit-calendar',
  trendingUp: 'trending-up',
  alarm: 'alarm',
  lightMode: 'light-mode',
  darkMode: 'dark-mode',
  phoneIphone: 'phone-iphone',
  palette: 'palette',
  notificationsNone: 'notifications-none',
  qrCode: 'qr-code-2',
  qrCodeScanner: 'qr-code-scanner',
  cameraAlt: 'camera-alt',
  flashOff: 'flash-off',
  bolt: 'bolt',
  shield: 'shield',
  radioButtonUnchecked: 'radio-button-unchecked',
  radioButtonChecked: 'radio-button-checked',
  howToVote: 'how-to-vote',
  send: 'send',
  chatBubble: 'chat-bubble-outline',
  markChatRead: 'mark-chat-read',
  directionsCar: 'directions-car',
  myLocation: 'my-location',
  nearMe: 'near-me',
  visibilityOff: 'visibility-off',
  workspacePremium: 'workspace-premium',
  science: 'science',
  eventAvailable: 'event-available',
  taskAlt: 'task-alt',
} as const;

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorToken | string;
  /** Applied to the tile when icon sits inside a coloured chip. */
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function iconName(name: string): IconName {
  return (glyphs as unknown as Record<string, IconName>)[name] ?? 'code';
}

const IconInner = memo(function Icon({ name, size = 20, color = 'onSurfaceVariant', style }: IconProps) {
  const theme = useTheme();
  const resolved =
    color && color in theme.colors ? theme.colors[color as ColorToken] : (color as string);
  return <MaterialIcons name={glyphs[name]} size={size} color={resolved} style={style} />;
});

export const Icon = IconInner;

export type { IconName };
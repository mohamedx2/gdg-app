import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { GdgEvent, NotificationPreferences } from '@/types';

export type NotificationOpenHandler = (deepLink: string | undefined) => void;

type NotificationsModule = typeof import('expo-notifications');

/**
 * expo-notifications crashes the module graph at load time inside Expo Go on
 * Android (remote push was removed in SDK 53+). Metro re-surfaces that failed
 * module load on every require even when the throw is caught, so we must never
 * load it there at all. Every call degrades to a safe no-op instead.
 */
let moduleRef: NotificationsModule | null | undefined;
let warned = false;

function isExpoGoOnAndroid(): boolean {
  return Platform.OS === 'android' && Constants.executionEnvironment === 'storeClient';
}

function loadNotifications(): NotificationsModule | null {
  if (moduleRef !== undefined) return moduleRef;

  if (isExpoGoOnAndroid()) {
    moduleRef = null;
    if (!warned) {
      warned = true;
      console.warn(
        '[notifications] Disabled: not available in Expo Go on Android. Use a development build for reminders.',
      );
    }
    return moduleRef;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    moduleRef = require('expo-notifications') as NotificationsModule;
    moduleRef.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    moduleRef = null;
    if (!warned) {
      warned = true;
      console.warn(
        '[notifications] Disabled: notification module could not be initialised. The rest of the app keeps working.',
      );
    }
  }
  return moduleRef;
}

export function notificationsSupported(): boolean {
  return loadNotifications() !== null;
}

let openHandler: NotificationOpenHandler | null = null;
let initialized = false;

/**
 * Sets up channels, permissions and the tap handler.
 * Returns false when notifications are unavailable or declined — callers must
 * keep the app fully usable either way.
 */
export async function initNotifications(onOpen: NotificationOpenHandler): Promise<boolean> {
  openHandler = onOpen;
  const Notifications = loadNotifications();
  if (!Notifications) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('events', {
      name: 'Event reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A73E8',
    });
    await Notifications.setNotificationChannelAsync('community', {
      name: 'Community updates',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#008939',
    });
  }

  if (!initialized) {
    initialized = true;
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { deepLink?: string };
      openHandler?.(data.deepLink);
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

/** Returns the Expo push token when available (development builds only). */
export async function getPushToken(): Promise<string | null> {
  const Notifications = loadNotifications();
  if (!Notifications) return null;
  try {
    const result = await Notifications.getExpoPushTokenAsync();
    return result.data;
  } catch {
    return null;
  }
}

/** Schedules a reminder 24h before the event (or 1h before if it is closer). */
export async function scheduleEventReminder(event: GdgEvent): Promise<string | null> {
  const Notifications = loadNotifications();
  if (!Notifications) return null;
  try {
    const startsAt = new Date(event.startsAt).getTime();
    const lead = startsAt - Date.now() > 26 * 60 * 60 * 1000 ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    const triggerAt = startsAt - lead;
    if (triggerAt <= Date.now()) return null;

    return await Notifications.scheduleNotificationAsync({
      identifier: `reminder-${event.id}`,
      content: {
        title: `${event.title} starts soon`,
        body: `${event.durationLabel} · ${event.location}`,
        data: { deepLink: `/events/${event.id}` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerAt,
        channelId: 'events',
      },
    });
  } catch {
    return null;
  }
}

export async function cancelEventReminder(eventId: string): Promise<void> {
  const Notifications = loadNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`reminder-${eventId}`);
  } catch {
    // Nothing scheduled — safe to ignore.
  }
}

/** Sends a local confirmation notification after a successful registration. */
export async function notifyRegistrationConfirmed(event: GdgEvent): Promise<void> {
  const Notifications = loadNotifications();
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `You're going to ${event.title} 🎉`,
        body: 'Your seat is confirmed. We will remind you before it starts.',
        data: { deepLink: `/events/${event.id}` },
      },
      trigger: null,
    });
  } catch {
    // Local notification failures must never break the registration flow.
  }
}

export async function applyNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<void> {
  const Notifications = loadNotifications();
  if (!Notifications) return;
  if (!preferences.eventReminders) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((request) => request.identifier.startsWith('reminder-'))
        .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
    );
  }
}
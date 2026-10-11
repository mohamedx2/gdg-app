/**
 * Provider-agnostic analytics. Swap the array of providers to wire a real
 * backend (Segment, Firebase, GA4 …) without touching call sites.
 */
export type AnalyticsEventName =
  | 'app_open'
  | 'session_restore'
  | 'login'
  | 'signup'
  | 'logout'
  | 'guest_continue'
  | 'event_view'
  | 'event_register'
  | 'event_unregister'
  | 'resource_view'
  | 'resource_bookmark'
  | 'resource_start'
  | 'resource_complete'
  | 'profile_view'
  | 'member_view'
  | 'notification_open'
  | 'badge_unlock'
  | 'settings_change';

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

export interface AnalyticsProvider {
  name: string;
  identify?(userId: string, traits?: AnalyticsProps): void;
  track(event: AnalyticsEventName, props?: AnalyticsProps): void;
}

const buffer: { event: AnalyticsEventName; props?: AnalyticsProps; at: number }[] = [];

const consoleProvider: AnalyticsProvider = {
  name: 'console',
  track(event, props) {
    if (__DEV__) {
      console.log(`[analytics] ${event}`, props ?? '');
    }
    buffer.push({ event, props, at: Date.now() });
    if (buffer.length > 200) buffer.shift();
  },
};

let providers: AnalyticsProvider[] = [consoleProvider];

export const analytics = {
  register(next: AnalyticsProvider[]): void {
    providers = next;
  },
  identify(userId: string, traits?: AnalyticsProps): void {
    for (const provider of providers) provider.identify?.(userId, traits);
  },
  track(event: AnalyticsEventName, props?: AnalyticsProps): void {
    for (const provider of providers) provider.track(event, props);
  },
  drain(): { event: AnalyticsEventName; props?: AnalyticsProps; at: number }[] {
    return [...buffer];
  },
};

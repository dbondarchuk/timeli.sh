import type { AppEventConfig } from "@timelish/types";
import { eventPatternMatches } from "@timelish/types";
import { AvailableApps } from "../apps";
import { FORMS_APP_EVENTS } from "../apps/forms/app-events";
import { FORMS_APP_NAME } from "../apps/forms/const";
import { WAITLIST_APP_EVENTS } from "../apps/waitlist/app-events";
import { WAITLIST_APP_NAME } from "../apps/waitlist/const";

/** Matches {@link BOOKING_TRACKING_APP_ID} in services — built-in subscriber, not a DB row. */
export const BOOKING_TRACKING_BUILTIN_APP_ID = "booking-tracking";

export const BUILT_IN_APP_EVENT_IDS = new Set<string>([
  BOOKING_TRACKING_BUILTIN_APP_ID,
]);

/** Built-in event subscribers that are not entries in {@link AvailableApps}. */
export const BUILT_IN_APP_EVENT_SUBSCRIPTIONS: Record<string, string[]> = {
  [BOOKING_TRACKING_BUILTIN_APP_ID]: ["booking.tracking.*"],
};

/**
 * Per-app event definition bundles for {@link resolveEventDefinition} (activity, dashboard, etc.).
 * Subscription routing uses each app’s `subscribeTo` field in {@link AvailableApps}.
 */
export const APP_EVENT_CONFIGS: Record<string, AppEventConfig> = {
  [FORMS_APP_NAME]: FORMS_APP_EVENTS,
  [WAITLIST_APP_NAME]: WAITLIST_APP_EVENTS,
};

export function getAppNamesSubscribedToEventType(eventType: string): string[] {
  const names: string[] = [];
  for (const [appName, app] of Object.entries(AvailableApps)) {
    if (!app.subscribeTo?.length) continue;
    if (app.subscribeTo.some((p) => eventPatternMatches(p, eventType))) {
      names.push(appName);
    }
  }
  for (const [id, patterns] of Object.entries(BUILT_IN_APP_EVENT_SUBSCRIPTIONS)) {
    if (patterns.some((p) => eventPatternMatches(p, eventType))) {
      names.push(id);
    }
  }
  return names;
}

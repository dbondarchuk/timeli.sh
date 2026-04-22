import { AllKeys } from "@timelish/i18n";
import type { ActivityActorDisplay } from "../../activity/activity-actor";
import type { ActivityTextField } from "../../activity/activity-record";
import type { ActivitySeverity } from "../../activity/activity-severity";
import { ConnectedAppData } from "../connected-app.data";

export type DashboardNotificationBadge = {
  key: string;
  count: number;
};

/** Serialized for SSE / dashboard header activity preview (newest first). */
export type ActivityFeedPreview = {
  id: string;
  eventType: string;
  createdAt: string;
  severity: ActivitySeverity;
  title: ActivityTextField;
  link?: string;
  actor: ActivityActorDisplay;
};

export type DashboardNotification = {
  type: string;
  badges?: DashboardNotificationBadge[];
  /** When set, clients refresh the activity header preview (e.g. last 3 rows). */
  activityFeed?: {
    preview?: ActivityFeedPreview[];
    highestSeverity?: ActivitySeverity | null;
  };
  toast?: {
    type: "info" | "success" | "warning" | "error";
    title: {
      key: AllKeys;
      args?: Record<string, any>;
    };
    message: {
      key: AllKeys;
      args?: Record<string, any>;
    };
    action?: {
      label: {
        key: AllKeys;
        args?: Record<string, any>;
      };
      href: string;
    };
  };
};

export interface IDashboardNotifierApp {
  getInitialNotifications(
    appData: ConnectedAppData,
    date?: Date,
  ): Promise<DashboardNotification[]>;
}

"use client";

import {
  useActivityFeedStore,
  useNotificationsStore,
} from "@/notifications/store";
import { BASE_ADMIN_API_URL } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import { DashboardNotification } from "@timelish/types";
import { Badge, toast, useTimeZone } from "@timelish/ui";
import { resolvedI18nText } from "@timelish/ui-admin";
import { useRouter } from "next/navigation";
import React from "react";
import { authClient } from "../auth-client";

export const PendingAppointmentsBadge: React.FC = () => {
  return (
    <DashboardTabNotificationsBadge notificationsCountKey="pending_appointments" />
  );
};

export const DashboardTabNotificationsBadge: React.FC<{
  notificationsCountKey: string;
}> = ({ notificationsCountKey }) => {
  const { badges } = useNotificationsStore();
  const count = badges[notificationsCountKey];
  return typeof count === "number" ? (
    <Badge variant="default" className="ml-1 px-2 scale-75 -translate-y-1">
      {count > 9 ? `9+` : count}
    </Badge>
  ) : null;
};

export const NotificationsToastStream: React.FC = () => {
  const { setBadges } = useNotificationsStore();
  const { addPreviews } = useActivityFeedStore();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "";
  const timeZone = useTimeZone();
  const router = useRouter();
  const t = useI18n();

  const lastDate = React.useRef<Date | undefined>(undefined);

  React.useEffect(() => {
    const dateQueryParam = lastDate.current
      ? `?date=${lastDate.current.toISOString()}`
      : "";
    // Create an EventSource to listen to SSE events
    const eventSource = new EventSource(
      `${BASE_ADMIN_API_URL}/notifications${dateQueryParam}`,
    );

    eventSource.onopen = () => {
      lastDate.current = new Date();
    };

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as DashboardNotification;
      if (data.badges) {
        setBadges((prev) => {
          return (
            data.badges?.reduce((acc, badge) => {
              acc[badge.key] = badge.count;
              return acc;
            }, prev) || prev
          );
        });
      }

      if (data.activityFeed?.preview) {
        addPreviews(
          data.activityFeed.preview,
          userId,
          data.activityFeed.highestSeverity,
        );
      }

      if (data.toast) {
        toast(resolvedI18nText(data.toast.title, t, timeZone), {
          description: resolvedI18nText(data.toast.message, t, timeZone),
          action: data.toast.action
            ? {
                label: resolvedI18nText(data.toast.action.label, t, timeZone),
                onClick: () => {
                  router.push(data.toast!.action!.href);
                },
              }
            : undefined,
        });
      }
    };

    // Handle errors
    eventSource.onerror = () => {
      console.error("Error connecting to SSE server.");
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [t, setBadges, addPreviews, router, userId, timeZone]);

  return null;
};

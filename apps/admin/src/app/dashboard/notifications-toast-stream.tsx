"use client";

import { authClient } from "@/app/auth-client";
import {
  useActivityFeedStore,
  useNotificationsStore,
} from "@/notifications/store";
import { BASE_ADMIN_API_URL } from "@timelish/api-sdk";
import { useI18n, useLocale } from "@timelish/i18n";
import {
  DASHBOARD_BADGE_EVENT,
  DashboardBadgeUpdate,
  DashboardNotification,
} from "@timelish/types";
import { Badge, cn, toast, useTimeZone } from "@timelish/ui";
import {
  applyDashboardBadgeUpdate,
  resolvedI18nText,
} from "@timelish/ui-admin";
import { useRouter } from "next/navigation";
import React from "react";

export const PendingAppointmentsBadge: React.FC = () => {
  return (
    <DashboardNotificationsBadge notificationsCountKey="pending_appointments" />
  );
};

export function useHasDashboardNotifications(
  keys: Array<string | undefined>,
): boolean {
  const { badges } = useNotificationsStore();
  return keys.some((key) => {
    if (!key) {
      return false;
    }
    const count = badges[key];
    return typeof count === "number" && count > 0;
  });
}

export const DashboardNotificationsBadge: React.FC<{
  notificationsCountKey: string;
  className?: string;
}> = ({ notificationsCountKey, className }) => {
  const { badges } = useNotificationsStore();
  const count = badges[notificationsCountKey];
  if (typeof count !== "number" || count <= 0) {
    return null;
  }

  return (
    <Badge
      variant="default"
      className={cn("ml-auto shrink-0 px-1.5 py-0 text-[10px]", className)}
    >
      {count > 9 ? "9+" : count}
    </Badge>
  );
};

export const NotificationsToastStream: React.FC = () => {
  const { setBadges } = useNotificationsStore();
  const { addPreviews } = useActivityFeedStore();
  const { data: session } = authClient.useSession();

  const timeZone = useTimeZone();
  const locale = useLocale();
  const router = useRouter();
  const t = useI18n();

  const lastDate = React.useRef<Date | undefined>(undefined);

  // when session updates, we need to remember last user id to avoid unnecessary re-renders
  const userId = React.useRef<string>("");
  if (session?.user?.id) {
    userId.current = session.user.id;
  }

  React.useEffect(() => {
    const onDashboardBadge = (event: Event) => {
      const detail = (event as CustomEvent<DashboardBadgeUpdate>).detail;
      if (!detail?.key) {
        return;
      }

      setBadges((prev) => applyDashboardBadgeUpdate(prev, detail));
    };

    window.addEventListener(DASHBOARD_BADGE_EVENT, onDashboardBadge);

    return () => {
      window.removeEventListener(DASHBOARD_BADGE_EVENT, onDashboardBadge);
    };
  }, [setBadges]);

  React.useEffect(() => {
    if (!userId.current) {
      return;
    }

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

      if (data.incrementBadgeKey) {
        setBadges((prev) =>
          applyDashboardBadgeUpdate(prev, {
            key: data.incrementBadgeKey!,
            increment: 1,
          }),
        );
      }

      if (data.activityFeed?.preview) {
        addPreviews(
          data.activityFeed.preview,
          userId.current,
          data.activityFeed.highestSeverity,
        );
      }

      if (data.toast) {
        const method =
          typeof toast[data.toast.type] === "function"
            ? toast[data.toast.type]
            : toast;

        method(resolvedI18nText(data.toast.title, t, timeZone, locale), {
          description: resolvedI18nText(
            data.toast.message,
            t,
            timeZone,
            locale,
          ),
          action: data.toast.action
            ? {
                label: resolvedI18nText(
                  data.toast.action.label,
                  t,
                  timeZone,
                  locale,
                ),
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
  }, [t, setBadges, addPreviews, router, userId.current, timeZone]);

  return null;
};

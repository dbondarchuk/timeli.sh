"use client";

import { BASE_ADMIN_API_URL } from "@vivid/api-sdk";
import { useI18n } from "@vivid/i18n";
import { DashboardNotification } from "@vivid/types";
import { Badge, toast } from "@vivid/ui";
import { useRouter } from "next/navigation";
import React from "react";
import { create } from "zustand";

export type NotificationsContextProps = {
  badges: Record<string, number>;
  setBadges: (
    setter: (prev: Record<string, number>) => Record<string, number>,
  ) => void;
};

export const useNotificationsStore = create<NotificationsContextProps>(
  (set) => ({
    badges: {} as Record<string, number>,
    setBadges: (setter) => {
      return set((state) => ({
        badges: setter(state.badges),
      }));
    },
  }),
);

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

      if (data.toast) {
        toast(t(data.toast.title.key, data.toast.title.args), {
          description: t(data.toast.message.key, data.toast.message.args),
          action: data.toast.action
            ? {
                label: t(
                  data.toast.action.label.key,
                  data.toast.action.label.args,
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
  }, [t, setBadges, router]);

  return null;
};

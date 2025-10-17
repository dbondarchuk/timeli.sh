"use client";

import { useI18n } from "@vivid/i18n";
import { DashboardNotification } from "@vivid/types";
import { Badge, toast } from "@vivid/ui";
import { useRouter } from "next/navigation";
import React from "react";
import { create } from "zustand";

export type NotificationsContextProps = {
  notifications: DashboardNotification[];
  setNotifications: (notifications: DashboardNotification[]) => void;
};

export const useNotificationsStore = create<NotificationsContextProps>(
  (set) => ({
    notifications: [],
    setNotifications: (notifications) => {
      return set(() => ({
        notifications,
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
  const { notifications } = useNotificationsStore();
  const count =
    notifications.find((n) => n.key === notificationsCountKey)?.count ?? 0;
  return count > 0 ? (
    <Badge variant="default" className="ml-1 px-2 scale-75 -translate-y-1">
      {count > 9 ? `9+` : count}
    </Badge>
  ) : null;
};

export const NotificationsToastStream: React.FC = () => {
  const { setNotifications } = useNotificationsStore();
  const router = useRouter();
  const t = useI18n();

  React.useEffect(() => {
    // Create an EventSource to listen to SSE events
    const eventSource = new EventSource("/admin/api/notifications");
    // Handle incoming messages
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as DashboardNotification[];
      setNotifications(data);

      const toasts = data.filter((n) => !!n.toast);
      toasts.forEach((notification) => {
        toast(
          t(notification.toast!.title.key, notification.toast!.title.args),
          {
            description: t(
              notification.toast!.message.key,
              notification.toast!.message.args,
            ),
            action: {
              label: t(
                notification.toast!.action.label.key,
                notification.toast!.action.label.args,
              ),
              onClick: () => {
                router.push(notification.toast!.action.href);
              },
            },
          },
        );
      });
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
  }, [t]);

  return null;
};

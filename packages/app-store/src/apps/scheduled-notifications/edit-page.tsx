"use client";

import { useI18n } from "@vivid/i18n";
import { Skeleton, toast } from "@vivid/ui";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { getScheduledNotification } from "./actions";
import { ScheduledNotificationForm } from "./form";
import { ScheduledNotification } from "./models";
import {
  ScheduledNotificationsAdminKeys,
  ScheduledNotificationsAdminNamespace,
  scheduledNotificationsAdminNamespace,
} from "./translations/types";

export const EditScheduledNotificationPage: React.FC<{ appId: string }> = ({
  appId,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const t = useI18n<
    ScheduledNotificationsAdminNamespace,
    ScheduledNotificationsAdminKeys
  >(scheduledNotificationsAdminNamespace);

  const [loading, setLoading] = React.useState(true);
  const [scheduledNotification, setScheduledNotification] =
    React.useState<ScheduledNotification>();

  React.useEffect(() => {
    if (!id) {
      router.replace("/admin/dashboard/communications/scheduled-notifications");
      return;
    }

    const fn = async () => {
      setLoading(true);
      try {
        const result = await getScheduledNotification(appId, id);
        if (!result) {
          router.replace(
            "/admin/dashboard/communications/scheduled-notifications",
          );
          return;
        }

        setScheduledNotification(result as ScheduledNotification);
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        toast.error(t("statusText.error_loading_scheduled_notification"));
      } finally {
      }
    };

    fn();
  }, [id]);

  return loading ? (
    <Skeleton className="w-full h-[70vh]" />
  ) : (
    <ScheduledNotificationForm
      appId={appId}
      initialData={scheduledNotification}
    />
  );
};

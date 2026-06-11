"use client";

import { DashboardNotificationsBadge } from "@/app/dashboard/notifications-toast-stream";
import { AllKeys, useI18n } from "@timelish/i18n";
import { cn, useSidebar } from "@timelish/ui";

export const SidebarNavLabel: React.FC<{
  title: AllKeys;
  notificationsCountKey?: string;
  className?: string;
}> = ({ title, notificationsCountKey, className }) => {
  const t = useI18n();
  const { state, isMobile } = useSidebar();
  const showCountBadge = isMobile || state === "expanded";

  return (
    <span
      className={cn("flex min-w-0 flex-1 items-center gap-1", className)}
    >
      <span className="truncate">{t(title)}</span>
      {showCountBadge && notificationsCountKey ? (
        <DashboardNotificationsBadge
          notificationsCountKey={notificationsCountKey}
        />
      ) : null}
    </span>
  );
};

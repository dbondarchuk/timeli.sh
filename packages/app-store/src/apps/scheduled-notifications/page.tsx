"use client";

import { ScheduledNotificationsTable } from "./table/table";
import { ScheduledNotificationsTableAction } from "./table/table-action";

export const ScheduledNotificationsPage: React.FC<{ appId: string }> = ({
  appId,
}) => {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <ScheduledNotificationsTableAction appId={appId} />
      <ScheduledNotificationsTable appId={appId} />
    </div>
  );
};

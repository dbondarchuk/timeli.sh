"use client";

import { AppointmentNotificationsTable } from "./table/table";
import { AppointmentNotificationsTableAction } from "./table/table-action";

export const AppointmentNotificationsPage: React.FC<{ appId: string }> = ({
  appId,
}) => {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <AppointmentNotificationsTableAction appId={appId} />
      <AppointmentNotificationsTable appId={appId} />
    </div>
  );
};

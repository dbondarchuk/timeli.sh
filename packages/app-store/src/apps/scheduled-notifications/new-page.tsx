"use client";

import { ScheduledNotificationForm } from "./form";

export const NewScheduledNotificationPage: React.FC<{ appId: string }> = ({
  appId,
}) => {
  return <ScheduledNotificationForm appId={appId} />;
};

"use client";

import { AppointmentNotificationForm } from "./form";

export const NewAppointmentNotificationPage: React.FC<{ appId: string }> = ({
  appId,
}) => {
  return <AppointmentNotificationForm appId={appId} />;
};

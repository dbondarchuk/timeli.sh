"use client";

import { Appointment, AppointmentStatus } from "@timelish/types";
import { useReload } from "@timelish/ui-admin";
import { AppointmentDeclineDialog } from "@timelish/ui-admin-kit";

export const AppointmentDeclineDialogWrapper: React.FC<{
  appointment: Appointment;
}> = ({ appointment }) => {
  const { reload } = useReload();
  const onClose = () => {
    location.replace("?");
  };

  const handleSuccess = (status: AppointmentStatus) => {
    reload();
  };

  return (
    <AppointmentDeclineDialog
      appointment={appointment}
      open={appointment.status !== "declined"}
      onClose={onClose}
      onSuccess={handleSuccess}
    />
  );
};

"use client";

import { Appointment } from "@vivid/types";
import { AppointmentDeclineDialog } from "@vivid/ui-admin-kit";

export const AppointmentDeclineDialogWrapper: React.FC<{
  appointment: Appointment;
}> = ({ appointment }) => {
  const onClose = () => {
    location.replace("?");
  };

  return (
    <AppointmentDeclineDialog
      appointment={appointment}
      open={appointment.status !== "declined"}
      onClose={onClose}
    />
  );
};

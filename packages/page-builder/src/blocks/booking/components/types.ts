import { DateTime } from "luxon";

export type BookingProps = {
  successPage?: string | null;
  className?: string;
};

export type CheckDuplicateAppointmentsResponse =
  | {
      hasDuplicateAppointments: false;
    }
  | {
      hasDuplicateAppointments: true;
      closestAppointment: DateTime;
    };

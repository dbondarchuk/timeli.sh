import { DateTime } from "luxon";

export type BookingWithWaitlistProps = {
  successPage?: string | null;
  className?: string;
};

export type CheckDuplicateAppointmentsResponse =
  | {
      hasDuplicateAppointments: false;
    }
  | {
      hasDuplicateAppointments: true;
      doNotAllowScheduling: boolean;
      closestAppointment: DateTime;
    };

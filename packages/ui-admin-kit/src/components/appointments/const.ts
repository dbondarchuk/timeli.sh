import { AppointmentStatus } from "@timelish/types";

export const APPOINTMENT_STATUS_STYLES: Record<AppointmentStatus, string> = {
  confirmed: "bg-green-50 text-green-600",
  pending: "bg-amber-50 text-amber-600",
  declined: "bg-red-50 text-red-500",
};

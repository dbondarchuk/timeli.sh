import { Appointment } from "./appointment";

export type CalendarEvent =
  | Appointment
  | {
      uid: string;
      title: string;
      dateTime: Date;
      totalDuration: number;
    };

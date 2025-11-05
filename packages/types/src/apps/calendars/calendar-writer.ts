import { AppointmentStatus } from "../../booking";
import { ConnectedAppData } from "../connected-app.data";

export type CalendarEventResult = {
  uid: string;
};

export type CalendarEventAttendee = {
  name: string;
  email: string;
  status: "organizer" | "tentative" | "confirmed" | "declined";
  type: "required" | "optional" | "resource";
};

export type CalendarEvent = {
  id: string;
  title: string;
  description: {
    plainText: string;
    html: string;
    url: string;
  };
  uid: string;
  status: AppointmentStatus;
  location: {
    address?: string;
    name: string;
  };
  startTime: Date;
  duration: number;
  timeZone: string;
  attendees: CalendarEventAttendee[];
};

export interface ICalendarWriter {
  createEvent(
    app: ConnectedAppData,
    event: CalendarEvent,
  ): Promise<CalendarEventResult>;

  updateEvent(
    app: ConnectedAppData,
    uid: string,
    event: CalendarEvent,
  ): Promise<CalendarEventResult>;

  deleteEvent(
    app: ConnectedAppData,
    uid: string,
    eventId: string,
  ): Promise<void>;
}

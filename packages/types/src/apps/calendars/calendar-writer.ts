import { AppointmentStatus } from "../../booking";
import { ConnectedAppData } from "../connected-app.data";

export type CalendarWriterEventResult = {
  uid: string;
};

export type CalendarWriterEventAttendee = {
  name: string;
  email: string;
  status: "organizer" | "tentative" | "confirmed" | "declined";
  type: "required" | "optional" | "resource";
};

export type CalendarWriterEvent = {
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
  attendees: CalendarWriterEventAttendee[];
};

export interface ICalendarWriter {
  createEvent(
    app: ConnectedAppData,
    event: CalendarWriterEvent,
  ): Promise<CalendarWriterEventResult>;

  updateEvent(
    app: ConnectedAppData,
    uid: string,
    event: CalendarWriterEvent,
  ): Promise<CalendarWriterEventResult>;

  deleteEvent(
    app: ConnectedAppData,
    uid: string,
    eventId: string,
  ): Promise<void>;
}

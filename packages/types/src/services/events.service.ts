import { AssetEntity } from "../assets";
import {
  Appointment,
  AppointmentEvent,
  AppointmentHistoryEntry,
  AppointmentStatus,
  Availability,
  Event,
  GetAppointmentOptionsResponse,
  ModifyAppointmentInformationRequest,
  Period,
} from "../booking";
import { Query, WithTotal } from "../database";
import { DateRange } from "../general";

export interface IEventsService {
  getAvailability(duration: number): Promise<Availability>;
  getBusyEventsInTimeFrame(start: Date, end: Date): Promise<Period[]>;
  getBusyEvents(): Promise<Period[]>;
  createEvent(args: {
    event: AppointmentEvent;
    confirmed?: boolean;
    force?: boolean;
    files?: Record<string, File>;
    paymentIntentId?: string;
    by: "customer" | "user";
  }): Promise<Appointment>;
  updateEvent(
    id: string,
    args: {
      event: AppointmentEvent;
      confirmed?: boolean;
      files?: Record<string, File>;
      doNotNotifyCustomer?: boolean;
    },
  ): Promise<Appointment>;
  getPendingAppointmentsCount(
    minimumDate?: Date,
    createdAfter?: Date,
  ): Promise<{ totalCount: number; newCount: number }>;
  getPendingAppointments(
    limit?: number,
    after?: Date,
  ): Promise<WithTotal<Appointment>>;
  getNextAppointments(date: Date, limit?: number): Promise<Appointment[]>;
  getAppointments(
    query: Query & {
      range?: DateRange;
      endRange?: DateRange;
      status?: AppointmentStatus[];
      optionId?: string | string[];
      customerId?: string | string[];
      discountId?: string | string[];
    },
  ): Promise<WithTotal<Appointment>>;
  getEvents(
    start: Date,
    end: Date,
    status: AppointmentStatus[],
  ): Promise<Event[]>;
  getAppointment(id: string): Promise<Appointment | null>;
  findAppointment(
    fields: ModifyAppointmentInformationRequest["fields"],
    status?: AppointmentStatus[],
  ): Promise<Appointment | null>;
  changeAppointmentStatus(
    id: string,
    newStatus: AppointmentStatus,
    by?: "customer" | "user",
  ): Promise<void>;
  updateAppointmentNote(id: string, note?: string): Promise<void>;
  addAppointmentFiles(id: string, files: File[]): Promise<AssetEntity[]>;
  rescheduleAppointment(
    id: string,
    newTime: Date,
    newDuration: number,
    doNotNotifyCustomer?: boolean,
    by?: "customer" | "user",
  ): Promise<void>;

  getAppointmentHistory(
    query: Query & {
      appointmentId: string;
      type?: AppointmentHistoryEntry["type"];
    },
  ): Promise<WithTotal<AppointmentHistoryEntry>>;
  addAppointmentHistory(
    entry: Omit<AppointmentHistoryEntry, "_id" | "dateTime" | "companyId">,
  ): Promise<string>;

  verifyTimeAvailability(dateTime: Date, duration: number): Promise<boolean>;
  getAppointmentOptions(): Promise<GetAppointmentOptionsResponse>;
}

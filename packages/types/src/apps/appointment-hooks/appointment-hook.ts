import { Appointment, AppointmentStatus } from "../../booking";
import { ConnectedAppData } from "../connected-app.data";

export interface IAppointmentHook {
  onAppointmentCreated?: (
    appData: ConnectedAppData,
    appointment: Appointment,
    confirmed: boolean,
    by: "customer" | "user",
  ) => Promise<void>;
  onAppointmentStatusChanged?: (
    appData: ConnectedAppData,
    appointment: Appointment,
    newStatus: AppointmentStatus,
    oldStatus?: AppointmentStatus,
    by?: "customer" | "user",
  ) => Promise<void>;
  onAppointmentRescheduled?: (
    appData: ConnectedAppData,
    appointment: Appointment,
    newTime: Date,
    newDuration: number,
    oldTime?: Date,
    oldDuration?: number,
    doNotNotifyCustomer?: boolean,
  ) => Promise<void>;
}

import { Appointment } from "../booking/appointment";
import { Customer } from "./customer";

export type CustomerListModel = Pick<
  Customer,
  "_id" | "avatar" | "name" | "phone" | "email"
> & {
  appointmentsCount: number;
  lastAppointment?: Appointment;
  nextAppointment?: Appointment;
};

export type CustomerSearchField = "name" | "email" | "phone";

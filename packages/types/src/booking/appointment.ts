import { AssetEntity } from "../assets/entity";
import { Customer } from "../customers/customer";
import { WithCompanyId, WithDatabaseId } from "../database";
import { Prettify } from "../utils/helpers";
import {
  AppointmentEvent,
  AppointmentOnlineMeetingInformation,
} from "./appointment-event";
import { Payment } from "./payment";

export const appointmentStatuses = [
  "pending",
  "confirmed",
  "declined",
] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export type AppointmentEntity = Prettify<
  WithCompanyId<
    WithDatabaseId<
      AppointmentEvent & {
        status: AppointmentStatus;
        createdAt: Date;
        customerId: string;
        meetingInformation?: AppointmentOnlineMeetingInformation;
      }
    >
  >
>;

export type Appointment = Prettify<
  AppointmentEntity & {
    customer: Customer;
    files?: AssetEntity[];
    payments?: Payment[];
    endAt: Date;
  }
>;

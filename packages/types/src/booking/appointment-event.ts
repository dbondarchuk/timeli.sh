import * as z from "zod";
import {
  AppointmentReschedulePolicyAction,
  AppointmentWithDepositCancellationPolicyAction,
} from "../configuration/booking/cancellation";
import {
  zNonEmptyString,
  zOptionalOrMinLengthString,
  zPhone,
  zUniqueArray,
} from "../utils";
import { Prettify } from "../utils/helpers";
import { zTimeZone } from "../utils/zTimeZone";
import { AppointmentAddon, AppointmentOption } from "./appointment-option";

export type AppointmentFields = {
  name: string;
  email: string;
  phone: string;
} & {
  [key: string]: any;
};

export type AppointmentDiscount = {
  id: string;
  name: string;
  code: string;
  discountAmount: number;
};

export type AppointmentEventOption = Prettify<
  Pick<AppointmentOption, "_id" | "name" | "price" | "duration" | "isOnline">
>;
export type AppointmentEventAddon = Prettify<
  Pick<AppointmentAddon, "_id" | "name" | "price" | "duration">
>;

export type AppointmentOnlineMeetingInformation = {
  url: string;
  type: string;
  meetingId: string;
  meetingPassword?: string;
  data?: Record<string, any>;
};

export type AppointmentEvent = {
  totalDuration: number;
  totalPrice?: number;
  dateTime: Date;
  timeZone: string;
  fields: AppointmentFields;
  option: AppointmentEventOption;
  fieldsLabels?: Record<string, string>;
  addons?: AppointmentEventAddon[];
  note?: string;
  discount?: AppointmentDiscount;
  data?: Record<string, any>;
};

export const appointmentEventSchema = z.object({
  totalDuration: z.coerce.number<number>().int().min(1),
  totalPrice: z.coerce.number<number>().optional(),
  dateTime: z.coerce.date<Date>(),
  fields: z.record(z.string(), z.any()),
  optionId: zNonEmptyString("appointments.event.optionId.required"),
  addonsIds: zUniqueArray(
    z.array(zNonEmptyString("appointments.event.addonsIds.required")),
    (x) => x,
    "appointments.event.addonsIds.unique",
  ).optional(),
  note: z.string().optional(),
  discount: z
    .object({
      code: zNonEmptyString("appointments.event.discount.code.required"),
      discountAmount: z.coerce.number<number>().min(1),
    })
    .optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export type AppointmentEventRequest = z.infer<typeof appointmentEventSchema>;

export const appointmentRequestSchema = z.object({
  optionId: zNonEmptyString("appointments.request.optionId.required"),
  addonsIds: zUniqueArray(
    z.array(zNonEmptyString("appointments.request.addonsIds.required")),
    (x) => x,
    "appointments.request.addonsIds.unique",
  ).optional(),
  dateTime: z.coerce.date<Date>({
    error: "appointments.request.dateTime.required",
  }),
  timeZone: zTimeZone,
  duration: z.coerce
    .number<number>({ error: "appointments.request.duration.required" })
    .int("appointments.request.duration.positive")
    .min(1, "appointments.request.duration.positive")
    .max(60 * 24 * 1, "appointments.request.duration.max")
    .optional(),
  fields: z.looseObject({
    email: z.email("appointments.request.fields.email.required").trim(),
    name: zNonEmptyString("appointments.request.fields.name.required"),
    phone: zPhone,
  }),
  promoCode: zOptionalOrMinLengthString(
    1,
    "appointments.request.promoCode.min",
  ),
  paymentIntentId: zOptionalOrMinLengthString(
    1,
    "appointments.request.paymentIntentId.min",
  ),
});

export type AppointmentRequest = z.infer<typeof appointmentRequestSchema>;

export class AppointmentTimeNotAvaialbleError extends Error {}

export const baseModifyAppointmentRequestSchema = z.object({
  fields: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("email"),
      email: z.email({ error: "appointments.request.fields.email.required" }),
      dateTime: z.coerce.date<Date>({
        error: "appointments.request.dateTime.required",
      }),
    }),
    z.object({
      type: z.literal("phone"),
      phone: zNonEmptyString("appointments.request.fields.phone.required"),
      dateTime: z.coerce.date<Date>({
        error: "appointments.request.dateTime.required",
      }),
    }),
  ]),
});

export const modifyAppointmentType = ["cancel", "reschedule"] as const;
export type ModifyAppointmentType = (typeof modifyAppointmentType)[number];
export const modifyAppointmentTypeSchema = z.enum(modifyAppointmentType);

export const modifyAppointmentInformationRequestSchema = z.object({
  ...baseModifyAppointmentRequestSchema.shape,
  type: modifyAppointmentTypeSchema,
});

export type ModifyAppointmentInformationRequest = z.infer<
  typeof modifyAppointmentInformationRequestSchema
>;

export const modifyAppointmentRequestSchema = z.discriminatedUnion("type", [
  z.object({
    type: modifyAppointmentTypeSchema.extract(["cancel"]),
    paymentIntentId: zOptionalOrMinLengthString(
      1,
      "appointments.request.intentId.min",
    ),
    ...baseModifyAppointmentRequestSchema.shape,
  }),
  z.object({
    type: modifyAppointmentTypeSchema.extract(["reschedule"]),
    dateTime: z.coerce.date<Date>({
      error: "appointments.request.dateTime.required",
    }),
    paymentIntentId: zOptionalOrMinLengthString(
      1,
      "appointments.request.intentId.min",
    ),
    ...baseModifyAppointmentRequestSchema.shape,
  }),
]);

export type ModifyAppointmentRequest = z.infer<
  typeof modifyAppointmentRequestSchema
>;

export type ModifyAppointmentInformation = {
  id: string;
  name: string;
  optionName: string;
  addonsNames?: string[];
  dateTime: Date;
  timeZone: string;
  duration: number;
  price?: number;
} & (
  | ({
      allowed: true;
      type: "cancel";
    } & (
      | {
          action: "payment";
          paymentPolicy: Extract<
            AppointmentWithDepositCancellationPolicyAction,
            "paymentRequired" | "paymentToFullPriceRequired"
          >;
          paymentPercentage: number;
          paymentAmount: number;
        }
      | {
          action: "refund";
          refundPolicy: Extract<
            AppointmentWithDepositCancellationPolicyAction,
            "partialRefund" | "fullRefund" | "forfeitDeposit"
          >;
          refundPercentage: number;
          refundAmount: number;
          refundFees: boolean;
          feesAmount: number;
        }
      | {
          action: "allowed";
        }
    ))
  | ({
      allowed: true;
      type: "reschedule";
      timeZone: string;
    } & (
      | {
          reschedulePolicy: Extract<
            AppointmentReschedulePolicyAction,
            "allowed"
          >;
        }
      | {
          reschedulePolicy: Extract<
            AppointmentReschedulePolicyAction,
            "paymentRequired"
          >;
          paymentPercentage: number;
          paymentAmount: number;
        }
    ))
  | {
      type: ModifyAppointmentType;
      allowed: false;
      reason: string;
    }
);

export type CheckDuplicateAppointmentsResponse = {
  hasDuplicateAppointments: boolean;
  closestAppointment?: Date;
  doNotAllowScheduling: boolean;
};

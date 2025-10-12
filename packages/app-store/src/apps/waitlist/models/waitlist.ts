import {
  AppointmentEventAddon,
  AppointmentEventOption,
  Customer,
  Prettify,
  WithDatabaseId,
  zPhone,
  zUniqueArray,
} from "@vivid/types";
import z from "zod";

export const waitlistTime = ["morning", "afternoon", "evening"] as const;
export type WaitlistTime = (typeof waitlistTime)[number];

export const waitlistTimeSchema = z.enum(waitlistTime, {
  errorMap: () => ({ message: "waitlist.times.required" }),
});

export const waitlistDateSchema = z.object({
  date: z.string().date("waitlist.date.required"),
  time: zUniqueArray(
    z.array(waitlistTimeSchema),
    (x) => x,
    "waitlist.times.required",
  ),
});

export type WaitlistDate = z.infer<typeof waitlistDateSchema>;

export const waitlistRequestFormSchemaBase = z.object({
  email: z.string().email("waitlist.email.required").trim(),
  name: z.string().min(1, "waitlist.name.required").trim(),
  phone: zPhone,
});

export const MAX_WAITLIST_DATES = 30;

export const waitlistRequestDates = zUniqueArray(
  z
    .array(waitlistDateSchema)
    .min(1, "waitlist.dates.required")
    .max(MAX_WAITLIST_DATES, "waitlist.dates.max"),
  (x) => x.date,
  "waitlist.dates.required",
);

export const waitlistRequestFormSchema = waitlistRequestFormSchemaBase.and(
  z
    .object({
      asSoonAsPossible: z.literal(false, {
        errorMap: () => ({ message: "waitlist.asSoonAsPossible.required" }),
      }),
      dates: waitlistRequestDates,
    })
    .or(
      z.object({
        asSoonAsPossible: z.literal(true, {
          errorMap: () => ({ message: "waitlist.asSoonAsPossible.required" }),
        }),
        dates: z.never().optional(),
      }),
    ),
);

export type WaitlistRequestForm = Prettify<
  z.infer<typeof waitlistRequestFormSchema>
>;

export const waitlistRequestSchema = waitlistRequestFormSchema.and(
  z.object({
    optionId: z.string().min(1, "appointments.request.optionId.required"),
    addonsIds: zUniqueArray(
      z.array(z.string().min(1, "appointments.request.addonsIds.required")),
      (x) => x,
      "appointments.request.addonsIds.unique",
    ).optional(),
    duration: z.coerce
      .number({ message: "appointments.request.duration.required" })
      .int("appointments.request.duration.positive")
      .min(1, "appointments.request.duration.positive")
      .max(60 * 24 * 1, "appointments.request.duration.max")
      .optional(),
  }),
);

export type WaitlistRequest = Prettify<z.infer<typeof waitlistRequestSchema>>;

export const waitlistStatus = ["active", "dismissed"] as const;
export type WaitlistStatus = (typeof waitlistStatus)[number];

export type WaitlistEntryEntity = WithDatabaseId<WaitlistRequest> & {
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  status: WaitlistStatus;
};

export type WaitlistEntry = Prettify<
  WaitlistEntryEntity & {
    customer: Customer;
    option: AppointmentEventOption;
    addons?: AppointmentEventAddon[];
  }
>;

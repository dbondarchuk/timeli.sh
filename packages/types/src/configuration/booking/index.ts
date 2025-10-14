import { z } from "zod";
import { asOptinalNumberField } from "../../utils";
import { calendarSourcesConfigurationSchema } from "./calendar-source";
import { appointmentCancellationRescheduleSchema } from "./cancellation";
import { paymentsConfigurationSchema } from "./payments";

export * from "../../booking/field";
export * from "./calendar-source";
export * from "./cancellation";
export * from "./payments";

export const customTimeSlotSchema = z
  .string({ message: "Time is required" })
  .refine((arg) => {
    const split = arg.split(":", 2).map((x) => parseInt(x));
    return !(
      isNaN(split[0]) ||
      split[0] < 0 ||
      split[0] >= 24 ||
      isNaN(split[1]) ||
      split[1] < 0 ||
      split[1] >= 60
    );
  }, "Invalid time");

export const slotStartSchema = z.union(
  [
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(20),
    z.literal(30),
    z.literal("every-hour"), // every hour at start
    z.literal("custom"), // custom
  ],
  { message: "configuration.booking.slotStart.unknown" },
);

export const allowPromoCodeType = [
  "never",
  "allow-if-has-active",
  "always",
] as const;

export type AllowPromoCodeType = (typeof allowPromoCodeType)[number];

export const generalBookingConfigurationSchema = z.object({
  maxWeeksInFuture: asOptinalNumberField(
    z.coerce
      .number()
      .int("configuration.booking.maxWeeksInFuture.integer")
      .min(2, "configuration.booking.maxWeeksInFuture.min")
      .max(20, "configuration.booking.maxWeeksInFuture.max"),
  ),
  minHoursBeforeBooking: asOptinalNumberField(
    z.coerce
      .number()
      .int("configuration.booking.minHoursBeforeBooking.integer")
      .min(0, "configuration.booking.minHoursBeforeBooking.min")
      .max(72, "configuration.booking.minHoursBeforeBooking.max"),
  ),
  breakDuration: asOptinalNumberField(
    z.coerce
      .number()
      .int("configuration.booking.breakDuration.integer")
      .min(0, "configuration.booking.breakDuration.min")
      .max(120, "configuration.booking.breakDuration.max"),
  ),
  slotStart: slotStartSchema.optional(),
  customSlotTimes: z.array(customTimeSlotSchema).optional(),
  scheduleAppId: z.string().optional(),
  availabilityProviderAppId: z.string().optional(),
  autoConfirm: z.coerce.boolean().optional(),
  allowPromoCode: z.enum(allowPromoCodeType).default("allow-if-has-active"),
  payments: paymentsConfigurationSchema,
  cancellationsAndReschedules: appointmentCancellationRescheduleSchema,
});

export const appointOptionsSchema = z.array(
  z.object({
    id: z.string().min(1, "configuration.booking.options.id.required"),
  }),
);

export const bookingConfigurationSchema = generalBookingConfigurationSchema
  .merge(
    z.object({
      calendarSources: calendarSourcesConfigurationSchema,
      options: appointOptionsSchema,
    }),
  )
  .superRefine((arg, ctx) => {
    if (arg.slotStart === "custom" && !arg.customSlotTimes?.length) {
      ctx.addIssue({
        path: ["specifiedSlotTimes"],
        code: z.ZodIssueCode.custom,
        message: "configuration.booking.customSlotTimes.required",
      });
    }
  });

export type BookingConfiguration = z.infer<typeof bookingConfigurationSchema>;

import { z } from "zod";
import { asOptinalNumberField } from "../../utils";

export const paymentsConfigurationSchema = z
  .object({
    paymentAppId: z
      .string()
      .min(1, "configuration.booking.payments.paymentAppId.required"),
    enabled: z.literal(true, {
      message: "configuration.booking.payments.paymentAppId.required",
    }),
  })
  .and(
    z.discriminatedUnion("requireDeposit", [
      z.object({
        requireDeposit: z
          .literal(false, {
            message: "configuration.booking.payments.requireDeposit.required",
          })
          .optional(),
      }),
      z.object({
        requireDeposit: z.literal(true, {
          message: "configuration.booking.payments.requireDeposit.required",
        }),
        depositPercentage: z.coerce
          .number({
            message:
              "configuration.booking.payments.depositPercentage.required",
          })
          .int("configuration.booking.payments.depositPercentage.integer")
          .min(10, "configuration.booking.payments.depositPercentage.min")
          .max(100, "configuration.booking.payments.depositPercentage.max"),
        dontRequireIfCompletedMinNumberOfAppointments: asOptinalNumberField(
          z.coerce
            .number({
              message:
                "configuration.booking.payments.dontRequireIfCompletedMinNumberOfAppointments.min",
            })
            .int(
              "configuration.booking.payments.dontRequireIfCompletedMinNumberOfAppointments.integer",
            )
            .min(
              1,
              "configuration.booking.payments.dontRequireIfCompletedMinNumberOfAppointments.min",
            ),
        ),
      }),
    ]),
  )
  .or(
    z.object({
      enabled: z
        .literal(false, {
          message: "configuration.booking.payments.paymentAppId.required",
        })
        .optional(),
    }),
  );

export type PaymentsConfiguration = z.infer<typeof paymentsConfigurationSchema>;

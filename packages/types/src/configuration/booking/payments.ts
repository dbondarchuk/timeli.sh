import * as z from "zod";
import { asOptinalNumberField, zNonEmptyString } from "../../utils";

export const paymentsConfigurationSchema = z
  .object({
    paymentAppId: zNonEmptyString(
      "configuration.booking.payments.paymentAppId.required",
    ),
    enabled: z.literal(true, {
      error: "configuration.booking.payments.paymentAppId.required",
    }),
  })
  .and(
    z.discriminatedUnion("requireDeposit", [
      z.object({
        requireDeposit: z
          .literal(false, {
            error: "configuration.booking.payments.requireDeposit.required",
          })
          .optional(),
      }),
      z.object({
        requireDeposit: z.literal(true, {
          error: "configuration.booking.payments.requireDeposit.required",
        }),
        depositPercentage: z.coerce
          .number<number>({
            error: "configuration.booking.payments.depositPercentage.required",
          })
          .int("configuration.booking.payments.depositPercentage.integer")
          .min(10, "configuration.booking.payments.depositPercentage.min")
          .max(100, "configuration.booking.payments.depositPercentage.max"),
        dontRequireIfCompletedMinNumberOfAppointments: asOptinalNumberField(
          z.coerce
            .number<number>({
              error:
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
          error: "configuration.booking.payments.paymentAppId.required",
        })
        .optional(),
    }),
  );

export type PaymentsConfiguration = z.infer<typeof paymentsConfigurationSchema>;

import * as z from "zod";

export const modifyEnabledType = [
  "disabled",
  "enabled",
  "notAllowedWithoutDeposit",
] as const;
export const enabledSchema = z.enum(modifyEnabledType, {
  message: "cancellation.policy.enabled.required",
});
export type ModifyEnabledType = z.infer<typeof enabledSchema>;

/**
 * Policy action options:
 * - notAllowed: no cancellations allowed in this window
 * - forfeitDeposit: allowed but customer loses 100% of deposit
 * - partialRefund: allowed with a refund percentage of deposit (0-100)
 * - fullRefund: allowed with full refund
 */
export const appointmentCancellationPolicyActionType = [
  "notAllowed",
  "forfeitDeposit",
  "partialRefund",
  "fullRefund",
] as const;

export const appointmentCancellationPolicyAction = z.enum(
  appointmentCancellationPolicyActionType,
  { message: "cancellation.policy.action.required" },
);

export type AppointmentCancellationPolicyAction = z.infer<
  typeof appointmentCancellationPolicyAction
>;

/**
 * Policy action options:
 * - notAllowed: no reschedules allowed in this window
 * - allowed: allowed without payment
 * - paymentRequired: payment required to reschedule
 */
export const appointmentReschedulePolicyActionType = [
  "notAllowed",
  "allowed",
  "paymentRequired",
] as const;

export const appointmentReschedulePolicyAction = z.enum(
  appointmentReschedulePolicyActionType,
  { message: "cancellation.policy.action.required" },
);

export type AppointmentReschedulePolicyAction = z.infer<
  typeof appointmentReschedulePolicyAction
>;

const baseAppointmentCancellationPolicyRowSchema = z.object({
  action: appointmentCancellationPolicyAction,
  refundFees: z.coerce.boolean<boolean>().optional(),
  refundPercentage: z.coerce
    .number<number>("cancellation.policy.refundPercentage.required")
    .min(0, { message: "cancellation.policy.refundPercentage.min" })
    .max(100, { message: "cancellation.policy.refundPercentage.max" })
    .optional(),
  // optional free-form note for admins
  note: z
    .string()
    .max(500, { message: "cancellation.policy.note.max" })
    .optional(),
});

const baseAppointmentReschedulePolicyRowSchema = z.object({
  action: appointmentReschedulePolicyAction,
  paymentPercentage: z.coerce
    .number<number>("cancellation.policy.paymentPercentage.required")
    .min(0, { message: "cancellation.policy.paymentPercentage.min" })
    .max(100, { message: "cancellation.policy.paymentPercentage.max" })
    .optional(),
  // optional free-form note for admins
  note: z
    .string()
    .max(500, { message: "cancellation.policy.note.max" })
    .optional(),
});

const baseAppointmentCancellationPolicyRowSuperRefineFunction = (
  val: z.infer<typeof baseAppointmentCancellationPolicyRowSchema>,
  ctx: z.RefinementCtx,
) => {
  if (val.action === "partialRefund") {
    if (typeof val.refundPercentage !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cancellation.policy.refundPercentage.required",
        path: ["refundPercentage"],
      });
    }
  } else {
    // if provided, ensure it's within range (already validated) but warn if unnecessary?
    // We'll simply ignore it for other actions — no error.
  }
};

const baseAppointmentReschedulePolicyRowSuperRefineFunction = (
  val: z.infer<typeof baseAppointmentReschedulePolicyRowSchema>,
  ctx: z.RefinementCtx,
) => {
  if (val.action === "paymentRequired") {
    if (typeof val.paymentPercentage !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cancellation.policy.paymentPercentage.required",
        path: ["paymentPercentage"],
      });
    }
  }
};

/**
 * Single cancellation policy row:
 * - minutesToAppointment: integer > 0
 *     (meaning "if customer cancels/reschedules at most X minutes before appointment, apply this policy")
 * - action: one of PolicyAction
 * - refundPercentage: required ONLY when action === "partial_refund" (0..100)
 *
 * NOTE: We keep time in minutes for precision; helpers below convert days/hours -> minutes.
 */
export const appointmentCancellationPolicyRowSchema = z
  .object({
    minutesToAppointment: z.coerce
      .number<number>()
      .int({
        error: "cancellation.policy.minutesToAppointment.required",
      })
      .positive({
        error: "cancellation.policy.minutesToAppointment.required",
      }),
    ...baseAppointmentCancellationPolicyRowSchema.shape,
  })
  .superRefine(baseAppointmentCancellationPolicyRowSuperRefineFunction);

export type AppointmentCancellationPolicyRow = z.infer<
  typeof appointmentCancellationPolicyRowSchema
>;

export const defaultAppointmentCancellationPolicyRowSchema =
  baseAppointmentCancellationPolicyRowSchema.superRefine(
    baseAppointmentCancellationPolicyRowSuperRefineFunction,
  );

export type DefaultAppointmentCancellationPolicyRow = z.infer<
  typeof defaultAppointmentCancellationPolicyRowSchema
>;

/**
 * Policy array schema: enforces strictly increasing minutesToAppointment order.
 * (each item's time must be greater than the previous one)
 */
export const appointmentCancellationPolicyListSchema = z
  .array(appointmentCancellationPolicyRowSchema)
  .optional()
  .superRefine((rows, ctx) => {
    if (!rows) {
      return;
    }

    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1].minutesToAppointment;
      const cur = rows[i].minutesToAppointment;
      if (!(cur > prev)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "cancellation.policy.increasing",
          path: [i, "minutesToAppointment"],
        });
      }
    }
  });

export type AppointmentCancellationPolicyList = z.infer<
  typeof appointmentCancellationPolicyListSchema
>;

/**
 * Single reschedule policy row:
 * - minutesToAppointment: integer > 0
 *     (meaning "if customer cancels/reschedules at most X minutes before appointment, apply this policy")
 * - action: one of PolicyAction
 * - paymentPercentage: required ONLY when action === "payment" (0..100)
 *
 * NOTE: We keep time in minutes for precision; helpers below convert days/hours -> minutes.
 */
export const appointmentReschedulePolicyRowSchema = z
  .object({
    minutesToAppointment: z.coerce
      .number<number>()
      .int({
        error: "cancellation.policy.minutesToAppointment.required",
      })
      .positive({
        error: "cancellation.policy.minutesToAppointment.required",
      }),
    ...baseAppointmentReschedulePolicyRowSchema.shape,
  })
  .superRefine(baseAppointmentReschedulePolicyRowSuperRefineFunction);

export type AppointmentReschedulePolicyRow = z.infer<
  typeof appointmentReschedulePolicyRowSchema
>;

export const defaultAppointmentReschedulePolicyRowSchema =
  baseAppointmentReschedulePolicyRowSchema.superRefine(
    baseAppointmentReschedulePolicyRowSuperRefineFunction,
  );

export type DefaultAppointmentReschedulePolicyRow = z.infer<
  typeof defaultAppointmentReschedulePolicyRowSchema
>;

/**
 * Policy array schema: enforces strictly increasing minutesToAppointment order.
 * (each item's time must be greater than the previous one)
 */
export const appointmentReschedulePolicyListSchema = z
  .array(appointmentReschedulePolicyRowSchema)
  .optional()
  .superRefine((rows, ctx) => {
    if (!rows) {
      return;
    }

    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1].minutesToAppointment;
      const cur = rows[i].minutesToAppointment;
      if (!(cur > prev)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "cancellation.policy.increasing",
          path: [i, "minutesToAppointment"],
        });
      }
    }
  });

export type AppointmentReschedulePolicyList = z.infer<
  typeof appointmentReschedulePolicyListSchema
>;

/**
 * Per-feature (cancellations/reschedules) configuration:
 * - enabled: boolean
 * - policies: array (required if enabled === true)
 * If enabled === false, policies may be present or omitted (we allow present but ignore).
 */
export const appointmentCancellationSchema = z.discriminatedUnion("enabled", [
  z.object({
    enabled: enabledSchema.extract(["disabled"]),
  }),
  z.object({
    enabled: enabledSchema.exclude(["disabled"]),
    doNotAllowIfRescheduled: z.coerce.boolean<boolean>().optional(),
    policies: appointmentCancellationPolicyListSchema,
    defaultPolicy: defaultAppointmentCancellationPolicyRowSchema,
  }),
]);

export type AppointmentCancellationConfiguration = z.infer<
  typeof appointmentCancellationSchema
>;

export const appointmentRescheduleSchema = z.discriminatedUnion("enabled", [
  z.object({
    enabled: enabledSchema.extract(["disabled"]),
  }),
  z.object({
    enabled: enabledSchema.exclude(["disabled"]),
    maxReschedules: z.coerce
      .number<number>()
      .int({
        error: "cancellation.policy.maxReschedules.required",
      })
      .min(0, {
        error: "cancellation.policy.maxReschedules.required",
      })
      .optional(),
    policies: appointmentReschedulePolicyListSchema.optional(),
    defaultPolicy: defaultAppointmentReschedulePolicyRowSchema,
  }),
]);

export type AppointmentRescheduleConfiguration = z.infer<
  typeof appointmentRescheduleSchema
>;

/**
 * Top-level schema for cancellation/reschedule configuration
 */
export const appointmentCancellationRescheduleSchema = z.object({
  cancellations: appointmentCancellationSchema,
  reschedules: appointmentRescheduleSchema,
  // Optional global settings you might want later (example: deposit percentage / currency)
  // depositPercentage: z.number().min(0).max(100).optional(),
});

export type AppointmentCancellationRescheduleConfiguration = z.infer<
  typeof appointmentCancellationRescheduleSchema
>;

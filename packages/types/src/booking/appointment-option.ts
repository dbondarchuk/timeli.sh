import { ValidationKeys } from "@timelish/i18n";
import * as z from "zod";
import { WithCompanyId, WithDatabaseId } from "../database";
import { asOptinalNumberField, zNonEmptyString, zUniqueArray } from "../utils";
import { Prettify } from "../utils/helpers";
import { FieldSchema } from "./field";

export const isRequiredOptionTypes = ["inherit", "always", "never"] as const;

const isRequiredOptionSchema = z.enum(isRequiredOptionTypes);

export const appointmentOptionSchema = z
  .object({
    name: zNonEmptyString("appointments.option.name.required", 2),
    // description: z.array(z.any()),
    description: zNonEmptyString("appointments.option.description.required", 2),
    duration: asOptinalNumberField(
      z.coerce
        .number<number>()
        .int("appointments.option.duration.positive")
        .min(1, "appointments.option.duration.positive"),
    ),

    price: asOptinalNumberField(
      z.coerce.number<number>().min(1, "appointments.option.price.min"),
    ),
    addons: zUniqueArray(
      z.array(
        z.object({
          id: zNonEmptyString("appointments.option.addons.id.required"),
        }),
      ),
      (addon) => addon.id,
      "appointments.option.addons.id.unique",
    ).optional(),
    fields: zUniqueArray(
      z.array(
        z.object({
          id: zNonEmptyString("appointments.option.fields.id.required"),
          required: z.coerce.boolean<boolean>().optional(),
        }),
      ),
      (field) => field.id,
      "appointments.option.fields.id.unique",
    ).optional(),
    isAutoConfirm: isRequiredOptionSchema,
    duplicateAppointmentCheck: z
      .object({
        enabled: z.literal(true, {
          error:
            "appointments.option.duplicateAppointmentCheck.enabled.required",
        }),
        message: zNonEmptyString(
          "appointments.option.duplicateAppointmentCheck.message.required",
        ),
        days: z.coerce
          .number<number>({
            error: "appointments.option.duplicateAppointmentCheck.days.min",
          })
          .int("appointments.option.duplicateAppointmentCheck.days.min")
          .min(1, "appointments.option.duplicateAppointmentCheck.days.min")
          .max(30, "appointments.option.duplicateAppointmentCheck.days.max"),
        doNotAllowScheduling: z.coerce.boolean<boolean>().optional(),
      })
      .or(
        z.object({
          enabled: z
            .literal(false, {
              error:
                "appointments.option.duplicateAppointmentCheck.enabled.required" satisfies ValidationKeys,
            })
            .default(false)
            .optional()
            .nullable(),
        }),
      )
      .optional(),
  })
  .and(
    z
      .object({
        requireDeposit: isRequiredOptionSchema
          .exclude(["always"], {
            error: "appointments.option.requireDeposit.required",
          })
          .optional()
          .nullable(),
      })
      .or(
        z.object({
          requireDeposit: isRequiredOptionSchema.extract(["always"], {
            error: "appointments.option.requireDeposit.required",
          }),
          depositPercentage: z.coerce
            .number<number>({
              error: "appointments.option.depositPercentage.required",
            })
            .int("appointments.option.depositPercentage.required")
            .min(10, "appointments.option.depositPercentage.required")
            .max(100, "appointments.option.depositPercentage.required"),
        }),
      ),
  )
  .and(
    z
      .object({
        isOnline: z.literal(false, {
          error:
            "appointments.option.isOnline.required" satisfies ValidationKeys,
        }),
      })
      .or(
        z.object({
          isOnline: z.literal(true, {
            error:
              "appointments.option.isOnline.required" satisfies ValidationKeys,
          }),
          meetingUrlProviderAppId: z.string().optional(),
        }),
      ),
  );

export type AppointmentOptionUpdateModel = z.infer<
  typeof appointmentOptionSchema
>;

export type AppointmentOption = Prettify<
  WithCompanyId<
    WithDatabaseId<
      AppointmentOptionUpdateModel & {
        updatedAt: Date;
      }
    >
  >
>;

export const getAppointmentOptionSchemaWithUniqueCheck = (
  uniqueNameCheckFn: (name: string) => Promise<boolean>,
  message: string,
) => {
  return appointmentOptionSchema.superRefine(async (args, ctx) => {
    const isUnique = await uniqueNameCheckFn(args.name);
    if (!isUnique) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message,
      });
    }
  });
};

export const appointmentAddonSchema = z.object({
  name: zNonEmptyString("addons.name.required", 2),
  // description: z.array(z.any()),
  description: zNonEmptyString("addons.description.required", 2),
  duration: asOptinalNumberField(
    z.coerce
      .number<number>()
      .int("addons.duration.positive")
      .min(1, "addons.duration.positive"),
  ),
  price: asOptinalNumberField(
    z.coerce.number<number>().min(1, "addons.price.min"),
  ),
  fields: zUniqueArray(
    z.array(
      z.object({
        id: zNonEmptyString("appointments.option.fields.id.required"),
        required: z.coerce.boolean<boolean>().optional(),
      }),
    ),
    (field) => field.id,
    "appointments.option.fields.id.unique",
  ).optional(),
});

export const getAppointmentAddonSchemaWithUniqueCheck = (
  uniqueNameCheckFn: (name: string) => Promise<boolean>,
  message: string,
) => {
  return appointmentAddonSchema.superRefine(async (args, ctx) => {
    const isUnique = await uniqueNameCheckFn(args.name);
    if (!isUnique) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message,
      });
    }
  });
};

export type AppointmentAddonUpdateModel = z.infer<
  typeof appointmentAddonSchema
>;

export type AppointmentAddon = Prettify<
  WithCompanyId<
    WithDatabaseId<
      AppointmentAddonUpdateModel & {
        updatedAt: Date;
      }
    >
  >
>;

export const appointmentAddonsSchema = z
  .array(appointmentAddonSchema)
  .optional();
export type AppointmentAddons = z.infer<typeof appointmentAddonsSchema>;

export type AppointmentChoice = Prettify<
  Omit<AppointmentOption, "addons"> & {
    addons: AppointmentAddon[];
  }
>;

export type GetAppointmentOptionsResponse = {
  options: AppointmentChoice[];
  fieldsSchema: Record<string, FieldSchema>;
  showPromoCode: boolean;
};

import { AllKeys } from "@vivid/i18n";
import {
  asOptinalNumberField,
  CommunicationChannel,
  communicationChannels,
  Query,
  WithDatabaseId,
} from "@vivid/types";
import { z } from "zod";
import { RemindersAdminAllKeys } from "./translations/types";

export const timeBeforeReminderType = "timeBefore" as const;
export const atTimeReminderType = "atTime" as const;
export const reminderTypes = [
  timeBeforeReminderType,
  atTimeReminderType,
] as const;

export type ReminderType = (typeof reminderTypes)[number];

export const reminderTypesEnum = z.enum(reminderTypes);
export const reminderChannelesEnum = z.enum(communicationChannels);

export const reminderTimeBeforeSchema = z.object({
  type: reminderTypesEnum.extract(["timeBefore"]),
  weeks: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_reminders_admin.validation.form.weeks.min" satisfies RemindersAdminAllKeys,
      )
      .max(
        10,
        "app_reminders_admin.validation.form.weeks.max" satisfies RemindersAdminAllKeys,
      ),
  ),
  days: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_reminders_admin.validation.form.days.min" satisfies RemindersAdminAllKeys,
      )
      .max(
        31,
        "app_reminders_admin.validation.form.days.max" satisfies RemindersAdminAllKeys,
      ),
  ),
  hours: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_reminders_admin.validation.form.hours.min" satisfies RemindersAdminAllKeys,
      )
      .max(
        24 * 5,
        "app_reminders_admin.validation.form.hours.max" satisfies RemindersAdminAllKeys,
      ),
  ),
  minutes: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_reminders_admin.validation.form.minutes.min" satisfies RemindersAdminAllKeys,
      )
      .max(
        60 * 10,
        "app_reminders_admin.validation.form.minutes.max" satisfies RemindersAdminAllKeys,
      ),
  ),
});

export const reminderAtTimeSchema = z.object({
  type: reminderTypesEnum.extract(["atTime"]),
  weeks: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_reminders_admin.validation.form.weeks.min" satisfies RemindersAdminAllKeys,
      )
      .max(
        10,
        "app_reminders_admin.validation.form.weeks.max" satisfies RemindersAdminAllKeys,
      ),
  ),
  days: z.coerce
    .number()
    .int("common.number.integer")
    .min(
      0,
      "app_reminders_admin.validation.form.days.min" satisfies RemindersAdminAllKeys,
    )
    .max(
      31,
      "app_reminders_admin.validation.form.days.max" satisfies RemindersAdminAllKeys,
    ),
  time: z.object({
    hour: z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_reminders_admin.validation.form.time.hour.min" satisfies RemindersAdminAllKeys,
      )
      .max(
        23,
        "app_reminders_admin.validation.form.time.hour.max" satisfies RemindersAdminAllKeys,
      ),
    minute: z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_reminders_admin.validation.form.time.minute.min" satisfies RemindersAdminAllKeys,
      )
      .max(
        59,
        "app_reminders_admin.validation.form.time.minute.max" satisfies RemindersAdminAllKeys,
      ),
  }),
});

export const baseReminderChannelSchema = z.object({
  templateId: z
    .string({
      message:
        "app_reminders_admin.validation.form.templateId.required" satisfies RemindersAdminAllKeys,
    })
    .min(
      1,
      "app_reminders_admin.validation.form.templateId.required" satisfies RemindersAdminAllKeys,
    ),
});

export const reminderEmailSchema = z
  .object({
    channel: reminderChannelesEnum.extract(["email"]),
    subject: z
      .string()
      .min(
        1,
        "app_reminders_admin.validation.form.subject.required" satisfies RemindersAdminAllKeys,
      ),
  })
  .merge(baseReminderChannelSchema);

export const reminderTextMessageSchema = z
  .object({
    channel: reminderChannelesEnum.extract(["text-message"]),
  })
  .merge(baseReminderChannelSchema);

export const reminderTypeSchema = z.discriminatedUnion("type", [
  reminderTimeBeforeSchema,
  reminderAtTimeSchema,
]);

export const reminderChannelSchema = z.discriminatedUnion("channel", [
  reminderEmailSchema,
  reminderTextMessageSchema,
]);

export const reminderGeneralSchema = z.object({
  name: z
    .string()
    .min(
      2,
      "app_reminders_admin.validation.form.name.min" satisfies RemindersAdminAllKeys,
    ),
});

export const reminderSchema = z
  .intersection(
    z.intersection(reminderGeneralSchema, reminderTypeSchema),
    reminderChannelSchema,
  )
  .superRefine((arg, ctx) => {
    if (arg.type === "atTime" && !arg.weeks && !arg.days) {
      ctx.addIssue({
        code: "custom",
        path: ["days"],
        message:
          "app_reminders_admin.validation.form.atTime.days.min" satisfies RemindersAdminAllKeys,
      });
    } else if (
      arg.type === "timeBefore" &&
      !arg.weeks &&
      !arg.days &&
      !arg.hours &&
      !arg.minutes
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minutes"],
        message:
          "app_reminders_admin.validation.form.atTime.minutes.min" satisfies RemindersAdminAllKeys,
      });
    }
  });

export const getReminderSchemaWithUniqueCheck = (
  uniqueNameCheckFn: (name: string) => Promise<boolean>,
  message: string,
) => {
  return reminderSchema.superRefine(async (args, ctx) => {
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

export const remindersSchema = z.array(reminderSchema).optional();

export type TimeBeforeReminder = z.infer<typeof reminderTimeBeforeSchema>;
export type AtTimeReminder = z.infer<typeof reminderAtTimeSchema>;

export type EmailChannelReminder = z.infer<typeof reminderEmailSchema>;
export type TextMessageChannelReminder = z.infer<
  typeof reminderTextMessageSchema
>;

export type ReminderUpdateModel = z.infer<typeof reminderSchema>;

export type Reminder = WithDatabaseId<ReminderUpdateModel> & {
  appId: string;
  updatedAt: Date;
};

export type GetRemindersAction = {
  query: Query & {
    channel?: CommunicationChannel[];
  };
};

export const GetRemindersActionType = "get-reminders" as const;

export type GetReminderAction = {
  id: string;
};

export const GetReminderActionType = "get-reminder" as const;

export type DeleteRemindersAction = {
  ids: string[];
};

export const DeleteRemindersActionType = "delete-reminders" as const;

export type CreateNewReminderAction = {
  reminder: ReminderUpdateModel;
};

export const CreateNewReminderActionType = "create-reminder" as const;

export type UpdateReminderAction = {
  id: string;
  update: ReminderUpdateModel;
};

export const UpdateReminderActionType = "update-reminder" as const;

export type CheckUniqueReminderNameAction = {
  id?: string;
  name: string;
};

export const CheckUniqueReminderNameActionType = "check-unique-name" as const;

export const remindersAppDataSchema = z.object({});

export type RemindersAppData = z.infer<typeof remindersAppDataSchema>;

export type GetAppDataAction = {};

export const GetAppDataActionType = "get-app-data" as const;

export type SetAppDataAction = {
  data: RemindersAppData;
};

export const SetAppDataActionType = "set-app-data" as const;

export type RequestAction =
  | ({
      type: typeof GetRemindersActionType;
    } & GetRemindersAction)
  | ({
      type: typeof GetReminderActionType;
    } & GetReminderAction)
  | ({
      type: typeof DeleteRemindersActionType;
    } & DeleteRemindersAction)
  | ({
      type: typeof CreateNewReminderActionType;
    } & CreateNewReminderAction)
  | ({
      type: typeof UpdateReminderActionType;
    } & UpdateReminderAction)
  | ({
      type: typeof CheckUniqueReminderNameActionType;
    } & CheckUniqueReminderNameAction)
  | ({
      type: typeof GetAppDataActionType;
    } & GetAppDataAction)
  | ({
      type: typeof SetAppDataActionType;
    } & SetAppDataAction);

// export type Reminders = z.infer<typeof remindersSchema>;

// export const remindersConfigurationSchema = z.object({
//   reminders: remindersSchema,
// });

// export type RemindersConfiguration = z.infer<
//   typeof remindersConfigurationSchema
// >;

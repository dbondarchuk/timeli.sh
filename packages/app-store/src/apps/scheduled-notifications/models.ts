import { AllKeys } from "@vivid/i18n";
import {
  asOptinalNumberField,
  CommunicationChannel,
  communicationChannels,
  Query,
  WithDatabaseId,
} from "@vivid/types";
import * as z from "zod";
import { ScheduledNotificationsAdminAllKeys } from "./translations/types";

export const timeBeforeScheduledNotificationType = "timeBefore" as const;
export const atTimeScheduledNotificationType = "atTimeBefore" as const;
export const timeAfterScheduledNotificationType = "timeAfter" as const;
export const atTimeAfterScheduledNotificationType = "atTimeAfter" as const;

export const scheduledNotificationTypes = [
  timeBeforeScheduledNotificationType,
  atTimeScheduledNotificationType,
  timeAfterScheduledNotificationType,
  atTimeAfterScheduledNotificationType,
] as const;

export type ScheduledNotificationType =
  (typeof scheduledNotificationTypes)[number];

export const scheduledNotificationTypesEnum = z.enum(
  scheduledNotificationTypes,
);
export const scheduledNotificationChannelsEnum = z.enum(communicationChannels);

export const scheduledNotificationTimeBeforeAfterSchema = z.object({
  type: scheduledNotificationTypesEnum.extract(["timeBefore", "timeAfter"]),
  weeks: asOptinalNumberField(
    z.coerce
      .number<number>()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_scheduled-notifications_admin.validation.form.weeks.min" satisfies ScheduledNotificationsAdminAllKeys,
      )
      .max(
        10,
        "app_scheduled-notifications_admin.validation.form.weeks.max" satisfies ScheduledNotificationsAdminAllKeys,
      ),
  ),
  days: asOptinalNumberField(
    z.coerce
      .number<number>()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_scheduled-notifications_admin.validation.form.days.min" satisfies ScheduledNotificationsAdminAllKeys,
      )
      .max(
        31,
        "app_scheduled-notifications_admin.validation.form.days.max" satisfies ScheduledNotificationsAdminAllKeys,
      ),
  ),
  hours: asOptinalNumberField(
    z.coerce
      .number<number>()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_scheduled-notifications_admin.validation.form.hours.min" satisfies ScheduledNotificationsAdminAllKeys,
      )
      .max(
        24 * 5,
        "app_scheduled-notifications_admin.validation.form.hours.max" satisfies ScheduledNotificationsAdminAllKeys,
      ),
  ),
  minutes: asOptinalNumberField(
    z.coerce
      .number<number>()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_scheduled-notifications_admin.validation.form.minutes.min" satisfies ScheduledNotificationsAdminAllKeys,
      )
      .max(
        60 * 10,
        "app_scheduled-notifications_admin.validation.form.minutes.max" satisfies ScheduledNotificationsAdminAllKeys,
      ),
  ),
});

export const scheduledNotificationAtTimeSchema = z.object({
  type: scheduledNotificationTypesEnum.extract(["atTimeBefore", "atTimeAfter"]),
  weeks: asOptinalNumberField(
    z.coerce
      .number<number>()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_scheduled-notifications_admin.validation.form.weeks.min" satisfies ScheduledNotificationsAdminAllKeys,
      )
      .max(
        10,
        "app_scheduled-notifications_admin.validation.form.weeks.max" satisfies ScheduledNotificationsAdminAllKeys,
      ),
  ),
  days: z.coerce
    .number<number>()
    .int("common.number.integer")
    .min(
      0,
      "app_scheduled-notifications_admin.validation.form.days.min" satisfies ScheduledNotificationsAdminAllKeys,
    )
    .max(
      31,
      "app_scheduled-notifications_admin.validation.form.days.max" satisfies ScheduledNotificationsAdminAllKeys,
    ),
  time: z.object({
    hour: z.coerce
      .number<number>()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_scheduled-notifications_admin.validation.form.time.hour.min" satisfies ScheduledNotificationsAdminAllKeys,
      )
      .max(
        23,
        "app_scheduled-notifications_admin.validation.form.time.hour.max" satisfies ScheduledNotificationsAdminAllKeys,
      ),
    minute: z.coerce
      .number<number>()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_scheduled-notifications_admin.validation.form.time.minute.min" satisfies ScheduledNotificationsAdminAllKeys,
      )
      .max(
        59,
        "app_scheduled-notifications_admin.validation.form.time.minute.max" satisfies ScheduledNotificationsAdminAllKeys,
      ),
  }),
});

export const baseScheduledNotificationChannelSchema = z.object({
  templateId: z
    .string({
      error:
        "app_scheduled-notifications_admin.validation.form.templateId.required" satisfies ScheduledNotificationsAdminAllKeys,
    })
    .min(
      1,
      "app_scheduled-notifications_admin.validation.form.templateId.required" satisfies ScheduledNotificationsAdminAllKeys,
    ),
});

export const scheduledNotificationEmailSchema = z.object({
  ...baseScheduledNotificationChannelSchema.shape,
  channel: scheduledNotificationChannelsEnum.extract(["email"]),
  subject: z
    .string()
    .min(
      1,
      "app_scheduled-notifications_admin.validation.form.subject.required" satisfies ScheduledNotificationsAdminAllKeys,
    ),
});

export const scheduledNotificationTextMessageSchema = z.object({
  ...baseScheduledNotificationChannelSchema.shape,
  channel: scheduledNotificationChannelsEnum.extract(["text-message"]),
});

export const scheduledNotificationTypeSchema = z.discriminatedUnion("type", [
  scheduledNotificationTimeBeforeAfterSchema,
  scheduledNotificationAtTimeSchema,
]);

export const scheduledNotificationChannelSchema = z.discriminatedUnion(
  "channel",
  [scheduledNotificationEmailSchema, scheduledNotificationTextMessageSchema],
);

export const scheduledNotificationAppointmentCountType = [
  "none",
  "lessThan",
  "equalTo",
  "greaterThan",
  "lessThanOrEqualTo",
  "greaterThanOrEqualTo",
] as const;
export const scheduledNotificationAppointmentCountTypeEnum = z.enum(
  scheduledNotificationAppointmentCountType,
  {
    error:
      "app_scheduled-notifications_admin.validation.form.appointmentCount.type" satisfies ScheduledNotificationsAdminAllKeys,
  },
);

export const scheduledNotificationAppointmentCountSchema = z.object({
  type: scheduledNotificationAppointmentCountTypeEnum,
  count: z.coerce
    .number<number>({
      error:
        "app_scheduled-notifications_admin.validation.form.appointmentCount.min" satisfies ScheduledNotificationsAdminAllKeys,
    })
    .int("validation.common.number.integer" satisfies AllKeys)
    .min(
      1,
      "app_scheduled-notifications_admin.validation.form.appointmentCount.min" satisfies ScheduledNotificationsAdminAllKeys,
    )
    .optional(),
});

export const scheduledNotificationGeneralSchema = z.object({
  name: z
    .string()
    .min(
      2,
      "app_scheduled-notifications_admin.validation.form.name.min" satisfies ScheduledNotificationsAdminAllKeys,
    ),

  // Optional setting to send scheduled notification after specific number of customer appointments
  appointmentCount: scheduledNotificationAppointmentCountSchema,
});

export const scheduledNotificationSchema = z
  .intersection(
    z.intersection(
      scheduledNotificationGeneralSchema,
      scheduledNotificationTypeSchema,
    ),
    scheduledNotificationChannelSchema,
  )
  .superRefine((arg, ctx) => {
    if (arg.type === "atTimeBefore" && !arg.weeks && !arg.days) {
      ctx.addIssue({
        code: "custom",
        path: ["days"],
        message:
          "app_scheduled-notifications_admin.validation.form.atTimeBefore.days.min" satisfies ScheduledNotificationsAdminAllKeys,
      });
    } else if (arg.type === "atTimeAfter" && !arg.weeks && !arg.days) {
      ctx.addIssue({
        code: "custom",
        path: ["days"],
        message:
          "app_scheduled-notifications_admin.validation.form.atTimeAfter.days.min" satisfies ScheduledNotificationsAdminAllKeys,
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
          "app_scheduled-notifications_admin.validation.form.atTimeBefore.minutes.min" satisfies ScheduledNotificationsAdminAllKeys,
      });
    } else if (
      arg.type === "timeAfter" &&
      !arg.weeks &&
      !arg.days &&
      !arg.hours &&
      !arg.minutes
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minutes"],
        message:
          "app_scheduled-notifications_admin.validation.form.atTimeAfter.minutes.min" satisfies ScheduledNotificationsAdminAllKeys,
      });
    }

    if (arg.appointmentCount.type !== "none" && !arg.appointmentCount.count) {
      ctx.addIssue({
        code: "custom",
        path: ["appointmentCount.count"],
        message:
          "app_scheduled-notifications_admin.validation.form.appointmentCount.min" satisfies ScheduledNotificationsAdminAllKeys,
      });
    }
  });

export const getScheduledNotificationSchemaWithUniqueCheck = (
  uniqueNameCheckFn: (name: string) => Promise<boolean>,
  message: string,
) => {
  return scheduledNotificationSchema.superRefine(async (args, ctx) => {
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

export const scheduledNotificationsSchema = z
  .array(scheduledNotificationSchema)
  .optional();

export type TimeBeforeAfterScheduledNotification = z.infer<
  typeof scheduledNotificationTimeBeforeAfterSchema
>;
export type AtTimeScheduledNotification = z.infer<
  typeof scheduledNotificationAtTimeSchema
>;

export type EmailChannelScheduledNotification = z.infer<
  typeof scheduledNotificationEmailSchema
>;
export type TextMessageChannelScheduledNotification = z.infer<
  typeof scheduledNotificationTextMessageSchema
>;

export type ScheduledNotificationUpdateModel = z.infer<
  typeof scheduledNotificationSchema
>;

export type ScheduledNotification =
  WithDatabaseId<ScheduledNotificationUpdateModel> & {
    appId: string;
    updatedAt: Date;
  };

export type GetScheduledNotificationsAction = {
  query: Query & {
    channel?: CommunicationChannel[];
    type?: ScheduledNotificationType[];
  };
};

export const GetScheduledNotificationsActionType =
  "get-scheduled-notifications" as const;

export type GetScheduledNotificationAction = {
  id: string;
};

export const GetScheduledNotificationActionType =
  "get-scheduled-notification" as const;

export type DeleteScheduledNotificationsAction = {
  ids: string[];
};

export const DeleteScheduledNotificationsActionType =
  "delete-scheduled-notifications" as const;

export type CreateNewScheduledNotificationAction = {
  scheduledNotification: ScheduledNotificationUpdateModel;
};

export const CreateNewScheduledNotificationActionType =
  "create-scheduled-notification" as const;

export type UpdateScheduledNotificationAction = {
  id: string;
  update: ScheduledNotificationUpdateModel;
};

export const UpdateScheduledNotificationActionType =
  "update-scheduled-notification" as const;

export type CheckUniqueScheduledNotificationNameAction = {
  id?: string;
  name: string;
};

export const CheckUniqueScheduledNotificationNameActionType =
  "check-unique-name" as const;

export const scheduledNotificationsAppDataSchema = z.object({});

export type ScheduledNotificationsAppData = z.infer<
  typeof scheduledNotificationsAppDataSchema
>;

export type GetAppDataAction = {};

export const GetAppDataActionType = "get-app-data" as const;

export type SetAppDataAction = {
  data: ScheduledNotificationsAppData;
};

export const SetAppDataActionType = "set-app-data" as const;

export type RequestAction =
  | ({
      type: typeof GetScheduledNotificationsActionType;
    } & GetScheduledNotificationsAction)
  | ({
      type: typeof GetScheduledNotificationActionType;
    } & GetScheduledNotificationAction)
  | ({
      type: typeof DeleteScheduledNotificationsActionType;
    } & DeleteScheduledNotificationsAction)
  | ({
      type: typeof CreateNewScheduledNotificationActionType;
    } & CreateNewScheduledNotificationAction)
  | ({
      type: typeof UpdateScheduledNotificationActionType;
    } & UpdateScheduledNotificationAction)
  | ({
      type: typeof CheckUniqueScheduledNotificationNameActionType;
    } & CheckUniqueScheduledNotificationNameAction)
  | ({
      type: typeof GetAppDataActionType;
    } & GetAppDataAction)
  | ({
      type: typeof SetAppDataActionType;
    } & SetAppDataAction);

export type ScheduledNotificationsJobPayload =
  | {
      type: "send-scheduled-notification";
      scheduledNotificationId: string;
      appointmentId: string;
    }
  | {
      type: "update-scheduled-notification";
      scheduledNotificationId: string;
    }
  | {
      type: "update-appointment";
      appointmentId: string;
    }
  | {
      type: "delete-scheduled-notification";
      scheduledNotificationId: string;
    }
  | {
      type: "delete-scheduled-notifications";
      scheduledNotificationIds: string[];
    };

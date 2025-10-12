import { AllKeys } from "@vivid/i18n";
import {
  asOptinalNumberField,
  CommunicationChannel,
  communicationChannels,
  Query,
  WithDatabaseId,
} from "@vivid/types";
import { z } from "zod";
import { FollowUpsAdminAllKeys } from "./translations/types";

export const timeAfterFollowUpType = "timeAfter" as const;
export const atTimeFollowUpType = "atTime" as const;
export const followUpTypes = [
  timeAfterFollowUpType,
  atTimeFollowUpType,
] as const;

export type FollowUpType = (typeof followUpTypes)[number];

export const followUpTypesEnum = z.enum(followUpTypes);
export const followUpChannelsEnum = z.enum(communicationChannels);

export const followUpTimeAfterSchema = z.object({
  type: followUpTypesEnum.extract(["timeAfter"]),
  weeks: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_follow-ups_admin.validation.form.weeks.min" satisfies FollowUpsAdminAllKeys,
      )
      .max(
        10,
        "app_follow-ups_admin.validation.form.weeks.max" satisfies FollowUpsAdminAllKeys,
      ),
  ),
  days: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_follow-ups_admin.validation.form.days.min" satisfies FollowUpsAdminAllKeys,
      )
      .max(
        31,
        "app_follow-ups_admin.validation.form.days.max" satisfies FollowUpsAdminAllKeys,
      ),
  ),
  hours: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_follow-ups_admin.validation.form.hours.min" satisfies FollowUpsAdminAllKeys,
      )
      .max(
        24 * 5,
        "app_follow-ups_admin.validation.form.hours.max" satisfies FollowUpsAdminAllKeys,
      ),
  ),
  minutes: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_follow-ups_admin.validation.form.minutes.min" satisfies FollowUpsAdminAllKeys,
      )
      .max(
        60 * 10,
        "app_follow-ups_admin.validation.form.minutes.max" satisfies FollowUpsAdminAllKeys,
      ),
  ),
});

export const followUpAtTimeSchema = z.object({
  type: followUpTypesEnum.extract(["atTime"]),
  weeks: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_follow-ups_admin.validation.form.weeks.min" satisfies FollowUpsAdminAllKeys,
      )
      .max(
        10,
        "app_follow-ups_admin.validation.form.weeks.max" satisfies FollowUpsAdminAllKeys,
      ),
  ),
  days: z.coerce
    .number()
    .int("validation.common.number.integer" satisfies AllKeys)
    .min(
      0,
      "app_follow-ups_admin.validation.form.days.min" satisfies FollowUpsAdminAllKeys,
    )
    .max(
      31,
      "app_follow-ups_admin.validation.form.days.max" satisfies FollowUpsAdminAllKeys,
    ),
  time: z.object({
    hour: z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_follow-ups_admin.validation.form.time.hour.min" satisfies FollowUpsAdminAllKeys,
      )
      .max(
        23,
        "app_follow-ups_admin.validation.form.time.hour.max" satisfies FollowUpsAdminAllKeys,
      ),
    minute: z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        0,
        "app_follow-ups_admin.validation.form.time.minute.min" satisfies FollowUpsAdminAllKeys,
      )
      .max(
        59,
        "app_follow-ups_admin.validation.form.time.minute.max" satisfies FollowUpsAdminAllKeys,
      ),
  }),
});

export const baseFollowUpChannelSchema = z.object({
  templateId: z
    .string({
      message:
        "app_follow-ups_admin.validation.form.templateId.required" satisfies FollowUpsAdminAllKeys,
    })
    .min(
      1,
      "app_follow-ups_admin.validation.form.templateId.required" satisfies FollowUpsAdminAllKeys,
    ),
});

export const followUpEmailSchema = z
  .object({
    channel: followUpChannelsEnum.extract(["email"]),
    subject: z
      .string()
      .min(
        1,
        "app_follow-ups_admin.validation.form.subject.required" satisfies FollowUpsAdminAllKeys,
      ),
  })
  .merge(baseFollowUpChannelSchema);

export const followUpTextMessageSchema = z
  .object({
    channel: followUpChannelsEnum.extract(["text-message"]),
  })
  .merge(baseFollowUpChannelSchema);

export const followUpTypeSchema = z.discriminatedUnion("type", [
  followUpTimeAfterSchema,
  followUpAtTimeSchema,
]);

export const followUpChannelSchema = z.discriminatedUnion("channel", [
  followUpEmailSchema,
  followUpTextMessageSchema,
]);

export const followUpGeneralSchema = z.object({
  name: z
    .string()
    .min(
      2,
      "app_follow-ups_admin.validation.form.name.min" satisfies FollowUpsAdminAllKeys,
    ),
  // Optional setting to send follow-up after specific number of customer appointments
  afterAppointmentCount: asOptinalNumberField(
    z.coerce
      .number()
      .int("validation.common.number.integer" satisfies AllKeys)
      .min(
        1,
        "app_follow-ups_admin.validation.form.afterAppointmentCount.min" satisfies FollowUpsAdminAllKeys,
      )
      .max(
        100,
        "app_follow-ups_admin.validation.form.afterAppointmentCount.max" satisfies FollowUpsAdminAllKeys,
      ),
  ),
});

export const followUpSchema = z
  .intersection(
    z.intersection(followUpGeneralSchema, followUpTypeSchema),
    followUpChannelSchema,
  )
  .superRefine((arg, ctx) => {
    if (arg.type === "atTime" && !arg.weeks && !arg.days) {
      ctx.addIssue({
        code: "custom",
        path: ["days"],
        message:
          "app_follow-ups_admin.validation.form.atTime.days.min" satisfies FollowUpsAdminAllKeys,
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
          "app_follow-ups_admin.validation.form.atTime.minutes.min" satisfies FollowUpsAdminAllKeys,
      });
    }
  });

export const getFollowUpSchemaWithUniqueCheck = (
  uniqueNameCheckFn: (name: string) => Promise<boolean>,
  message: string,
) => {
  return followUpSchema.superRefine(async (args, ctx) => {
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

export const followUpsSchema = z.array(followUpSchema).optional();

export type TimeAfterFollowUp = z.infer<typeof followUpTimeAfterSchema>;
export type AtTimeFollowUp = z.infer<typeof followUpAtTimeSchema>;

export type EmailChannelFollowUp = z.infer<typeof followUpEmailSchema>;
export type TextMessageChannelFollowUp = z.infer<
  typeof followUpTextMessageSchema
>;

export type FollowUpUpdateModel = z.infer<typeof followUpSchema>;

export type FollowUp = WithDatabaseId<FollowUpUpdateModel> & {
  appId: string;
  updatedAt: Date;
};

export type GetFollowUpsAction = {
  query: Query & {
    channel?: CommunicationChannel[];
  };
};

export const GetFollowUpsActionType = "get-follow-ups" as const;

export type GetFollowUpAction = {
  id: string;
};

export const GetFollowUpActionType = "get-follow-up" as const;

export type DeleteFollowUpsAction = {
  ids: string[];
};

export const DeleteFollowUpsActionType = "delete-follow-ups" as const;

export type CreateNewFollowUpAction = {
  followUp: FollowUpUpdateModel;
};

export const CreateNewFollowUpActionType = "create-follow-up" as const;

export type UpdateFollowUpAction = {
  id: string;
  update: FollowUpUpdateModel;
};

export const UpdateFollowUpActionType = "update-follow-up" as const;

export type CheckUniqueFollowUpNameAction = {
  id?: string;
  name: string;
};

export const CheckUniqueFollowUpNameActionType =
  "check-unique-follow-up-name" as const;

export const followUpsAppDataSchema = z.object({});

export type FollowUpsAppData = z.infer<typeof followUpsAppDataSchema>;

export type GetAppDataAction = {};

export const GetAppDataActionType = "get-app-data" as const;

export type SetAppDataAction = {
  data: FollowUpsAppData;
};

export const SetAppDataActionType = "set-app-data" as const;

export type RequestAction =
  | ({
      type: typeof GetFollowUpsActionType;
    } & GetFollowUpsAction)
  | ({
      type: typeof GetFollowUpActionType;
    } & GetFollowUpAction)
  | ({
      type: typeof DeleteFollowUpsActionType;
    } & DeleteFollowUpsAction)
  | ({
      type: typeof CreateNewFollowUpActionType;
    } & CreateNewFollowUpAction)
  | ({
      type: typeof UpdateFollowUpActionType;
    } & UpdateFollowUpAction)
  | ({
      type: typeof CheckUniqueFollowUpNameActionType;
    } & CheckUniqueFollowUpNameAction)
  | ({
      type: typeof GetAppDataActionType;
    } & GetAppDataAction)
  | ({
      type: typeof SetAppDataActionType;
    } & SetAppDataAction);

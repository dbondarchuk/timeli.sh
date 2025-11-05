import * as z from "zod";
import { zNonEmptyString } from "../../utils";

export const defaultAppsConfigurationSchema = z.object({
  email: z.object({
    appId: zNonEmptyString("configuration.apps.email.required"),
    data: z.any().optional(),
  }),
  textMessage: z
    .object({
      appId: z.string().optional(),
      data: z.any().optional(),
    })
    .optional(),
});

export type DefaultAppsConfiguration = z.infer<
  typeof defaultAppsConfigurationSchema
>;

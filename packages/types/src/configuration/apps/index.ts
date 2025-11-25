import * as z from "zod";

export const defaultAppsConfigurationSchema = z.object({
  email: z
    .object({
      appId: z.string().optional(),
      data: z.any().optional(),
    })
    .optional(),
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

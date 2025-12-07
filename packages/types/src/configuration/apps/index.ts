import * as z from "zod";

export const defaultAppsConfigurationSchema = z.object({
  emailSender: z
    .object({
      appId: z.string().optional(),
      data: z.any().optional(),
    })
    .optional(),
  textMessageSender: z
    .object({
      appId: z.string().optional(),
      data: z.any().optional(),
    })
    .optional(),
  textMessageResponder: z
    .object({
      appId: z.string().optional(),
      data: z.any().optional(),
    })
    .optional(),
});

export type DefaultAppsConfiguration = z.infer<
  typeof defaultAppsConfigurationSchema
>;

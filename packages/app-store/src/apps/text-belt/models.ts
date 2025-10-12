import { z } from "zod";
import { TextBeltAdminAllKeys } from "./translations/types";

export const textBeltConfigurationSchema = z.object({
  apiKey: z
    .string()
    .min(
      1,
      "app_text-belt_admin.validation.apiKey.required" satisfies TextBeltAdminAllKeys,
    ),
  textMessageResponderAppId: z.string().optional(),
});

export type TextBeltConfiguration = z.infer<typeof textBeltConfigurationSchema>;

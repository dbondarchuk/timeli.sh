import { zNonEmptyString } from "@vivid/types";
import * as z from "zod";
import { TextBeltAdminAllKeys } from "./translations/types";

export const textBeltConfigurationSchema = z.object({
  apiKey: zNonEmptyString(
    "app_text-belt_admin.validation.apiKey.required" satisfies TextBeltAdminAllKeys,
  ),
  textMessageResponderAppId: z.string().optional(),
});

export type TextBeltConfiguration = z.infer<typeof textBeltConfigurationSchema>;

import { zNonEmptyString } from "@vivid/types";
import * as z from "zod";
import { TextMessageAutoReplyAdminAllKeys } from "./translations/types";

export const textMessageAutoReplyConfigurationSchema = z.object({
  autoReplyTemplateId: zNonEmptyString(
    "app_text-message-auto-reply_admin.validation.autoReplyTemplateId.required" satisfies TextMessageAutoReplyAdminAllKeys,
  ),
});

export type TextMessageAutoReplyConfiguration = z.infer<
  typeof textMessageAutoReplyConfigurationSchema
>;

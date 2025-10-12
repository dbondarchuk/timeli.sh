import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { TEXT_MESSAGE_AUTO_REPLY_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type TextMessageAutoReplyAdminKeys = Leaves<typeof admin>;
export const textMessageAutoReplyAdminNamespace =
  `app_${TEXT_MESSAGE_AUTO_REPLY_APP_NAME}_admin` as const;

export type TextMessageAutoReplyAdminNamespace =
  typeof textMessageAutoReplyAdminNamespace;

export type TextMessageAutoReplyAdminAllKeys = AllKeys<
  TextMessageAutoReplyAdminNamespace,
  TextMessageAutoReplyAdminKeys
>;

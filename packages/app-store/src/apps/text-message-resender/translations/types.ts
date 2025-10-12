import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { TEXT_MESSAGE_RESENDER_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type TextMessageResenderAdminKeys = Leaves<typeof admin>;
export const textMessageResenderAdminNamespace =
  `app_${TEXT_MESSAGE_RESENDER_APP_NAME}_admin` as const;

export type TextMessageResenderAdminNamespace =
  typeof textMessageResenderAdminNamespace;

export type TextMessageResenderAdminAllKeys = AllKeys<
  TextMessageResenderAdminNamespace,
  TextMessageResenderAdminKeys
>;

import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { REMINDERS_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type RemindersAdminKeys = Leaves<typeof adminKeys>;
export const remindersAdminNamespace =
  `app_${REMINDERS_APP_NAME}_admin` as const;

export type RemindersAdminNamespace = typeof remindersAdminNamespace;
export type RemindersAdminAllKeys = AllKeys<
  RemindersAdminNamespace,
  RemindersAdminKeys
>;

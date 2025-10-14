import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { SMART_SCHEDULE_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type SmartScheduleAdminKeys = Leaves<typeof admin>;
export const smartScheduleAdminNamespace =
  `app_${SMART_SCHEDULE_APP_NAME}_admin` as const;

export type SmartScheduleAdminNamespace = typeof smartScheduleAdminNamespace;

export type SmartScheduleAdminAllKeys = AllKeys<
  SmartScheduleAdminNamespace,
  SmartScheduleAdminKeys
>;

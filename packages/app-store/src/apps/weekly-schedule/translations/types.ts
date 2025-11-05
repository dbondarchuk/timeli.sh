import { AllKeys } from "@timelish/i18n";
import { Leaves } from "@timelish/types";
import { WEEKLY_SCHEDULE_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type WeeklyScheduleAdminKeys = Leaves<typeof admin>;
export const weeklyScheduleAdminNamespace =
  `app_${WEEKLY_SCHEDULE_APP_NAME}_admin` as const;

export type WeeklyScheduleAdminNamespace = typeof weeklyScheduleAdminNamespace;

export type WeeklyScheduleAdminAllKeys = AllKeys<
  WeeklyScheduleAdminNamespace,
  WeeklyScheduleAdminKeys
>;

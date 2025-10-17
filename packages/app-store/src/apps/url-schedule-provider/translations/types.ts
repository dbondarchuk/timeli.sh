import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { URL_SCHEDULE_PROVIDER_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type UrlScheduleProviderAdminKeys = Leaves<typeof admin>;
export const urlScheduleProviderAdminNamespace =
  `app_${URL_SCHEDULE_PROVIDER_APP_NAME}_admin` as const;

export type UrlScheduleProviderAdminNamespace =
  typeof urlScheduleProviderAdminNamespace;

export type UrlScheduleProviderAdminAllKeys = AllKeys<
  UrlScheduleProviderAdminNamespace,
  UrlScheduleProviderAdminKeys
>;

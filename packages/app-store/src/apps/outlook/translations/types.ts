import { AllKeys } from "@timelish/i18n";
import { Leaves } from "@timelish/types";
import { OUTLOOK_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type OutlookAdminKeys = Leaves<typeof admin>;
export const outlookAdminNamespace = `app_${OUTLOOK_APP_NAME}_admin` as const;

export type OutlookAdminNamespace = typeof outlookAdminNamespace;

export type OutlookAdminAllKeys = AllKeys<
  OutlookAdminNamespace,
  OutlookAdminKeys
>;

import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { LOG_CLEANUP_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type LogCleanupAdminKeys = Leaves<typeof admin>;
export const logCleanupAdminNamespace =
  `app_${LOG_CLEANUP_APP_NAME}_admin` as const;

export type LogCleanupAdminNamespace = typeof logCleanupAdminNamespace;

export type LogCleanupAdminAllKeys = AllKeys<
  LogCleanupAdminNamespace,
  LogCleanupAdminKeys
>;

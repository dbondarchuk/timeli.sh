import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { FOLLOW_UPS_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type FollowUpsAdminKeys = Leaves<typeof adminKeys>;
export const followUpsAdminNamespace =
  `app_${FOLLOW_UPS_APP_NAME}_admin` as const;

export type FollowUpsAdminNamespace = typeof followUpsAdminNamespace;
export type FollowUpsAdminAllKeys = AllKeys<
  FollowUpsAdminNamespace,
  FollowUpsAdminKeys
>;

import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import type adminKeys from "./en/admin.json";
import type publicKeys from "./en/public.json";

export type WaitlistAdminKeys = Leaves<typeof adminKeys>;
export const waitlistAdminNamespace = "app_waitlist_admin" as const;

export type WaitlistAdminNamespace = typeof waitlistAdminNamespace;

export type WaitlistPublicKeys = Leaves<typeof publicKeys>;
export const waitlistPublicNamespace = "app_waitlist_public" as const;

export type WaitlistPublicNamespace = typeof waitlistPublicNamespace;

export type WaitlistAdminAllKeys = AllKeys<
  WaitlistAdminNamespace,
  WaitlistAdminKeys
>;

export type WaitlistPublicAllKeys = AllKeys<
  WaitlistPublicNamespace,
  WaitlistPublicKeys
>;

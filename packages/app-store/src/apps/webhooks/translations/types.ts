import { AllKeys } from "@timelish/i18n";
import { Leaves } from "@timelish/types";
import { WEBHOOKS_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type WebhooksAdminKeys = Leaves<typeof adminKeys>;
export const webhooksAdminNamespace = `app_${WEBHOOKS_APP_NAME}_admin` as const;

export type WebhooksAdminNamespace = typeof webhooksAdminNamespace;

export type WebhooksAdminAllKeys = AllKeys<
  WebhooksAdminNamespace,
  WebhooksAdminKeys
>;

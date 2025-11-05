import { AllKeys } from "@timelish/i18n";
import { Leaves } from "@timelish/types";
import { URL_BUSY_EVENTS_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type UrlBusyEventsAdminKeys = Leaves<typeof admin>;
export const urlBusyEventsAdminNamespace =
  `app_${URL_BUSY_EVENTS_APP_NAME}_admin` as const;

export type UrlBusyEventsAdminNamespace = typeof urlBusyEventsAdminNamespace;

export type UrlBusyEventsAdminAllKeys = AllKeys<
  UrlBusyEventsAdminNamespace,
  UrlBusyEventsAdminKeys
>;

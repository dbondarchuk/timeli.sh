import { Leaves } from "@vivid/types";
import { BUSY_EVENTS_APP_NAME } from "../const";
import type adminKeys from "./en/admin.json";

export type BusyEventsAdminKeys = Leaves<typeof adminKeys>;
export const busyEventsAdminNamespace =
  `app_${BUSY_EVENTS_APP_NAME}_admin` as const;

export type BusyEventsAdminNamespace = typeof busyEventsAdminNamespace;

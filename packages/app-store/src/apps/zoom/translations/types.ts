import { AllKeys } from "@vivid/i18n";
import { Leaves } from "@vivid/types";
import { ZOOM_APP_NAME } from "../const";
import type admin from "./en/admin.json";

export type ZoomAdminKeys = Leaves<typeof admin>;
export const zoomAdminNamespace = `app_${ZOOM_APP_NAME}_admin` as const;

export type ZoomAdminNamespace = typeof zoomAdminNamespace;

export type ZoomAdminAllKeys = AllKeys<ZoomAdminNamespace, ZoomAdminKeys>;

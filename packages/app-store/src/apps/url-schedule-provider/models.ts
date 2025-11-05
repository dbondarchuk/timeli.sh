import { zNonEmptyString, zUniqueArray } from "@vivid/types";
import * as z from "zod";
import { UrlScheduleProviderAdminAllKeys } from "./translations/types";

export const urlScheduleProviderConfigurationSchema = z.object({
  url: z
    .url(
      "app_url-schedule-provider_admin.validation.form.url.url" satisfies UrlScheduleProviderAdminAllKeys,
    )
    .min(
      1,
      "app_url-schedule-provider_admin.validation.form.url.required" satisfies UrlScheduleProviderAdminAllKeys,
    ),
  headers: zUniqueArray(
    z.array(
      z.object({
        key: zNonEmptyString(
          "app_url-schedule-provider_admin.validation.form.headers.key.required" satisfies UrlScheduleProviderAdminAllKeys,
        ),
        value: zNonEmptyString(
          "app_url-schedule-provider_admin.validation.form.headers.value.required" satisfies UrlScheduleProviderAdminAllKeys,
        ),
      }),
    ),
    (header) => header.key,
    "app_url-schedule-provider_admin.validation.form.headers.key.unique" satisfies UrlScheduleProviderAdminAllKeys,
  ).optional(),
});

export type UrlScheduleProviderConfiguration = z.infer<
  typeof urlScheduleProviderConfigurationSchema
>;

import { zUniqueArray } from "@vivid/types";
import { z } from "zod";
import { UrlScheduleProviderAdminAllKeys } from "./translations/types";

export const urlScheduleProviderConfigurationSchema = z.object({
  url: z
    .string()
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
        key: z
          .string()
          .min(
            1,
            "app_url-schedule-provider_admin.validation.form.headers.key.required" satisfies UrlScheduleProviderAdminAllKeys,
          ),
        value: z
          .string()
          .min(
            1,
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

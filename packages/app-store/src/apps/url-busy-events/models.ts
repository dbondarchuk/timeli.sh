import { zNonEmptyString, zUniqueArray } from "@vivid/types";
import * as z from "zod";
import { UrlBusyEventsAdminAllKeys } from "./translations/types";

export const urlBusyEventsConfigurationSchema = z.object({
  url: z
    .url(
      "app_url-busy-events_admin.validation.form.url.url" satisfies UrlBusyEventsAdminAllKeys,
    )
    .min(
      1,
      "app_url-busy-events_admin.validation.form.url.required" satisfies UrlBusyEventsAdminAllKeys,
    ),
  headers: zUniqueArray(
    z.array(
      z.object({
        key: zNonEmptyString(
          "app_url-busy-events_admin.validation.form.headers.key.required" satisfies UrlBusyEventsAdminAllKeys,
        ),
        value: zNonEmptyString(
          "app_url-busy-events_admin.validation.form.headers.value.required" satisfies UrlBusyEventsAdminAllKeys,
        ),
      }),
    ),
    (header) => header.key,
    "app_url-busy-events_admin.validation.form.headers.key.unique" satisfies UrlBusyEventsAdminAllKeys,
  ).optional(),
});

export type UrlBusyEventsConfiguration = z.infer<
  typeof urlBusyEventsConfigurationSchema
>;

import * as z from "zod";
import { WebhooksAdminAllKeys } from "./translations/types";

/** Discriminator for webhooks `processStaticRequest` to list aggregated event type strings (see `webhooks/selectable-event-types`). */
export const LIST_SELECTABLE_EVENT_TYPES_REQUEST_TYPE =
  "listSelectableEventTypes" as const;

export type WebhookEventType = string;

export const webhooksConfigurationSchema = z.object({
  url: z
    .url(
      "app_webhooks_admin.validation.url.invalid" satisfies WebhooksAdminAllKeys,
    )
    .max(
      2048,
      "app_webhooks_admin.validation.url.max" satisfies WebhooksAdminAllKeys,
    ),
  secret: z
    .string()
    .max(
      256,
      "app_webhooks_admin.validation.secret.max" satisfies WebhooksAdminAllKeys,
    )
    .optional(),
  eventTypes: z
    .array(z.string().min(1))
    .min(
      1,
      "app_webhooks_admin.validation.eventTypes.required" satisfies WebhooksAdminAllKeys,
    ),
});

export type WebhooksConfiguration = z.infer<typeof webhooksConfigurationSchema>;

export const MASKED_SECRET = "********";

import * as z from "zod";
import { WebhooksAdminAllKeys } from "./translations/types";

export const webhookEventTypes = [
  "appointment.created",
  "appointment.status_changed",
  "appointment.rescheduled",
  "customer.created",
  "customer.updated",
  "customers.deleted",
  "payment.created",
  "payment.updated",
  "payment.deleted",
  "payment.refunded",
  "waitlist-entry.created",
  "waitlist-entries.dismissed",
  "form-response.created",
] as const;

export type WebhookEventType = (typeof webhookEventTypes)[number];

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
    .array(z.enum(webhookEventTypes))
    .min(
      1,
      "app_webhooks_admin.validation.eventTypes.required" satisfies WebhooksAdminAllKeys,
    ),
});

export type WebhooksConfiguration = z.infer<typeof webhooksConfigurationSchema>;

export const MASKED_SECRET = "********";

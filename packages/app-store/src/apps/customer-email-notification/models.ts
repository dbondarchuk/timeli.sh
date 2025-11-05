import { appointmentStatuses } from "@timelish/types";
import * as z from "zod";

export const eventConfigurationSchema = z.object({
  summary: z
    .string({
      message:
        "app_customer-email-notification_admin.validation.eventTemplate.summary.required",
    })
    .min(
      1,
      "app_customer-email-notification_admin.validation.eventTemplate.summary.required",
    ),
  templateId: z
    .string({
      message:
        "app_customer-email-notification_admin.validation.eventTemplate.templateId.required",
    })
    .min(
      1,
      "app_customer-email-notification_admin.validation.eventTemplate.templateId.required",
    ),
});

export type EventConfiguration = z.infer<typeof eventConfigurationSchema>;

const emailTemplateSchema = z.object({
  subject: z
    .string({
      message:
        "app_customer-email-notification_admin.validation.emailTemplate.subject.required",
    })
    .min(
      1,
      "app_customer-email-notification_admin.validation.emailTemplate.subject.required",
    ),
  templateId: z
    .string({
      message:
        "app_customer-email-notification_admin.validation.emailTemplate.templateId.required",
    })
    .min(
      1,
      "app_customer-email-notification_admin.validation.emailTemplate.templateId.required",
    ),
});

export type EmailTemplateConfiguration = z.infer<typeof emailTemplateSchema>;

export const emailTemplateKeys = z.enum([
  ...appointmentStatuses,
  "rescheduled",
]);

export type EmailTemplateKeys = z.infer<typeof emailTemplateKeys>;

export const emailTemplatesSchema = z.record(
  emailTemplateKeys,
  emailTemplateSchema,
);

export type EmailTemplates = z.infer<typeof emailTemplatesSchema>;

export const customerEmailNotificationConfigurationSchema = z.object({
  templates: emailTemplatesSchema,
  event: eventConfigurationSchema,
});

export type CustomerEmailNotificationConfiguration = z.infer<
  typeof customerEmailNotificationConfigurationSchema
>;

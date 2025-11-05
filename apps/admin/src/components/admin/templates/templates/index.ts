import { CommunicationChannel } from "@timelish/types";
import { appointmentConfirmedEmailTemplate } from "./email/appointment-confirmed";
import { appointmentCreatedEmailTemplate } from "./email/appointment-created";
import { appointmentDeclinedEmailTemplate } from "./email/appointment-declined";
import { appointmentRescheduledEmailTemplate } from "./email/appointment-rescheduled";
import { appointmentReminderEmailTemplate } from "./email/reminder";
import { waitlistEntryCreatedEmailTemplate } from "./email/waitlist-entry-created";
import { appointmentConfirmedTextMessageTemplate } from "./text-message/appointment-confirmed";
import { appointmentCreatedTextMessageTemplate } from "./text-message/appointment-created";
import { appointmentDeclinedTextMessageTemplate } from "./text-message/appointment-declined";
import { appointmentRescheduledTextMessageTemplate } from "./text-message/appointment-rescheduled";
import { autoReplyTextMessageTemplate } from "./text-message/auto-reply";
import { appointmentReminderTextMessageTemplate } from "./text-message/reminder";
import { TemplatesTemplate } from "./type";

export const TemplateTemplates: Record<
  CommunicationChannel,
  Record<string, TemplatesTemplate>
> = {
  email: {
    "appointment-created": appointmentCreatedEmailTemplate,
    "appointment-declined": appointmentDeclinedEmailTemplate,
    "appointment-confirmed": appointmentConfirmedEmailTemplate,
    "appointment-rescheduled": appointmentRescheduledEmailTemplate,
    reminder: appointmentReminderEmailTemplate,
    "waitlist-entry-created": waitlistEntryCreatedEmailTemplate,
  },
  "text-message": {
    "appointment-created": appointmentCreatedTextMessageTemplate,
    "appointment-declined": appointmentDeclinedTextMessageTemplate,
    "appointment-confirmed": appointmentConfirmedTextMessageTemplate,
    "appointment-rescheduled": appointmentRescheduledTextMessageTemplate,
    reminder: appointmentReminderTextMessageTemplate,
    "auto-reply": autoReplyTextMessageTemplate,
  },
};

import { CommunicationChannel } from "@vivid/types";
import { ReminderType } from "./models";
import { RemindersAdminKeys } from "./translations/types";

export const REMINDERS_APP_NAME = "reminders";

export const reminderChannelLabels: Record<
  CommunicationChannel,
  RemindersAdminKeys
> = {
  email: "channels.email",
  "text-message": "channels.text-message",
};

export const reminderTypeLabels: Record<ReminderType, RemindersAdminKeys> = {
  timeBefore: "triggers.timeBefore",
  atTime: "triggers.atTime",
};

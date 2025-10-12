import { AppMenuItem } from "@vivid/types";
import { BUSY_EVENTS_APP_NAME } from "./apps/busy-events/const";
import { BusyEventsMenuItems } from "./apps/busy-events/menu-items";
import { CUSTOMER_EMAIL_NOTIFICATION_APP_NAME } from "./apps/customer-email-notification/const";
import { CustomerEmailNotificationMenuItems } from "./apps/customer-email-notification/menu-items";
import { CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./apps/customer-text-message-notification/const";
import { CustomerTextMessageNotificationMenuItems } from "./apps/customer-text-message-notification/menu-items";
import { FOLLOW_UPS_APP_NAME } from "./apps/followups/const";
import { FollowUpsMenuItems } from "./apps/followups/menu-items";
import { REMINDERS_APP_NAME } from "./apps/reminders/const";
import { remindersMenuItems as RemindersMenuItems } from "./apps/reminders/menu-items";
import { SMTP_APP_NAME } from "./apps/smtp/const";
import { SmtpMenuItems } from "./apps/smtp/menu-items";
import { WAITLIST_APP_NAME } from "./apps/waitlist/const";
import { WaitlistMenuItems } from "./apps/waitlist/menu-items";
import { WEEKLY_SCHEDULE_APP_NAME } from "./apps/weekly-schedule/const";
import { WeeklyScheduleMenuItems } from "./apps/weekly-schedule/menu-items";

export const AppMenuItems: Record<string, AppMenuItem[]> = {
  [BUSY_EVENTS_APP_NAME]: BusyEventsMenuItems,
  [CUSTOMER_EMAIL_NOTIFICATION_APP_NAME]: CustomerEmailNotificationMenuItems,
  [CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME]:
    CustomerTextMessageNotificationMenuItems,
  [FOLLOW_UPS_APP_NAME]: FollowUpsMenuItems,
  [REMINDERS_APP_NAME]: RemindersMenuItems,
  [WAITLIST_APP_NAME]: WaitlistMenuItems,
  [SMTP_APP_NAME]: SmtpMenuItems,
  [WEEKLY_SCHEDULE_APP_NAME]: WeeklyScheduleMenuItems,
};

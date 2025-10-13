import { App } from "@vivid/types";
import { BusyEventsApp } from "./apps/busy-events/app";
import { BUSY_EVENTS_APP_NAME } from "./apps/busy-events/const";
import { CaldavApp } from "./apps/caldav/app";
import { CALDAV_APP_NAME } from "./apps/caldav/const";
import { CalendarWriterApp } from "./apps/calendar-writer/app";
import { CALENDAR_WRITER_APP_NAME } from "./apps/calendar-writer/const";
import { CustomerEmailNotificationApp } from "./apps/customer-email-notification/app";
import { CUSTOMER_EMAIL_NOTIFICATION_APP_NAME } from "./apps/customer-email-notification/const";
import { CustomerTextMessageNotificationApp } from "./apps/customer-text-message-notification/app";
import { CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./apps/customer-text-message-notification/const";
import { EmailNotificationApp } from "./apps/email-notification/app";
import { EMAIL_NOTIFICATION_APP_NAME } from "./apps/email-notification/const";
import { FileSystemAssetsStorageApp } from "./apps/file-system-assets-storage/app";
import { FILE_SYSTEM_ASSETS_STORAGE_APP_NAME } from "./apps/file-system-assets-storage/const";
import { FinancialOverviewApp } from "./apps/financial-overview/app";
import { FINANCIAL_OVERVIEW_APP_NAME } from "./apps/financial-overview/const";
import { FollowUpsApp } from "./apps/followups/app";
import { FOLLOW_UPS_APP_NAME } from "./apps/followups/const";
import { GoogleCalendarApp } from "./apps/google-calendar/app";
import { GOOGLE_CALENDAR_APP_NAME } from "./apps/google-calendar/const";
import { IcsApp } from "./apps/ics/app";
import { ICS_APP_NAME } from "./apps/ics/const";
import { OutlookApp } from "./apps/outlook/app";
import { OUTLOOK_APP_NAME } from "./apps/outlook/const";
import { PaypalApp } from "./apps/paypal/app";
import { PAYPAL_APP_NAME } from "./apps/paypal/const";
import { RemindersApp } from "./apps/reminders/app";
import { REMINDERS_APP_NAME } from "./apps/reminders/const";
import { S3AssetsStorageApp } from "./apps/s3-assets-storage/app";
import { S3_ASSETS_STORAGE_APP_NAME } from "./apps/s3-assets-storage/const";
import { SmtpApp } from "./apps/smtp/app";
import { SMTP_APP_NAME } from "./apps/smtp/const";
import { TextBeltApp } from "./apps/text-belt/app";
import { TEXTBELT_APP_NAME } from "./apps/text-belt/const";
import { TextMessageAutoReplyApp } from "./apps/text-message-auto-reply/app";
import { TEXT_MESSAGE_AUTO_REPLY_APP_NAME } from "./apps/text-message-auto-reply/const";
import { TextMessageNotificationApp } from "./apps/text-message-notification/app";
import { TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./apps/text-message-notification/const";
import { TextMessageResenderApp } from "./apps/text-message-resender/app";
import { TEXT_MESSAGE_RESENDER_APP_NAME } from "./apps/text-message-resender/const";
import { WaitlistApp } from "./apps/waitlist/app";
import { WAITLIST_APP_NAME } from "./apps/waitlist/const";
import { webhooksApp } from "./apps/webhooks/app";
import { WEBHOOKS_APP_NAME } from "./apps/webhooks/const";
import { WeeklyScheduleApp } from "./apps/weekly-schedule/app";
import { WEEKLY_SCHEDULE_APP_NAME } from "./apps/weekly-schedule/const";

export const AvailableApps: Record<string, App> = {
  [OUTLOOK_APP_NAME]: OutlookApp,
  [GOOGLE_CALENDAR_APP_NAME]: GoogleCalendarApp,
  [ICS_APP_NAME]: IcsApp,
  [CALDAV_APP_NAME]: CaldavApp,
  [SMTP_APP_NAME]: SmtpApp,
  [WEEKLY_SCHEDULE_APP_NAME]: WeeklyScheduleApp,
  [BUSY_EVENTS_APP_NAME]: BusyEventsApp,
  [TEXTBELT_APP_NAME]: TextBeltApp,
  [CUSTOMER_EMAIL_NOTIFICATION_APP_NAME]: CustomerEmailNotificationApp,
  [EMAIL_NOTIFICATION_APP_NAME]: EmailNotificationApp,
  [CALENDAR_WRITER_APP_NAME]: CalendarWriterApp,
  [CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME]:
    CustomerTextMessageNotificationApp,
  [TEXT_MESSAGE_NOTIFICATION_APP_NAME]: TextMessageNotificationApp,
  [REMINDERS_APP_NAME]: RemindersApp,
  [FOLLOW_UPS_APP_NAME]: FollowUpsApp,
  // [LOG_CLEANUP_APP_NAME]: LogCleanupApp,
  [FILE_SYSTEM_ASSETS_STORAGE_APP_NAME]: FileSystemAssetsStorageApp,
  [S3_ASSETS_STORAGE_APP_NAME]: S3AssetsStorageApp,
  [TEXT_MESSAGE_AUTO_REPLY_APP_NAME]: TextMessageAutoReplyApp,
  [TEXT_MESSAGE_RESENDER_APP_NAME]: TextMessageResenderApp,
  [PAYPAL_APP_NAME]: PaypalApp,
  [WAITLIST_APP_NAME]: WaitlistApp,
  [WEBHOOKS_APP_NAME]: webhooksApp,
  [FINANCIAL_OVERVIEW_APP_NAME]: FinancialOverviewApp,
};

export { BUSY_EVENTS_APP_NAME } from "./apps/busy-events/const";
export { CALDAV_APP_NAME } from "./apps/caldav/const";
export { CALENDAR_WRITER_APP_NAME } from "./apps/calendar-writer/const";
export { CUSTOMER_EMAIL_NOTIFICATION_APP_NAME } from "./apps/customer-email-notification/const";
export { CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./apps/customer-text-message-notification/const";
export { EMAIL_NOTIFICATION_APP_NAME } from "./apps/email-notification/const";
export { FILE_SYSTEM_ASSETS_STORAGE_APP_NAME } from "./apps/file-system-assets-storage/const";
export { FINANCIAL_OVERVIEW_APP_NAME } from "./apps/financial-overview/const";
export { FOLLOW_UPS_APP_NAME } from "./apps/followups/const";
export { GOOGLE_CALENDAR_APP_NAME } from "./apps/google-calendar/const";
export { ICS_APP_NAME } from "./apps/ics/const";
export { LOG_CLEANUP_APP_NAME } from "./apps/log-cleanup/const";
export { OUTLOOK_APP_NAME } from "./apps/outlook/const";
export { PAYPAL_APP_NAME } from "./apps/paypal/const";
export { REMINDERS_APP_NAME } from "./apps/reminders/const";
export { S3_ASSETS_STORAGE_APP_NAME } from "./apps/s3-assets-storage/const";
export { SMTP_APP_NAME } from "./apps/smtp/const";
export { TEXTBELT_APP_NAME } from "./apps/text-belt/const";
export { TEXT_MESSAGE_AUTO_REPLY_APP_NAME } from "./apps/text-message-auto-reply/const";
export { TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./apps/text-message-notification/const";
export { TEXT_MESSAGE_RESENDER_APP_NAME } from "./apps/text-message-resender/const";
export { WAITLIST_APP_NAME as WAITLIST_NOTIFICATION_APP_NAME } from "./apps/waitlist/const";
export { WEBHOOKS_APP_NAME } from "./apps/webhooks/const";
export { WEEKLY_SCHEDULE_APP_NAME } from "./apps/weekly-schedule/const";

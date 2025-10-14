import { BUSY_EVENTS_APP_NAME } from "./apps/busy-events/const";
import { BusyEventsTranslations } from "./apps/busy-events/translations";
import { CALDAV_APP_NAME } from "./apps/caldav/const";
import { CaldavTranslations } from "./apps/caldav/translations";
import { CALENDAR_WRITER_APP_NAME } from "./apps/calendar-writer/const";
import { CalendarWriterTranslations } from "./apps/calendar-writer/translations";
import { CUSTOMER_EMAIL_NOTIFICATION_APP_NAME } from "./apps/customer-email-notification/const";
import { CustomerEmailNotificationTranslations } from "./apps/customer-email-notification/translations";
import { CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./apps/customer-text-message-notification/const";
import { CustomerTextMessageNotificationTranslations } from "./apps/customer-text-message-notification/translations";
import { EMAIL_NOTIFICATION_APP_NAME } from "./apps/email-notification/const";
import { EmailNotificationTranslations } from "./apps/email-notification/translations";
import { FILE_SYSTEM_ASSETS_STORAGE_APP_NAME } from "./apps/file-system-assets-storage/const";
import { FileSystemAssetsStorageTranslations } from "./apps/file-system-assets-storage/translations";
import { FINANCIAL_OVERVIEW_APP_NAME } from "./apps/financial-overview/const";
import { FinancialOverviewTranslations } from "./apps/financial-overview/translations";
import { FOLLOW_UPS_APP_NAME } from "./apps/followups/const";
import { FollowUpsTranslations } from "./apps/followups/translations";
import { GOOGLE_CALENDAR_APP_NAME } from "./apps/google-calendar/const";
import { GoogleCalendarTranslations } from "./apps/google-calendar/translations";
import { ICS_APP_NAME } from "./apps/ics/const";
import { IcsTranslations } from "./apps/ics/translations";
import { LOG_CLEANUP_APP_NAME } from "./apps/log-cleanup/const";
import { LogCleanupTranslations } from "./apps/log-cleanup/translations";
import { OUTLOOK_APP_NAME } from "./apps/outlook/const";
import { OutlookTranslations } from "./apps/outlook/translations";
import { PAYPAL_APP_NAME } from "./apps/paypal/const";
import { PaypalTranslations } from "./apps/paypal/translations";
import { REMINDERS_APP_NAME } from "./apps/reminders/const";
import { RemindersTranslations } from "./apps/reminders/translations";
import { S3_ASSETS_STORAGE_APP_NAME } from "./apps/s3-assets-storage/const";
import { S3AssetsStorageTranslations } from "./apps/s3-assets-storage/translations";
import { SMART_SCHEDULE_APP_NAME } from "./apps/smart-schedule/const";
import { SmartScheduleTranslations } from "./apps/smart-schedule/translations";
import { SMTP_APP_NAME } from "./apps/smtp/const";
import { SmtpTranslations } from "./apps/smtp/translations";
import { TEXTBELT_APP_NAME } from "./apps/text-belt/const";
import { TextBeltTranslations } from "./apps/text-belt/translations";
import { TEXT_MESSAGE_AUTO_REPLY_APP_NAME } from "./apps/text-message-auto-reply/const";
import { TextMessageAutoReplyTranslations } from "./apps/text-message-auto-reply/translations";
import { TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./apps/text-message-notification/const";
import { TextMessageNotificationTranslations } from "./apps/text-message-notification/translations";
import { TEXT_MESSAGE_RESENDER_APP_NAME } from "./apps/text-message-resender/const";
import { TextMessageResenderTranslations } from "./apps/text-message-resender/translations";
import { WAITLIST_NOTIFICATIONS_APP_NAME } from "./apps/waitlist-notifications/const";
import { WaitlistNotificationsTranslations } from "./apps/waitlist-notifications/translations";
import { WAITLIST_APP_NAME } from "./apps/waitlist/const";
import { WaitlistTranslations } from "./apps/waitlist/translations";
import { WEBHOOKS_APP_NAME } from "./apps/webhooks/const";
import { WebhooksTranslations } from "./apps/webhooks/translations";
import { WEEKLY_SCHEDULE_APP_NAME } from "./apps/weekly-schedule/const";
import { WeeklyScheduleTranslations } from "./apps/weekly-schedule/translations";

export const AppsTranslations: Record<
  string,
  {
    admin?: (locale: string) => Promise<Record<string, any>>;
    public?: (locale: string) => Promise<Record<string, any>>;
    overrides?: (locale: string) => Promise<Record<string, any>>;
  }
> = {
  [WAITLIST_APP_NAME]: WaitlistTranslations,
  [WAITLIST_NOTIFICATIONS_APP_NAME]: WaitlistNotificationsTranslations,
  [FINANCIAL_OVERVIEW_APP_NAME]: FinancialOverviewTranslations,
  [BUSY_EVENTS_APP_NAME]: BusyEventsTranslations,
  [CALDAV_APP_NAME]: CaldavTranslations,
  [CALENDAR_WRITER_APP_NAME]: CalendarWriterTranslations,
  [CUSTOMER_EMAIL_NOTIFICATION_APP_NAME]: CustomerEmailNotificationTranslations,
  [CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME]:
    CustomerTextMessageNotificationTranslations,
  [EMAIL_NOTIFICATION_APP_NAME]: EmailNotificationTranslations,
  [FILE_SYSTEM_ASSETS_STORAGE_APP_NAME]: FileSystemAssetsStorageTranslations,
  [FOLLOW_UPS_APP_NAME]: FollowUpsTranslations,
  [GOOGLE_CALENDAR_APP_NAME]: GoogleCalendarTranslations,
  [ICS_APP_NAME]: IcsTranslations,
  [LOG_CLEANUP_APP_NAME]: LogCleanupTranslations,
  [OUTLOOK_APP_NAME]: OutlookTranslations,
  [PAYPAL_APP_NAME]: PaypalTranslations,
  [REMINDERS_APP_NAME]: RemindersTranslations,
  [S3_ASSETS_STORAGE_APP_NAME]: S3AssetsStorageTranslations,
  [SMTP_APP_NAME]: SmtpTranslations,
  [TEXTBELT_APP_NAME]: TextBeltTranslations,
  [TEXT_MESSAGE_AUTO_REPLY_APP_NAME]: TextMessageAutoReplyTranslations,
  [TEXT_MESSAGE_NOTIFICATION_APP_NAME]: TextMessageNotificationTranslations,
  [TEXT_MESSAGE_RESENDER_APP_NAME]: TextMessageResenderTranslations,
  [WEEKLY_SCHEDULE_APP_NAME]: WeeklyScheduleTranslations,
  [WEBHOOKS_APP_NAME]: WebhooksTranslations,
  [SMART_SCHEDULE_APP_NAME]: SmartScheduleTranslations,
};

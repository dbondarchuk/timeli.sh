import { App } from "@timelish/types";
import { BusyEventsApp } from "./apps/busy-events/app";
import { BUSY_EVENTS_APP_NAME } from "./apps/busy-events/const";
import { CaldavApp } from "./apps/caldav/app";
import { CALDAV_APP_NAME } from "./apps/caldav/const";
import { CarddavApp } from "./apps/carddav/app";
import { CARDDAV_APP_NAME } from "./apps/carddav/const";
import { CalendarWriterApp } from "./apps/calendar-writer/app";
import { CALENDAR_WRITER_APP_NAME } from "./apps/calendar-writer/const";
import { CustomerEmailNotificationApp } from "./apps/customer-email-notification/app";
import { CUSTOMER_EMAIL_NOTIFICATION_APP_NAME } from "./apps/customer-email-notification/const";
import { CustomerTextMessageNotificationApp } from "./apps/customer-text-message-notification/app";
import { CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./apps/customer-text-message-notification/const";
import { EmailNotificationApp } from "./apps/email-notification/app";
import { EMAIL_NOTIFICATION_APP_NAME } from "./apps/email-notification/const";
import { FinancialOverviewApp } from "./apps/financial-overview/app";
import { FINANCIAL_OVERVIEW_APP_NAME } from "./apps/financial-overview/const";
import { GoogleCalendarApp } from "./apps/google-calendar/app";
import { GOOGLE_CALENDAR_APP_NAME } from "./apps/google-calendar/const";
import { IcsApp } from "./apps/ics/app";
import { ICS_APP_NAME } from "./apps/ics/const";
import { OutlookApp } from "./apps/outlook/app";
import { OUTLOOK_APP_NAME } from "./apps/outlook/const";
import { PaypalApp } from "./apps/paypal/app";
import { PAYPAL_APP_NAME } from "./apps/paypal/const";
import { ScheduledNotificationsApp } from "./apps/scheduled-notifications/app";
import { SCHEDULED_NOTIFICATIONS_APP_NAME } from "./apps/scheduled-notifications/const";
import { SmartScheduleApp } from "./apps/smart-schedule/app";
import { SMART_SCHEDULE_APP_NAME } from "./apps/smart-schedule/const";
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
import { UrlBusyEventsApp } from "./apps/url-busy-events/app";
import { URL_BUSY_EVENTS_APP_NAME } from "./apps/url-busy-events/const";
import { UrlScheduleProviderApp } from "./apps/url-schedule-provider/app";
import { URL_SCHEDULE_PROVIDER_APP_NAME } from "./apps/url-schedule-provider/const";
import { WaitlistNotificationsApp } from "./apps/waitlist-notifications/app";
import { WAITLIST_NOTIFICATIONS_APP_NAME } from "./apps/waitlist-notifications/const";
import { BlogApp } from "./apps/blog/app";
import { BLOG_APP_NAME } from "./apps/blog/const";
import { WaitlistApp } from "./apps/waitlist/app";
import { WAITLIST_APP_NAME } from "./apps/waitlist/const";
import { webhooksApp } from "./apps/webhooks/app";
import { WEBHOOKS_APP_NAME } from "./apps/webhooks/const";
import { WeeklyScheduleApp } from "./apps/weekly-schedule/app";
import { WEEKLY_SCHEDULE_APP_NAME } from "./apps/weekly-schedule/const";
import { ZoomApp } from "./apps/zoom/app";
import { ZOOM_APP_NAME } from "./apps/zoom/const";
import { FormsApp } from "./apps/forms/app";
import { FORMS_APP_NAME } from "./apps/forms/const";

export const AvailableApps: Record<string, App> = {
  [OUTLOOK_APP_NAME]: OutlookApp,
  [GOOGLE_CALENDAR_APP_NAME]: GoogleCalendarApp,
  [ICS_APP_NAME]: IcsApp,
  [CALDAV_APP_NAME]: CaldavApp,
  [CARDDAV_APP_NAME]: CarddavApp,
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
  [SCHEDULED_NOTIFICATIONS_APP_NAME]: ScheduledNotificationsApp,
  // [FILE_SYSTEM_ASSETS_STORAGE_APP_NAME]: FileSystemAssetsStorageApp,
  // [S3_ASSETS_STORAGE_APP_NAME]: S3AssetsStorageApp,
  [TEXT_MESSAGE_AUTO_REPLY_APP_NAME]: TextMessageAutoReplyApp,
  [TEXT_MESSAGE_RESENDER_APP_NAME]: TextMessageResenderApp,
  [PAYPAL_APP_NAME]: PaypalApp,
  [BLOG_APP_NAME]: BlogApp,
  [WAITLIST_APP_NAME]: WaitlistApp,
  [WAITLIST_NOTIFICATIONS_APP_NAME]: WaitlistNotificationsApp,
  [WEBHOOKS_APP_NAME]: webhooksApp,
  [FINANCIAL_OVERVIEW_APP_NAME]: FinancialOverviewApp,
  [SMART_SCHEDULE_APP_NAME]: SmartScheduleApp,
  [URL_BUSY_EVENTS_APP_NAME]: UrlBusyEventsApp,
  [URL_SCHEDULE_PROVIDER_APP_NAME]: UrlScheduleProviderApp,
  [ZOOM_APP_NAME]: ZoomApp,
  [FORMS_APP_NAME]: FormsApp,
};

export { BLOG_APP_NAME } from "./apps/blog/const";
export { BUSY_EVENTS_APP_NAME } from "./apps/busy-events/const";
export { CALDAV_APP_NAME } from "./apps/caldav/const";
export { CARDDAV_APP_NAME } from "./apps/carddav/const";
export { CALENDAR_WRITER_APP_NAME } from "./apps/calendar-writer/const";
export { CUSTOMER_EMAIL_NOTIFICATION_APP_NAME } from "./apps/customer-email-notification/const";
export { CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./apps/customer-text-message-notification/const";
export { EMAIL_NOTIFICATION_APP_NAME } from "./apps/email-notification/const";
// export { FILE_SYSTEM_ASSETS_STORAGE_APP_NAME } from "./apps/file-system-assets-storage/const";
export { FINANCIAL_OVERVIEW_APP_NAME } from "./apps/financial-overview/const";
export { GOOGLE_CALENDAR_APP_NAME } from "./apps/google-calendar/const";
export { ICS_APP_NAME } from "./apps/ics/const";
export { OUTLOOK_APP_NAME } from "./apps/outlook/const";
export { PAYPAL_APP_NAME } from "./apps/paypal/const";
// export { S3_ASSETS_STORAGE_APP_NAME } from "./apps/s3-assets-storage/const";
export { SCHEDULED_NOTIFICATIONS_APP_NAME } from "./apps/scheduled-notifications/const";
export { SMART_SCHEDULE_APP_NAME } from "./apps/smart-schedule/const";
export { SMTP_APP_NAME } from "./apps/smtp/const";
export { TEXTBELT_APP_NAME } from "./apps/text-belt/const";
export { TEXT_MESSAGE_AUTO_REPLY_APP_NAME } from "./apps/text-message-auto-reply/const";
export { TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "./apps/text-message-notification/const";
export { TEXT_MESSAGE_RESENDER_APP_NAME } from "./apps/text-message-resender/const";
export { URL_BUSY_EVENTS_APP_NAME } from "./apps/url-busy-events/const";
export { URL_SCHEDULE_PROVIDER_APP_NAME } from "./apps/url-schedule-provider/const";
export { WAITLIST_NOTIFICATIONS_APP_NAME } from "./apps/waitlist-notifications/const";
export { WAITLIST_APP_NAME } from "./apps/waitlist/const";
export { WEBHOOKS_APP_NAME } from "./apps/webhooks/const";
export { WEEKLY_SCHEDULE_APP_NAME } from "./apps/weekly-schedule/const";
export { ZOOM_APP_NAME } from "./apps/zoom/const";
export { FORMS_APP_NAME } from "./apps/forms/const";

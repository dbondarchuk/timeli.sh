import { IConnectedApp, IConnectedAppProps } from "@vivid/types";
import { BUSY_EVENTS_APP_NAME } from "../apps/busy-events/const";
import BusyEventsConnectedApp from "../apps/busy-events/service";
import { CALDAV_APP_NAME } from "../apps/caldav/const";
import CaldavConnectedApp from "../apps/caldav/service";
import { CALENDAR_WRITER_APP_NAME } from "../apps/calendar-writer/const";
import { CalendarWriterConnectedApp } from "../apps/calendar-writer/service";
import { CUSTOMER_EMAIL_NOTIFICATION_APP_NAME } from "../apps/customer-email-notification/const";
import CustomerEmailNotificationConnectedApp from "../apps/customer-email-notification/service";
import { CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "../apps/customer-text-message-notification/const";
import CustomerTextMessageNotificationConnectedApp from "../apps/customer-text-message-notification/service";
import { EMAIL_NOTIFICATION_APP_NAME } from "../apps/email-notification/const";
import { EmailNotificationConnectedApp } from "../apps/email-notification/service";
import { FILE_SYSTEM_ASSETS_STORAGE_APP_NAME } from "../apps/file-system-assets-storage/const";
import FileSystemAssetsStorageConnectedApp from "../apps/file-system-assets-storage/service";
import { FINANCIAL_OVERVIEW_APP_NAME } from "../apps/financial-overview/const";
import FinancialOverviewService from "../apps/financial-overview/service";
import { FOLLOW_UPS_APP_NAME } from "../apps/followups/const";
import FollowUpsConnectedApp from "../apps/followups/service";
import { GOOGLE_CALENDAR_APP_NAME } from "../apps/google-calendar/const";
import GoogleCalendarConnectedApp from "../apps/google-calendar/service";
import { ICS_APP_NAME } from "../apps/ics/const";
import IcsConnectedApp from "../apps/ics/service";
import { LOG_CLEANUP_APP_NAME } from "../apps/log-cleanup/const";
import LogCleanupConnectedApp from "../apps/log-cleanup/service";
import { OUTLOOK_APP_NAME } from "../apps/outlook/const";
import OutlookConnectedApp from "../apps/outlook/service";
import { PAYPAL_APP_NAME } from "../apps/paypal/const";
import PaypalConnectedApp from "../apps/paypal/service";
import { REMINDERS_APP_NAME } from "../apps/reminders/const";
import RemindersConnectedApp from "../apps/reminders/service";
import { S3_ASSETS_STORAGE_APP_NAME } from "../apps/s3-assets-storage/const";
import S3AssetsStorageConnectedApp from "../apps/s3-assets-storage/service";
import { SMTP_APP_NAME } from "../apps/smtp/const";
import SmtpConnectedApp from "../apps/smtp/service";
import { TEXTBELT_APP_NAME } from "../apps/text-belt/const";
import TextBeltConnectedApp from "../apps/text-belt/service";
import { TEXT_MESSAGE_AUTO_REPLY_APP_NAME } from "../apps/text-message-auto-reply/const";
import TextMessageAutoReplyConnectedApp from "../apps/text-message-auto-reply/service";
import { TEXT_MESSAGE_NOTIFICATION_APP_NAME } from "../apps/text-message-notification/const";
import { TextMessageNotificationConnectedApp } from "../apps/text-message-notification/service";
import { TEXT_MESSAGE_RESENDER_APP_NAME } from "../apps/text-message-resender/const";
import TextMessageResenderConnectedApp from "../apps/text-message-resender/service";
import { WAITLIST_APP_NAME } from "../apps/waitlist/const";
import { WaitlistConnectedApp } from "../apps/waitlist/service/service";
import { WEBHOOKS_APP_NAME } from "../apps/webhooks/const";
import { WebhooksConnectedApp } from "../apps/webhooks/service";
import { WEEKLY_SCHEDULE_APP_NAME } from "../apps/weekly-schedule/const";
import WeeklyScheduleConnectedApp from "../apps/weekly-schedule/service";

export const AvailableAppServices: Record<
  string,
  (props: IConnectedAppProps) => IConnectedApp
> = {
  [OUTLOOK_APP_NAME]: (props) => new OutlookConnectedApp(props),
  [GOOGLE_CALENDAR_APP_NAME]: (props) => new GoogleCalendarConnectedApp(props),
  [ICS_APP_NAME]: (props) => new IcsConnectedApp(props),
  [CALDAV_APP_NAME]: (props) => new CaldavConnectedApp(props),
  [WEEKLY_SCHEDULE_APP_NAME]: (props) => new WeeklyScheduleConnectedApp(props),
  [BUSY_EVENTS_APP_NAME]: (props) => new BusyEventsConnectedApp(props),
  [SMTP_APP_NAME]: (props) => new SmtpConnectedApp(props),
  [TEXTBELT_APP_NAME]: (props) => new TextBeltConnectedApp(props),
  [CUSTOMER_EMAIL_NOTIFICATION_APP_NAME]: (props) =>
    new CustomerEmailNotificationConnectedApp(props),
  [EMAIL_NOTIFICATION_APP_NAME]: (props) =>
    new EmailNotificationConnectedApp(props),
  [CALENDAR_WRITER_APP_NAME]: (props) => new CalendarWriterConnectedApp(props),
  [CUSTOMER_TEXT_MESSAGE_NOTIFICATION_APP_NAME]: (props) =>
    new CustomerTextMessageNotificationConnectedApp(props),
  [TEXT_MESSAGE_NOTIFICATION_APP_NAME]: (props) =>
    new TextMessageNotificationConnectedApp(props),
  [TEXT_MESSAGE_AUTO_REPLY_APP_NAME]: (props) =>
    new TextMessageAutoReplyConnectedApp(props),
  [TEXT_MESSAGE_RESENDER_APP_NAME]: (props) =>
    new TextMessageResenderConnectedApp(props),
  [REMINDERS_APP_NAME]: (props) => new RemindersConnectedApp(props),
  [FOLLOW_UPS_APP_NAME]: (props) => new FollowUpsConnectedApp(props),
  [LOG_CLEANUP_APP_NAME]: (props) => new LogCleanupConnectedApp(props),
  [FILE_SYSTEM_ASSETS_STORAGE_APP_NAME]: (props) =>
    new FileSystemAssetsStorageConnectedApp(props),
  [S3_ASSETS_STORAGE_APP_NAME]: (props) =>
    new S3AssetsStorageConnectedApp(props),
  [PAYPAL_APP_NAME]: (props) => new PaypalConnectedApp(props),
  [WAITLIST_APP_NAME]: (props) => new WaitlistConnectedApp(props),
  [FINANCIAL_OVERVIEW_APP_NAME]: (props) => new FinancialOverviewService(props),
  [WEBHOOKS_APP_NAME]: (props) => new WebhooksConnectedApp(props),
};

import { CALDAV_APP_NAME } from "./apps/caldav/const";
import { CaldavImages } from "./apps/caldav/images";
import { FINANCIAL_OVERVIEW_APP_NAME } from "./apps/financial-overview/const";
import { FinancialOverviewImages } from "./apps/financial-overview/images";
import { GOOGLE_CALENDAR_APP_NAME } from "./apps/google-calendar/const";
import { GoogleCalendarImages } from "./apps/google-calendar/images";
import { OUTLOOK_APP_NAME } from "./apps/outlook/const";
import { OutlookImages } from "./apps/outlook/images";
import { PAYPAL_APP_NAME } from "./apps/paypal/const";
import { PaypalImages } from "./apps/paypal/images";
import { TEXTBELT_APP_NAME } from "./apps/text-belt/const";
import { TextBeltImages } from "./apps/text-belt/images";
import { WAITLIST_APP_NAME } from "./apps/waitlist/const";
import { WaitlistImages } from "./apps/waitlist/images";
import { ZOOM_APP_NAME } from "./apps/zoom/const";
import { ZoomImages } from "./apps/zoom/images";

export const AppImages: Record<string, string[]> = {
  [CALDAV_APP_NAME]: CaldavImages,
  [FINANCIAL_OVERVIEW_APP_NAME]: FinancialOverviewImages,
  [GOOGLE_CALENDAR_APP_NAME]: GoogleCalendarImages,
  [OUTLOOK_APP_NAME]: OutlookImages,
  [PAYPAL_APP_NAME]: PaypalImages,
  [TEXTBELT_APP_NAME]: TextBeltImages,
  [WAITLIST_APP_NAME]: WaitlistImages,
  [ZOOM_APP_NAME]: ZoomImages,
};

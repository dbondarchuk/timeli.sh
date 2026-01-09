import { AppScope, IServicesContainer } from "@timelish/types";
import { BuiltInBookingTrackingApp } from "../booking-tracking/app";
import { BOOKING_TRACKING_APP_ID } from "../booking-tracking/const";

export const BuiltInApps: Record<
  string,
  {
    scopes?: AppScope[];
    scheduled?: boolean;
    getService: new (companyId: string, services: IServicesContainer) => any;
  }
> = {
  [BOOKING_TRACKING_APP_ID]: {
    scopes: ["event-hook"],
    scheduled: true,
    getService: BuiltInBookingTrackingApp,
  },
};

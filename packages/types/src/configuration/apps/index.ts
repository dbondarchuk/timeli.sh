import * as z from "zod";
import { zObjectId } from "../../utils";

export const defaultAppsConfigurationSchema = z.object({
  paymentAppId: zObjectId().optional(),
  emailSenderAppId: zObjectId().optional(),
  textMessageSenderAppId: zObjectId().optional(),
  textMessageResponderAppId: zObjectId().optional(),
});

export type DefaultAppsConfiguration = z.infer<
  typeof defaultAppsConfigurationSchema
>;

export const defaultAppScopes = [
  "payment",
  "mail-send",
  "text-message-send",
  "text-message-respond",
] as const;

export const calendarSourceScopes = ["calendar-read"] as const;
export const bookingProviderScopes = [
  "schedule",
  "availability-provider",
] as const;

export type DefaultAppScope = (typeof defaultAppScopes)[number];
export type CalendarSourceScope = (typeof calendarSourceScopes)[number];
export type BookingProviderScope = (typeof bookingProviderScopes)[number];

export const defaultAppToInstallScopes = [
  ...defaultAppScopes,
  ...calendarSourceScopes,
  ...bookingProviderScopes,
] as const;
export type DefaultAppToInstallScope =
  (typeof defaultAppToInstallScopes)[number];

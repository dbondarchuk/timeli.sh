import { z } from "zod";
import { CaldavAdminAllKeys } from "./translations/types";

export const caldavCalendarSourceSchema = z.object({
  serverUrl: z
    .string()
    .url(
      "app_caldav_admin.validation.serverUrl.url" satisfies CaldavAdminAllKeys,
    ),
  calendarName: z
    .string({
      message:
        "app_caldav_admin.validation.calendarName.required" satisfies CaldavAdminAllKeys,
    })
    .min(
      1,
      "app_caldav_admin.validation.calendarName.required" satisfies CaldavAdminAllKeys,
    ),
  username: z.string().optional(),
  password: z.string().optional(),
});

export type CaldavCalendarSource = z.infer<typeof caldavCalendarSourceSchema>;

export type SaveActionType = "save";
export type FetchActionType = "fetchCalendars";

export type CaldavActionType = SaveActionType | FetchActionType;

export type CaldavAction =
  | {
      type: SaveActionType;
      data: CaldavCalendarSource;
    }
  | {
      type: FetchActionType;
      data: CaldavCalendarSource;
    };

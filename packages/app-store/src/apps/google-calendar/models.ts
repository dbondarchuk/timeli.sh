import { ConnectedOauthAppTokens } from "@timelish/types";
import * as z from "zod";

export const googleCalendarConfigurationSchema = z.object({
  calendar: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
});

export type GoogleCalendarConfiguration = ConnectedOauthAppTokens &
  z.infer<typeof googleCalendarConfigurationSchema>;

export type CalendarListItem = {
  id: string;
  name: string;
};

export type GetCalendarListRequest = {};

export const GetCalendarListRequestType = "get-calendar-list" as const;

export type GetSelectedCalendarRequest = {};

export const GetSelectedCalendarRequestType = "get-selected-calendar" as const;

export type SetCalendarRequest = {
  calendar: CalendarListItem;
};

export const SetCalendarRequestType = "set-calendar" as const;

export type RequestAction =
  | ({
      type: typeof GetSelectedCalendarRequestType;
    } & GetSelectedCalendarRequest)
  | ({
      type: typeof GetCalendarListRequestType;
    } & GetCalendarListRequest)
  | ({
      type: typeof SetCalendarRequestType;
    } & SetCalendarRequest);

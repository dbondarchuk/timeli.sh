import { Schedule, WeekIdentifier } from "@timelish/types";

export type SetBusyEventsAction = {
  events: Schedule;
  week: WeekIdentifier;
};

export const SetBusyEventsActionType = "set-busy-events" as const;

export type GetWeeklyBusyEventsRequest = {
  week: WeekIdentifier;
};

export const GetWeeklyBusyEventsRequestType = "get-weekly-busy-events" as const;

export type RequestAction =
  | ({
      type: typeof SetBusyEventsActionType;
    } & SetBusyEventsAction)
  | ({
      type: typeof GetWeeklyBusyEventsRequestType;
    } & GetWeeklyBusyEventsRequest);

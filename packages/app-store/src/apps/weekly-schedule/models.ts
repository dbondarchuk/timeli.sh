import { Schedule, WeekIdentifier } from "@timelish/types";

export type SetSchedulesAction = {
  schedules: Record<WeekIdentifier, Schedule>;
  replaceExisting?: boolean;
};

export const SetSchedulesActionType = "set-schedules" as const;

export type RemoveScheduleAction = {
  week: WeekIdentifier;
};

export const RemoveScheduleActionType = "remove-schedule" as const;

export type RemoveAllSchedulesAction = {
  week: WeekIdentifier;
};

export const RemoveAllSchedulesActionType = "remove-all-schedules" as const;

export type GetWeeklyScheduleRequest = {
  week: WeekIdentifier;
};

export const GetWeeklyScheduleRequestType = "get-weekly-schedule" as const;

export type RequestAction =
  | ({
      type: typeof SetSchedulesActionType;
    } & SetSchedulesAction)
  | ({
      type: typeof RemoveScheduleActionType;
    } & RemoveScheduleAction)
  | ({
      type: typeof RemoveAllSchedulesActionType;
    } & RemoveAllSchedulesAction)
  | ({ type: typeof GetWeeklyScheduleRequestType } & GetWeeklyScheduleRequest);

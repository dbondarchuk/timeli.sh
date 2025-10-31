import { DateRange, Query } from "@vivid/types";
import * as z from "zod";

import { WaitlistStatus } from "./waitlist";

export const waitlistConfigurationSchema = z.object({
  dontDismissWaitlistOnAppointmentCreate: z.coerce
    .boolean<boolean>()
    .optional(),
});

export type WaitlistConfiguration = z.infer<typeof waitlistConfigurationSchema>;

export type GetWaitlistEntriesAction = {
  query: Query & {
    status?: WaitlistStatus[];
    optionId?: string | string[];
    customerId?: string | string[];
    range?: DateRange;
  };
};

export const GetWaitlistEntriesActionType = "get-waitlist-entries" as const;

export type GetWaitlistEntryAction = {
  id: string;
};

export const GetWaitlistEntryActionType = "get-waitlist-entry" as const;

export type DismissWaitlistEntriesAction = {
  ids: string[];
};

export const DismissWaitlistEntriesActionType =
  "dismiss-waitlist-entries" as const;

export type SetConfigurationAction = {
  configuration: WaitlistConfiguration;
};

export const SetConfigurationActionType = "set-configuration" as const;

export type RequestAction =
  | ({
      type: typeof GetWaitlistEntriesActionType;
    } & GetWaitlistEntriesAction)
  | ({
      type: typeof GetWaitlistEntryActionType;
    } & GetWaitlistEntryAction)
  | ({
      type: typeof DismissWaitlistEntriesActionType;
    } & DismissWaitlistEntriesAction)
  | ({
      type: typeof SetConfigurationActionType;
    } & SetConfigurationAction);

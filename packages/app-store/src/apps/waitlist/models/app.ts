import { asOptionalField, DateRange, Query, zEmail } from "@vivid/types";
import { z } from "zod";

import { WaitlistStatus } from "./waitlist";

export const waitlistConfigurationSchema = z
  .object({
    dontDismissWaitlistOnAppointmentCreate: z.coerce.boolean().optional(),
    email: asOptionalField(zEmail),
    notifyOnNewEntry: z.coerce.boolean().optional(),
  })
  .and(
    z
      .object({
        notifyCustomerOnNewEntry: z.literal(true, {
          errorMap: () => ({
            message: "waitlist.notifyCustomerOnNewEntry.required",
          }),
        }),
        customerNewEntrySubject: z.string().min(1, {
          message: "waitlist.customerNewEntrySubject.required",
        }),
        customerNewEntryTemplateId: z.string().min(1, {
          message: "waitlist.customerNewEntryTemplateId.required",
        }),
      })
      .or(
        z.object({
          notifyCustomerOnNewEntry: z.literal(false, {
            errorMap: () => ({
              message: "waitlist.notifyCustomerOnNewEntry.required",
            }),
          }),
        }),
      ),
  );

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

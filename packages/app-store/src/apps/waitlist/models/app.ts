import {
  dateRangeSchema,
  querySchema,
  zObjectId,
  zTaggedUnion,
} from "@timelish/types";
import * as z from "zod";

import { waitlistStatus } from "./waitlist";

export const waitlistConfigurationSchema = z.object({
  dontDismissWaitlistOnAppointmentCreate: z.coerce
    .boolean<boolean>()
    .optional(),
});

export type WaitlistConfiguration = z.infer<typeof waitlistConfigurationSchema>;

// Request actions

// Get waitlist entries action

export const getWaitlistEntriesActionSchema = z.object({
  query: querySchema.extend({
    status: z.array(z.enum(waitlistStatus)).optional(),
    optionId: z.array(zObjectId()).or(zObjectId()).optional(),
    customerId: z.array(zObjectId()).or(zObjectId()).optional(),
    range: dateRangeSchema.optional(),
  }),
});

export type GetWaitlistEntriesAction = z.infer<
  typeof getWaitlistEntriesActionSchema
>;
export const GetWaitlistEntriesActionType = "get-waitlist-entries" as const;

// Get waitlist entry action

export const getWaitlistEntryActionSchema = z.object({
  id: zObjectId(),
});

export type GetWaitlistEntryAction = z.infer<
  typeof getWaitlistEntryActionSchema
>;
export const GetWaitlistEntryActionType = "get-waitlist-entry" as const;

// Dismiss waitlist entries action

export const dismissWaitlistEntriesActionSchema = z.object({
  ids: z.array(zObjectId()),
});

export type DismissWaitlistEntriesAction = z.infer<
  typeof dismissWaitlistEntriesActionSchema
>;
export const DismissWaitlistEntriesActionType =
  "dismiss-waitlist-entries" as const;

// Set configuration action

export const setConfigurationActionSchema = z.object({
  configuration: waitlistConfigurationSchema,
});

export type SetConfigurationAction = z.infer<
  typeof setConfigurationActionSchema
>;
export const SetConfigurationActionType = "set-configuration" as const;

// Request action

export const requestActionSchema = zTaggedUnion([
  { type: GetWaitlistEntriesActionType, data: getWaitlistEntriesActionSchema },
  { type: GetWaitlistEntryActionType, data: getWaitlistEntryActionSchema },
  {
    type: DismissWaitlistEntriesActionType,
    data: dismissWaitlistEntriesActionSchema,
  },
  { type: SetConfigurationActionType, data: setConfigurationActionSchema },
]);

export type RequestAction = z.infer<typeof requestActionSchema>;

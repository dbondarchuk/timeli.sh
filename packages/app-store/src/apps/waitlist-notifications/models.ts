import {
  asOptionalField,
  zEmail,
  zNonEmptyString,
  zObjectId,
} from "@timelish/types";
import * as z from "zod";
import { WaitlistNotificationsAdminAllKeys } from "./translations/types";

export const waitlistNotificationsConfigurationSchema = z
  .object({
    email: asOptionalField(zEmail),
    notifyOnNewEntry: z.coerce.boolean<boolean>().optional(),
  })
  .and(
    z
      .object({
        notifyCustomerOnNewEntry: z.literal(true, {
          error:
            "app_waitlist-notifications_admin.validation.notifyCustomerOnNewEntry.required" satisfies WaitlistNotificationsAdminAllKeys,
        }),
        customerNewEntrySubject: zNonEmptyString(
          "app_waitlist-notifications_admin.validation.customerNewEntrySubject.required" satisfies WaitlistNotificationsAdminAllKeys,
          1,
          256,
          "app_waitlist-notifications_admin.validation.customerNewEntrySubject.max" satisfies WaitlistNotificationsAdminAllKeys,
        ),
        customerNewEntryTemplateId: zObjectId(
          "app_waitlist-notifications_admin.validation.customerNewEntryTemplateId.required" satisfies WaitlistNotificationsAdminAllKeys,
        ),
      })
      .or(
        z.object({
          notifyCustomerOnNewEntry: z.literal(false, {
            error:
              "app_waitlist-notifications_admin.validation.notifyCustomerOnNewEntry.required" satisfies WaitlistNotificationsAdminAllKeys,
          }),
        }),
      ),
  );

export type WaitlistNotificationsConfiguration = z.infer<
  typeof waitlistNotificationsConfigurationSchema
>;

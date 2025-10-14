import { asOptionalField, zEmail } from "@vivid/types";
import { z } from "zod";
import { WaitlistNotificationsAdminAllKeys } from "./translations/types";

export const waitlistNotificationsConfigurationSchema = z
  .object({
    email: asOptionalField(zEmail),
    notifyOnNewEntry: z.coerce.boolean().optional(),
  })
  .and(
    z
      .object({
        notifyCustomerOnNewEntry: z.literal(true, {
          errorMap: () => ({
            message:
              "app_waitlist-notifications_admin.validation.notifyCustomerOnNewEntry.required" satisfies WaitlistNotificationsAdminAllKeys,
          }),
        }),
        customerNewEntrySubject: z.string().min(1, {
          message:
            "app_waitlist-notifications_admin.validation.customerNewEntrySubject.required" satisfies WaitlistNotificationsAdminAllKeys,
        }),
        customerNewEntryTemplateId: z.string().min(1, {
          message:
            "app_waitlist-notifications_admin.validation.customerNewEntryTemplateId.required" satisfies WaitlistNotificationsAdminAllKeys,
        }),
      })
      .or(
        z.object({
          notifyCustomerOnNewEntry: z.literal(false, {
            errorMap: () => ({
              message:
                "app_waitlist-notifications_admin.validation.notifyCustomerOnNewEntry.required" satisfies WaitlistNotificationsAdminAllKeys,
            }),
          }),
        }),
      ),
  );

export type WaitlistNotificationsConfiguration = z.infer<
  typeof waitlistNotificationsConfigurationSchema
>;

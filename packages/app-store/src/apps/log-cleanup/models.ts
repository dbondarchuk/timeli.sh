import { z } from "zod";
import { LogCleanupAdminAllKeys } from "./translations/types";

export const cleanUpIntervalType = z.enum(["days", "weeks", "months"]);
export type CleanUpIntervalType = z.infer<typeof cleanUpIntervalType>;

export const logCleanupConfigurationSchema = z.object({
  amount: z.coerce
    .number()
    .min(
      1,
      "app_log-cleanup_admin.validation.amountMin" satisfies LogCleanupAdminAllKeys,
    )
    .int(
      "app_log-cleanup_admin.validation.amountInteger" satisfies LogCleanupAdminAllKeys,
    ),
  type: cleanUpIntervalType,
});

export type LogCleanupConfiguration = z.infer<
  typeof logCleanupConfigurationSchema
>;

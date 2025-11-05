import { asOptionalField, zEmail } from "@timelish/types";
import * as z from "zod";

export const emailNotificationConfigurationSchema = z.object({
  email: asOptionalField(zEmail),
});

export type EmailNotificationConfiguration = z.infer<
  typeof emailNotificationConfigurationSchema
>;

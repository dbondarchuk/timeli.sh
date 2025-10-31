import { asOptionalField } from "@vivid/types";
import * as z from "zod";
import { SmtpAdminAllKeys } from "./translations/types";

export const smtpConfigurationSchema = z.object({
  host: z.string().min(3, {
    message:
      "app_smtp_admin.validation.host.required" satisfies SmtpAdminAllKeys,
  }),
  port: z.coerce
    .number<number>()
    .int("app_smtp_admin.validation.port.integer" satisfies SmtpAdminAllKeys)
    .min(1, {
      message: "app_smtp_admin.validation.port.min" satisfies SmtpAdminAllKeys,
    })
    .max(99999, {
      message: "app_smtp_admin.validation.port.max" satisfies SmtpAdminAllKeys,
    }),
  secure: z.coerce.boolean<boolean>(),
  email: z.email(
    "app_smtp_admin.validation.email.invalid" satisfies SmtpAdminAllKeys,
  ),
  auth: z.object({
    user: asOptionalField(z.string()),
    pass: asOptionalField(z.string()),
  }),
});

export type SmtpConfiguration = z.infer<typeof smtpConfigurationSchema>;

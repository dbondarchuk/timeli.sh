import { languages } from "@vivid/i18n";
import * as z from "zod";
import { asOptionalField, zNonEmptyString, zPhone } from "../../utils";
import { zTimeZone } from "../../utils/zTimeZone";

export const generalConfigurationSchema = z.object({
  name: zNonEmptyString("configuration.general.name.min", 3),
  title: zNonEmptyString("configuration.general.title.min", 3),
  description: zNonEmptyString("configuration.general.description.min", 3),
  keywords: zNonEmptyString("configuration.general.keywords.min", 3),
  phone: asOptionalField(zPhone),
  email: z.email({ error: "common.email.required" }),
  address: z.string().optional(),
  domain: asOptionalField(
    z
      .string()
      .regex(
        /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
        {
          message: "configuration.general.domain.invalid",
        },
      ),
  ),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  language: z.enum(languages),
  timeZone: zTimeZone,
});

export type GeneralConfiguration = z.infer<typeof generalConfigurationSchema>;

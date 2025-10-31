import { languages } from "@vivid/i18n";
import * as z from "zod";
import { asOptionalField, zPhone } from "../../utils";
import { zTimeZone } from "../../utils/zTimeZone";

export const generalConfigurationSchema = z.object({
  name: z.string().min(3, { message: "configuration.general.name.min" }),
  title: z.string().min(3, { message: "configuration.general.title.min" }),
  description: z
    .string()
    .min(3, { message: "configuration.general.description.min" }),
  keywords: z
    .string()
    .min(3, { message: "configuration.general.keywords.min" }),
  phone: asOptionalField(zPhone),
  email: z.email({ error: "common.email.required" }),
  address: z.string().optional(),
  domain: z
    .string()
    .regex(/^((?!-)[A-Za-z0-9-]{1, 63}(?<!-)\\.)+[A-Za-z]{2, 6}$/, {
      message: "configuration.general.domain.invalid",
    })
    .optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  language: z.enum(languages),
  timeZone: zTimeZone,
});

export type GeneralConfiguration = z.infer<typeof generalConfigurationSchema>;

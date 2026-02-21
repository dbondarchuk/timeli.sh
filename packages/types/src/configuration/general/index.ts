import { languages } from "@timelish/i18n";
import * as z from "zod";
import {
  asOptionalField,
  zAssetName,
  zEmail,
  zNonEmptyString,
  zPhone,
} from "../../utils";
import { zTimeZone } from "../../utils/zTimeZone";

export const generalConfigurationSchema = z.object({
  name: zNonEmptyString(
    "configuration.general.name.min",
    3,
    64,
    "configuration.general.name.max",
  ),
  title: zNonEmptyString(
    "configuration.general.title.min",
    3,
    64,
    "configuration.general.title.max",
  ),
  description: zNonEmptyString(
    "configuration.general.description.min",
    3,
    1024,
    "configuration.general.description.max",
  ),
  keywords: zNonEmptyString(
    "configuration.general.keywords.min",
    3,
    1024,
    "configuration.general.keywords.max",
  ),
  phone: asOptionalField(zPhone),
  email: zEmail,
  address: asOptionalField(
    z.string().max(1024, "configuration.general.address.max"),
  ),
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
  logo: asOptionalField(zAssetName),
  favicon: asOptionalField(zAssetName),
  language: z.enum(languages),
  timeZone: zTimeZone,
});

export type GeneralConfiguration = z.infer<typeof generalConfigurationSchema>;

import * as z from "zod";
import { asOptionalField, zEmail, zNonEmptyString, zPhone } from "../../utils";
import { zCountry } from "../../utils/country";
import { zCurrency } from "../../utils/currency";
import { zTimeZone } from "../../utils/zTimeZone";

export const generalConfigurationSchema = z.object({
  name: zNonEmptyString(
    "configuration.general.name.min",
    3,
    64,
    "configuration.general.name.max",
  ),
  phone: asOptionalField(zPhone),
  email: zEmail,
  address: asOptionalField(
    z.string().max(1024, "configuration.general.address.max"),
  ),
  country: zCountry,
  currency: zCurrency,
  timeZone: zTimeZone,
  useClientTimezone: z.coerce.boolean<boolean>().optional(),
});

export type GeneralConfiguration = z.infer<typeof generalConfigurationSchema>;

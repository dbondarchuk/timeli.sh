import {
  brandConfigurationSchema,
  generalConfigurationSchema,
  socialConfigurationSchema,
  stylingConfigurationSchema,
} from "@timelish/types";
import * as z from "zod";

export const siteSettingsFormSchema = z.object({
  general: generalConfigurationSchema,
  brand: brandConfigurationSchema,
  social: socialConfigurationSchema,
  styling: stylingConfigurationSchema,
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;

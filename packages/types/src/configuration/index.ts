import * as z from "zod";
import { WithCompanyId } from "../database";
import {
  DefaultAppsConfiguration,
  defaultAppsConfigurationSchema,
} from "./apps";
import { BookingConfiguration, bookingConfigurationSchema } from "./booking";
import { GeneralConfiguration, generalConfigurationSchema } from "./general";
import { ScheduleConfiguration, scheduleConfigurationSchema } from "./schedule";
import { ScriptsConfiguration, scriptsConfigurationSchema } from "./scripts";
import { SocialConfiguration, socialConfigurationSchema } from "./social";
import { StylingConfiguration, stylingConfigurationSchema } from "./styling";

export * from "./apps";
export * from "./booking";
export * from "./general";
export * from "./resources";
export * from "./schedule";
export * from "./scripts";
export * from "./social";
export * from "./styling";

export type Configuration = {
  general: GeneralConfiguration;
  social: SocialConfiguration;
  booking: BookingConfiguration;
  defaultApps: DefaultAppsConfiguration;
  scripts: ScriptsConfiguration;
  styling: StylingConfiguration;
  schedule: ScheduleConfiguration;
};

export type ConfigurationKey = keyof Configuration;

export type ConfigurationOption<T extends ConfigurationKey> = {
  key: T;
  value: Configuration[T];
};

export type ConfigurationOptionWithCompanyId<T extends ConfigurationKey> =
  WithCompanyId<ConfigurationOption<T>>;

export const configurationSchemaMap: Record<
  ConfigurationKey,
  z.ZodSchema<Configuration[ConfigurationKey]>
> = {
  general: generalConfigurationSchema,
  social: socialConfigurationSchema,
  booking: bookingConfigurationSchema,
  defaultApps: defaultAppsConfigurationSchema,
  scripts: scriptsConfigurationSchema,
  styling: stylingConfigurationSchema,
  schedule: scheduleConfigurationSchema,
};

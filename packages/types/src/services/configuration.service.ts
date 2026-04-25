import {
  Configuration,
  ConfigurationKey,
  ConfigurationOption,
} from "../configuration";
import type { EventSource } from "../events/envelope";

export interface IConfigurationService {
  getConfiguration<T extends ConfigurationKey>(
    key: T,
  ): Promise<ConfigurationOption<T>["value"]>;

  getConfigurations<T extends ConfigurationKey>(
    ...keys: T[]
  ): Promise<Pick<Configuration, T>>;

  setConfiguration<T extends ConfigurationKey>(
    key: T,
    configuration: ConfigurationOption<T>["value"],
    source: EventSource,
  ): Promise<void>;
}

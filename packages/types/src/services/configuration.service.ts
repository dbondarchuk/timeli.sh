import {
  Configuration,
  ConfigurationKey,
  ConfigurationOption,
} from "../configuration";

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
  ): Promise<void>;
}

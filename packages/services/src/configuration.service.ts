import {
  Configuration,
  ConfigurationKey,
  ConfigurationOption,
  IConfigurationService,
} from "@vivid/types";
import { cache } from "react";
import { CONFIGURATION_COLLECTION_NAME } from "./collections";
import { getDbConnection } from "./database";
import { BaseService } from "./services/base.service";

export class ConfigurationService
  extends BaseService
  implements IConfigurationService
{
  public constructor(companyId: string) {
    super("ConfigurationService", companyId);
  }

  public async getConfiguration<T extends ConfigurationKey>(
    key: T,
  ): Promise<ConfigurationOption<T>["value"]> {
    const logger = this.loggerFactory("getConfiguration");
    logger.debug({ key }, "Getting configuration");
    const db = await getDbConnection();
    const configurations = db.collection<ConfigurationOption<T>>(
      CONFIGURATION_COLLECTION_NAME,
    );

    const value = await configurations.findOne({
      // @ts-ignore Correct key
      key,
      companyId: this.companyId,
    });

    if (!value?.value) {
      logger.error({ key }, "Can't find configuration");
      return {} as ConfigurationOption<T>["value"];
    }

    logger.debug({ key }, "Found configuration");

    return value.value;
  }

  public async getConfigurations<T extends ConfigurationKey>(
    ...keys: T[]
  ): Promise<Pick<Configuration, T>> {
    const logger = this.loggerFactory("getConfigurations");
    logger.debug({ keys }, "Getting configurations");

    const db = await getDbConnection();
    const configurations = db.collection(CONFIGURATION_COLLECTION_NAME);

    const values: ConfigurationOption<T>[] = await configurations
      .find<ConfigurationOption<T>>({
        key: {
          $in: keys,
        },
        companyId: this.companyId,
      })
      .toArray();

    if (values.length !== keys.length) {
      logger.error(
        {
          keys,
          foundKeys: values?.map((v) => v.key),
        },
        "Can't find configuration for all keys",
      );
    }

    const result = values.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.key]: cur.value,
      }),
      {} as Pick<Configuration, T>,
    );

    logger.debug({ keys }, "Fetched configurations");
    return result;
  }

  public async setConfiguration<T extends ConfigurationKey>(
    key: T,
    configuration: ConfigurationOption<T>["value"],
  ): Promise<void> {
    const logger = this.loggerFactory("setConfiguration");
    logger.debug({ key }, "Setting configuration");

    const db = await getDbConnection();
    const configurations = db.collection<ConfigurationOption<T>>(
      CONFIGURATION_COLLECTION_NAME,
    );

    const updateResult = await configurations.updateOne(
      {
        // @ts-ignore Correct key
        key,
        companyId: this.companyId,
      },
      {
        $set: {
          key,
          companyId: this.companyId,
          value: configuration,
        },
      },
      {
        upsert: true,
      },
    );

    logger.debug({ key, updateResult }, "Set configuration");
  }
}

export class CachedConfigurationService extends ConfigurationService {
  private cachedGetConfiguration: ConfigurationService["getConfiguration"] =
    cache(async (option) => await super.getConfiguration(option));

  private cachedGetConfigurations: ConfigurationService["getConfigurations"] =
    cache(async (...options) => await super.getConfigurations(...options));

  public async getConfiguration<T extends ConfigurationKey>(
    key: T,
  ): Promise<ConfigurationOption<T>["value"]> {
    return await this.cachedGetConfiguration(key);
  }

  public async getConfigurations<K extends ConfigurationKey>(
    ...keys: K[]
  ): Promise<Pick<Configuration, K>> {
    return await this.cachedGetConfigurations(...keys);
  }
}

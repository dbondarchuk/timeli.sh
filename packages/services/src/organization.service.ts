import {
  ConfigurationOptionWithCompanyId,
  IOrganizationService,
  Organization,
} from "@timelish/types";
import {
  CONFIGURATION_COLLECTION_NAME,
  ORGANIZATIONS_COLLECTION_NAME,
} from "./collections";
import { getDbConnection } from "./database";
import { BaseService } from "./services/base.service";

const DOMAIN_ALREADY_IN_USE_ERROR = "domain_already_in_use";

export class OrganizationService
  extends BaseService
  implements IOrganizationService
{
  public constructor(companyId: string) {
    super("OrganizationService", companyId);
  }

  public async getOrganization(): Promise<Organization | null> {
    const logger = this.loggerFactory("getOrganization");
    logger.debug("Getting organization");
    const db = await getDbConnection();
    const organizations = db.collection<Organization>(
      ORGANIZATIONS_COLLECTION_NAME,
    );
    const organization = await organizations.findOne({ _id: this.companyId });
    if (!organization) {
      logger.warn({ companyId: this.companyId }, "Organization not found");
      return null;
    }
    return organization;
  }

  public async setDomain(domain?: string | null): Promise<void> {
    const logger = this.loggerFactory("setDomain");
    const normalized = domain?.trim().toLowerCase();
    logger.debug({ domain: normalized }, "Setting organization domain");
    const db = await getDbConnection();
    const organizations = db.collection<Organization>(
      ORGANIZATIONS_COLLECTION_NAME,
    );

    if (normalized) {
      const existingOrganization = await organizations.findOne({
        _id: { $ne: this.companyId },
        domain: normalized,
      });

      // Legacy fallback for domains stored in brand configuration.
      const configuration = db.collection<ConfigurationOptionWithCompanyId<"brand">>(
        CONFIGURATION_COLLECTION_NAME,
      );
      const existingBrandDomain = await configuration.findOne({
        companyId: { $ne: this.companyId },
        key: "brand",
        "value.domain": normalized,
      });

      if (existingOrganization || existingBrandDomain) {
        logger.warn({ domain: normalized }, "Domain is already in use");
        const error = new Error(DOMAIN_ALREADY_IN_USE_ERROR);
        error.name = DOMAIN_ALREADY_IN_USE_ERROR;
        throw error;
      }

      await organizations.updateOne(
        { _id: this.companyId },
        { $set: { domain: normalized } },
      );
      return;
    }

    await organizations.updateOne(
      { _id: this.companyId },
      { $unset: { domain: "" } },
    );
  }
}

export class StaticOrganizationService {
  public async getOrganizationBySlug(
    slug: string,
  ): Promise<Organization | null> {
    // console.debug("Getting organization by slug");
    const db = await getDbConnection();
    const organizations = db.collection<Organization>(
      ORGANIZATIONS_COLLECTION_NAME,
    );
    const organization = await organizations.findOne({ slug });
    if (!organization) {
      // console.warn({ slug }, "Organization not found by slug");
      return null;
    }
    return organization;
  }

  public async getOrganizationByDomain(
    domain: string,
  ): Promise<Organization | null> {
    const db = await getDbConnection();
    const organizations = db.collection<Organization>(
      ORGANIZATIONS_COLLECTION_NAME,
    );
    const organization = await organizations.findOne({ domain });
    if (!organization) {
      // console.warn({ domain }, "Organization not found by domain");
      return null;
    }
    return organization;
  }
}

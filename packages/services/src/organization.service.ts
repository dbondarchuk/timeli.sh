import {
  ConfigurationOptionWithCompanyId,
  IOrganizationService,
} from "@timelish/types";
import { Organization } from "@timelish/types/src/users/organization";
import {
  CONFIGURATION_COLLECTION_NAME,
  ORGANIZATIONS_COLLECTION_NAME,
} from "./collections";
import { getDbConnection } from "./database";
import { BaseService } from "./services/base.service";

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
    // console.debug("Getting organization by domain");
    const db = await getDbConnection();
    const organizations = db.collection<
      ConfigurationOptionWithCompanyId<"general">
    >(CONFIGURATION_COLLECTION_NAME);

    const configuration = await organizations.findOne({
      key: "general",
      "value.domain": domain,
    });

    if (!configuration) {
      // console.warn({ domain }, "Configuration not found by domain");
      return null;
    }

    const companyId = configuration.companyId;
    if (!companyId) {
      // console.warn({ domain }, "Company ID not found by domain");
      return null;
    }

    const organization = await new OrganizationService(
      companyId,
    ).getOrganization();
    if (!organization) {
      // console.warn({ companyId }, "Organization not found by company ID");
      return null;
    }

    return organization;
  }
}

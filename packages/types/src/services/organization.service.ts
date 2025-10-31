import { Organization } from "../users/organization";

export interface IOrganizationService {
  getOrganization(): Promise<Organization | null>;
}

import { Organization } from "../organizations";

export interface IOrganizationService {
  getOrganization(): Promise<Organization | null>;
  setDomain(domain?: string | null): Promise<void>;
}

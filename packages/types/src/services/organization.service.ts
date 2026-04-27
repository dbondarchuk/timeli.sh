import { EventSource } from "../events";
import { Organization } from "../organizations";

export interface IOrganizationService {
  getOrganization(): Promise<Organization | null>;
  setDomain(
    domain: string | null | undefined,
    source: EventSource,
  ): Promise<void>;
}

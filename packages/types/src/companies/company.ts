import { WithDatabaseId } from "../database";

export type CompanyStatus = "active" | "suspended" | "trial" | "cancelled";
export type CompanyPlan = "free" | "basic" | "pro" | "enterprise";

export type Company = WithDatabaseId<{
  name: string;
  subdomain?: string; // e.g., "acme" -> acme.timelish.com
  domain?: string; // e.g., "appointments.acme.com"
  status: CompanyStatus;
  plan: CompanyPlan;
  createdAt: Date;
  updatedAt: Date;
}>;

export const COMPANY_COLLECTION_NAME = "companies";

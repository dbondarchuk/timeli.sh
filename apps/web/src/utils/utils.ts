import { ServicesContainer } from "@vivid/services";
import { headers } from "next/headers";
import { cache } from "react";

export const getCompanyId = cache(async () => {
  const headersList = await headers();
  return headersList.get("x-company-id") as string;
});

export const getServicesContainer = cache(async () => {
  const companyId = await getCompanyId();
  return ServicesContainer(companyId);
});

export const getWebsiteUrl = cache(async () => {
  const headersList = await headers();
  const organizationDomain = headersList.get("x-organization-domain") as string;
  const organizationSlug = headersList.get("x-organization-slug") as string;
  return organizationDomain
    ? `https://${organizationDomain}`
    : `https://${organizationSlug}.${process.env.PUBLIC_DOMAIN}`;
});

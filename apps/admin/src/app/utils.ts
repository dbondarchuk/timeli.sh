import { ServicesContainer } from "@vivid/services";
import { headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

const getOrganizationIdAndSlug = async () => {
  const headersList = await headers();
  const organizationId = headersList.get("x-company-id") as string;
  const organizationSlug = headersList.get("x-organization-slug") as string;
  if (!organizationId || !organizationSlug) {
    const pathname = headersList.get("x-pathname");
    const isApiCall = pathname?.startsWith("/api");
    if (isApiCall) {
      unauthorized();
    }

    redirect("/auth/login");
  }

  return { organizationId, organizationSlug };
};

export const getSession = cache(async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    const pathname = headersList.get("x-pathname");
    const isApiCall = pathname?.startsWith("/api");
    if (isApiCall) {
      unauthorized();
    }

    redirect("/auth/login");
  }

  return session;
});

export const getServicesContainer = cache(async () => {
  const { organizationId } = await getOrganizationIdAndSlug();

  const servicesContainer = ServicesContainer(organizationId);
  return servicesContainer;
});

export const getCompanyId = cache(async () => {
  const { organizationId } = await getOrganizationIdAndSlug();
  return organizationId;
});

export const getWebsiteUrl = cache(async () => {
  const { organizationSlug, organizationId } = await getOrganizationIdAndSlug();

  const servicesContainer = ServicesContainer(organizationId);
  const { domain } =
    await servicesContainer.configurationService.getConfiguration("general");
  return domain
    ? `https://${domain}`
    : `https://${organizationSlug}.${process.env.PUBLIC_DOMAIN}`;
});

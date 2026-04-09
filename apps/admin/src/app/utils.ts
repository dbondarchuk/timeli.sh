import { ServicesContainer } from "@timelish/services";
import { headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

export const getOrganizationIdAndSlug = async () => {
  const headersList = await headers();
  const organizationId = headersList.get("x-organization-id") as string;
  const organizationSlug = headersList.get("x-organization-slug") as string;
  const organizationDomain = headersList.get("x-organization-domain") as string;
  if (!organizationId || !organizationSlug) {
    const pathname = headersList.get("x-pathname");
    const isApiCall = pathname?.startsWith("/api");
    if (isApiCall) {
      unauthorized();
    }

    redirect("/auth/signin");
  }

  return {
    organizationId,
    organizationSlug,
    organizationDomain,
  };
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

    redirect("/auth/signin");
  }

  return session;
});

export const getServicesContainer = cache(async () => {
  const { organizationId } = await getOrganizationIdAndSlug();

  const servicesContainer = ServicesContainer(organizationId);
  return servicesContainer;
});

export const getOrganizationId = cache(async () => {
  const { organizationId } = await getOrganizationIdAndSlug();
  return organizationId;
});

export const getWebsiteUrl = cache(async () => {
  const { organizationSlug, organizationDomain } =
    await getOrganizationIdAndSlug();

  const domain = organizationDomain?.trim();
  return domain
    ? `https://${domain}`
    : `https://${organizationSlug}.${process.env.PUBLIC_DOMAIN}`;
});

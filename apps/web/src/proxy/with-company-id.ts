import { StaticOrganizationService } from "@vivid/services";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { MiddlewareProxy } from "./types";

export const withCompanyId: MiddlewareProxy = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const { headers } = request;
    const hostname =
      headers.get("x-forwarded-host") || headers.get("host") || "";

    let slug: string;
    let companyId: string;
    if (hostname.endsWith(process.env.PUBLIC_DOMAIN!)) {
      slug = hostname.replace(`.${process.env.PUBLIC_DOMAIN!}`, "");
      const organization =
        await new StaticOrganizationService().getOrganizationBySlug(slug);
      if (!organization) {
        return new NextResponse("Organization not found", { status: 404 });
      }

      companyId = organization._id;
    } else if (process.env.ORGANIZATION_SLUG) {
      slug = process.env.ORGANIZATION_SLUG;
      const organization =
        await new StaticOrganizationService().getOrganizationBySlug(slug);
      if (!organization) {
        return new NextResponse("Organization not found", { status: 404 });
      }

      companyId = organization._id;
      slug = organization.slug;
    } else {
      const organization =
        await new StaticOrganizationService().getOrganizationByDomain(hostname);
      if (!organization) {
        return new NextResponse("Company not found", { status: 404 });
      }

      companyId = organization._id;
      slug = organization.slug;

      request.headers.set("x-organization-domain", hostname);
    }

    console.log("companyId", companyId, slug);

    request.headers.set("x-company-id", companyId);
    request.headers.set("x-organization-slug", slug);

    return next(request, event);
  };
};

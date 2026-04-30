import { StaticOrganizationService } from "@timelish/services";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { isSubscriptionInactive } from "@/utils/subscription-access";
import { ChainableProxy, MiddlewareProxy } from "./types";

const ORG_NOT_FOUND_PATH = "/organization-not-found";

function shouldSkipOrganizationLookup(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico" || pathname === "/icon.ico") return true;
  if (pathname === "/logo.png" || pathname === "/logo.svg") return true;
  return false;
}

function rewriteToOrganizationNotFoundPage(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = ORG_NOT_FOUND_PATH;
  return NextResponse.rewrite(url);
}

function responseWhenOrganizationNotFound(
  request: NextRequest,
  next: ChainableProxy,
  event: NextFetchEvent,
) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json(
      {
        success: false,
        code: "organization_not_found",
        message: "Organization not found",
      },
      { status: 404 },
    );
  }
  if (request.nextUrl.pathname === ORG_NOT_FOUND_PATH) {
    return next(request, event);
  }
  return rewriteToOrganizationNotFoundPage(request);
}

function responseWhenSubscriptionInactive(
  request: NextRequest,
  next: ChainableProxy,
  event: NextFetchEvent,
) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json(
      {
        success: false,
        code: "subscription_inactive",
        message: "Organization subscription is inactive",
      },
      { status: 402 },
    );
  }
  if (request.nextUrl.pathname === ORG_NOT_FOUND_PATH) {
    return next(request, event);
  }
  return rewriteToOrganizationNotFoundPage(request);
}

export const withOrganizationId: MiddlewareProxy = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    if (shouldSkipOrganizationLookup(request.nextUrl.pathname)) {
      return next(request, event);
    }

    const { headers } = request;
    const hostname =
      headers.get("x-forwarded-host") || headers.get("host") || "";

    let slug: string;
    let organizationId: string;
    let subscriptionStatus = "active";
    if (hostname.endsWith(process.env.PUBLIC_DOMAIN!)) {
      slug = hostname.replace(`.${process.env.PUBLIC_DOMAIN!}`, "");
      const organization =
        await new StaticOrganizationService().getOrganizationBySlug(slug);
      if (!organization) {
        return responseWhenOrganizationNotFound(request, next, event);
      }

      organizationId = organization._id;
      subscriptionStatus = organization.polarSubscriptionStatus || "active";
    } else if (process.env.ORGANIZATION_SLUG) {
      slug = process.env.ORGANIZATION_SLUG;
      const organization =
        await new StaticOrganizationService().getOrganizationBySlug(slug);
      if (!organization) {
        return responseWhenOrganizationNotFound(request, next, event);
      }

      organizationId = organization._id;
      slug = organization.slug;
      subscriptionStatus = organization.polarSubscriptionStatus || "active";
    } else {
      const organization =
        await new StaticOrganizationService().getOrganizationByDomain(hostname);
      if (!organization) {
        return responseWhenOrganizationNotFound(request, next, event);
      }

      organizationId = organization._id;
      slug = organization.slug;
      subscriptionStatus = organization.polarSubscriptionStatus || "active";
      request.headers.set("x-organization-domain", hostname);
    }

    if (isSubscriptionInactive(subscriptionStatus)) {
      return responseWhenSubscriptionInactive(request, next, event);
    }

    request.headers.set("x-organization-id", organizationId);
    request.headers.set("x-organization-slug", slug);

    return next(request, event);
  };
};

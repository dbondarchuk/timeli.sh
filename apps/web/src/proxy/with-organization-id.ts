import { isSubscriptionInactive } from "@/utils/subscription-access";
import { getBaseLoggerFactory } from "@timelish/logger";
import { StaticOrganizationService } from "@timelish/services";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { ChainableProxy, MiddlewareProxy } from "./types";

const ORG_NOT_FOUND_PATH = "/organization-not-found";

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
    if (request.nextUrl.pathname.startsWith("/_next")) {
      return next(request, event);
    }

    const { headers } = request;
    const hostname =
      headers.get("x-forwarded-host") || headers.get("host") || "";

    // const logger = getLoggerFactory("middleware")("withOrganizationId");
    const logger = getBaseLoggerFactory({
      correlationId: request.headers.get("x-correlation-id"),
      sessionId: request.headers.get("x-session-id"),
      hostname,
      url: request.url,
      method: request.method,
    });

    logger.debug("Looking up organization");

    let slug: string;
    let organizationId: string;
    let subscriptionStatus = "active";
    if (hostname.endsWith(process.env.PUBLIC_DOMAIN!)) {
      slug = hostname.replace(`.${process.env.PUBLIC_DOMAIN!}`, "");
      const organization =
        await new StaticOrganizationService().getOrganizationBySlug(slug);
      if (!organization) {
        logger.debug({ slug }, "Organization not found by slug");
        return responseWhenOrganizationNotFound(request, next, event);
      }

      organizationId = organization._id;
      subscriptionStatus = organization.polarSubscriptionStatus || "active";

      logger.debug(
        { organizationId, slug, subscriptionStatus },
        "Organization found by slug",
      );
    } else if (process.env.ORGANIZATION_SLUG) {
      slug = process.env.ORGANIZATION_SLUG;
      const organization =
        await new StaticOrganizationService().getOrganizationBySlug(slug);
      if (!organization) {
        logger.debug({ slug }, "Organization not found by slug: hardcoded");
        return responseWhenOrganizationNotFound(request, next, event);
      }

      organizationId = organization._id;
      slug = organization.slug;
      subscriptionStatus = organization.polarSubscriptionStatus || "active";

      logger.debug(
        { organizationId, slug, subscriptionStatus },
        "Organization found by slug: hardcoded",
      );
    } else {
      const organization =
        await new StaticOrganizationService().getOrganizationByDomain(hostname);
      if (!organization) {
        logger.debug("Organization not found by domain");
        return responseWhenOrganizationNotFound(request, next, event);
      }

      organizationId = organization._id;
      slug = organization.slug;
      subscriptionStatus = organization.polarSubscriptionStatus || "active";
      request.headers.set("x-organization-domain", hostname);

      logger.debug(
        { organizationId, slug, subscriptionStatus },
        "Organization found by domain",
      );
    }

    if (isSubscriptionInactive(subscriptionStatus)) {
      logger.debug(
        { organizationId, slug, subscriptionStatus },
        "Subscription inactive",
      );
      return responseWhenSubscriptionInactive(request, next, event);
    }

    request.headers.set("x-organization-id", organizationId);
    request.headers.set("x-organization-slug", slug);

    return next(request, event);
  };
};

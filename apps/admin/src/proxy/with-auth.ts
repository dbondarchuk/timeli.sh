import { auth } from "@/app/auth";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { MiddlewareProxy } from "./types";
import {
  containsAdminApi,
  containsAdminAuthApi,
  containsAdminDashboard,
} from "./utils";

export const withAuth: MiddlewareProxy = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const { nextUrl } = request;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session && !containsAdminAuthApi(nextUrl.pathname)) {
      if (containsAdminDashboard(nextUrl.pathname)) {
        const url = `/?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`;
        return NextResponse.redirect(new URL(url, request.url));
      }

      if (containsAdminApi(nextUrl.pathname)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    request.headers.set(
      "x-organization-id",
      session?.user.organizationId || "",
    );
    request.headers.set(
      "x-organization-slug",
      (session?.user as { organizationSlug?: string } | undefined)
        ?.organizationSlug || "",
    );

    request.headers.set(
      "x-organization-domain",
      (session?.user as { organizationDomain?: string } | undefined)
        ?.organizationDomain || "",
    );

    return next(request, event);
  };
};

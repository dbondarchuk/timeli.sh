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

    request.headers.set("x-company-id", session?.user.organizationId || "");
    request.headers.set(
      "x-organization-slug",
      session?.user.organizationSlug || "",
    );

    return next(request, event);
  };
};

import { NextFetchEvent, NextRequest } from "next/server";
import { MiddlewareProxy } from "./types";

export const withLocale: MiddlewareProxy = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    if (
      /^(\/_next\/static|\/_next\/image|\/favicon.ico)/.test(
        request.nextUrl.pathname,
      )
    )
      return next(request, event);

    const { nextUrl } = request;
    const locale = nextUrl.searchParams.get("lng");
    if (locale) {
      request.headers.set("x-locale", locale);
    }

    const isInstallPath =
      request.nextUrl.pathname.startsWith("/install") ||
      request.nextUrl.pathname.startsWith("/checkout") ||
      // We need to include this path in the install path because it's used to add options
      request.nextUrl.pathname.startsWith("/dashboard/services/options");

    request.headers.set("x-is-admin-path", "true");
    request.headers.set("x-pathname", nextUrl.pathname);
    request.headers.set("x-is-install-path", isInstallPath ? "true" : "false");

    return next(request, event);
  };
};

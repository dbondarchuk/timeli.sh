import { AuthResult } from "../app/admin/auth";

import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const { auth } = AuthResult;

import { MiddlewareFactory } from "./types";
import { containsAdminApi, containsAdminDashboard } from "./utils";

export const withAuth: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const { nextUrl } = request;
    const session = await auth();
    if (session == null) {
      if (containsAdminDashboard(nextUrl.pathname)) {
        const url = `/admin?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`;
        return NextResponse.redirect(new URL(url, request.url));
      }

      if (containsAdminApi(nextUrl.pathname)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return next(request, event);
  };
};

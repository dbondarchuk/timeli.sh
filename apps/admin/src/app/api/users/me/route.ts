import { auth } from "@/app/auth";
import { getServicesContainer, getSession } from "@/app/utils";
import { userUpdateSchema } from "@timelish/api-sdk";
import { getLoggerFactory } from "@timelish/logger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const logger = getLoggerFactory("AdminAPI/users/me")("GET");
  logger.debug("Getting current user information");
  const session = await getSession();
  if (!session) {
    logger.warn("Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  logger.debug({ userId: session.user.id }, "Authorized");

  const servicesContainer = await getServicesContainer();
  const user = await servicesContainer.userService.getUser(session.user.id);
  if (!user) {
    logger.warn({ userId: session.user.id }, "User not found");
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  logger.debug({ userId: session.user.id }, "User found");
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const logger = getLoggerFactory("AdminAPI/users/me")("PATCH");
  logger.debug("Updating current user information");
  const session = await getSession();
  if (!session) {
    logger.warn("Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error, success } = userUpdateSchema
    .partial()
    .safeParse(await request.json());

  if (!success) {
    logger.warn({ error }, "Invalid user update model format");
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  const { bio, calendarSources, ...rest } = data;
  const authBody: Record<string, any> = {
    ...rest,
  };

  if (Object.keys(rest).length > 0) {
    logger.debug({ rest }, "Updating auth fields");
    await auth.api.updateUser({ body: authBody, headers: await headers() });
  }

  const servicesContainer = await getServicesContainer();
  const userPatch: Record<string, unknown> = {};
  if ("bio" in data) {
    userPatch.bio = bio;
  }
  if ("calendarSources" in data) {
    userPatch.calendarSources = calendarSources;
  }
  if (Object.keys(userPatch).length > 0) {
    logger.debug({ userPatch }, "Updating user profile fields");
    await servicesContainer.userService.updateUser(session.user.id, userPatch);
  }

  const user = await servicesContainer.userService.getUser(session.user.id);

  if (!user) {
    logger.warn({ userId: session.user.id }, "User not found");
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  logger.debug({ userId: session.user.id }, "User updated");
  return NextResponse.json(user);
}

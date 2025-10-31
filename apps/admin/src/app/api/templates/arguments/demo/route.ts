import { getServicesContainer, getWebsiteUrl } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import {
  demoAppointment,
  demoWaitlistEntry,
  getAdminUrl,
  getArguments,
} from "@vivid/utils";
import { NextRequest, NextResponse } from "next/server";

export const fetchCache = "force-cache";
export const revalidate = 10;

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/templates-arguments-demo")("GET");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing templates arguments demo API request",
  );

  const searchParams = request.nextUrl.searchParams;

  logger.debug({}, "Fetching demo template arguments");

  const config = await servicesContainer.configurationService.getConfigurations(
    "booking",
    "general",
    "social",
  );

  const adminUrl = getAdminUrl();
  const websiteUrl = await getWebsiteUrl();

  const demoArguments = getArguments({
    appointment:
      searchParams.get("noAppointment") !== "true"
        ? demoAppointment
        : undefined,
    config,
    customer: demoAppointment.customer,
    locale: config.general.language,
    additionalProperties: {
      waitlistEntry:
        searchParams.get("waitlistEntry") === "true"
          ? demoWaitlistEntry
          : undefined,
    },
    adminUrl,
    websiteUrl,
  });

  logger.debug({}, "Successfully retrieved demo template arguments");

  const headers = new Headers();
  headers.append("Cache-Control", "max-age=10");

  return NextResponse.json(demoArguments, { headers });
}

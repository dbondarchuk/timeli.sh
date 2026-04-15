import { getServicesContainer } from "@/utils/utils";
import { getLoggerFactory } from "@timelish/logger";
import { IPaymentProcessor } from "@timelish/types";
import { NextResponse } from "next/server";

export async function GET() {
  const logger = getLoggerFactory(
    "API/.well-known/apple-developer-merchantid-domain-association",
  )("GET");

  try {
    const servicesContainer = await getServicesContainer();

    logger.debug("Getting apple pay domain association");

    const { defaultApps } =
      await servicesContainer.configurationService.getConfigurations(
        "defaultApps",
      );

    const paymentAppId = defaultApps?.paymentAppId;

    if (!paymentAppId) {
      logger.debug("No default payment app configured");
      return new NextResponse(null, { status: 404 });
    }

    const { app, service } =
      await servicesContainer.connectedAppsService.getAppService<IPaymentProcessor>(
        paymentAppId,
      );

    if (!service.getApplePayDomainAssociation) {
      logger.debug(
        { appId: paymentAppId },
        "Payment app does not support Apple Pay domain association",
      );
      return new NextResponse(null, { status: 404 });
    }

    logger.debug(
      { appId: paymentAppId, appName: app.name },
      "Getting apple pay domain association from payment app",
    );

    const content = await service.getApplePayDomainAssociation(app);

    if (!content) {
      logger.error(
        { appId: paymentAppId },
        "Apple Pay domain association file is empty or unavailable",
      );
      return new NextResponse(null, { status: 404 });
    }

    logger.debug(
      { appId: paymentAppId, appName: app.name },
      "Successfully served Apple Pay domain association file",
    );

    return new NextResponse(content, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    logger.error(
      { error: error?.message || error?.toString() },
      "Error serving Apple Pay domain association file",
    );
    return new NextResponse(null, { status: 500 });
  }
}

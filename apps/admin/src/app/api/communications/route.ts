import { getServicesContainer, getWebsiteUrl } from "@/app/utils";
import { renderToStaticMarkup } from "@vivid/email-builder/static";
import { getLoggerFactory } from "@vivid/logger";
import {
  Appointment,
  Customer,
  okStatus,
  sendCommunicationRequestSchema,
} from "@vivid/types";
import { getAdminUrl, getArguments, template } from "@vivid/utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/communications")("POST");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing communications API request",
  );

  const { error, success, data } = sendCommunicationRequestSchema.safeParse(
    await request.json(),
  );
  if (!success || !data || error) {
    logger.error(
      {
        error: error?.message || error?.toString(),
      },
      "Error parsing communication request",
    );
    return NextResponse.json(
      {
        error: "bad_data",
        message: error?.message,
      },
      { status: 400 },
    );
  }

  let customer: Customer;
  let appointment: Appointment | null = null;

  if ("appointmentId" in data) {
    appointment = await servicesContainer.eventsService.getAppointment(
      data.appointmentId,
    );

    if (!appointment) {
      logger.error(
        {
          error: "appointment_not_found",
          message: `Appointment ${data.appointmentId} was not found`,
        },
        "Appointment not found",
      );
      return NextResponse.json(
        {
          error: "appointment_not_found",
          message: `Appointment ${data.appointmentId} was not found`,
        },
        { status: 404 },
      );
    }

    customer = appointment.customer;
  } else {
    const _customer = await servicesContainer.customersService.getCustomer(
      data.customerId!, // Customer Id will be present
    );

    if (!_customer) {
      logger.error(
        {
          error: "customer_not_found",
          message: `Customer ${data.customerId} was not found`,
        },
        "Customer not found",
      );
      return NextResponse.json(
        {
          error: "customer_not_found",
          message: `Customer ${data.customerId} was not found`,
        },
        { status: 404 },
      );
    }

    customer = _customer;
  }

  const config = await servicesContainer.configurationService.getConfigurations(
    "booking",
    "general",
    "social",
  );

  const locale = config.general.language;
  const adminUrl = getAdminUrl();
  const websiteUrl = await getWebsiteUrl();
  const args = getArguments({
    appointment,
    config,
    customer,
    locale,
    adminUrl,
    websiteUrl,
  });

  const customerId = "customerId" in data ? data.customerId : undefined;
  const appointmentId =
    "appointmentId" in data ? data.appointmentId : undefined;

  const handledBy = customerId
    ? "communications.handledBy.customer"
    : "communications.handledBy.appointment";

  switch (data.channel) {
    case "text-message": {
      const body = template(data.content, args);
      await servicesContainer.notificationService.sendTextMessage({
        body,
        handledBy,
        participantType: "customer",
        phone: customer.phone,
        sender: config.general.name,
        customerId,
        appointmentId,
        webhookData: {
          customerId,
          appointmentId,
        },
      });

      break;
    }

    case "email": {
      const body = await renderToStaticMarkup({
        args: args,
        document: data.content,
      });

      await servicesContainer.notificationService.sendEmail({
        email: {
          body,
          subject: template(data.subject, args),
          to: customer.email,
        },
        handledBy,
        participantType: "customer",
        appointmentId,
        customerId,
      });
      break;
    }
  }

  logger.debug(
    {
      success: true,
      messageId: "Communication sent successfully",
    },
    "Communication sent successfully",
  );

  return NextResponse.json(okStatus);
}

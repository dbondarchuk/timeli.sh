import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { Appointment, Customer } from "@vivid/types";
import { getArguments } from "@vivid/utils";
import { NextRequest, NextResponse } from "next/server";

export const fetchCache = "force-cache";
export const revalidate = 10;

export async function GET(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/templates/arguments")("GET");

  logger.debug(
    {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
    "Processing templates arguments API request",
  );

  const params = request.nextUrl.searchParams;
  const appointmentId = params.get("appointmentId");
  const customerId = params.get("customerId");

  if (!appointmentId && !customerId) {
    logger.warn("Neither appointmentId nor customerId provided");
    return NextResponse.json(
      {
        code: "id_not_provided",
        error: "Neither appointmentId nor customerId provided",
        success: false,
      },
      { status: 400 },
    );
  }

  if (appointmentId && customerId) {
    logger.warn("Both appointmentId and customerId provided");
    return NextResponse.json(
      {
        code: "both_ids_provided",
        error: "Both appointmentId and customerId provided",
        success: false,
      },
      { status: 400 },
    );
  }

  logger.debug({ appointmentId, customerId }, "Fetching template arguments");

  const config =
    await ServicesContainer.ConfigurationService().getConfigurations(
      "booking",
      "general",
      "social",
    );

  let appointment: Appointment | null = null;
  let customer: Customer;

  if (appointmentId) {
    appointment =
      await ServicesContainer.EventsService().getAppointment(appointmentId);
    if (!appointment) {
      logger.warn({ appointmentId }, "Appointment not found");
      return NextResponse.json(
        { error: "appointment_not_found" },
        { status: 404 },
      );
    }

    customer = appointment.customer;
  } else {
    const _customer = await ServicesContainer.CustomersService().getCustomer(
      customerId!,
    );

    if (!_customer) {
      logger.warn({ customerId }, "Customer not found");
      return NextResponse.json(
        { error: "customer_not_found" },
        { status: 404 },
      );
    }

    customer = _customer;
  }

  const args = getArguments({
    appointment,
    config,
    customer,
    locale: config.general.language,
  });

  logger.debug(
    {
      appointmentId,
      customerId,
      argumentCount: Object.keys(args).length,
    },
    "Successfully retrieved template arguments",
  );

  const headers = new Headers();
  headers.append("Cache-Control", "max-age=10");

  return NextResponse.json(args, { headers });
}

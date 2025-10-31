import { getServicesContainer } from "@/utils/utils";
import { getLoggerFactory } from "@vivid/logger";
import {
  applyDiscountRequestSchema,
  ApplyDiscountResponse,
} from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("API/discounts")("POST");
  const servicesContainer = await getServicesContainer();
  logger.debug(
    {
      url: request.url,
      method: request.method,
    },
    "Processing discounts API request",
  );

  const body = await request.json();

  const { data, error, success } = applyDiscountRequestSchema.safeParse(body);
  if (!success) {
    logger.warn({ error }, "Invalid discount request format");
    return NextResponse.json(error, { status: 400 });
  }

  logger.debug(
    {
      code: data.code,
      customerEmail: data.email,
      optionId: data.optionId,
      addonsCount: data.addons?.length || 0,
    },
    "Applying discount",
  );

  const customer = await servicesContainer.customersService.findCustomer(
    data.email,
    data.phone,
  );

  const discount = await servicesContainer.servicesService.applyDiscount({
    code: data.code,
    optionId: data.optionId,
    addons: data.addons,
    customerId: customer?._id,
    dateTime: data.dateTime,
  });

  if (!discount) {
    logger.warn({ code: data.code }, "Discount code not found");
    return NextResponse.json({ error: "code_not_found" }, { status: 400 });
  }

  logger.debug(
    {
      code: data.code,
      type: discount.type,
      value: discount.value,
      customerFound: !!customer,
    },
    "Successfully applied discount",
  );

  return NextResponse.json({
    code: data.code,
    type: discount.type,
    value: discount.value,
  } satisfies ApplyDiscountResponse);
}

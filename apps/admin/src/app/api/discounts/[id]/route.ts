import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import { discountSchema, okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/discounts/[id]">,
) {
  const logger = getLoggerFactory("AdminAPI/discounts/[id]")("GET");
  const servicesContainer = await getServicesContainer();
  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      discountId: id,
    },
    "Processing get discount by ID API request",
  );

  const discount = await servicesContainer.servicesService.getDiscount(id);

  if (!discount) {
    logger.warn({ discountId: id }, "Discount not found");
    return NextResponse.json(
      {
        success: false,
        error: "Discount not found",
        code: "discount_not_found",
      },
      { status: 404 },
    );
  }

  logger.debug(
    { discountId: id, discountName: discount.name },
    "Discount found",
  );

  return NextResponse.json(discount);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext<"/api/discounts/[id]">,
) {
  const logger = getLoggerFactory("AdminAPI/discounts/[id]")("PUT");
  const servicesContainer = await getServicesContainer();
  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      discountId: id,
    },
    "Processing update discount by ID API request",
  );

  const body = await request.json();
  const { data, success, error } = discountSchema.safeParse(body);

  if (!success) {
    logger.warn({ error }, "Invalid discount update model format");
    return NextResponse.json(
      {
        success: false,
        error: "Invalid discount update model format",
        code: "invalid_request_format",
      },
      { status: 400 },
    );
  }

  await servicesContainer.servicesService.updateDiscount(id, data);

  logger.debug(
    { discountId: id, discountName: data.name },
    "Discount updated successfully",
  );

  return NextResponse.json(okStatus, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext<"/api/discounts/[id]">,
) {
  const logger = getLoggerFactory("AdminAPI/discounts/[id]")("DELETE");
  const servicesContainer = await getServicesContainer();
  const { id } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      discountId: id,
    },
    "Processing delete discount by ID API request",
  );

  const result = await servicesContainer.servicesService.deleteDiscount(id);

  if (!result) {
    logger.warn({ discountId: id }, "Discount not found");
    return NextResponse.json(
      {
        success: false,
        error: "Discount not found",
        code: "discount_not_found",
      },
      { status: 404 },
    );
  }

  logger.debug({ discountId: id }, "Discount deleted successfully");
  return NextResponse.json(result, { status: 200 });
}

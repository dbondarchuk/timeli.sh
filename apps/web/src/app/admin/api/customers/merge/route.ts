import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const mergeCustomersSchema = z.object({
  targetId: z.string().min(1, "Target ID is required"),
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
});

export async function POST(request: NextRequest) {
  const logger = getLoggerFactory("AdminAPI/customers/merge")("POST");
  const body = await request.json();

  logger.debug(
    {
      targetId: body.targetId,
      customerIds: body.ids,
      count: body.ids?.length || 0,
    },
    "Processing merge customers request",
  );

  const { data, error, success } = mergeCustomersSchema.safeParse(body);
  if (!success) {
    logger.warn({ error }, "Invalid merge customers request format");
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  try {
    await ServicesContainer.CustomersService().mergeCustomers(
      data.targetId,
      data.ids,
    );

    logger.debug(
      {
        targetId: data.targetId,
        customerIds: data.ids,
        count: data.ids.length,
      },
      "Customers merged successfully",
    );

    return NextResponse.json(okStatus);
  } catch (error: any) {
    logger.error(
      {
        targetId: data.targetId,
        customerIds: data.ids,
        count: data.ids.length,
        error: error?.message || error?.toString(),
      },
      "Failed to merge customers",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to merge customers",
        code: "merge_customers_failed",
      },
      { status: 500 },
    );
  }
}

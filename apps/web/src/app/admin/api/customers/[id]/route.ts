import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { customerSchema, okStatus } from "@vivid/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/customers/[id]")("GET");
  const { id } = await params;

  logger.debug(
    {
      customerId: id,
    },
    "Getting customer by ID",
  );

  try {
    const customer = await ServicesContainer.CustomersService().getCustomer(id);

    if (!customer) {
      logger.warn({ customerId: id }, "Customer not found");
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
          code: "customer_not_found",
        },
        { status: 404 },
      );
    }

    logger.debug(
      {
        customerId: id,
        customerName: customer.name,
        customerEmail: customer.email,
      },
      "Successfully retrieved customer",
    );

    return NextResponse.json(customer);
  } catch (error: any) {
    logger.error(
      {
        customerId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to get customer",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get customer",
        code: "get_customer_failed",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/customers/[id]")("PUT");
  const { id } = await params;
  const body = await request.json();

  logger.debug(
    {
      customerId: id,
      customerName: body.name,
      customerEmail: body.email,
    },
    "Updating customer",
  );

  const { data, error, success } = customerSchema.safeParse(body);
  if (!success) {
    logger.warn(
      { error, customerId: id },
      "Invalid customer update model format",
    );
    return NextResponse.json(
      { error, success: false, code: "invalid_request_format" },
      { status: 400 },
    );
  }

  try {
    await ServicesContainer.CustomersService().updateCustomer(id, data);

    logger.debug(
      {
        customerId: id,
        customerName: data.name,
        customerEmail: data.email,
      },
      "Customer updated successfully",
    );

    return NextResponse.json(okStatus);
  } catch (error: any) {
    logger.error(
      {
        customerId: id,
        customerName: data.name,
        customerEmail: data.email,
        error: error?.message || error?.toString(),
      },
      "Failed to update customer",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update customer",
        code: "update_customer_failed",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const logger = getLoggerFactory("AdminAPI/customers/[id]")("DELETE");
  const { id } = await params;

  logger.debug(
    {
      customerId: id,
    },
    "Deleting customer",
  );

  try {
    const customer =
      await ServicesContainer.CustomersService().deleteCustomer(id);

    if (!customer) {
      logger.warn({ customerId: id }, "Customer not found for deletion");
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
          code: "customer_not_found",
        },
        { status: 404 },
      );
    }

    logger.debug(
      {
        customerId: id,
        customerName: customer.name,
        customerEmail: customer.email,
      },
      "Customer deleted successfully",
    );

    return NextResponse.json(okStatus);
  } catch (error: any) {
    logger.error(
      {
        customerId: id,
        error: error?.message || error?.toString(),
      },
      "Failed to delete customer",
    );
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete customer",
        code: "delete_customer_failed",
      },
      { status: 500 },
    );
  }
}

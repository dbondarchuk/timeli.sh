import { getLoggerFactory } from "@vivid/logger";
import { NextRequest } from "next/server";
import { createOrUpdateIntent } from "../../../../utils/payments/createIntent";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ intentId: string }> },
) {
  const logger = getLoggerFactory("API/payments-intent")("POST");
  const { intentId } = await params;

  logger.debug(
    {
      url: request.url,
      method: request.method,
      intentId,
    },
    "Processing payment intent API request",
  );

  try {
    const result = await createOrUpdateIntent(request, intentId);

    if (!result || result.status >= 400) {
      logger.error(
        {
          status: result.status,
        },
        "Getting if payment is required has failed",
      );
    } else {
      logger.debug(
        {
          intentId,
          success: true,
        },
        "Successfully processed payment intent",
      );
    }

    return result;
  } catch (error: any) {
    logger.error(
      {
        intentId,
        error: error?.message || error?.toString(),
      },
      "Error processing payment intent",
    );
    throw error;
  }
}

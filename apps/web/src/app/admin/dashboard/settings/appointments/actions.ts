"use server";

import { getLoggerFactory } from "@vivid/logger";
import { ServicesContainer } from "@vivid/services";
import { BookingConfiguration } from "@vivid/types";

const logger = getLoggerFactory("BookingConfigurationActions");

export async function updateBookingConfiguration(data: BookingConfiguration) {
  const actionLogger = logger("updateBookingConfiguration");

  actionLogger.debug(
    {
      optionsCount: data.options.length,
    },
    "Updating booking configuration",
  );

  try {
    await ServicesContainer.ConfigurationService().setConfiguration(
      "booking",
      data,
    );

    actionLogger.debug(
      {
        optionsCount: data.options.length,
      },
      "Booking configuration updated successfully",
    );
  } catch (error) {
    actionLogger.error(
      {
        optionsCount: data.options.length,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to update booking configuration",
    );
    throw error;
  }
}

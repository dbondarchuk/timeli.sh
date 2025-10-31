"use server";

import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import { StylingConfiguration } from "@vivid/types";

const logger = getLoggerFactory("StylingConfigurationActions");

export async function updateStylingConfiguration(data: StylingConfiguration) {
  const actionLogger = logger("updateStylingConfiguration");
  const servicesContainer = await getServicesContainer();
  actionLogger.debug(
    {
      hasPrimaryColor: !!data.colors?.find((c) => c.type === "primary")?.value,
      hasSecondaryColor: !!data.colors?.find((c) => c.type === "secondary"),
      hasAccentColor: !!data.colors?.find((c) => c.type === "accent"),
      hasFontFamily: !!data.fonts?.primary,
    },
    "Updating styling configuration",
  );

  try {
    await servicesContainer.configurationService.setConfiguration(
      "styling",
      data,
    );

    actionLogger.debug(
      {
        hasPrimaryColor: !!data.colors?.find((c) => c.type === "primary")
          ?.value,
        hasSecondaryColor: !!data.colors?.find((c) => c.type === "secondary")
          ?.value,
        hasAccentColor: !!data.colors?.find((c) => c.type === "accent")?.value,
        hasFontFamily: !!data.fonts?.primary,
      },
      "Styling configuration updated successfully",
    );
  } catch (error) {
    actionLogger.error(
      {
        hasPrimaryColor: !!data.colors?.find((c) => c.type === "primary")
          ?.value,
        hasSecondaryColor: !!data.colors?.find((c) => c.type === "secondary")
          ?.value,
        hasAccentColor: !!data.colors?.find((c) => c.type === "accent")?.value,
        hasFontFamily: !!data.fonts?.primary,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to update styling configuration",
    );
    throw error;
  }
}

"use server";

import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@timelish/logger";
import { siteSettingsFormSchema } from "./site-settings-schema";

export type SaveSiteSettingsResult =
  | { ok: true }
  | { ok: false; code: "invalid_input" | "persist_failed" };

export async function saveSiteSettingsAction(
  input: unknown,
): Promise<SaveSiteSettingsResult> {
  const logger = getLoggerFactory("SiteSettingsActions")("saveSiteSettings");
  const parsed = siteSettingsFormSchema.safeParse(input);
  if (!parsed.success) {
    logger.warn(
      { issues: parsed.error.flatten() },
      "Invalid site settings payload",
    );
    return { ok: false, code: "invalid_input" };
  }

  const services = await getServicesContainer();
  const d = parsed.data;

  try {
    await services.configurationService.setConfiguration("general", d.general);
    await services.configurationService.setConfiguration("brand", d.brand);
    await services.configurationService.setConfiguration("social", d.social);
    await services.configurationService.setConfiguration("styling", d.styling);
    logger.debug("Persisted site settings (general, brand, social, styling)");
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to persist site settings",
    );
    return { ok: false, code: "persist_failed" };
  }

  return { ok: true };
}

"use server";

import { StaticOrganizationService } from "@timelish/services";

export async function checkOrganizationSlug(
  slug: string,
  currentOrganizationId?: string | null,
) {
  const existing = await new StaticOrganizationService().getOrganizationBySlug(
    slug,
  );
  if (!existing) return true;
  if (
    currentOrganizationId &&
    String(existing._id) === String(currentOrganizationId)
  ) {
    return true;
  }
  return false;
}

"use server";

import { getDbConnection } from "@vivid/services/database";
import { Organization } from "better-auth/plugins/organization";

export async function checkOrganizationSlug(slug: string) {
  const db = await getDbConnection();
  const organization = await db
    .collection<Organization>("organization")
    .findOne({
      slug,
    });

  return !organization;
}

"use server";

import { auth } from "@/app/auth";
import { resolveAppOrigin } from "@/lib/resolve-app-origin";
import { getPolarClient } from "@timelish/services";
import { ORGANIZATIONS_COLLECTION_NAME } from "@timelish/services/collections";
import { getDbConnection } from "@timelish/services/database";
import type { Organization } from "@timelish/types";
import { headers } from "next/headers";

export async function createPolarBillingPortalSession(): Promise<
  { ok: true; url: string } | { ok: false; code: string }
> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized" };
  }

  const organizationId = (
    session.user as { organizationId?: string }
  ).organizationId?.trim();
  if (!organizationId) {
    return { ok: false, code: "no_org" };
  }

  const db = await getDbConnection();
  const org = await db
    .collection<Organization>(ORGANIZATIONS_COLLECTION_NAME)
    .findOne(
      { _id: organizationId },
      { projection: { feesExempt: 1, name: 1 } },
    );

  if (org?.feesExempt === true) {
    return { ok: false, code: "fees_exempt" };
  }

  const polarBilling = getPolarClient();
  await polarBilling.ensureTeamCustomerForOrganization({
    organizationId,
    ownerUserId: session.user.id,
    ownerEmail: session.user.email,
    ownerName: session.user.name,
    teamName: org?.name,
  });

  const origin = await resolveAppOrigin();
  const returnUrl = `${origin}/dashboard/settings/brand`;

  try {
    const portalSession = await polarBilling.createCustomerBillingPortalSession(
      {
        externalCustomerId: organizationId,
        returnUrl,
      },
    );
    return { ok: true, url: portalSession.customerPortalUrl };
  } catch {
    return { ok: false, code: "polar_error" };
  }
}

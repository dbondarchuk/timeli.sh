"use server";

import { auth } from "@/app/auth";
import { resolveAppOrigin } from "@/lib/resolve-app-origin";
import { getPolarClient } from "@timelish/services";
import { ORGANIZATIONS_COLLECTION_NAME } from "@timelish/services/collections";
import { getDbConnection } from "@timelish/services/database";
import type { Organization } from "@timelish/types";
import { headers } from "next/headers";
import * as z from "zod";

const createCheckoutInputSchema = z.object({
  productId: z.string().min(1),
  organizationId: z.string().min(1),
  /** All billable product ids (selected product should be first in the Polar session). */
  productIds: z.array(z.string().min(1)).min(1),
});

/**
 * Polar checkout session (SDK), same pattern as
 * https://dev.to/phumudzosly/polarsh-betterauth-for-organizations-1j1b — metadata.org for webhooks.
 */
export async function createPolarCheckoutSession(
  input: z.infer<typeof createCheckoutInputSchema>,
): Promise<{ ok: true; url: string } | { ok: false; code: string }> {
  const parsed = createCheckoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input" };
  }

  const { productId, organizationId, productIds } = parsed.data;
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized" };
  }
  if (!(session.user as { emailVerified?: boolean }).emailVerified) {
    return { ok: false, code: "email_not_verified" };
  }

  const sessionOrg = (
    session.user as { organizationId?: string }
  ).organizationId?.trim();
  if (!sessionOrg || sessionOrg !== organizationId) {
    return { ok: false, code: "organization_mismatch" };
  }

  const products = [productId, ...productIds.filter((id) => id !== productId)];

  const origin = await resolveAppOrigin();
  const successUrl = `${origin}/install?checkout_id={CHECKOUT_ID}`;

  const db = await getDbConnection();
  const org = await db
    .collection<Organization>(ORGANIZATIONS_COLLECTION_NAME)
    .findOne({ _id: organizationId }, { projection: { name: 1 } });

  const polarBilling = getPolarClient();
  await polarBilling.ensureTeamCustomerForOrganization({
    organizationId,
    ownerUserId: session.user.id,
    ownerEmail: session.user.email,
    ownerName: session.user.name,
    teamName: org?.name,
  });

  try {
    const checkoutSession = await polarBilling.createCheckoutSession({
      products,
      metadata: {
        org: organizationId,
      },
      customerEmail: session.user.email,
      externalCustomerId: organizationId,
      successUrl,
      returnUrl: `${origin}/checkout`,
    });

    return { ok: true, url: checkoutSession.url };
  } catch {
    return { ok: false, code: "polar_checkout_failed" };
  }
}

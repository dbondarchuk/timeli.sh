import { auth } from "@/app/auth";
import { getPolarClient } from "@timelish/services";
import { ORGANIZATIONS_COLLECTION_NAME } from "@timelish/services/collections";
import { getDbConnection } from "@timelish/services/database";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";

/**
 * Ensures the signed-in user has an organization document for org-level Polar billing
 * (placeholder slug/name until install step 1 updates them).
 */
export async function ensureBillingOrganizationForUser(): Promise<string> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const existing = (
    session.user as { organizationId?: string }
  ).organizationId?.trim();
  if (existing) return existing;

  const db = await getDbConnection();
  const orgId = new ObjectId().toString();
  const slug = `pending-${orgId}`;

  await db
    .collection<{
      _id: string;
      slug: string;
      name: string;
      createdAt: Date;
      isInstalled: boolean;
    }>(ORGANIZATIONS_COLLECTION_NAME)
    .insertOne({
      _id: orgId,
      slug,
      name: session.user.name,
      createdAt: new Date(),
      isInstalled: false,
    });

  const adapter = (await auth.$context).adapter;
  await adapter.update({
    model: "users",
    where: [
      // @ts-ignore better-auth mongodb adapter ObjectId user id
      { field: "id", operator: "eq", value: new ObjectId(session.user.id) },
    ],
    update: { organizationId: orgId },
  });

  await getPolarClient().ensureTeamCustomerForOrganization({
    organizationId: orgId,
    ownerUserId: session.user.id,
    ownerEmail: session.user.email,
    ownerName: session.user.name,
    teamName: session.user.name,
  });

  return orgId;
}

"use server";

import { auth } from "@/app/auth";
import { languages } from "@timelish/i18n";
import { getLoggerFactory } from "@timelish/logger";
import { StaticOrganizationService } from "@timelish/services";
import { CONFIGURATION_COLLECTION_NAME, ORGANIZATIONS_COLLECTION_NAME } from "@timelish/services/collections";
import { getDbConnection } from "@timelish/services/database";
import { generalConfigurationSchema, type ConfigurationOption, type Organization, zCountry, zCurrency, zTimeZone } from "@timelish/types";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import * as z from "zod";
import { getDefaultBookingConfiguration } from "../default-booking";

const workspaceInputSchema = z.object({
  businessName: z.string().min(2).max(128),
  address: z.string().trim().max(256).optional().default(""),
  slug: z
    .string()
    .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/)
    .max(64),
  timeZone: zTimeZone,
  language: z.enum(languages),
  country: zCountry,
  currency: zCurrency,
});

export type CreateWorkspaceInput = z.infer<typeof workspaceInputSchema>;

export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<{ ok: true; updated: boolean } | { ok: false; code: string }> {
  const logger = getLoggerFactory("InstallActions")("createWorkspace");
  logger.debug({ input }, "Creating workspace");
  const workspaceInputSchemaResult = workspaceInputSchema.safeParse(input);
  if (!workspaceInputSchemaResult.success) {
    logger.error({ error: workspaceInputSchemaResult.error }, "Invalid workspace input");
    return { ok: false, code: "invalid_input" };
  }
  const parsed = workspaceInputSchemaResult.data;
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user) {
    logger.error({ session }, "Unauthorized");
    return { ok: false, code: "unauthorized" };
  }
  if (!(session.user as { emailVerified?: boolean }).emailVerified) {
    logger.error({ userId: session.user.id }, "Email not verified");
    return { ok: false, code: "email_not_verified" };
  }

  const wasExistingOrg = Boolean(
    (session.user as { organizationId?: string }).organizationId,
  );
  const db = await getDbConnection();
  let orgId: string;
  if (session.user.organizationId) {
    orgId = session.user.organizationId;
    const taken = await new StaticOrganizationService().getOrganizationBySlug(
      parsed.slug,
    );
    if (taken && String(taken._id) !== String(orgId)) {
      logger.error({ slug: parsed.slug, orgId }, "Slug taken");
      return { ok: false, code: "slug_taken" };
    }
    await db.collection<Organization>(ORGANIZATIONS_COLLECTION_NAME).updateOne(
      { _id: orgId },
      { $set: { slug: parsed.slug, name: parsed.businessName } },
    );
  } else {
    const taken = await new StaticOrganizationService().getOrganizationBySlug(
      parsed.slug,
    );
    if (taken) {
      logger.error({ slug: parsed.slug }, "Slug taken");
      return { ok: false, code: "slug_taken" };
    }
    orgId = new ObjectId().toString();
    await db.collection<{
      _id: string;
      slug: string;
      name: string;
      createdAt: Date;
    }>(ORGANIZATIONS_COLLECTION_NAME).insertOne({
      _id: orgId,
      slug: parsed.slug,
      name: parsed.businessName,
      createdAt: new Date(),
    });
  }

  const adapter = (await auth.$context).adapter;
  await adapter.update({
    model: "users",
    where: [{ field: "id", operator: "eq", value: session.user.id }],
    update: { organizationId: orgId },
  });
  logger.debug({ orgId, userId: session.user.id }, "Assigned user to organization");

  const generalValue = generalConfigurationSchema.parse({
    name: parsed.businessName,
    title: parsed.businessName,
    description: `${parsed.businessName} — Book online with Timeli.sh.`,
    keywords: `${parsed.businessName}, booking`,
    address: parsed.address || "",
    email: session.user.email,
    phone: session.user.phone,
    country: parsed.country,
    currency: parsed.currency,
    language: parsed.language,
    timeZone: parsed.timeZone,
  });

  const configurations = db.collection<
    ConfigurationOption<"general"> | ConfigurationOption<"booking">
  >(CONFIGURATION_COLLECTION_NAME);
  await configurations.updateOne(
    { key: "general", companyId: orgId },
    { $set: { key: "general", companyId: orgId, value: generalValue } },
    { upsert: true },
  );
  logger.debug({ orgId }, "Stored general configuration");

  const existingBooking = await configurations.findOne({
    key: "booking",
    companyId: orgId,
  } as any);
  if (!existingBooking?.value || Object.keys(existingBooking.value).length === 0) {
    await configurations.updateOne(
      { key: "booking", companyId: orgId },
      {
        $set: {
          key: "booking",
          companyId: orgId,
          value: getDefaultBookingConfiguration(),
        },
      },
      { upsert: true },
    );
    logger.debug({ orgId }, "Stored default booking configuration");
  }

  logger.debug({ orgId }, "Created or updated workspace");
  return { ok: true, updated: wasExistingOrg };
}


import { getLoggerFactory } from "@timelish/logger";
import type { Organization } from "@timelish/types";
import { ORGANIZATIONS_COLLECTION_NAME } from "../collections";
import { getDbConnection } from "../database";
import { getPolarClient } from "./client";
import { getPolarSmsCreditsMeterIdFromEnv } from "./sms-credits-meter-env";

const logger = getLoggerFactory("PolarSmsCreditsGuard");

export class SmsCreditsExhaustedError extends Error {
  readonly code = "sms_credits_exhausted" as const;

  constructor(
    message = "SMS subscription credits are exhausted. Add credits or upgrade your plan.",
  ) {
    super(message);
    this.name = "SmsCreditsExhaustedError";
  }
}

/**
 * Blocks built-in text messaage sends when the org’s Polar customer meter balance is zero.
 * No-op when `POLAR_SMS_CREDITS_METER_ID` or `POLAR_ACCESS_TOKEN` is missing, when the org is
 * fees-exempt, or when Polar cannot be reached (logs a warning; send is allowed).
 */
export async function assertOrgSmsCreditsAvailableForBuiltInSend(
  organizationId: string,
): Promise<void> {
  const meterId = getPolarSmsCreditsMeterIdFromEnv();
  const polar = getPolarClient();
  if (!meterId || !polar) return;

  const orgId = organizationId.trim();
  if (!orgId) return;

  const db = await getDbConnection();
  const org = await db
    .collection<Organization>(ORGANIZATIONS_COLLECTION_NAME)
    .findOne({ _id: orgId }, { projection: { feesExempt: 1 } });

  if (org?.feesExempt === true) return;

  try {
    const page = await polar.customerMeters.list({
      externalCustomerId: orgId,
      meterId,
      limit: 10,
    });

    const row =
      page.result.items.find((m) => m.meterId === meterId) ??
      page.result.items[0];

    const balance = row ? Math.max(0, row.balance) : 0;
    if (balance <= 0) {
      throw new SmsCreditsExhaustedError();
    }
  } catch (error) {
    if (error instanceof SmsCreditsExhaustedError) throw error;
    logger("assertOrgSmsCreditsAvailableForBuiltInSend").warn(
      { error, organizationId: orgId },
      "Polar SMS credits check failed; allowing send",
    );
  }
}

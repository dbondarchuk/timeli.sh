import type { BillingPlanTier } from "@timelish/types";

export type PolarBillingPlanDef = {
  slug: BillingPlanTier;
  productId: string;
};

/**
 * Env: `POLAR_BILLING_PLANS=free:prod_xxx,pro:prod_yyy`
 */
export function getPolarBillingPlansFromEnv(): PolarBillingPlanDef[] {
  const raw = process.env.POLAR_BILLING_PLANS?.trim();
  if (raw) {
    return raw.split(",").map((part) => {
      const [slug, productId] = part.split(":").map((s) => s.trim());
      if (!slug || !productId) {
        throw new Error(
          `Invalid POLAR_BILLING_PLANS entry "${part}" (expected slug:productId)`,
        );
      }
      if (slug !== "free" && slug !== "pro") {
        throw new Error(
          `Invalid POLAR_BILLING_PLANS slug "${slug}" (expected free or pro)`,
        );
      }
      return { slug, productId };
    });
  }

  throw new Error("Set POLAR_BILLING_PLANS for billing");
}

export function getBillingPlanProductIdMap(): Map<string, BillingPlanTier> {
  const map = new Map<string, BillingPlanTier>();
  for (const plan of getPolarBillingPlansFromEnv()) {
    map.set(plan.productId, plan.slug);
  }
  return map;
}

export function getBillingPlanProductIdForTier(
  tier: BillingPlanTier,
): string | null {
  const plan = getPolarBillingPlansFromEnv().find((p) => p.slug === tier);
  return plan?.productId ?? null;
}

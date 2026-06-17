import type { BillingPlanTier } from "@timelish/types";

export type PolarBillingPlanDef = {
  slug: BillingPlanTier;
  productId: string;
};

/**
 * Env: `POLAR_BILLING_PLANS=free:prod_xxx,pro:prod_yyy`
 * Fallback: `POLAR_PRODUCT_ID` with slug `pro`.
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

  const legacy = process.env.POLAR_PRODUCT_ID?.trim();
  if (legacy) {
    return [{ slug: "pro", productId: legacy }];
  }

  throw new Error("Set POLAR_BILLING_PLANS or POLAR_PRODUCT_ID for billing");
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

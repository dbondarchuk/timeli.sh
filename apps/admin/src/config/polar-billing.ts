import { InstallKeys } from "@timelish/i18n";

export type PolarBillingPlanSlug = "pro";
export type PolarBillingPlanDef = {
  slug: PolarBillingPlanSlug;
  productId: string;
};

/**
 * Env: `POLAR_BILLING_PLANS=pro:prod_xxx,starter:prod_yyy`
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
      return { slug: slug as PolarBillingPlanSlug, productId };
    });
  }

  const legacy = process.env.POLAR_PRODUCT_ID?.trim();
  if (legacy) {
    return [{ slug: "pro", productId: legacy }];
  }

  throw new Error("Set POLAR_BILLING_PLANS or POLAR_PRODUCT_ID for billing");
}

/**
 * App-defined benefits per checkout slug (i18n keys under `install` namespace).
 */
export const POLAR_CHECKOUT_PLAN_BENEFIT_I18N_KEYS: Record<
  PolarBillingPlanSlug,
  InstallKeys[]
> = {
  pro: [
    "checkout.plans.pro.benefits.bookings",
    "checkout.plans.pro.benefits.branding",
    "checkout.plans.pro.benefits.domain",
    "checkout.plans.pro.benefits.calendar",
    "checkout.plans.pro.benefits.payments",
    "checkout.plans.pro.benefits.emailNotifications",
    "checkout.plans.pro.benefits.textNotifications",
    "checkout.plans.pro.benefits.smsCredits",
  ],
};

/** Polar benefit id on the subscribed product (`meter_credit`); meter id from `sub.product.benefits`. */
export function getPolarSmsCreditsBenefitIdFromEnv(): string | undefined {
  const raw = process.env.POLAR_SMS_CREDITS_BENEFIT_ID?.trim();
  return raw || undefined;
}

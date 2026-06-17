import { InstallKeys } from "@timelish/i18n";
import {
  getPolarBillingPlansFromEnv,
  resolvePlanTierFromProductId,
  type PolarBillingPlanDef,
} from "@timelish/services/billing";
import type { BillingPlanTier } from "@timelish/types";

export type PolarBillingPlanSlug = BillingPlanTier;
export type { PolarBillingPlanDef };

export { getPolarBillingPlansFromEnv, resolvePlanTierFromProductId };

/**
 * App-defined benefits per checkout slug (i18n keys under `install` namespace).
 */
export const POLAR_CHECKOUT_PLAN_BENEFIT_I18N_KEYS: Record<
  PolarBillingPlanSlug,
  InstallKeys[]
> = {
  free: [
    "checkout.plans.free.benefits.bookings",
    "checkout.plans.free.benefits.services",
    "checkout.plans.free.benefits.pages",
    "checkout.plans.free.benefits.branding",
    "checkout.plans.free.benefits.calendar",
    "checkout.plans.free.benefits.emailNotifications",
    "checkout.plans.free.benefits.textNotifications",
  ],
  pro: [
    "checkout.plans.pro.benefits.bookings",
    "checkout.plans.pro.benefits.services",
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

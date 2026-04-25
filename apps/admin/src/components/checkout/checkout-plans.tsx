"use client";

import { createPolarCheckoutSession } from "@/components/checkout/actions";
import { PolarBillingPlanSlug } from "@/config/polar-billing";
import { useI18n } from "@timelish/i18n";
import { Button, Spinner, toast } from "@timelish/ui";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

const ACCENT = "#1d63a8";
const PRICE_BG = "#f9f7f2";

export type CheckoutPlanView = {
  productId: string;
  slug: PolarBillingPlanSlug;
  name: string;
  cardTitle: string;
  cardSubtitle: string | null;
  priceAmount: string | null;
  pricePeriod: string | null;
  benefits: string[];
};

export function CheckoutPlans({
  organizationId,
  plans,
}: {
  organizationId: string;
  plans: CheckoutPlanView[];
}) {
  const t = useI18n("install");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const productIds = plans.map((p) => p.productId);

  const startCheckout = async (productId: string) => {
    setLoadingId(productId);
    const result = await createPolarCheckoutSession({
      productId,
      organizationId,
      productIds,
    });
    if (!result.ok) {
      toast.error(t("checkout.checkoutError"));
      setLoadingId(null);
      return;
    }
    window.location.assign(result.url);
  };

  const gridClass =
    plans.length === 1
      ? "mx-auto w-full max-w-md"
      : "grid gap-8 md:grid-cols-2 lg:max-w-5xl lg:mx-auto";

  return (
    <div className={gridClass}>
      {plans.map((plan) => (
        <div
          key={plan.productId}
          className="flex flex-col rounded-xl border border-neutral-200/80 bg-card p-6 shadow-sm md:p-7"
        >
          <div className="mb-5 flex gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
              style={{ backgroundColor: ACCENT }}
            >
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 className="text-lg font-semibold leading-tight text-foreground">
                {plan.cardTitle}
              </h2>
              {plan.cardSubtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.cardSubtitle}
                </p>
              ) : null}
            </div>
          </div>

          {plan.priceAmount ? (
            <div
              className="mb-5 rounded-lg px-4 py-4"
              style={{ backgroundColor: PRICE_BG }}
            >
              <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  {plan.priceAmount}
                </span>
                {plan.pricePeriod ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    {plan.pricePeriod}
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}

          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("checkout.includedLabel")}
          </p>
          <ul className="mb-6 flex flex-1 flex-col gap-2.5">
            {plan.benefits.map((line, i) => (
              <li
                key={`${plan.productId}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-neutral-200/90 bg-background px-3 py-2.5 text-sm leading-snug text-foreground"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full rounded-lg border-0 bg-[#1d63a8] font-semibold text-white shadow-sm hover:bg-[#174d86]"
            size="lg"
            onClick={() => void startCheckout(plan.productId)}
            disabled={loadingId !== null}
          >
            {loadingId === plan.productId ? (
              <Spinner className="mr-2 h-4 w-4 animate-spin text-white" />
            ) : null}
            {t.has(`checkout.plans.${plan.slug}.cta`)
              ? t(`checkout.plans.${plan.slug}.cta`)
              : t("checkout.cta")}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t("checkout.disclaimer")}
          </p>
        </div>
      ))}
    </div>
  );
}

"use client";

import { createPolarBillingPortalSession } from "@/app/dashboard/settings/brand/billing-portal";
import { useI18n, useLocale } from "@timelish/i18n";
import type { OrganizationBillingSubscriptionDetails } from "@timelish/types";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
  toast,
} from "@timelish/ui";
import { ExternalLink } from "lucide-react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useMemo, useState } from "react";

function formatMediumDate(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const dt = DateTime.fromISO(iso, { zone: "utc" });
  if (!dt.isValid) return null;
  return dt.setLocale(locale).toLocaleString(DateTime.DATE_MED);
}

function hasActiveLikeSubscription(status: string | null | undefined): boolean {
  const s = status?.trim().toLowerCase();
  return s === "active" || s === "trialing" || s === "past_due";
}

export function GeneralBillingCard({
  details,
}: {
  details: OrganizationBillingSubscriptionDetails;
}) {
  const t = useI18n("admin");
  const locale = useLocale();
  const [opening, setOpening] = useState(false);

  const subscriptionPriceLabel = useMemo(() => {
    const price = details.subscriptionPrice;
    if (!price) return null;
    const amount = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: price.currency,
    }).format(price.amountCents / 100);

    return price.recurringInterval
      ? t(
          `settings.general.billing.priceWithIntervalLabel.${price.recurringInterval}`,
          { price: amount },
        )
      : amount;
  }, [locale, details.subscriptionPrice, t]);

  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  }, [locale]);

  let primary: string;
  let secondary: string | undefined;
  if (details.feesExempt) {
    primary = t("settings.general.billing.statusFeesExempt");
    secondary = t("settings.general.billing.statusFeesExemptHint");
  } else {
    const raw = details.status?.trim();
    if (!raw) {
      primary = t("settings.general.billing.statusNone");
      secondary = undefined;
    } else {
      const s = raw.toLowerCase();
      secondary = undefined;
      if (s === "active") primary = t("settings.general.billing.statusActive");
      else if (s === "trialing")
        primary = t("settings.general.billing.statusTrialing");
      else if (s === "past_due")
        primary = t("settings.general.billing.statusPastDue");
      else if (s === "canceled")
        primary = t("settings.general.billing.statusCanceled");
      else if (s === "incomplete" || s === "incomplete_expired") {
        primary = t("settings.general.billing.statusIncomplete");
      } else if (s === "unpaid")
        primary = t("settings.general.billing.statusUnpaid");
      else if (s === "revoked")
        primary = t("settings.general.billing.statusRevoked");
      else primary = t("settings.general.billing.statusOther", { status: raw });
    }
  }

  const showChoosePlan =
    !details.feesExempt && !hasActiveLikeSubscription(details.status);

  const showSubscriptionDetails =
    !details.feesExempt &&
    Boolean(
      details.subscriptionName ||
        subscriptionPriceLabel ||
        details.nextCycleDate,
    );

  const openPortal = async () => {
    setOpening(true);
    const result = await createPolarBillingPortalSession();
    if (!result.ok) {
      toast.error(t("settings.general.billing.portalError"));
      setOpening(false);
      return;
    }
    window.location.assign(result.url);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="border-b">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("settings.general.billing.sectionTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("settings.general.billing.statusLabel")}
            </span>
            <span className="text-sm font-medium text-foreground">
              {primary}
            </span>
            {secondary ? (
              <span className="text-sm text-muted-foreground">{secondary}</span>
            ) : null}
            {!details.feesExempt ? (
              <span className="text-xs text-muted-foreground">
                {t("settings.general.billing.portalReturnHint")}
              </span>
            ) : null}
          </div>
          {details.feesExempt ? null : (
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => void openPortal()}
                disabled={opening}
              >
                {opening ? (
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                {t("settings.general.billing.openPortal")}
              </Button>
              {showChoosePlan ? (
                <Button type="button" variant="secondary" asChild>
                  <Link href="/checkout">
                    {t("settings.general.billing.choosePlan")}
                  </Link>
                </Button>
              ) : null}
            </div>
          )}
        </div>
        {showSubscriptionDetails ? (
          <div className="grid gap-4 border-t pt-4 sm:grid-cols-3">
            {details.subscriptionName ? (
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("settings.general.billing.planLabel")}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {details.subscriptionName}
                </span>
              </div>
            ) : null}
            {subscriptionPriceLabel ? (
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("settings.general.billing.priceLabel")}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {subscriptionPriceLabel}
                </span>
              </div>
            ) : null}
            {details.nextCycleDate ? (
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("settings.general.billing.nextBillingLabel")}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {DateTime.fromJSDate(details.nextCycleDate)
                    .setLocale(locale)
                    .toLocaleString(DateTime.DATE_MED)}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
        {details.benefits.sms ? (
          <div className="flex flex-col gap-3 border-t pt-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("settings.general.billing.smsCreditsSectionTitle")}
            </span>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("settings.general.billing.smsCreditsCredited")}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {numberFormatter.format(details.benefits.sms.totalAmount)}
                </span>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("settings.general.billing.smsCreditsConsumed")}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {numberFormatter.format(details.benefits.sms.amountUsed)}
                </span>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("settings.general.billing.smsCreditsBalance")}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {numberFormatter.format(details.benefits.sms.balance)}
                </span>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("settings.general.billing.smsCreditsNextCycle")}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {details.benefits.sms.nextRefreshDate
                    ? DateTime.fromJSDate(details.benefits.sms.nextRefreshDate)
                        .setLocale(locale)
                        .toLocaleString(DateTime.DATE_MED)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

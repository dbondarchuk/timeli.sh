"use client";

import { SmsTopupPurchaseDialog } from "@/app/dashboard/settings/brand/tabs/sms-topup-purchase-dialog";
import { adminApi } from "@timelish/api-sdk";
import { useI18n, useLocale } from "@timelish/i18n";
import {
  OrganizationBillingSubscriptionDetails,
  OrganizationSubscriptionStatus,
} from "@timelish/types";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
  toast,
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
} from "@timelish/ui";
import { ExternalLink } from "lucide-react";
import { DateTime } from "luxon";
import Link from "next/link";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";

function hasActiveLikeSubscription(
  status: OrganizationSubscriptionStatus | null | undefined,
): boolean {
  return (
    status === OrganizationSubscriptionStatus.Active ||
    status === OrganizationSubscriptionStatus.Trialing ||
    status === OrganizationSubscriptionStatus.PastDue
  );
}

export function GeneralBillingCard({
  details,
}: {
  details: OrganizationBillingSubscriptionDetails;
}) {
  const t = useI18n("admin");
  const locale = useLocale();
  const [opening, setOpening] = useState(false);
  const [smsPurchased, setSmsPurchased] = useQueryState(
    "sms_topup",
    parseAsBoolean
      .withDefault(false)
      .withOptions({ shallow: true, history: "replace" }),
  );

  useEffect(() => {
    if (!smsPurchased) return;
    toast.success(t("settings.general.billing.smsTopup.purchaseSuccess"));
    setSmsPurchased(false);
  }, [t, smsPurchased, setSmsPurchased]);

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
    primary = t("settings.general.billing.status.feesExempt.label");
    secondary = t("settings.general.billing.status.feesExempt.hint");
  } else {
    if (!details.status) {
      primary = t("settings.general.billing.status.none");
      secondary = undefined;
    } else {
      secondary = undefined;
      primary = t.has(`settings.general.billing.status.${details.status}`)
        ? t(`settings.general.billing.status.${details.status}`)
        : t("settings.general.billing.status.other", {
            status: details.status,
          });
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
    try {
      const result = await adminApi.billing.getBillingPortalUrl();
      window.location.assign(result);
    } catch (error) {
      toast.error(t("settings.general.billing.portalError"));
      setOpening(false);
    } finally {
      setOpening(false);
    }
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
              {t("settings.general.billing.status.label")}
            </span>
            <span className="text-sm font-medium text-foreground">
              {primary}
            </span>
            {secondary ? (
              <span className="text-sm text-muted-foreground">{secondary}</span>
            ) : null}
          </div>
          {details.feesExempt ? null : (
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-col gap-2">
                <TooltipResponsive>
                  <TooltipResponsiveTrigger>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openPortal}
                      disabled={opening}
                    >
                      {opening ? (
                        <Spinner className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="mr-2 h-4 w-4" />
                      )}
                      {t("settings.general.billing.openPortal")}
                    </Button>
                  </TooltipResponsiveTrigger>
                  <TooltipResponsiveContent>
                    {t("settings.general.billing.portalReturnHint")}
                  </TooltipResponsiveContent>
                </TooltipResponsive>
              </div>
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
          <div className="flex flex-col gap-4 border-t pt-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("settings.general.billing.smsCreditsSectionTitle")}
            </span>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("settings.general.billing.smsIncluded.title")}
                </span>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("settings.general.billing.smsIncluded.balanceLabel")}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {numberFormatter.format(details.benefits.sms.included)}
                    </span>
                  </div>
                  {details.benefits.sms.includedPerCycle != null ? (
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t(
                          "settings.general.billing.smsIncluded.perCycleLabel",
                        )}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {numberFormatter.format(
                          details.benefits.sms.includedPerCycle,
                        )}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("settings.general.billing.smsIncluded.nextCycleLabel")}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {details.benefits.sms.nextRefreshDate
                        ? DateTime.fromJSDate(
                            details.benefits.sms.nextRefreshDate,
                          )
                            .setLocale(locale)
                            .toLocaleString(DateTime.DATE_MED)
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("settings.general.billing.smsTopupPool.title")}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t("settings.general.billing.smsTopupPool.balanceLabel")}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {numberFormatter.format(details.benefits.sms.topup)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("settings.general.billing.smsTopupPool.usageHint")}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground sm:max-w-prose">
                {t("settings.general.billing.smsTopupPool.depletionOrderHint")}
              </p>
              <SmsTopupPurchaseDialog canPurchase />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

"use client";

import { adminApi } from "@timelish/api-sdk";
import { AvailableApps } from "@timelish/app-store";
import { AllKeys, BaseAllKeys, useI18n, useLocale } from "@timelish/i18n";
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentSummary,
} from "@timelish/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Checkbox,
  CurrencyPercentageInput,
  Label,
  Link,
  Spinner,
  toast,
  TooltipResponsive,
  TooltipResponsiveContent,
  TooltipResponsiveTrigger,
  useCurrencyFormat,
} from "@timelish/ui";
import { formatAmount } from "@timelish/utils";
import {
  Check,
  CheckCircle,
  CircleDollarSign,
  Clock,
  CreditCard,
  Gift,
  Pencil,
} from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { AddUpdatePaymentDialog } from "./add-update-payment-dialog";
import { PaymentDeleteConfirmationModal } from "./payment-delete-confirmation-modal";

export type PaymentCardProps = {
  payment: Payment | PaymentSummary;
  className?: string;
  onDelete?: (payment: Payment) => void;
  onRefund?: (payment: Payment) => void;
};

export const getPaymentStatusIcon = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
      return <CheckCircle className="size-4 text-green-600" />;
    //   case "refunded":
    //     return <Clock className="h-4 w-4 text-yellow-600" />;
    //   case "failed":
    //     return <CreditCard className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="size-4 text-gray-600" />;
  }
};

export const getPaymentStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
      return "bg-green-100 hover:bg-green-300 text-green-800 hover:text-green-900 border-green-200 hover:border-green-400 ";
    //   case "pending":
    //     return "bg-yellow-100 text-yellow-800 border-yellow-200";
    //   case "failed":
    //     return "bg-red-100 text-red-800 border-red-200";
    case "refunded":
      return "bg-red-100 hover:bg-red-300 text-red-800 hover:text-red-900 border-red-200 hover:border-red-400 ";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getPaymentDescription = (description: string): AllKeys => {
  switch (description) {
    case "full_payment":
      return "admin.payment.descriptions.fullPayment" satisfies BaseAllKeys;

    case "deposit":
      return "admin.payment.descriptions.deposit" satisfies BaseAllKeys;

    case "rescheduleFee":
      return "admin.payment.descriptions.rescheduleFee" satisfies BaseAllKeys;

    case "cancellationFee":
      return "admin.payment.descriptions.cancellationFee" satisfies BaseAllKeys;

    case "giftCard":
      return "admin.payment.descriptions.giftCard" satisfies BaseAllKeys;

    default:
      return description as AllKeys;
  }
};

export const getPaymentMethod = (
  method: PaymentMethod,
  appName?: string,
): AllKeys => {
  return method === "online" && appName
    ? AvailableApps[appName]?.displayName
    : method === "gift-card"
      ? "admin.payment.methods.giftCard"
      : method === "cash"
        ? "admin.payment.methods.cash"
        : "admin.payment.methods.card";
};

export const getPaymentMethodIcon = (
  method: PaymentMethod,
  appName?: string,
) => {
  const Icon =
    method === "online" && appName
      ? AvailableApps[appName]?.Logo
      : method === "gift-card"
        ? Gift
        : method === "cash"
          ? CircleDollarSign
          : CreditCard;

  return <Icon className="size-6" />;
};

const RefundDialog = ({
  isRefundInProgress,
  setIsRefundDialogOpen,
  isRefundDialogOpen,
  payment,
  refund,
}: {
  isRefundInProgress: boolean;
  setIsRefundDialogOpen: (open: boolean) => void;
  isRefundDialogOpen: boolean;
  payment: Payment;
  refund: (amount: number) => void;
}) => {
  const t = useI18n();
  const { method, ...rest } = payment;
  const currencyFormat = useCurrencyFormat();

  const totalRefunded =
    payment.refunds?.reduce((acc, refund) => acc + refund.amount, 0) || 0;

  const [amount, setAmount] = useState(payment.amount - totalRefunded);
  const [refundFees, setRefundFees] = useState(false);
  const commitValue = useCallback(
    (value: number) => {
      const newAmount = Math.min(
        payment.amount - totalRefunded,
        formatAmount(value),
      );

      setAmount(newAmount);
    },
    [payment.amount, totalRefunded],
  );

  const refundableAmount =
    payment.amount -
    totalRefunded -
    (!refundFees
      ? payment.fees?.reduce((acc, fee) => acc + fee.amount, 0) || 0
      : 0);

  useEffect(() => {
    if (amount > refundableAmount) {
      commitValue(refundableAmount);
    }
  }, [amount, refundableAmount, commitValue]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsRefundDialogOpen(open);
      if (open) {
        const amount = payment.amount - totalRefunded;
        setAmount(amount);
      }
    },
    [setIsRefundDialogOpen, payment.amount, totalRefunded],
  );

  return (
    <AlertDialog open={isRefundDialogOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="md"
          className="w-full"
          disabled={isRefundInProgress}
        >
          {isRefundInProgress && <Spinner />} {t("admin.payment.card.refund")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("admin.payment.card.confirmRefund")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("admin.payment.card.confirmRefundDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-muted/30 dark:bg-muted/80 text-foreground font-normal rounded-lg p-4">
          <h4 className="font-semibold mb-3">
            {t("admin.payment.card.refundDetails")}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-xs">
                {t("admin.payment.card.paymentMethod")}
              </span>
              <span className="font-semibold">
                {t(
                  getPaymentMethod(
                    method,
                    "appName" in rest ? rest.appName : undefined,
                  ),
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="">{t("admin.payment.card.originalAmount")}</span>
              <span className="font-semibold">
                {currencyFormat(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="">{t("admin.payment.card.totalRefunded")}</span>
              <span className="font-semibold">
                {currencyFormat(totalRefunded)}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-semibold">
                <div className="flex flex-col gap-2">
                  <span>{t("admin.payment.card.refundAmount")}</span>
                  {payment.fees?.length && payment.fees.length > 0 && (
                    <div className="flex flex-row gap-2 items-center">
                      <Checkbox
                        id="refundFees"
                        checked={refundFees}
                        onCheckedChange={(checked) => setRefundFees(!!checked)}
                        className="bg-background dark:bg-background"
                      />
                      <Label htmlFor="refundFees">
                        {t("admin.payment.card.refundFees")}
                      </Label>
                    </div>
                  )}
                </div>
                <CurrencyPercentageInput
                  maxAmount={refundableAmount}
                  value={amount}
                  onChange={commitValue}
                />
              </div>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRefundInProgress}>
            {t("admin.payment.card.cancel")}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => refund(amount)}
            disabled={
              isRefundInProgress ||
              amount <= 0 ||
              amount > payment.amount - totalRefunded
            }
          >
            {isRefundInProgress && <Spinner />}{" "}
            {t("admin.payment.card.confirmRefundButton", {
              amountFormatted: currencyFormat(amount),
            })}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  className,
  onDelete,
  onRefund,
}) => {
  const {
    _id,
    amount,
    paidAt,
    description,
    status,
    method,
    refunds,
    fees,
    ...rest
  } = payment;

  const [isRefundInProgress, setIsRefundInProgress] = React.useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = React.useState(false);

  const router = useRouter();

  const t = useI18n();
  const locale = useLocale();
  const currencyFormat = useCurrencyFormat();

  const dateTime =
    typeof paidAt === "string"
      ? DateTime.fromISO(paidAt)
      : DateTime.fromJSDate(paidAt);
  const refundedDateTime = refunds?.[0]?.refundedAt
    ? typeof refunds[0].refundedAt === "string"
      ? DateTime.fromISO(refunds[0].refundedAt)
      : DateTime.fromJSDate(refunds[0].refundedAt)
    : undefined;

  const totalRefunded =
    refunds?.reduce((acc, refund) => acc + refund.amount, 0) || 0;

  const refund = useCallback(
    async (amount: number) => {
      try {
        if (amount <= 0 || amount > payment.amount - totalRefunded) {
          throw new Error("Invalid refund amount");
        }

        setIsRefundInProgress(true);

        const result = await adminApi.payments.refundPayment(_id, amount);

        if (!result.success) {
          throw new Error(`Refund has failed: ${result.error}`);
        }

        toast.success(t("admin.payment.toasts.refundSuccess"), {
          description: t("admin.payment.toasts.refundSuccessDescription"),
        });

        Object.assign(payment, result.payment);

        setIsRefundDialogOpen(false);
        onRefund?.(payment);
        router.refresh();
      } catch (e) {
        console.error(e);
        toast.error(t("admin.payment.toasts.refundError"), {
          description: t("admin.payment.toasts.refundErrorDescription"),
        });
      } finally {
        setIsRefundInProgress(false);
      }
    },
    [totalRefunded, _id, t],
  );

  const onUpdate = useCallback(
    (updatedPayment: Payment) => {
      Object.assign(payment, updatedPayment);
      router.refresh();
    },
    [router],
  );

  return (
    <div className="w-full flex flex-col rounded-lg border border-border bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          {getPaymentMethodIcon(
            method,
            "appName" in rest ? rest.appName : undefined,
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {t(
                getPaymentMethod(
                  method,
                  "appName" in rest ? rest.appName : undefined,
                ),
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(`admin.common.labels.paymentMethod.${payment.method}`)}
            </p>
          </div>
        </div>
        <Badge className={getPaymentStatusColor(status)}>
          {t(`admin.common.labels.paymentStatus.${status}`)}
        </Badge>
      </div>

      {/* Amount + fields */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex justify-between items-baseline mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {t("admin.payment.card.amount")}
          </p>
          <p className="text-xl font-medium text-foreground">
            {currencyFormat(amount)}
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          {"customerName" in rest && !!rest.customerId && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {t("admin.payment.card.customer")}
              </span>
              <span className="text-xs font-medium text-foreground">
                <Link
                  href={`/dashboard/customers/${rest.customerId}`}
                  variant="underline"
                >
                  {rest.customerName}
                </Link>
              </span>
            </div>
          )}
          {fees && fees.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {t("admin.payment.card.fees")}
                </span>
              </div>
              {fees.map((fee, index) => (
                <div
                  className="flex justify-between items-center pl-4"
                  key={fee.type + index + fee.amount}
                >
                  <span className="text-xs text-muted-foreground">
                    {t(`admin.payment.feeTypes.${fee.type}`)}
                  </span>
                  <span className="text-xs font-medium text-foreground/60">
                    {currencyFormat(-1 * fee.amount)}
                  </span>
                </div>
              ))}
            </>
          )}
          {"externalId" in rest && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {t("admin.payment.card.transactionId")}
              </span>
              <code className="text-xs border border-border bg-muted font-mono px-2 py-0.5 rounded-lg">
                {rest.externalId}
              </code>
            </div>
          )}
          {"giftCardCode" in rest && !!rest.giftCardId && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {t("admin.payment.card.giftCardCode")}
              </span>
              <Link
                href={`/dashboard/services/gift-cards/${rest.giftCardId}`}
                variant="none"
                className="text-xs font-mono text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg"
              >
                {rest.giftCardCode}
              </Link>
            </div>
          )}
          {"serviceName" in rest && !!rest.appointmentId && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {t("admin.payment.card.appointment")}
              </span>
              <Link
                href={`/dashboard/appointments/${rest.appointmentId}`}
                variant="underline"
              >
                {rest.serviceName}
              </Link>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {t("admin.payment.card.timePaid")}
            </span>
            <TooltipResponsive>
              <TooltipResponsiveTrigger>
                <span className="text-xs text-foreground/60 underline decoration-dashed cursor-help">
                  {dateTime.setLocale(locale).toRelative()}
                </span>
              </TooltipResponsiveTrigger>
              <TooltipResponsiveContent>
                {dateTime.toLocaleString(DateTime.DATETIME_MED, {
                  locale,
                })}
              </TooltipResponsiveContent>
            </TooltipResponsive>
          </div>
          {description && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {t("admin.payment.card.description")}
              </span>
              <span className="text-xs text-foreground/60">
                {t.has(getPaymentDescription(description))
                  ? t(getPaymentDescription(description))
                  : description}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Refund details — only shown when refunded */}
      {status === "refunded" && (
        <div className="px-5 py-4 border-b border-border bg-red-50">
          <h4 className="font-semibold mb-3 text-destructive">
            {t("admin.payment.card.refundDetails")}
          </h4>
          <div className="flex flex-col gap-2">
            {refundedDateTime?.isValid && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-destructive/80">
                  {t("admin.payment.card.timeRefunded")}
                </span>
                <TooltipResponsive>
                  <TooltipResponsiveTrigger>
                    <span className="text-xs text-destructive underline decoration-dashed cursor-help">
                      {refundedDateTime.setLocale(locale).toRelative()}
                    </span>
                  </TooltipResponsiveTrigger>
                  <TooltipResponsiveContent>
                    {refundedDateTime.toLocaleString(DateTime.DATETIME_MED, {
                      locale,
                    })}
                  </TooltipResponsiveContent>
                </TooltipResponsive>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs text-destructive/80">
                {t("admin.payment.card.refunded")}
              </span>
              <TooltipResponsive>
                <TooltipResponsiveTrigger>
                  <span className="text-xs text-destructive underline decoration-dashed cursor-help">
                    {currencyFormat(-1 * totalRefunded)}
                  </span>
                </TooltipResponsiveTrigger>
                <TooltipResponsiveContent>
                  {refunds?.map((refund) => (
                    <div
                      key={refund.refundedAt?.toISOString()}
                      className="flex flex-row gap-2"
                    >
                      <span>
                        {DateTime.fromJSDate(refund.refundedAt).toLocaleString(
                          DateTime.DATETIME_MED,
                          {
                            locale,
                          },
                        )}
                      </span>
                      <span>{currencyFormat(-1 * refund.amount)}</span>
                    </div>
                  ))}
                </TooltipResponsiveContent>
              </TooltipResponsive>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-destructive/80">
                {t("admin.payment.card.amountLeft")}
              </span>
              <span className="text-xs font-medium text-destructive">
                {currencyFormat(amount - totalRefunded)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Net amount */}
      <div className="flex justify-between items-center px-5 py-3.5 bg-muted/30 dark:bg-muted/80 border-b border-border">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("admin.payment.card.netAmount")}
        </p>
        <p className="text-base font-medium text-foreground">
          {currencyFormat(
            amount -
              (fees?.reduce((acc, fee) => acc + fee.amount, 0) || 0) -
              totalRefunded,
          )}
        </p>
      </div>

      {/* Action */}
      <div className="px-5 py-4">
        {(status === "paid" ||
          (status === "refunded" && totalRefunded < amount)) &&
          (method === "online" || method === "gift-card") && (
            <RefundDialog
              isRefundInProgress={isRefundInProgress}
              setIsRefundDialogOpen={setIsRefundDialogOpen}
              isRefundDialogOpen={isRefundDialogOpen}
              payment={payment}
              refund={refund}
            />
          )}

        {method !== "online" &&
          method !== "gift-card" &&
          (!("disableUpdate" in rest) || !rest.disableUpdate) && (
            <div className="mt-4 flex flex-row gap-2 w-full">
              <AddUpdatePaymentDialog
                paymentId={payment._id}
                payment={payment}
                onSuccess={onUpdate}
              >
                <Button variant="primary" className="w-full">
                  <Pencil /> {t("admin.payment.card.update")}
                </Button>
              </AddUpdatePaymentDialog>

              <PaymentDeleteConfirmationModal
                payment={payment}
                onDelete={onDelete}
              />
            </div>
          )}

        {status === "refunded" && totalRefunded >= amount && (
          <div className="mt-4">
            <Button
              variant="ghost-destructive"
              size="md"
              className="w-full"
              disabled
            >
              <Check /> {t("admin.payment.card.refunded")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

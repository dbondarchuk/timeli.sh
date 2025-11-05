"use client";

import { adminApi } from "@timelish/api-sdk";
import { AvailableApps } from "@timelish/app-store";
import { AdminKeys, AllKeys, useI18n, useLocale } from "@timelish/i18n";
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
  Card,
  CardContent,
  Checkbox,
  cn,
  CurrencyPercentageInput,
  Label,
  Separator,
  Spinner,
  toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@timelish/ui";
import { formatAmount, formatAmountString } from "@timelish/utils";
import {
  Check,
  CheckCircle,
  CircleDollarSign,
  Clock,
  CreditCard,
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

export const getPaymentDescription = (description: string): AdminKeys => {
  switch (description) {
    case "full_payment":
      return "payment.descriptions.fullPayment";

    case "deposit":
      return "payment.descriptions.deposit";

    case "rescheduleFee":
      return "payment.descriptions.rescheduleFee";

    default:
      return description as AdminKeys;
  }
};

export const getPaymentMethod = (
  method: PaymentMethod,
  appName?: string,
): AllKeys => {
  return method === "online" && appName
    ? AvailableApps[appName]?.displayName
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
      : method === "cash"
        ? CircleDollarSign
        : CreditCard;

  return <Icon className="h-8 w-8" />;
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
    <div className="mt-4">
      <AlertDialog open={isRefundDialogOpen} onOpenChange={onOpenChange}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
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
          <div className="bg-muted text-foreground font-thin rounded-lg p-4">
            <h4 className="font-semibold mb-3">
              {t("admin.payment.card.refundDetails")}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="">
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
                <span className="">
                  {t("admin.payment.card.originalAmount")}
                </span>
                <span className="font-semibold">
                  ${formatAmountString(payment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="">
                  {t("admin.payment.card.totalRefunded")}
                </span>
                <span className="font-semibold">
                  ${formatAmountString(totalRefunded)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-semibold">
                  <div className="flex flex-col gap-2">
                    <span>{t("admin.payment.card.refundAmount")}</span>
                    {payment.fees?.length && payment.fees.length > 0 && (
                      <div className="flex flex-row gap-2">
                        <Checkbox
                          id="refundFees"
                          checked={refundFees}
                          onCheckedChange={(checked) =>
                            setRefundFees(!!checked)
                          }
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
                amount: formatAmountString(amount),
              })}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  className,
  onDelete,
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
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getPaymentMethodIcon(
              method,
              "appName" in rest ? rest.appName : undefined,
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {t(
                  getPaymentMethod(
                    method,
                    "appName" in rest ? rest.appName : undefined,
                  ),
                )}
              </h3>
              <p className="text-sm text-gray-600">
                {t(`admin.payment.types.${payment.type}`)}
              </p>
            </div>
          </div>
          <Badge className={getPaymentStatusColor(status)}>
            <div className="flex items-center space-x-1">
              {getPaymentMethodIcon(
                method,
                "appName" in rest ? rest.appName : undefined,
              )}
              <span>
                {t(`admin.common.labels.paymentStatus.${payment.status}`)}
              </span>
            </div>
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col flex-1 justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-foreground/80">
                {t("admin.payment.card.amount")}
              </span>
              <span className="font-semibold text-lg text-right">
                ${formatAmountString(amount)}
              </span>
            </div>

            {fees && fees.length > 0 && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/80">
                    {t("admin.payment.card.fees")}
                  </span>
                </div>
                {fees.map((fee, index) => (
                  <div
                    className="flex justify-between items-center text-sm pl-4"
                    key={fee.type + index + fee.amount}
                  >
                    <span className="text-foreground/80">
                      {t(`admin.payment.feeTypes.${fee.type}`)}
                    </span>
                    <span className="text-foreground/60">
                      -${formatAmountString(fee.amount)}
                    </span>
                  </div>
                ))}
              </>
            )}

            {"externalId" in rest && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/80">
                  {t("admin.payment.card.transactionId")}
                </span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-right">
                  {rest.externalId}
                </span>
              </div>
            )}

            {"customerName" in rest && rest.customerId && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/80">
                  {t("admin.payment.card.customerName")}
                </span>
                <span className="font-semibold">
                  <a
                    className="font-semibold underline text-right"
                    href={`/dashboard/customers/${rest.customerId}`}
                  >
                    {rest.customerName}
                  </a>
                </span>
              </div>
            )}

            {"serviceName" in rest && rest.appointmentId && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/80">
                  {t("admin.payment.card.appointment")}
                </span>
                <a
                  className="font-semibold underline text-right"
                  href={`/dashboard/appointments/${rest.appointmentId}`}
                >
                  {rest.serviceName}
                </a>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground/80">
                {t("admin.payment.card.timePaid")}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-foreground/60 underline decoration-dashed cursor-help text-right">
                      {dateTime.setLocale(locale).toRelative()}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {dateTime.toLocaleString(DateTime.DATETIME_MED, {
                      locale,
                    })}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {description && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/80">
                  {t("admin.payment.card.description")}
                </span>
                <span className="font-semibold">
                  {" "}
                  {t.has(`admin.${getPaymentDescription(description)}`)
                    ? t(`admin.${getPaymentDescription(description)}`)
                    : description}
                </span>
              </div>
            )}

            {refundedDateTime?.isValid && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/80">
                  {t("admin.payment.card.timeRefunded")}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm text-foreground/60 underline decoration-dashed cursor-help text-right">
                        {refundedDateTime.setLocale(locale).toRelative()}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {refundedDateTime.toLocaleString(DateTime.DATETIME_MED, {
                        locale,
                      })}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {totalRefunded > 0 && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/80">
                    {t("admin.payment.card.refunded")}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-foreground/60 underline decoration-dashed cursor-help">
                          -${formatAmountString(totalRefunded)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="flex flex-col gap-2">
                        {refunds?.map((refund) => (
                          <div
                            key={refund.refundedAt?.toISOString()}
                            className="flex flex-row gap-2"
                          >
                            <span>
                              {DateTime.fromJSDate(
                                refund.refundedAt,
                              ).toLocaleString(DateTime.DATETIME_MED, {
                                locale,
                              })}
                            </span>
                            <span>-${formatAmountString(refund.amount)}</span>
                          </div>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-foreground/80">
                    {t("admin.payment.card.amountLeft")}
                  </span>
                  <span className="font-semibold">
                    ${formatAmountString(amount - totalRefunded)}
                  </span>
                </div>
              </>
            )}
          </div>

          {(status === "paid" ||
            (status === "refunded" && totalRefunded < amount)) &&
            method === "online" && (
              <RefundDialog
                isRefundInProgress={isRefundInProgress}
                setIsRefundDialogOpen={setIsRefundDialogOpen}
                isRefundDialogOpen={isRefundDialogOpen}
                payment={payment}
                refund={refund}
              />
            )}

          {method !== "online" && (
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
              <Button variant="destructive" className="w-full" disabled>
                <Check /> {t("admin.payment.card.refunded")}
              </Button>
            </div>
          )}
        </div>

        <Separator className="my-4" />
        <div className="flex justify-between items-center font-semibold">
          <span>{t("admin.payment.card.netAmount")}</span>
          <span className="text-lg">
            $
            {(
              amount -
              (fees?.reduce((acc, fee) => acc + fee.amount, 0) || 0) -
              totalRefunded
            ).toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

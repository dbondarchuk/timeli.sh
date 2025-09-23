import { AvailableApps } from "@vivid/app-store";
import { AdminKeys, AllKeys, useI18n, useLocale } from "@vivid/i18n";
import {
  Payment,
  PaymentStatus,
  PaymentSummary,
  PaymentType,
} from "@vivid/types";
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
  cn,
  Input,
  InputGroup,
  InputGroupInput,
  InputGroupInputClasses,
  InputGroupSuffixClasses,
  InputSuffix,
  Separator,
  Spinner,
  toast,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@vivid/ui";
import { formatAmount, formatAmountString } from "@vivid/utils";
import {
  Check,
  CheckCircle,
  CircleDollarSign,
  Clock,
  CreditCard,
} from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

export type PaymentCardProps = {
  payment: Payment | PaymentSummary;
  className?: string;
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

    default:
      return description as AdminKeys;
  }
};

export const getPaymentMethod = (
  type: PaymentType,
  appName?: string,
): AllKeys => {
  return type === "online" && appName
    ? `apps.${AvailableApps[appName]?.displayName}`
    : type === "cash"
      ? "admin.payment.methods.cash"
      : "admin.payment.methods.card";
};

export const getPaymentMethodIcon = (type: PaymentType, appName?: string) => {
  const Icon =
    type === "online" && appName
      ? AvailableApps[appName]?.Logo
      : type === "cash"
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
  const { type, ...rest } = payment;

  const totalRefunded =
    payment.refunds?.reduce((acc, refund) => acc + refund.amount, 0) || 0;

  const [amount, setAmount] = useState(payment.amount - totalRefunded);
  const [value, setValue] = useState(amount.toFixed(2));

  useEffect(() => {
    const amount = payment.amount - totalRefunded;
    setAmount(amount);
    setValue(amount.toFixed(2));
  }, [payment.amount, totalRefunded]);

  const commitValue = useCallback(() => {
    const newAmount = Math.min(
      payment.amount - totalRefunded,
      formatAmount(parseFloat(value)),
    );

    setAmount(newAmount);
    setValue(newAmount.toFixed(2));
  }, [value, payment.amount, totalRefunded]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsRefundDialogOpen(open);
      if (open) {
        const amount = payment.amount - totalRefunded;
        setAmount(amount);
        setValue(amount.toFixed(2));
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
                      type,
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
                  <span>{t("admin.payment.card.refundAmount")}</span>
                  <InputGroup>
                    <InputSuffix
                      className={InputGroupSuffixClasses({
                        variant: "prefix",
                      })}
                    >
                      $
                    </InputSuffix>
                    <InputGroupInput>
                      <Input
                        disabled={isRefundInProgress}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            commitValue();
                            e.currentTarget.blur();
                          }
                        }}
                        onBlur={commitValue}
                        type="number"
                        min={0}
                        inputMode="decimal"
                        step={1}
                        max={payment.amount - totalRefunded}
                        className={cn(
                          InputGroupInputClasses({
                            variant: "prefix",
                          }),
                          "text-right w-24",
                        )}
                      />
                    </InputGroupInput>
                  </InputGroup>
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
}) => {
  const { _id, amount, paidAt, description, status, type, refunds, ...rest } =
    payment;

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

        const response = await fetch(`/admin/api/payments/${_id}/refund`, {
          method: "POST",
          body: JSON.stringify({ amount }),
        });

        if (response.status >= 400) {
          const text = await response.text();
          throw new Error(
            `Refund has failed (status: ${response.status}): ${text}`,
          );
        }

        const result = (await response.json()) as
          | {
              success: false;
              error: string;
            }
          | {
              success: true;
              payment: Payment;
            };

        if (!result.success) {
          throw new Error(`Refund has failed: ${result.error}`);
        }

        toast.success(t("admin.payment.toasts.refundSuccess"), {
          description: t("admin.payment.toasts.refundSuccessDescription"),
        });

        result.payment.paidAt = result.payment.paidAt
          ? DateTime.fromISO(
              result.payment.paidAt as unknown as string,
            ).toJSDate()
          : result.payment.paidAt;
        result.payment.updatedAt = result.payment.updatedAt
          ? DateTime.fromISO(
              result.payment.updatedAt as unknown as string,
            ).toJSDate()
          : result.payment.updatedAt;
        result.payment.refunds?.forEach((refund) => {
          refund.refundedAt = refund.refundedAt
            ? DateTime.fromISO(
                refund.refundedAt as unknown as string,
              ).toJSDate()
            : refund.refundedAt;
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

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getPaymentMethodIcon(
              type,
              "appName" in rest ? rest.appName : undefined,
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {t(
                  getPaymentMethod(
                    type,
                    "appName" in rest ? rest.appName : undefined,
                  ),
                )}
              </h3>
              <p className="text-sm text-gray-600">
                {t(`admin.${getPaymentDescription(description)}`)}
              </p>
            </div>
          </div>
          <Badge className={getPaymentStatusColor(status)}>
            <div className="flex items-center space-x-1">
              {getPaymentMethodIcon(
                type,
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
              <span className="font-semibold text-lg">
                ${formatAmountString(amount)}
              </span>
            </div>

            {/* {fee && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Processing Fee</span>
              <span className="text-gray-800">${fee.toFixed(2)}</span>
            </div>
          )} */}

            {"externalId" in rest && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/80">
                  {t("admin.payment.card.transactionId")}
                </span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
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
                    className="font-semibold underline"
                    href={`/admin/dashboard/customers/${rest.customerId}`}
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
                  className="font-semibold underline"
                  href={`/admin/dashboard/appointments/${rest.appointmentId}`}
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
                    <span className="text-sm text-foreground/60 underline decoration-dashed cursor-help">
                      {dateTime.setLocale(locale).toRelative()}
                    </span>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      {dateTime.toLocaleString(DateTime.DATETIME_MED, {
                        locale,
                      })}
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            </div>

            {refundedDateTime?.isValid && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/80">
                  {t("admin.payment.card.timeRefunded")}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm text-foreground/60 underline decoration-dashed cursor-help">
                        {refundedDateTime.setLocale(locale).toRelative()}
                      </span>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent side="left">
                        {refundedDateTime.toLocaleString(
                          DateTime.DATETIME_MED,
                          {
                            locale,
                          },
                        )}
                      </TooltipContent>
                    </TooltipPortal>
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
                      <TooltipPortal>
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
                      </TooltipPortal>
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
            type === "online" && (
              <RefundDialog
                isRefundInProgress={isRefundInProgress}
                setIsRefundDialogOpen={setIsRefundDialogOpen}
                isRefundDialogOpen={isRefundDialogOpen}
                payment={payment}
                refund={refund}
              />
            )}

          {status === "refunded" && totalRefunded >= amount && (
            <div className="mt-4">
              <Button variant="destructive" className="w-full" disabled>
                <Check /> {t("admin.payment.card.refunded")}
              </Button>
            </div>
          )}
        </div>

        {/* {fee && (
          <>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-semibold">
              <span>Total Charged</span>
              <span className="text-lg">${(amount + fee).toFixed(2)}</span>
            </div>
          </>
        )} */}
      </CardContent>
    </Card>
  );
};

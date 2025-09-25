"use client";

import {
  getPaymentDescription,
  getPaymentMethod,
  getPaymentMethodIcon,
  getPaymentStatusColor,
  getPaymentStatusIcon,
} from "@/components/payments/payment-card";
import { useI18n, useLocale } from "@vivid/i18n";
import { Appointment, AppointmentStatus, Payment } from "@vivid/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Card,
  CardContent,
  Checkbox,
  cn,
  Input,
  InputGroup,
  InputGroupInput,
  InputGroupInputClasses,
  InputGroupSuffixClasses,
  InputSuffix,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vivid/ui";
import { formatAmount, formatAmountString } from "@vivid/utils";
import { CalendarX2 } from "lucide-react";
import { DateTime } from "luxon";
import React, { useCallback, useEffect, useState } from "react";
import { AppointmentActionButton } from "./action-button";

const PaymentRefundCard = ({
  payment,
  paymentState,
  setSelected,
}: {
  payment: Payment;
  paymentState?: {
    amount: number;
    selected: boolean;
  };
  setSelected: (
    id: string,
    defaultAmount: number,
    selected?: boolean,
    amount?: number,
  ) => void;
}) => {
  const t = useI18n();
  const locale = useLocale();

  const dateTime =
    typeof payment.paidAt === "string"
      ? DateTime.fromISO(payment.paidAt)
      : DateTime.fromJSDate(payment.paidAt);

  const totalRefunded =
    payment.status === "refunded"
      ? payment.refunds?.reduce((acc, refund) => acc + refund.amount, 0) || 0
      : 0;

  const isSelected = !!paymentState?.selected;

  const isRefundable =
    payment.status === "paid" ||
    (payment.status === "refunded" && totalRefunded < payment.amount);

  const refundableAmount =
    payment.status === "paid" ? payment.amount : payment.amount - totalRefunded;

  const refundAmount = paymentState?.amount ?? refundableAmount;

  const [value, setValue] = useState(refundAmount.toFixed(2));
  useEffect(() => {
    setValue(refundAmount.toFixed(2));
  }, [refundAmount]);

  const commitValue = useCallback(() => {
    setSelected(
      payment._id,
      refundableAmount,
      true,
      Math.min(payment.amount - totalRefunded, formatAmount(parseFloat(value))),
    );
  }, [
    payment._id,
    refundableAmount,
    payment.amount,
    totalRefunded,
    value,
    setSelected,
  ]);

  return (
    <Card
      className={cn(
        "w-full cursor-pointer",
        paymentState?.selected && "bg-blue-50 dark:bg-sky-600/20",
      )}
      key={payment._id}
      onClick={() => isRefundable && setSelected(payment._id, refundableAmount)}
    >
      <CardContent className="p-6 relative">
        {isRefundable && (
          <Checkbox
            id={`payment-${payment._id}`}
            checked={isSelected}
            className="absolute top-1 left-1"
          />
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getPaymentMethodIcon(
              payment.type,
              "appName" in payment ? payment.appName : undefined,
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {t(
                  getPaymentMethod(
                    payment.type,
                    "appName" in payment ? payment.appName : undefined,
                  ),
                )}
              </h3>
              <p className="text-sm text-gray-600">
                {payment.description
                  ? t.has(`admin.${getPaymentDescription(payment.description)}`)
                    ? t(`admin.${getPaymentDescription(payment.description)}`)
                    : payment.description
                  : ""}
              </p>
            </div>
          </div>
          <Badge className={getPaymentStatusColor(payment.status)}>
            <div className="flex items-center space-x-1">
              {getPaymentStatusIcon(payment.status)}
              <span className="capitalize">
                {t(`admin.common.labels.paymentStatus.${payment.status}`)}
              </span>
            </div>
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-foreground/80">
              {t("admin.appointments.declineDialog.amount")}
            </span>
            <span className="font-semibold text-lg">
              ${formatAmountString(payment.amount)}
            </span>
          </div>
          {"externalId" in payment && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground/80">
                {t("admin.appointments.declineDialog.transactionId")}
              </span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {payment.externalId}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-foreground/80">
              {t("admin.appointments.declineDialog.timePaid")}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-foreground/60 underline decoration-dashed cursor-help">
                    {dateTime.setLocale(locale).toRelative()}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {dateTime.toLocaleString(DateTime.DATETIME_MED, { locale })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {payment.status === "refunded" && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground/80">
                {t("admin.appointments.declineDialog.refunded")}
              </span>
              <span className="text-foreground/60">
                ${formatAmountString(totalRefunded)}
              </span>
            </div>
          )}
          <div
            className="flex justify-between items-center text-sm"
            onClick={(e) => isSelected && e.stopPropagation()}
          >
            <span className="text-foreground/80">
              {t(
                isSelected
                  ? "admin.appointments.declineDialog.refundAmount"
                  : "admin.appointments.declineDialog.refundableAmount",
              )}
            </span>
            {isSelected ? (
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
                    placeholder={value}
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
                    max={refundableAmount}
                    className={cn(
                      InputGroupInputClasses({
                        variant: "prefix",
                      }),
                      "text-right w-24",
                    )}
                  />
                </InputGroupInput>
              </InputGroup>
            ) : (
              <span className="text-foreground/60">
                ${formatAmountString(refundableAmount)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AppointmentDeclineDialog: React.FC<{
  appointment: Appointment;
  trigger?: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
  onSuccess?: (status: AppointmentStatus) => void;
}> = ({ appointment, open, trigger, onClose, onSuccess }) => {
  const t = useI18n();

  const locale = useLocale();
  const [isLoading, setIsLoading] = React.useState(false);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setPaymentsIdsSelectionState({});
      onClose?.();
    }
  };

  const [paymentsIdsSelectionState, setPaymentsIdsSelectionState] =
    React.useState<
      Record<
        string,
        {
          amount: number;
          selected: boolean;
        }
      >
    >({});

  const selectedPayments = Object.entries(paymentsIdsSelectionState)
    .filter(([id]) => !!paymentsIdsSelectionState[id]?.selected)
    .map(([id, { amount }]) => ({ id, amount }));

  const setSelected = (
    id: string,
    defaultAmount: number,
    selected?: boolean,
    amount?: number,
  ) => {
    setPaymentsIdsSelectionState((prev) => {
      return {
        ...prev,
        [id]: {
          amount:
            typeof amount === "undefined"
              ? (prev[id]?.amount ?? defaultAmount)
              : amount,
          selected:
            typeof selected === "undefined" ? !prev[id]?.selected : selected,
        },
      };
    });
  };

  const paymentsAvailableToRefund = React.useMemo(
    () =>
      appointment.payments?.filter(
        (payment) =>
          payment.type === "online" &&
          (payment.status === "paid" ||
            (payment.status === "refunded" &&
              (payment.refunds?.reduce(
                (acc, refund) => acc + refund.amount,
                0,
              ) || 0) < payment.amount)),
      ) ?? [],
    [appointment],
  );

  const refundSelected = async () => {
    const response = await fetch("/admin/api/payments/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refunds: selectedPayments,
      }),
    });

    if (response.status >= 400) {
      const text = await response.text();
      console.error(text);

      throw new Error(text);
    }

    const result = (await response.json()) as {
      success: boolean;
      updatedPayments: Record<string, Payment>;
      errors: Record<string, string>;
    };

    for (const [id, updated] of Object.entries(result.updatedPayments)) {
      const payment = appointment.payments?.find((p) => p._id === id);
      if (!payment) continue;

      const totalRefunded =
        payment.refunds?.reduce((acc, refund) => acc + refund.amount, 0) || 0;

      const defaultAmount = payment.amount - totalRefunded;

      Object.assign(payment, updated);
      setSelected(id, defaultAmount, false, defaultAmount);
    }

    if (!result.success) {
      console.error(`Refunds failed:`, result.errors);
      throw new Error(t("admin.appointments.declineDialog.refundError"));
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (!isLoading) onOpenChange(open);
      }}
    >
      {!!trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className="md:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("admin.appointments.declineDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("admin.appointments.declineDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="flex flex-col gap-2">
            <div className="bg-muted text-foreground font-light rounded-lg p-4 flex flex-col gap-2">
              <h4 className="font-semibold mb-3">
                {t("admin.appointments.declineDialog.appointmentDetails")}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="">
                    {t("admin.appointments.declineDialog.customer")}
                  </span>
                  <span className="font-semibold">
                    {appointment.fields.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="">
                    {t("admin.appointments.declineDialog.service")}
                  </span>
                  <span className="font-semibold">
                    {appointment.option.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="">
                    {t("admin.appointments.declineDialog.dateTime")}
                  </span>
                  <span className="font-semibold">
                    {DateTime.fromJSDate(appointment.dateTime).toLocaleString(
                      DateTime.DATETIME_MED_WITH_WEEKDAY,
                      { locale },
                    )}
                  </span>
                </div>
              </div>
            </div>
            {!!paymentsAvailableToRefund.length && (
              <div className="flex flex-col gap-2">
                <div className="font-semibold">
                  {t("admin.appointments.declineDialog.refundPayments")}
                </div>

                <div className="flex flex-row flex-wrap gap-2">
                  {paymentsAvailableToRefund.map((payment) => (
                    <PaymentRefundCard
                      key={payment._id}
                      payment={payment}
                      paymentState={paymentsIdsSelectionState[payment._id]}
                      setSelected={setSelected}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("admin.appointments.declineDialog.cancel")}
          </AlertDialogCancel>
          {!!paymentsAvailableToRefund.length && (
            <AlertDialogAction asChild variant="destructive">
              <AppointmentActionButton
                _id={appointment._id}
                status="declined"
                disabled={!selectedPayments.length || isLoading}
                className="mt-2 sm:mt-0"
                beforeRequest={() => refundSelected()}
                setIsLoading={setIsLoading}
                onSuccess={onSuccess}
              >
                <CalendarX2 size={20} />
                {t("admin.appointments.declineDialog.declineAndRefund", {
                  count: selectedPayments.length,
                  amount: formatAmountString(
                    selectedPayments.reduce(
                      (acc, payment) => acc + payment.amount,
                      0,
                    ),
                  ),
                })}
              </AppointmentActionButton>
            </AlertDialogAction>
          )}
          <AlertDialogAction asChild variant="destructive">
            <AppointmentActionButton
              _id={appointment._id}
              status="declined"
              disabled={isLoading}
              setIsLoading={setIsLoading}
              onSuccess={onSuccess}
            >
              <CalendarX2 size={20} />
              {t("admin.appointments.declineDialog.decline")}
            </AppointmentActionButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

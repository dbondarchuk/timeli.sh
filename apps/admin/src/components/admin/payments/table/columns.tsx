"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AdminKeys, useI18n, useLocale } from "@timelish/i18n";
import { PaymentSummary } from "@timelish/types";
import { Badge, Link, useCurrencyFormat } from "@timelish/ui";
import { tableSortHeader, tableSortNoopFunction } from "@timelish/ui-admin";
import {
  getPaymentDescription,
  getPaymentMethod,
  getPaymentStatusColor,
} from "@timelish/ui-admin-kit";
import { DateTime } from "luxon";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<PaymentSummary>[] = [
  {
    id: "paidAt",
    header: tableSortHeader("paymentsList.columns.date", "date", "admin"),
    sortingFn: tableSortNoopFunction,
    cell: ({ row }) => {
      const locale = useLocale();
      const paidAt = row.original.paidAt;
      const dateTime =
        typeof paidAt === "string"
          ? DateTime.fromISO(paidAt)
          : DateTime.fromJSDate(paidAt);

      return (
        <span className="whitespace-nowrap">
          {dateTime.toLocaleString(DateTime.DATETIME_MED, { locale })}
        </span>
      );
    },
  },
  {
    id: "amount",
    header: tableSortHeader("paymentsList.columns.amount", "number", "admin"),
    sortingFn: tableSortNoopFunction,
    cell: ({ row }) => {
      const currencyFormat = useCurrencyFormat();
      return (
        <span className="font-medium tabular-nums">
          {currencyFormat(row.original.amount)}
        </span>
      );
    },
  },
  {
    id: "description",
    header: tableSortHeader("paymentsList.columns.type", "string", "admin"),
    sortingFn: tableSortNoopFunction,
    cell: ({ row }) => {
      const t = useI18n();
      const { description } = row.original;
      const descriptionKey = getPaymentDescription(description);
      return t.has(descriptionKey) ? t(descriptionKey) : description;
    },
  },
  {
    id: "method",
    header: tableSortHeader("paymentsList.columns.method", "string", "admin"),
    sortingFn: tableSortNoopFunction,
    cell: ({ row }) => {
      const t = useI18n();
      const payment = row.original;
      const methodKey = getPaymentMethod(
        payment.method,
        "appName" in payment ? payment.appName : undefined,
      );

      if (payment.method === "gift-card") {
        return (
          <span className="flex items-center gap-1">
            <span>{t("admin.payment.methods.giftCard")}</span>
            <Link
              href={`/dashboard/services/gift-cards/${payment.giftCardId}`}
              variant="underline"
            >
              {payment.giftCardCode}
            </Link>
          </span>
        );
      }
      return t.has(methodKey) ? t(methodKey) : payment.method;
    },
  },
  {
    id: "customerName",
    header: tableSortHeader("paymentsList.columns.customer", "string", "admin"),
    sortingFn: tableSortNoopFunction,
    cell: ({ row }) => {
      const { customerName, customerId } = row.original;
      if (!customerName || !customerId) {
        return "—";
      }

      return (
        <Link href={`/dashboard/customers/${customerId}`} variant="underline">
          {customerName}
        </Link>
      );
    },
  },
  {
    id: "serviceName",
    header: tableSortHeader(
      "paymentsList.columns.appointment",
      "string",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
    cell: ({ row }) => {
      const { serviceName, appointmentId } = row.original;
      if (!serviceName || !appointmentId) {
        return "—";
      }

      return (
        <Link
          href={`/dashboard/appointments/${appointmentId}`}
          variant="underline"
        >
          {serviceName}
        </Link>
      );
    },
  },
  {
    id: "status",
    header: tableSortHeader("paymentsList.columns.status", "string", "admin"),
    sortingFn: tableSortNoopFunction,
    cell: ({ row }) => {
      const t = useI18n("admin");
      const { status } = row.original;
      return (
        <Badge className={getPaymentStatusColor(status)}>
          {t(`common.labels.paymentStatus.${status}` as AdminKeys)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction payment={row.original} />,
    enableSorting: false,
  },
];

"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useI18n, useLocale } from "@timelish/i18n";
import { GiftCardListModel } from "@timelish/types";
import { Badge, Button, Checkbox, Link } from "@timelish/ui";
import {
  CustomerName,
  tableSortHeader,
  tableSortNoopFunction,
} from "@timelish/ui-admin";
import { formatAmount } from "@timelish/utils";
import { DateTime } from "luxon";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback } from "react";
import { CellAction } from "./cell-action";
import { GiftCardPaymentsDialog } from "./payments-dialog";

export const columns: ColumnDef<GiftCardListModel>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const t = useI18n("admin");
      return (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("common.selectAll")}
        />
      );
    },
    cell: ({ row }) => {
      const t = useI18n("admin");
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("common.selectRow")}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    cell: ({ row }) => (
      <Link
        href={`/dashboard/services/gift-cards/${row.original._id}`}
        variant="underline"
      >
        {row.original.code}
      </Link>
    ),
    id: "name",
    header: tableSortHeader(
      "services.giftCards.table.columns.code",
      "string",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n("admin");
      const isActive =
        row.original.status === "active" &&
        (!row.original.expiresAt || row.original.expiresAt > new Date()) &&
        row.original.amountLeft > 0;
      return isActive ? (
        <Badge variant="default">
          {t(`common.labels.giftCardStatus.active`)}
        </Badge>
      ) : (
        <Badge variant="secondary">
          {t(`common.labels.giftCardStatus.inactive`)}
        </Badge>
      );
    },
    id: "status",
    header: tableSortHeader(
      "services.giftCards.table.columns.status",
      "string",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    accessorFn: (giftCard) => `$${formatAmount(giftCard.amount)}`,
    id: "amount",
    header: tableSortHeader(
      "services.giftCards.table.columns.amount",
      "string",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    accessorFn: (giftCard) => `$${formatAmount(giftCard.amountLeft)}`,
    id: "amountLeft",
    header: tableSortHeader(
      "services.giftCards.table.columns.amountLeft",
      "number",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const [_, setQuery] = useQueryState(
        "ts",
        parseAsString.withDefault("").withOptions({ shallow: false }),
      );

      const onRefund = useCallback(() => {
        setQuery(new Date().getTime().toString());
      }, [setQuery]);

      return !!row.original.paymentsCount ? (
        <GiftCardPaymentsDialog
          giftCardId={row.original._id}
          onRefund={onRefund}
        >
          <Button variant="link-dashed">{row.original.paymentsCount}</Button>
        </GiftCardPaymentsDialog>
      ) : (
        <Button variant="link-dashed" disabled>
          0
        </Button>
      );
    },
    id: "payments",
    header: tableSortHeader(
      "services.giftCards.table.columns.payments",
      "number",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const locale = useLocale();
      return row.original.expiresAt
        ? DateTime.fromJSDate(row.original.expiresAt).toLocaleString(
            DateTime.DATETIME_MED,
            { locale },
          )
        : "";
    },
    id: "expiresAt",
    header: tableSortHeader(
      "services.giftCards.table.columns.expiresAt",
      "date",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/customers/${row.original.customerId}`}
          variant="underline"
        >
          <CustomerName customer={row.original.customer} />
        </Link>
      );
    },
    id: "customer",
    header: tableSortHeader(
      "services.giftCards.table.columns.customer",
      "string",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const locale = useLocale();
      return row.original.createdAt
        ? DateTime.fromJSDate(row.original.createdAt).toLocaleString(
            DateTime.DATETIME_MED,
            { locale },
          )
        : "";
    },
    id: "createdAt",
    header: tableSortHeader(
      "services.giftCards.table.columns.createdAt",
      "date",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const locale = useLocale();
      return DateTime.fromJSDate(row.original.updatedAt).toLocaleString(
        DateTime.DATETIME_MED,
        { locale },
      );
    },
    id: "updatedAt",
    header: tableSortHeader(
      "services.discounts.table.columns.updatedAt",
      "date",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction giftCard={row.original} />,
  },
];

export const GiftCardsTableColumnsCount = columns.length;

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button, Link } from "@timelish/ui";
import {
  CustomerName,
  tableSortHeader,
  tableSortNoopFunction,
} from "@timelish/ui-admin";
import { DateTime } from "luxon";
import { PurchasedGiftCardListModel } from "../../models";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../../translations/types";
import { GiftCardDetailDialog } from "./gift-card-detail-dialog";

export type PurchasesTableRow = PurchasedGiftCardListModel & { appId: string };

export const columns: ColumnDef<PurchasesTableRow>[] = [
  {
    id: "code",
    header: tableSortHeader<
      GiftCardStudioAdminNamespace,
      GiftCardStudioAdminKeys
    >("purchases.table.columns.code", "string", giftCardStudioAdminNamespace),
    cell: ({ row }) => (
      <GiftCardDetailDialog purchase={row.original}>
        <Button variant="link-dashed" className="p-0 h-auto font-medium">
          {row.original.giftCardCode ?? row.original.giftCardId}
        </Button>
      </GiftCardDetailDialog>
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "amountPurchased",
    header: tableSortHeader<
      GiftCardStudioAdminNamespace,
      GiftCardStudioAdminKeys
    >(
      "purchases.table.columns.amountPurchased",
      "number",
      giftCardStudioAdminNamespace,
    ),
    cell: ({ row }) => `$${row.original.amountPurchased}`,
    sortingFn: tableSortNoopFunction,
  },
  // {
  //   id: "amountLeft",
  //   header: tableSortHeader<
  //     GiftCardStudioAdminNamespace,
  //     GiftCardStudioAdminKeys
  //   >(
  //     "purchases.table.columns.amountLeft",
  //     "number",
  //     giftCardStudioAdminNamespace,
  //   ),
  //   cell: ({ row }) =>
  //     row.original.amountLeft != null ? `$${row.original.amountLeft}` : "—",
  //   sortingFn: tableSortNoopFunction,
  // },
  {
    id: "customer",
    header: tableSortHeader<
      GiftCardStudioAdminNamespace,
      GiftCardStudioAdminKeys
    >(
      "purchases.table.columns.customer",
      "string",
      giftCardStudioAdminNamespace,
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/customers/${row.original.customerId}`}
        variant="underline"
      >
        <CustomerName customer={row.original.customer} />
      </Link>
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "toName",
    header: tableSortHeader<
      GiftCardStudioAdminNamespace,
      GiftCardStudioAdminKeys
    >("purchases.table.columns.toName", "string", giftCardStudioAdminNamespace),
    cell: ({ row }) => row.original.toName ?? "—",
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "toEmail",
    header: tableSortHeader<
      GiftCardStudioAdminNamespace,
      GiftCardStudioAdminKeys
    >(
      "purchases.table.columns.toEmail",
      "string",
      giftCardStudioAdminNamespace,
    ),
    cell: ({ row }) => row.original.toEmail ?? "—",
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "design",
    header: tableSortHeader<
      GiftCardStudioAdminNamespace,
      GiftCardStudioAdminKeys
    >("purchases.table.columns.design", "string", giftCardStudioAdminNamespace),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/gift-card-studio/designs/${row.original.designId}`}
        variant="underline"
      >
        {row.original.designName}
      </Link>
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "createdAt",
    header: tableSortHeader<
      GiftCardStudioAdminNamespace,
      GiftCardStudioAdminKeys
    >(
      "purchases.table.columns.createdAt",
      "date",
      giftCardStudioAdminNamespace,
    ),
    cell: ({ row }) =>
      DateTime.fromJSDate(row.original.createdAt).toLocaleString(
        DateTime.DATETIME_MED,
      ),
    sortingFn: tableSortNoopFunction,
  },
];

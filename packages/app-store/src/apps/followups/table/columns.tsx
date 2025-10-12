"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useI18n, useLocale } from "@vivid/i18n";
import {
  Checkbox,
  Link,
  tableSortHeader,
  tableSortNoopFunction,
} from "@vivid/ui";
import { DateTime } from "luxon";
import { FollowUp } from "../models";
import {
  FollowUpsAdminKeys,
  FollowUpsAdminNamespace,
  followUpsAdminNamespace,
} from "../translations/types";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<FollowUp>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const t = useI18n("ui");
      return (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("common.selectAll")}
        />
      );
    },
    cell: ({ row }) => {
      const t = useI18n("ui");
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
        href={`/admin/dashboard/communications/follow-ups/edit?id=${row.original._id}`}
        variant="underline"
      >
        {row.original.name}
      </Link>
    ),
    id: "name",
    header: tableSortHeader<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
      "table.columns.name",
      "string",
      followUpsAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
        followUpsAdminNamespace,
      );
      return t(`triggers.${row.original.type}`);
    },
    id: "type",
    header: tableSortHeader<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
      "table.columns.type",
      "string",
      followUpsAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
        followUpsAdminNamespace,
      );
      return t(`channels.${row.original.channel}`);
    },
    id: "channel",
    header: tableSortHeader<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
      "table.columns.channel",
      "string",
      followUpsAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
        followUpsAdminNamespace,
      );
      return row.original.afterAppointmentCount || t("table.all");
    },
    id: "afterAppointmentCount",
    header: tableSortHeader<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
      "table.columns.afterAppointmentCount",
      "number",
      followUpsAdminNamespace,
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
    header: tableSortHeader<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
      "table.columns.updatedAt",
      "date",
      followUpsAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellAction followUp={row.original} appId={row.original.appId} />
    ),
  },
];

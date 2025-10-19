"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useI18n, useLocale } from "@vivid/i18n";
import { Checkbox, Link } from "@vivid/ui";
import { tableSortHeader, tableSortNoopFunction } from "@vivid/ui-admin";
import { DateTime } from "luxon";
import { reminderChannelLabels, reminderTypeLabels } from "../const";
import { Reminder } from "../models";
import {
  RemindersAdminKeys,
  RemindersAdminNamespace,
  remindersAdminNamespace,
} from "../translations/types";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<Reminder>[] = [
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
        href={`/admin/dashboard/communications/reminders/edit?id=${row.original._id}`}
        variant="underline"
      >
        {row.original.name}
      </Link>
    ),
    id: "name",
    header: tableSortHeader<RemindersAdminNamespace, RemindersAdminKeys>(
      "table.columns.name",
      "string",
      remindersAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n<RemindersAdminNamespace, RemindersAdminKeys>(
        remindersAdminNamespace,
      );
      return t(reminderTypeLabels[row.original.type]);
    },
    id: "type",
    header: tableSortHeader<RemindersAdminNamespace, RemindersAdminKeys>(
      "table.columns.type",
      "string",
      remindersAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n<RemindersAdminNamespace, RemindersAdminKeys>(
        remindersAdminNamespace,
      );
      return t(reminderChannelLabels[row.original.channel]);
    },
    id: "channel",
    header: tableSortHeader<RemindersAdminNamespace, RemindersAdminKeys>(
      "table.columns.channel",
      "string",
      remindersAdminNamespace,
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
    header: tableSortHeader<RemindersAdminNamespace, RemindersAdminKeys>(
      "table.columns.updatedAt",
      "date",
      remindersAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellAction reminder={row.original} appId={row.original.appId} />
    ),
  },
];

"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useI18n, useLocale } from "@vivid/i18n";
import { Checkbox, Link } from "@vivid/ui";
import { tableSortHeader, tableSortNoopFunction } from "@vivid/ui-admin";
import { DateTime } from "luxon";
import { ScheduledNotification } from "../models";
import {
  ScheduledNotificationsAdminKeys,
  ScheduledNotificationsAdminNamespace,
  scheduledNotificationsAdminNamespace,
} from "../translations/types";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<ScheduledNotification>[] = [
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
        href={`/admin/dashboard/communications/scheduled-notifications/edit?id=${row.original._id}`}
        variant="underline"
      >
        {row.original.name}
      </Link>
    ),
    id: "name",
    header: tableSortHeader<
      ScheduledNotificationsAdminNamespace,
      ScheduledNotificationsAdminKeys
    >("table.columns.name", "string", scheduledNotificationsAdminNamespace),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n<
        ScheduledNotificationsAdminNamespace,
        ScheduledNotificationsAdminKeys
      >(scheduledNotificationsAdminNamespace);
      return t(`triggers.${row.original.type}`);
    },
    id: "type",
    header: tableSortHeader<
      ScheduledNotificationsAdminNamespace,
      ScheduledNotificationsAdminKeys
    >("table.columns.type", "string", scheduledNotificationsAdminNamespace),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n<
        ScheduledNotificationsAdminNamespace,
        ScheduledNotificationsAdminKeys
      >(scheduledNotificationsAdminNamespace);
      return t(`channels.${row.original.channel}`);
    },
    id: "channel",
    header: tableSortHeader<
      ScheduledNotificationsAdminNamespace,
      ScheduledNotificationsAdminKeys
    >("table.columns.channel", "string", scheduledNotificationsAdminNamespace),
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
    header: tableSortHeader<
      ScheduledNotificationsAdminNamespace,
      ScheduledNotificationsAdminKeys
    >("table.columns.updatedAt", "date", scheduledNotificationsAdminNamespace),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellAction
        scheduledNotification={row.original}
        appId={row.original.appId}
      />
    ),
  },
];

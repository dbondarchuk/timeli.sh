"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useI18n, useLocale } from "@vivid/i18n";
import {
  Checkbox,
  Link,
  tableSortHeader,
  tableSortNoopFunction,
} from "@vivid/ui";
import { CalendarPlus } from "lucide-react";
import { DateTime } from "luxon";
import { WaitlistEntry } from "../models";
import {
  WaitlistAdminKeys,
  WaitlistAdminNamespace,
  waitlistAdminNamespace,
} from "../translations/types";
import { WaitlistDate } from "../views/components/waitlist-date";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<WaitlistEntry & { appId: string }>[] = [
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
        href={`/admin/dashboard/services/options/${row.original.optionId}`}
        variant="underline"
      >
        {row.original.option?.name}
      </Link>
    ),
    id: "option.name",
    header: tableSortHeader<WaitlistAdminNamespace, WaitlistAdminKeys>(
      "table.columns.option",
      "string",
      waitlistAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => (
      <Link
        href={`/admin/dashboard/customers/${row.original.customerId}`}
        variant="underline"
      >
        {row.original.customer?.name || row.original.name}
      </Link>
    ),
    id: "customer.name",
    header: tableSortHeader<WaitlistAdminNamespace, WaitlistAdminKeys>(
      "table.columns.customer",
      "string",
      waitlistAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n<WaitlistAdminNamespace, WaitlistAdminKeys>(
        "app_waitlist_admin",
      );
      return t(`statuses.${row.original.status}`);
    },
    id: "status",
    header: tableSortHeader<WaitlistAdminNamespace, WaitlistAdminKeys>(
      "table.columns.status",
      "string",
      waitlistAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const locale = useLocale();
      return DateTime.fromJSDate(row.original.createdAt).toLocaleString(
        DateTime.DATETIME_MED,
        { locale },
      );
    },
    id: "createdAt",
    header: tableSortHeader<WaitlistAdminNamespace, WaitlistAdminKeys>(
      "table.columns.createdAt",
      "date",
      waitlistAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n<WaitlistAdminNamespace, WaitlistAdminKeys>(
        "app_waitlist_admin",
      );

      if (row.original.asSoonAsPossible) {
        return t("view.asSoonAsPossible");
      }

      return <WaitlistDate entry={row.original} />;
    },
    id: "dateAndTime",
    header: () => {
      const t = useI18n<WaitlistAdminNamespace, WaitlistAdminKeys>(
        "app_waitlist_admin",
      );
      return t("table.columns.dateAndTime");
    },
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n<WaitlistAdminNamespace, WaitlistAdminKeys>(
        "app_waitlist_admin",
      );
      return (
        <Link
          href={`/admin/dashboard/waitlist/appointment/new?id=${row.original._id}`}
          variant="primary"
          button
        >
          <CalendarPlus className="h-4 w-4" />{" "}
          {t("table.actions.createAppointment")}
        </Link>
      );
    },
    id: "createAppointment",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellAction waitlistEntry={row.original} appId={row.original.appId} />
    ),
  },
];

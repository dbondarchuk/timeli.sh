"use client";
import { ColumnDef } from "@tanstack/react-table";
import JsonView from "@uiw/react-json-view";
import { useI18n, useLocale } from "@vivid/i18n";
import { CommunicationLog } from "@vivid/types";
import {
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  IFrame,
  Link,
  Markdown,
} from "@vivid/ui";
import { tableSortHeader, tableSortNoopFunction } from "@vivid/ui-admin";
import { DateTime } from "luxon";

export const columns: ColumnDef<CommunicationLog>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const t = useI18n("admin");
      return (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("communicationLogs.table.actions.selectAll")}
        />
      );
    },
    cell: ({ row }) => {
      const t = useI18n("admin");
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("communicationLogs.table.actions.selectRow")}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    cell: ({ row }) => {
      const t = useI18n("admin");
      return t(`common.labels.direction.${row.original.direction}`);
    },
    id: "direction",
    header: tableSortHeader(
      "communicationLogs.table.columns.direction",
      "default",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n("admin");
      return t(`common.labels.channel.${row.original.channel}`);
    },
    id: "channel",
    header: tableSortHeader(
      "communicationLogs.table.columns.channel",
      "default",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n("admin");
      return t(`common.labels.participantType.${row.original.participantType}`);
    },
    id: "participantType",
    header: tableSortHeader(
      "communicationLogs.table.columns.participantType",
      "default",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    accessorFn: (log) => log.participant,
    id: "participant",
    header: tableSortHeader(
      "communicationLogs.table.columns.participant",
      "default",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    cell: ({ row }) => {
      const t = useI18n();
      return t(
        typeof row.original.handledBy === "string"
          ? row.original.handledBy
          : row.original.handledBy.key,
        typeof row.original.handledBy === "object" &&
          row.original.handledBy.args
          ? row.original.handledBy.args
          : undefined,
      );
    },
    id: "handledBy",
    header: tableSortHeader(
      "communicationLogs.table.columns.handler",
      "default",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    accessorFn: (log) => log.subject,
    id: "subject",
    header: tableSortHeader(
      "communicationLogs.table.columns.subject",
      "string",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "content",
    header: tableSortHeader(
      "communicationLogs.table.columns.content",
      "string",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
    cell: ({ row }) => {
      const t = useI18n("admin");
      if (row.original.text.length < 50) return row.original.text;

      return (
        <div className="flex flex-col gap-1">
          <span>{row.original.text.substring(0, 50)}...</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link-dashed">
                {t("communicationLogs.table.actions.viewMore")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[80%] flex flex-col max-h-[100%]">
              <DialogHeader>
                <DialogTitle className="w-full flex flex-row justify-between items-center mt-2">
                  {t("communicationLogs.table.actions.logContent")}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 w-full overflow-auto">
                {row.original.channel === "email" && row.original.html ? (
                  <IFrame className="w-full h-[80vh]">
                    <div
                      dangerouslySetInnerHTML={{ __html: row.original.html }}
                    />
                  </IFrame>
                ) : (
                  <Markdown
                    markdown={row.original.text}
                    className="not-prose"
                  />
                )}
              </div>
              <DialogFooter className="flex-row !justify-between gap-2">
                <DialogClose asChild>
                  <Button variant="secondary">
                    {t("communicationLogs.table.actions.close")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
  {
    id: "data",
    header: () => {
      const t = useI18n("admin");
      return t("communicationLogs.table.columns.data");
    },
    enableSorting: false,
    cell: ({ row }) => {
      const t = useI18n("admin");
      if (!row.original.data) return null;
      return (
        <div className="flex flex-col gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link-dashed">
                {t("communicationLogs.table.actions.view")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[80%] flex flex-col max-h-[100%]">
              <DialogHeader>
                <DialogTitle className="w-full flex flex-row justify-between items-center mt-2">
                  {t("communicationLogs.table.actions.logData")}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 w-full overflow-auto">
                <JsonView value={row.original.data} />
              </div>
              <DialogFooter className="flex-row !justify-between gap-2">
                <DialogClose asChild>
                  <Button variant="secondary">
                    {t("communicationLogs.table.actions.close")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
    accessorFn: () => "", // Data column doesn't need sorting
  },
  {
    cell: ({ row }) => {
      const locale = useLocale();
      return DateTime.fromJSDate(row.original.dateTime).toLocaleString(
        DateTime.DATETIME_MED,
        { locale },
      );
    },
    id: "dateTime",
    header: tableSortHeader(
      "communicationLogs.table.columns.dateTime",
      "date",
      "admin",
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "appointment.option.name",
    sortingFn: tableSortNoopFunction,
    header: tableSortHeader(
      "communicationLogs.table.columns.appointment",
      "string",
      "admin",
    ),
    cell: ({ row }) => {
      if (!row.original.appointmentId) return null;

      return (
        <Link
          variant="default"
          href={`/dashboard/appointments/${row.original.appointmentId}`}
        >
          {row.original.appointment?.option.name}
        </Link>
      );
    },
  },
  {
    id: "customer.name",
    sortingFn: tableSortNoopFunction,
    header: tableSortHeader(
      "communicationLogs.table.columns.customer",
      "string",
      "admin",
    ),
    cell: ({ row }) => {
      if (!row.original.customer) return null;

      return (
        <Link
          variant="default"
          href={`/dashboard/customers/${row.original.customer._id}`}
        >
          {row.original.customer.name}
        </Link>
      );
    },
  },
];

export const CommunicationLogsTableColumnsCount = columns.length;

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useI18n } from "@timelish/i18n";
import { Badge, Checkbox, Link } from "@timelish/ui";
import { tableSortHeader, tableSortNoopFunction } from "@timelish/ui-admin";
import { DateTime } from "luxon";
import { BlogCommentListItem } from "../../models";
import {
  BlogAdminKeys,
  BlogAdminNamespace,
  blogAdminNamespace,
} from "../../translations/types";
import { CellAction } from "./cell-action";

const bodyPreview = (body: string, maxLen = 80) => {
  return body.length > maxLen ? `${body.slice(0, maxLen)}…` : body;
};

const StatusCell: React.FC<{ status: BlogCommentListItem["status"] }> = ({
  status,
}) => {
  const t = useI18n<BlogAdminNamespace, BlogAdminKeys>(blogAdminNamespace);
  return (
    <Badge variant={status === "approved" ? "default" : "secondary"}>
      {t(`comments.status.${status}` satisfies BlogAdminKeys)}
    </Badge>
  );
};

export type CommentsTableRow = BlogCommentListItem & { appId: string };

export const columns: ColumnDef<CommentsTableRow>[] = [
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
    id: "postTitle",
    accessorKey: "postTitle",
    header: tableSortHeader(
      "comments.table.columns.post" satisfies BlogAdminKeys,
      "string",
      blogAdminNamespace,
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/blog/edit?id=${row.original.postId}`}
        variant="underline"
      >
        {row.original.postTitle ?? row.original.postId}
      </Link>
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "authorName",
    accessorKey: "authorName",
    header: tableSortHeader(
      "comments.table.columns.authorName" satisfies BlogAdminKeys,
      "string",
      blogAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "authorEmail",
    accessorKey: "authorEmail",
    header: tableSortHeader(
      "comments.table.columns.authorEmail" satisfies BlogAdminKeys,
      "string",
      blogAdminNamespace,
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "body",
    accessorKey: "body",
    header: tableSortHeader(
      "comments.table.columns.body" satisfies BlogAdminKeys,
      "string",
      blogAdminNamespace,
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground truncate max-w-[240px] block">
        {bodyPreview(row.original.body)}
      </span>
    ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "status",
    accessorKey: "status",
    header: tableSortHeader(
      "comments.table.columns.status" satisfies BlogAdminKeys,
      "string",
      blogAdminNamespace,
    ),
    cell: ({ row }) => <StatusCell status={row.original.status} />,
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: tableSortHeader(
      "comments.table.columns.createdAt" satisfies BlogAdminKeys,
      "date",
      blogAdminNamespace,
    ),
    cell: ({ row }) =>
      DateTime.fromJSDate(new Date(row.original.createdAt)).toLocaleString(
        DateTime.DATETIME_MED,
      ),
    sortingFn: tableSortNoopFunction,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellAction comment={row.original} appId={row.original.appId} />
    ),
  },
];

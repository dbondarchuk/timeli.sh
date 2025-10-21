"use client";
import { adminApi } from "@vivid/api-sdk";
import { useI18n } from "@vivid/i18n";
import { PageHeaderListModel } from "@vivid/types";
import {
  AlertModal,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toastPromise,
} from "@vivid/ui";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Link from "next/link";

interface CellActionProps {
  pageHeader: PageHeaderListModel;
}

export const CellAction: React.FC<CellActionProps> = ({ pageHeader }) => {
  const t = useI18n("admin");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);

      await toastPromise(
        adminApi.pageHeaders.deletePageHeader(pageHeader._id),
        {
          success: t("pages.headers.toasts.pageHeaderDeleted", {
            name: pageHeader.name,
          }),
          error: t("pages.headers.table.delete.error"),
        },
      );

      setOpen(false);
      router.refresh();
    } catch (error: any) {
      setLoading(false);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">
              {t("pages.headers.table.actions.openMenu")}
            </span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {t("pages.headers.table.actions.actions")}
          </DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href={`/admin/dashboard/pages/headers/${pageHeader._id}`}>
              <Edit className="h-4 w-4" />{" "}
              {t("pages.headers.table.actions.edit")}
            </Link>
          </DropdownMenuItem>
          {pageHeader.usedCount === 0 && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Trash className="h-4 w-4" />{" "}
              {t("pages.headers.table.actions.delete")}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

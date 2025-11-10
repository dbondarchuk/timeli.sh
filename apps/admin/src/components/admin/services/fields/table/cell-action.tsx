"use client";
import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import { ServiceField } from "@timelish/types";
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
} from "@timelish/ui";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Link from "next/link";

interface CellActionProps {
  field: ServiceField;
}

export const CellAction: React.FC<CellActionProps> = ({ field }) => {
  const t = useI18n("admin");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);

      await toastPromise(adminApi.serviceFields.deleteServiceField(field._id), {
        success: t("services.fields.table.cellAction.fieldDeleted", {
          label: field.data.label,
        }),
        error: t("services.fields.table.cellAction.deleteError"),
      });

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
            <span className="sr-only">{t("common.openMenu")}</span>
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {t("services.fields.table.cellAction.actions")}
          </DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/services/fields/new?from=${field._id}`}>
              <Copy className="size-3.5" />{" "}
              {t("services.fields.table.cellAction.clone")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/services/fields/${field._id}`}>
              <Edit className="size-3.5" />{" "}
              {t("services.fields.table.cellAction.update")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="size-3.5" />{" "}
            {t("services.fields.table.cellAction.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

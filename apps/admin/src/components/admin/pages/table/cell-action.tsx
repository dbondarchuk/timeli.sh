"use client";
import { adminApi } from "@vivid/api-sdk";
import { useI18n } from "@vivid/i18n";
import { Page } from "@vivid/types";
import {
  AlertModal,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toast,
  toastPromise,
} from "@vivid/ui";
import copy from "copy-text-to-clipboard";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CellActionProps {
  page: Page;
}

export const CellAction: React.FC<CellActionProps> = ({ page: page }) => {
  const t = useI18n("admin");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const copyRelative = () => {
    const url = `/${page.slug}`;
    copy(url);

    toast.info(t("assets.toasts.copied"), {
      description: t("pages.toasts.relativeUrlCopied", { url }),
      icon: <Copy />,
    });
  };

  const copyAbsolute = () => {
    const url = `${window.location.origin}/${page.slug}`;
    copy(url);

    toast.info(t("assets.toasts.copied"), {
      description: t("pages.toasts.absoluteUrlCopied", { url }),
      icon: <Copy />,
    });
  };

  const onConfirm = async () => {
    try {
      setLoading(true);

      await toastPromise(adminApi.pages.deletePage(page._id), {
        success: t("pages.toasts.pageDeleted", { title: page.title }),
        error: t("pages.table.delete.error"),
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
            <span className="sr-only">{t("pages.table.actions.openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {t("pages.table.actions.actions")}
          </DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href={`/dashboard/pages/${page._id}`}>
              <Edit className="h-4 w-4" /> {t("pages.table.actions.edit")}
            </Link>
          </DropdownMenuItem>
          {page.slug !== "home" && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Trash className="h-4 w-4" /> {t("pages.table.actions.delete")}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyRelative}>
            <Copy className="h-4 w-4" />{" "}
            {t("pages.table.actions.copyRelativeUrl")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyAbsolute}>
            <Copy className="h-4 w-4" />{" "}
            {t("pages.table.actions.copyAbsoluteUrl")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

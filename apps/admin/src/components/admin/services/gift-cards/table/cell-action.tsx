"use client";
import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import { GiftCardListModel } from "@timelish/types";
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
import {
  Edit,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CellActionProps {
  giftCard: GiftCardListModel;
}

export const CellAction: React.FC<CellActionProps> = ({ giftCard }) => {
  const t = useI18n("admin");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isActive = giftCard.status === "active";

  const onConfirm = async () => {
    try {
      setLoading(true);

      await toastPromise(adminApi.giftCards.deleteGiftCard(giftCard._id), {
        success: t("services.giftCards.table.cellAction.giftCardDeleted", {
          code: giftCard.code,
        }),
        error: t("common.toasts.error"),
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

  const onSetStatus = async (status: "active" | "inactive") => {
    try {
      await toastPromise(
        adminApi.giftCards.setGiftCardStatus(giftCard._id, status),
        {
          success:
            status === "active"
              ? t("services.giftCards.table.cellAction.giftCardSetActive", {
                  code: giftCard.code,
                })
              : t("services.giftCards.table.cellAction.giftCardSetInactive", {
                  code: giftCard.code,
                }),
          error: t("common.toasts.error"),
        },
      );
      router.refresh();
    } catch (error: any) {
      console.error(error);
    }
  };

  const canDelete =
    !giftCard.paymentsCount && giftCard.payment?.method !== "online";

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
            {t("services.giftCards.table.cellAction.actions")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/services/gift-cards/${giftCard._id}`}
              className="text-foreground"
            >
              <Edit className="size-3.5" />{" "}
              {t("services.giftCards.table.cellAction.update")}
            </Link>
          </DropdownMenuItem>
          {!isActive && (
            <DropdownMenuItem onClick={() => onSetStatus("active")}>
              <ToggleRight className="size-3.5" />{" "}
              {t("services.giftCards.table.cellAction.setActive")}
            </DropdownMenuItem>
          )}
          {isActive && (
            <DropdownMenuItem onClick={() => onSetStatus("inactive")}>
              <ToggleLeft className="size-3.5" />{" "}
              {t("services.giftCards.table.cellAction.setInactive")}
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Trash className="size-3.5" />{" "}
              {t("services.giftCards.table.cellAction.delete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

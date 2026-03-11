"use client";

import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toastPromise,
} from "@timelish/ui";
import { useReload } from "@timelish/ui-admin";
import { MoreHorizontal, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../../translations/types";
import { PurchasesTableRow } from "./columns";

interface CellActionProps {
  purchase: PurchasesTableRow;
}

export const CellAction: React.FC<CellActionProps> = ({ purchase }) => {
  const tUi = useI18n("ui");
  const t = useI18n<GiftCardStudioAdminNamespace, GiftCardStudioAdminKeys>(
    giftCardStudioAdminNamespace,
  );
  const [loading, setLoading] = useState(false);
  const { reload } = useReload();
  const isActive = purchase.status === "active";

  const onSetStatus = async (status: "active" | "inactive") => {
    try {
      setLoading(true);
      await toastPromise(
        adminApi.giftCards.setGiftCardStatus(purchase.giftCardId, status),
        {
          success:
            status === "active"
              ? t("purchases.table.toast.setActive", {
                  code: purchase.giftCardCode ?? purchase.giftCardId,
                })
              : t("purchases.table.toast.setInactive", {
                  code: purchase.giftCardCode ?? purchase.giftCardId,
                }),
          error: tUi("common.toasts.error"),
        },
      );
      reload();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <span className="sr-only">{tUi("common.openMenu")}</span>
          <MoreHorizontal className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{tUi("actions.label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isActive && (
          <DropdownMenuItem onClick={() => onSetStatus("active")}>
            <ToggleRight className="size-3.5" />{" "}
            {t("purchases.table.actions.setActive")}
          </DropdownMenuItem>
        )}
        {isActive && (
          <DropdownMenuItem onClick={() => onSetStatus("inactive")}>
            <ToggleLeft className="size-3.5" />{" "}
            {t("purchases.table.actions.setInactive")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

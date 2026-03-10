"use client";

import { useI18n } from "@timelish/i18n";
import { AlertModal, Button, Spinner, toastPromise } from "@timelish/ui";
import { Trash } from "lucide-react";
import { useQueryState } from "nuqs";
import React from "react";
import { deleteDesigns } from "../../actions";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../../translations/types";
import { DesignsTableRow } from "./columns";

export const DeleteSelectedDesignsButton: React.FC<{
  appId: string;
  selected: DesignsTableRow[];
  disabled?: boolean;
}> = ({ selected, appId, disabled }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const t = useI18n<
    GiftCardStudioAdminNamespace,
    GiftCardStudioAdminKeys
  >(giftCardStudioAdminNamespace);
  const tAdmin = useI18n("admin");

  const [, reload] = useQueryState("ts", { history: "replace" });
  const action = async () => {
    try {
      setIsLoading(true);
      await toastPromise(
        deleteDesigns(
          appId,
          selected.map((r) => r._id),
        ),
        {
          success: t("designs.table.toast.designsDeleted", {
            count: selected.length,
          }),
          error: tAdmin("common.toasts.error"),
        },
      );
      reload(`${Date.now()}`);
      setIsOpen(false);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        disabled={disabled || isLoading || !selected || !selected.length}
        onClick={() => setIsOpen(true)}
      >
        {isLoading && <Spinner />}
        <Trash className="mr-2 h-4 w-4" />
        <span>
          {t("designs.table.deleteSelected.label", { count: selected.length })}
        </span>
      </Button>
      <AlertModal
        isOpen={isOpen}
        loading={isLoading}
        onClose={() => setIsOpen(false)}
        onConfirm={action}
        description={t("designs.table.deleteSelected.description", {
          count: selected.length,
        })}
        continueButton={t("designs.table.deleteSelected.confirm", {
          count: selected.length,
        })}
      />
    </>
  );
}


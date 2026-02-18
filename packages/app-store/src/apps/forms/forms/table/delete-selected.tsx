"use client";

import { useI18n } from "@timelish/i18n";
import { AlertModal, Button, Spinner, toastPromise } from "@timelish/ui";
import { Trash } from "lucide-react";
import { useQueryState } from "nuqs";
import React from "react";
import { deleteSelectedForms } from "../../actions";
import {
  FormsAdminKeys,
  FormsAdminNamespace,
  formsAdminNamespace,
} from "../../translations/types";
import { FormsTableRow } from "./columns";

export const DeleteSelectedFormsButton: React.FC<{
  appId: string;
  selected: FormsTableRow[];
  disabled?: boolean;
}> = ({ selected, appId, disabled }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const t = useI18n<FormsAdminNamespace, FormsAdminKeys>(formsAdminNamespace);
  const tAdmin = useI18n("admin");

  const [_, reload] = useQueryState("ts", { history: "replace" });
  const action = async () => {
    try {
      setIsLoading(true);

      await toastPromise(
        deleteSelectedForms(
          appId,
          selected.map((r) => r._id),
        ),
        {
          success: t("forms.table.toast.formsDeleted", {
            count: selected.length,
          }),
          error: tAdmin("common.toasts.error"),
        },
      );

      reload(`${new Date().valueOf()}`);
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
          {t("forms.table.deleteSelected.label", {
            count: selected.length,
          })}
        </span>
      </Button>
      <AlertModal
        isOpen={isOpen}
        loading={isLoading}
        onClose={() => setIsOpen(false)}
        onConfirm={action}
        description={t("forms.table.deleteSelected.description", {
          count: selected.length,
        })}
        continueButton={t("forms.table.deleteSelected.confirm", {
          count: selected.length,
        })}
      />
    </>
  );
};

"use client";

import { useI18n } from "@timelish/i18n";
import { AlertModal, Button, Spinner, toastPromise } from "@timelish/ui";
import { ArchiveRestore } from "lucide-react";
import { useQueryState } from "nuqs";
import React from "react";
import { setFormsArchived } from "../../actions";
import {
  FormsAdminKeys,
  FormsAdminNamespace,
  formsAdminNamespace,
} from "../../translations/types";
import { FormsTableRow } from "./columns";

export const UnarchiveSelectedFormsButton: React.FC<{
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
        setFormsArchived(
          appId,
          selected.map((r) => r._id),
          false,
        ),
        {
          success: t("forms.table.toast.formsUnarchived", {
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
        variant="secondary"
        disabled={disabled || isLoading || !selected?.length}
        onClick={() => setIsOpen(true)}
      >
        {isLoading && <Spinner />}
        <ArchiveRestore className="mr-2 h-4 w-4" />
        <span>
          {t("forms.table.unarchiveSelected.label", { count: selected.length })}
        </span>
      </Button>
      <AlertModal
        isOpen={isOpen}
        loading={isLoading}
        onClose={() => setIsOpen(false)}
        onConfirm={action}
        description={t("forms.table.unarchiveSelected.description", {
          count: selected.length,
        })}
        continueButton={t("forms.table.unarchiveSelected.confirm", {
          count: selected.length,
        })}
      />
    </>
  );
};

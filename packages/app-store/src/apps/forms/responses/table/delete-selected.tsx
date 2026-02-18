"use client";

import { useI18n } from "@timelish/i18n";
import { AlertModal, Button, Spinner, toastPromise } from "@timelish/ui";
import { Trash } from "lucide-react";
import { useQueryState } from "nuqs";
import React from "react";
import { deleteSelectedFormResponses } from "../../actions";
import {
  FormsAdminKeys,
  FormsAdminNamespace,
  formsAdminNamespace,
} from "../../translations/types";
import { ResponsesTableRow } from "./columns";

export const DeleteSelectedFormResponsesButton: React.FC<{
  appId: string;
  selected: ResponsesTableRow[];
}> = ({ selected, appId }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const t = useI18n<FormsAdminNamespace, FormsAdminKeys>(formsAdminNamespace);
  const tAdmin = useI18n("admin");

  const [_, reload] = useQueryState("ts", { history: "replace" });
  const action = async () => {
    try {
      setIsLoading(true);

      await toastPromise(
        deleteSelectedFormResponses(
          appId,
          selected.map((r) => r._id),
        ),
        {
          success: t("responses.table.toast.responsesDeleted", {
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
        disabled={isLoading || !selected || !selected.length}
        onClick={() => setIsOpen(true)}
      >
        {isLoading && <Spinner />}
        <Trash className="mr-2 h-4 w-4" />
        <span>
          {t("responses.table.deleteSelected.label", {
            count: selected.length,
          })}
        </span>
      </Button>
      <AlertModal
        isOpen={isOpen}
        loading={isLoading}
        onClose={() => setIsOpen(false)}
        onConfirm={action}
        description={t("responses.table.deleteSelected.description", {
          count: selected.length,
        })}
        continueButton={t("responses.table.deleteSelected.confirm", {
          count: selected.length,
        })}
      />
    </>
  );
};

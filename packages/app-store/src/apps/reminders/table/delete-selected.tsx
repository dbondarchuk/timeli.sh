"use client";

import { useI18n } from "@vivid/i18n";
import { AlertModal, Button, Spinner, toastPromise } from "@vivid/ui";
import { Trash } from "lucide-react";
import { useQueryState } from "nuqs";
import React from "react";
import { deleteSelectedReminders } from "../actions";
import { Reminder } from "../models";
import {
  RemindersAdminKeys,
  RemindersAdminNamespace,
  remindersAdminNamespace,
} from "../translations/types";

export const DeleteSelectedRemindersButton: React.FC<{
  appId: string;
  selected: Reminder[];
}> = ({ selected, appId }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const t = useI18n<RemindersAdminNamespace, RemindersAdminKeys>(
    remindersAdminNamespace,
  );
  const tAdmin = useI18n("admin");

  const [_, reload] = useQueryState("ts", { history: "replace" });
  const action = async () => {
    try {
      setIsLoading(true);

      await toastPromise(
        deleteSelectedReminders(
          appId,
          selected.map((r) => r._id),
        ),
        {
          success: t("statusText.reminders_deleted", {
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
          {t("table.deleteSelected.label", {
            count: selected.length,
          })}
        </span>
      </Button>
      <AlertModal
        isOpen={isOpen}
        loading={isLoading}
        onClose={() => setIsOpen(false)}
        onConfirm={action}
        description={t("table.deleteSelected.description", {
          count: selected.length,
        })}
      />
    </>
  );
};

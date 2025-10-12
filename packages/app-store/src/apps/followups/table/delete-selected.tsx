"use client";

import { useI18n } from "@vivid/i18n";
import { AlertModal, Button, Spinner, toastPromise } from "@vivid/ui";
import { Trash } from "lucide-react";
import { useQueryState } from "nuqs";
import React from "react";
import { deleteFollowUps } from "../actions";
import { FollowUp } from "../models";
import {
  FollowUpsAdminKeys,
  FollowUpsAdminNamespace,
  followUpsAdminNamespace,
} from "../translations/types";

export const DeleteSelectedFollowUpsButton: React.FC<{
  appId: string;
  selected: FollowUp[];
}> = ({ selected, appId }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const t = useI18n<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
    followUpsAdminNamespace,
  );

  const [_, reload] = useQueryState("ts", { history: "replace" });
  const action = async () => {
    try {
      setIsLoading(true);

      await toastPromise(
        deleteFollowUps(
          appId,
          selected.map((r) => r._id),
        ),
        {
          success: t("statusText.follow_ups_deleted", {
            count: selected.length,
          }),
          error: t("statusText.error_deleting_follow_ups"),
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
        title={t("table.deleteSelected.label", {
          count: selected.length,
        })}
        continueButton={t("table.deleteSelected.confirm", {
          count: selected.length,
        })}
      />
    </>
  );
};

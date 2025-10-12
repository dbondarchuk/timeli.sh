"use client";
import {
  AlertModal,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  toastPromise,
} from "@vivid/ui";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";

import { useI18n } from "@vivid/i18n";
import { deleteFollowUps } from "../actions";
import { FollowUp } from "../models";
import {
  FollowUpsAdminKeys,
  FollowUpsAdminNamespace,
  followUpsAdminNamespace,
} from "../translations/types";

interface CellActionProps {
  followUp: FollowUp;
  appId: string;
}

export const CellAction: React.FC<CellActionProps> = ({ followUp, appId }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const t = useI18n<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
    followUpsAdminNamespace,
  );
  const tUi = useI18n("ui");

  const [_, reload] = useQueryState("ts", { history: "replace" });

  const onConfirm = async () => {
    try {
      setLoading(true);

      await toastPromise(deleteFollowUps(appId, [followUp._id]), {
        success: t("statusText.follow_up_deleted", {
          name: followUp.name,
        }),
        error: t("statusText.error_deleting_follow_up"),
      });

      setOpen(false);
      reload(`${new Date().valueOf()}`);
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
        title={t("table.delete.title")}
        description={t("table.delete.description")}
        continueButton={t("table.delete.confirm")}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tUi("common.openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{tUi("actions.label")}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href={`/admin/dashboard/communications/follow-ups/edit?id=${followUp._id}`}
            >
              <Edit className="h-4 w-4" /> {tUi("actions.update")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4" /> {tUi("actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

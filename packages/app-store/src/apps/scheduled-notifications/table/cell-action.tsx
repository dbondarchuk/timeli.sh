"use client";
import { useI18n } from "@timelish/i18n";
import {
  AlertModal,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  toastPromise,
} from "@timelish/ui";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";

import { deleteScheduledNotification } from "../actions";
import { ScheduledNotification } from "../models";
import {
  ScheduledNotificationsAdminKeys,
  scheduledNotificationsAdminNamespace,
  ScheduledNotificationsAdminNamespace,
} from "../translations/types";

interface CellActionProps {
  scheduledNotification: ScheduledNotification;
  appId: string;
}

export const CellAction: React.FC<CellActionProps> = ({
  scheduledNotification,
  appId,
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const t = useI18n<
    ScheduledNotificationsAdminNamespace,
    ScheduledNotificationsAdminKeys
  >(scheduledNotificationsAdminNamespace);

  const tAdmin = useI18n("admin");

  const [_, reload] = useQueryState("ts", { history: "replace" });

  const onConfirm = async () => {
    try {
      setLoading(true);

      await toastPromise(
        deleteScheduledNotification(appId, scheduledNotification._id),
        {
          success: t("statusText.scheduled_notification_deleted"),
          error: tAdmin("common.toasts.error"),
        },
      );

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
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tAdmin("common.openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("table.actions.label")}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/communications/scheduled-notifications/edit?id=${scheduledNotification._id}`}
            >
              <Edit className="h-4 w-4" /> {t("table.actions.edit")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4" /> {t("table.actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

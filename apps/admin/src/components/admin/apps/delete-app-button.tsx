"use client";

import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Spinner,
  toastPromise,
} from "@timelish/ui";
import { Unplug } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export type DeleteAppButtonProps = {
  appId: string;
};

export const DeleteAppButton: React.FC<DeleteAppButtonProps> = ({ appId }) => {
  const router = useRouter();
  const t = useI18n("apps");

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const disconnectApp = async () => {
    setIsLoading(true);
    try {
      await toastPromise(adminApi.apps.deleteApp(appId), {
        success: t("common.appDisconnected"),
        error: t("common.disconnectError"),
      });

      setIsDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Unplug /> {t("common.disconnectApp")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("common.disconnectConfirmTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("common.disconnectConfirmDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <Button
            disabled={isLoading}
            onClick={disconnectApp}
            className="flex flex-row gap-1 items-center"
          >
            {isLoading ? <Spinner /> : <Unplug />}{" "}
            <span>{t("common.disconnect")}</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

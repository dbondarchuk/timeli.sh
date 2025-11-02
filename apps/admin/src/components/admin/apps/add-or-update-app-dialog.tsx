"use client";

import { AvailableApps } from "@vivid/app-store";
import { AppSetups } from "@vivid/app-store/setup";
import { useI18n } from "@vivid/i18n";
import { AppSetupProps, ConnectedApp } from "@vivid/types";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Spinner,
  toast,
} from "@vivid/ui";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo } from "react";

export type AddOrUpdateAppButtonProps = {} & (
  | {
      app: ConnectedApp;
    }
  | {
      children: React.ReactNode;
      appType: string;
    }
);

export const AddOrUpdateAppButton: React.FC<AddOrUpdateAppButtonProps> = ({
  ...props
}) => {
  const router = useRouter();
  const t = useI18n("apps");

  let app: ConnectedApp | undefined = undefined;
  let appType: string;

  if ("app" in props) {
    app = props.app;
    appType = props.app.name;
  } else {
    appType = props.appType;
  }

  // TODO: For some reason, sometimes on installed app list passed children are not rendered
  // This is a workaround to ensure the button is rendered
  const children =
    "app" in props ? (
      <Button variant="secondary">
        <RefreshCcw /> {t("common.updateApp")}
      </Button>
    ) : (
      props.children
    );

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = useCallback(
    (redirect?: boolean) => {
      setIsOpen(false);
      setIsLoading(false);
      if (app) {
        router.refresh();
      } else if (redirect) {
        router.push("/dashboard/apps");
      }
    },
    [app, router],
  );

  const setupProps: AppSetupProps = useMemo(
    () => ({
      onSuccess: () => {
        toast.success(t("common.connectedAppSetup.success.description"));
        closeDialog(true);
      },
      onError: (
        error: string | { key: string; args?: Record<string, any> },
      ) => {
        console.error(
          `Failed to set up app: ${typeof error === "string" ? error : error.key}`,
        );

        toast.error(t("common.connectedAppSetup.error.description"));
      },
      appId: app?._id,
    }),
    [app?._id, t, closeDialog],
  );

  const AppSetupElement = React.useMemo(() => {
    if (!appType) return null;

    const app = AvailableApps[appType];
    if (app.type === "complex" || app.type === "system") return null;

    return AppSetups[appType](setupProps);
  }, [appType, setupProps]);

  const onDialogOpenChange = (open: boolean) => {
    if (open) openDialog();
    else closeDialog();
  };

  const title = app ? t("common.updateApp") : t("common.connectNewApp");

  console.log(appType);

  return (
    <Dialog open={isOpen} onOpenChange={onDialogOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full sm:max-w-lg" aria-description={title}>
        <DialogHeader className="px-1">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="w-full overflow-y-auto px-1">
          <div className="flex flex-col gap-4 py-4 relative w-full">
            {AppSetupElement}
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white opacity-50">
                <div role="status">
                  <Spinner className="w-20 h-20" />
                  <span className="sr-only">{t("common.pleaseWait")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="px-1">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("common.close")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import { AvailableApps } from "@timelish/app-store";
import { AppSetups } from "@timelish/app-store/setup";
import { useI18n } from "@timelish/i18n";
import {
  AppSetupProps,
  ConnectedApp,
  DefaultAppScope,
  defaultAppScopes,
} from "@timelish/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
  toastPromise,
} from "@timelish/ui";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo } from "react";
import { setDefaultAppByScope } from "./store/actions";

export type AddOrUpdateAppButtonProps = {
  children: React.ReactNode;
  /** When true, a new connection only refreshes the page (install wizard); default sends users to /dashboard/apps. */
  refreshOnClose?: boolean;
  dontAskToSetDefault?: boolean;
} & (
  | {
      app: ConnectedApp;
    }
  | {
      appType: string;
    }
);

export const AddOrUpdateAppButton: React.FC<AddOrUpdateAppButtonProps> = ({
  children,
  refreshOnClose = false,
  dontAskToSetDefault = false,
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

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [pendingDefaultPrompt, setPendingDefaultPrompt] = React.useState<{
    appId: string;
    scope: DefaultAppScope;
  } | null>(null);
  const [settingDefault, setSettingDefault] = React.useState(false);
  const isCalendarSourcePrompt =
    pendingDefaultPrompt?.scope === "calendar-read";

  const defaultScope = useMemo(() => {
    const currentApp = AvailableApps[appType];
    if (!currentApp) return undefined;
    return defaultAppScopes.find((scope) => currentApp.scope.includes(scope));
  }, [appType]);

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = useCallback(
    (redirect?: boolean) => {
      setIsOpen(false);
      setIsLoading(false);
      if (app) {
        router.refresh();
      } else if (refreshOnClose) {
        router.refresh();
      } else if (redirect) {
        router.push("/dashboard/apps");
      }
    },
    [app, refreshOnClose, router],
  );

  const setupProps: AppSetupProps = useMemo(
    () => ({
      onSuccess: (appId: string, doNotCloseDialog?: boolean) => {
        toast.success(t("common.connectedAppSetup.success.description"));
        if (app || !defaultScope || dontAskToSetDefault) {
          if (!doNotCloseDialog) {
            closeDialog(true);
          }
          return;
        }

        if (appId) {
          setPendingDefaultPrompt({ appId, scope: defaultScope });
          setIsOpen(false);
        } else if (!doNotCloseDialog) {
          closeDialog(true);
        }
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

  const onSetDefault = async () => {
    if (!pendingDefaultPrompt) return;
    try {
      setSettingDefault(true);
      await toastPromise(
        setDefaultAppByScope(
          pendingDefaultPrompt.appId,
          pendingDefaultPrompt.scope,
        ),
        {
          success: isCalendarSourcePrompt
            ? t("common.calendarSourcePrompt.toasts.setSuccess")
            : t("common.defaultAppPrompt.toasts.setSuccess"),
          error: isCalendarSourcePrompt
            ? t("common.calendarSourcePrompt.toasts.setError")
            : t("common.defaultAppPrompt.toasts.setError"),
        },
      );
    } finally {
      setSettingDefault(false);
      setPendingDefaultPrompt(null);
      closeDialog(true);
    }
  };

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onDialogOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="w-full sm:max-w-lg" aria-description={title}>
          <DialogHeader className="px-1">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="w-full overflow-y-auto max-h-[70svh] px-1">
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
      <AlertDialog
        open={!!pendingDefaultPrompt}
        onOpenChange={(open) => {
          if (!open && !settingDefault) {
            setPendingDefaultPrompt(null);
            closeDialog(true);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isCalendarSourcePrompt
                ? t("common.calendarSourcePrompt.title")
                : t("common.defaultAppPrompt.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isCalendarSourcePrompt
                ? t("common.calendarSourcePrompt.description")
                : t("common.defaultAppPrompt.description", {
                    target: pendingDefaultPrompt
                      ? t(
                          `common.defaultAppPrompt.targets.${pendingDefaultPrompt.scope}` as any,
                        )
                      : "",
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={settingDefault}
              onClick={() => {
                setPendingDefaultPrompt(null);
                closeDialog(true);
              }}
            >
              {isCalendarSourcePrompt
                ? t("common.calendarSourcePrompt.actions.skip")
                : t("common.defaultAppPrompt.actions.skip")}
            </AlertDialogCancel>
            <Button
              disabled={settingDefault || !pendingDefaultPrompt}
              onClick={onSetDefault}
            >
              {settingDefault && <Spinner />}
              {isCalendarSourcePrompt
                ? t("common.calendarSourcePrompt.actions.add")
                : t("common.defaultAppPrompt.actions.setDefault")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

"use client";

import { AvailableApps } from "@timelish/app-store";
import { BaseAllKeys, useI18n } from "@timelish/i18n";
import { ComplexApp, DefaultAppScope, defaultAppScopes } from "@timelish/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Spinner,
  toastPromise,
} from "@timelish/ui";
import { useRouter } from "next/navigation";
import React from "react";
import {
  installComplexApp,
  setAppStatus,
  setDefaultAppByScope,
} from "./actions";

export const InstallComplexAppButton: React.FC<{
  appName: string;
  installed: number;
}> = ({ appName, installed }) => {
  const app = React.useMemo(() => AvailableApps[appName], [appName]);
  const router = useRouter();
  const t = useI18n("apps");
  const [pendingDefaultPrompt, setPendingDefaultPrompt] = React.useState<{
    appId: string;
    scope: DefaultAppScope;
  } | null>(null);
  const [settingDefault, setSettingDefault] = React.useState(false);
  const isCalendarSourcePrompt =
    pendingDefaultPrompt?.scope === "calendar-read";

  const defaultScope = React.useMemo(() => {
    return defaultAppScopes.find((scope) => app.scope.includes(scope));
  }, [app.scope]);

  const finishInstallNavigation = React.useCallback(async () => {
    if (app.type === "complex" && app.settingsHref) {
      router.push(`/dashboard/${app.settingsHref}`);
    } else if (app.type === "system") {
      router.refresh();
    }
  }, [(app as ComplexApp).settingsHref, app.type, router]);

  const installComplex = async () => {
    if (app.type !== "complex" && app.type !== "system") return;

    const installFn = async () => {
      const appId = await installComplexApp(appName);
      if (app.type === "system") {
        await setAppStatus(appId, {
          status: "connected",
          statusText: "apps.common.statusText.installed" satisfies BaseAllKeys,
        });
      }

      if (defaultScope) {
        setPendingDefaultPrompt({ appId, scope: defaultScope });
      } else {
        await finishInstallNavigation();
      }
    };

    try {
      await toastPromise(installFn(), {
        success: t("common.statusText.connected"),
        error: t("common.statusText.error"),
      });
    } catch (error: any) {
      console.error(`Failed to set up app: ${error}`);
    }
  };
  return (
    <>
      <Button
        variant="default"
        disabled={app.dontAllowMultiple && installed > 0}
        onClick={installComplex}
      >
        {app.dontAllowMultiple && installed > 0
          ? t("common.alreadyInstalled")
          : t("common.addApp")}
      </Button>
      <AlertDialog
        open={!!pendingDefaultPrompt}
        onOpenChange={(open) => {
          if (!open && !settingDefault) {
            setPendingDefaultPrompt(null);
            void finishInstallNavigation();
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
              onClick={async () => {
                setPendingDefaultPrompt(null);
                await finishInstallNavigation();
              }}
            >
              {isCalendarSourcePrompt
                ? t("common.calendarSourcePrompt.actions.skip")
                : t("common.defaultAppPrompt.actions.skip")}
            </AlertDialogCancel>
            <Button
              disabled={settingDefault || !pendingDefaultPrompt}
              onClick={async () => {
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
                  await finishInstallNavigation();
                }
              }}
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

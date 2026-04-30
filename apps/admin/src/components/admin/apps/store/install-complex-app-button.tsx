"use client";

import { AvailableApps } from "@timelish/app-store";
import { BaseAllKeys, useI18n } from "@timelish/i18n";
import {
  ComplexApp,
  DefaultAppToInstallScope,
  defaultAppToInstallScopes,
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
  Checkbox,
  Label,
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
    scopes: DefaultAppToInstallScope[];
  } | null>(null);
  const [selectedScopes, setSelectedScopes] = React.useState<
    DefaultAppToInstallScope[]
  >([]);
  const [settingDefault, setSettingDefault] = React.useState(false);

  const defaultScopes = React.useMemo(() => {
    return defaultAppToInstallScopes.filter((scope) =>
      app.scope.includes(scope),
    );
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

      if (defaultScopes.length) {
        setPendingDefaultPrompt({ appId, scopes: defaultScopes });
        setSelectedScopes(defaultScopes);
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

  const onSetDefault = async () => {
    if (!pendingDefaultPrompt) return;
    try {
      setSettingDefault(true);
      await toastPromise(
        setDefaultAppByScope(pendingDefaultPrompt.appId, selectedScopes),
        {
          success: t("common.installTargetsPrompt.toasts.setSuccess"),
          error: t("common.installTargetsPrompt.toasts.setError"),
        },
      );
    } finally {
      setSettingDefault(false);
      setPendingDefaultPrompt(null);
      await finishInstallNavigation();
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
              {t("common.installTargetsPrompt.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.installTargetsPrompt.description")}
            </AlertDialogDescription>
            <div className="flex flex-col gap-2 pt-2">
              {pendingDefaultPrompt?.scopes.map((scope) => (
                <Label key={scope} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedScopes.includes(scope)}
                    onCheckedChange={(checked) => {
                      setSelectedScopes((prev) =>
                        checked
                          ? [...prev, scope]
                          : prev.filter((s) => s !== scope),
                      );
                    }}
                  />
                  <span>
                    {t(`common.installTargetsPrompt.targets.${scope}`)}
                  </span>
                </Label>
              ))}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={settingDefault}
              onClick={async () => {
                setPendingDefaultPrompt(null);
                await finishInstallNavigation();
              }}
            >
              {t("common.installTargetsPrompt.actions.skip")}
            </AlertDialogCancel>
            <Button
              disabled={
                settingDefault ||
                !pendingDefaultPrompt ||
                !selectedScopes.length
              }
              onClick={onSetDefault}
            >
              {settingDefault && <Spinner />}
              {t("common.installTargetsPrompt.actions.apply")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

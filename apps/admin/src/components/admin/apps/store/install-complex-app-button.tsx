"use client";

import { AvailableApps } from "@vivid/app-store";
import { useI18n } from "@vivid/i18n";
import { Button, toastPromise } from "@vivid/ui";
import { useRouter } from "next/navigation";
import React from "react";
import { installComplexApp, setAppStatus } from "./actions";

export const InstallComplexAppButton: React.FC<{
  appName: string;
  installed: number;
}> = ({ appName, installed }) => {
  const app = React.useMemo(() => AvailableApps[appName], [appName]);
  const router = useRouter();
  const t = useI18n("apps");

  const installComplex = async () => {
    if (app.type !== "complex" && app.type !== "system") return;

    const installFn = async () => {
      const appId = await installComplexApp(appName);
      if (app.type === "complex" && app.settingsHref) {
        router.push(`/dashboard/${app.settingsHref}`);
      } else if (app.type === "system") {
        await setAppStatus(appId, {
          status: "connected",
          statusText: "common.statusText.installed",
        });

        router.refresh();
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
    <Button
      variant="default"
      disabled={app.dontAllowMultiple && installed > 0}
      onClick={installComplex}
    >
      {app.dontAllowMultiple && installed > 0
        ? t("common.alreadyInstalled")
        : t("common.addApp")}
    </Button>
  );
};

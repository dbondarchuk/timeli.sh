import { ConnectedAppRow } from "@/components/admin/apps/connected-app";
import { AvailableApps } from "@vivid/app-store";
import { getI18nAsync } from "@vivid/i18n/server";
import { ServicesContainer } from "@vivid/services";
import React from "react";

export const InstalledApps: React.FC = async () => {
  const t = await getI18nAsync("admin");

  const apps = (
    await ServicesContainer.ConnectedAppsService().getApps()
  ).filter(
    (app) => AvailableApps[app.name] && !AvailableApps[app.name].isHidden,
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {apps.map((app) => (
        <ConnectedAppRow app={app} key={app._id} />
      ))}
      {apps.length === 0 && <div className="">{t("apps.noConnectedApps")}</div>}
    </div>
  );
};

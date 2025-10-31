import { getServicesContainer } from "@/app/utils";
import { ConnectedAppRow } from "@/components/admin/apps/connected-app";
import { AvailableApps } from "@vivid/app-store";
import { getI18nAsync } from "@vivid/i18n/server";
import React from "react";

export const InstalledApps: React.FC = async () => {
  const t = await getI18nAsync("admin");
  const servicesContainer = await getServicesContainer();
  const apps = (await servicesContainer.connectedAppsService.getApps()).filter(
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

import { getServicesContainer } from "@/app/utils";
import { AvailableApps } from "@timelish/app-store";
import { getI18nAsync } from "@timelish/i18n/server";
import React from "react";
import { InstalledAppsClient } from "./installed-apps-client";

export const InstalledApps: React.FC = async () => {
  const t = await getI18nAsync("admin");
  const servicesContainer = await getServicesContainer();
  const apps = (await servicesContainer.connectedAppsService.getApps()).filter(
    (app) => AvailableApps[app.name] && !AvailableApps[app.name].isHidden,
  );

  return <InstalledAppsClient apps={apps} />;
};

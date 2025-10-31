"use server";

import { getServicesContainer } from "@/app/utils";
import { getLoggerFactory } from "@vivid/logger";
import { ConnectedAppStatusWithText } from "@vivid/types";

const logger = getLoggerFactory("AppStoreActions");

export const getInstalledApps = async (name: string) => {
  const actionLogger = logger("getInstalledApps");

  actionLogger.debug(
    {
      appName: name,
    },
    "Getting installed apps",
  );

  try {
    const servicesContainer = await getServicesContainer();
    const result =
      await servicesContainer.connectedAppsService.getAppsByApp(name);

    actionLogger.debug(
      {
        appName: name,
        installedAppsCount: result.length,
      },
      "Installed apps retrieved successfully",
    );

    return result;
  } catch (error) {
    actionLogger.error(
      {
        appName: name,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get installed apps",
    );
    throw error;
  }
};

export const installComplexApp = async (name: string) => {
  const actionLogger = logger("installComplexApp");

  actionLogger.debug(
    {
      appName: name,
    },
    "Installing complex app",
  );

  try {
    const servicesContainer = await getServicesContainer();
    const appId =
      await servicesContainer.connectedAppsService.createNewApp(name);

    actionLogger.debug(
      {
        appName: name,
        appId,
      },
      "Complex app created, updating status",
    );

    await servicesContainer.connectedAppsService.updateApp(appId, {
      status: "connected",
      statusText: "common.statusText.installed",
    });

    actionLogger.debug(
      {
        appName: name,
        appId,
        status: "connected",
      },
      "Complex app installed successfully",
    );

    return appId;
  } catch (error) {
    actionLogger.error(
      {
        appName: name,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to install complex app",
    );
    throw error;
  }
};

export const setAppStatus = async (
  appId: string,
  status: ConnectedAppStatusWithText,
) => {
  const actionLogger = logger("setAppStatus");

  actionLogger.debug(
    {
      appId,
      status: status.status,
      statusText: status.statusText,
    },
    "Setting app status",
  );

  try {
    const servicesContainer = await getServicesContainer();
    const result = await servicesContainer.connectedAppsService.updateApp(
      appId,
      status,
    );

    actionLogger.debug(
      {
        appId,
        status: status.status,
        statusText: status.statusText,
      },
      "App status updated successfully",
    );

    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        status: status.status,
        statusText: status.statusText,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to set app status",
    );
    throw error;
  }
};

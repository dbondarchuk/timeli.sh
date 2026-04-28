"use server";

import { getActor, getServicesContainer, getSession } from "@/app/utils";
import { BaseAllKeys } from "@timelish/i18n";
import { getLoggerFactory } from "@timelish/logger";
import {
  ConnectedAppStatusWithText,
  DefaultAppsConfiguration,
  DefaultAppScope,
} from "@timelish/types";

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
    const session = await getSession();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const appId = await servicesContainer.connectedAppsService.createNewApp(
      name,
      session.user.id,
    );

    actionLogger.debug(
      {
        appName: name,
        appId,
      },
      "Complex app created, updating status",
    );

    await servicesContainer.connectedAppsService.updateApp(appId, {
      status: "connected",
      statusText: "apps.common.statusText.installed" satisfies BaseAllKeys,
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

const DEFAULT_SCOPE_TO_CONFIG_FIELD: Partial<
  Record<DefaultAppScope, keyof DefaultAppsConfiguration>
> = {
  payment: "paymentAppId",
  "mail-send": "emailSenderAppId",
  "text-message-send": "textMessageSenderAppId",
  "text-message-respond": "textMessageResponderAppId",
};

export const setDefaultAppByScope = async (
  appId: string,
  scope: DefaultAppScope,
) => {
  const actionLogger = logger("setDefaultAppByScope");

  if (scope === "calendar-read") {
    actionLogger.debug({ appId, scope }, "Adding app to user calendar sources");
    const servicesContainer = await getServicesContainer();
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await servicesContainer.userService.getUser(session.user.id);
    if (!user) {
      throw new Error("User not found");
    }

    const currentSources = user.calendarSources ?? [];
    if (currentSources.some((source) => source.appId === appId)) {
      actionLogger.debug({ appId, scope }, "App already in calendar sources");
      return { success: true, field: "calendarSources", alreadyPresent: true };
    }

    await servicesContainer.userService.updateUser(session.user.id, {
      calendarSources: [...currentSources, { appId }],
    });

    actionLogger.debug({ appId, scope }, "App added to user calendar sources");
    return { success: true, field: "calendarSources" };
  }

  const field = DEFAULT_SCOPE_TO_CONFIG_FIELD[scope];
  if (!field) {
    throw new Error(`Unsupported default app scope: ${scope}`);
  }

  actionLogger.debug({ appId, scope, field }, "Setting default app by scope");

  const servicesContainer = await getServicesContainer();
  const actor = await getActor();
  const current =
    await servicesContainer.configurationService.getConfiguration(
      "defaultApps",
    );
  const next: DefaultAppsConfiguration = {
    ...(current ?? {}),
    [field]: appId,
  };

  await servicesContainer.configurationService.setConfiguration(
    "defaultApps",
    next,
    actor,
  );

  actionLogger.debug({ appId, scope, field }, "Default app set by scope");

  return { success: true, field };
};

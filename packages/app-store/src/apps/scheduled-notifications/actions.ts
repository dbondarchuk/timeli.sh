import { adminApi } from "@timelish/api-sdk";
import { WithTotal } from "@timelish/types";
import {
  GetScheduledNotificationsAction,
  RequestAction,
  ScheduledNotification,
  ScheduledNotificationsAppData,
  ScheduledNotificationUpdateModel,
} from "./models";

const logger = (action: string) => ({
  debug: (data: any, message: string) => {
    console.debug(`[${action}] DEBUG:`, message, data);
  },
  info: (data: any, message: string) => {
    console.log(`[${action}] INFO:`, message, data);
  },
  error: (data: any, message: string) => {
    console.error(`[${action}] ERROR:`, message, data);
  },
});

export const deleteScheduledNotification = async (
  appId: string,
  scheduledNotificationId: string,
) => {
  const actionLogger = logger("deleteScheduledNotification");
  actionLogger.debug(
    { appId, scheduledNotificationId },
    "Deleting scheduled notification",
  );
  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: "delete-scheduled-notifications",
      ids: [scheduledNotificationId],
    } as RequestAction);
    actionLogger.debug(
      { appId, scheduledNotificationId },
      "Scheduled notification deleted",
    );
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        scheduledNotificationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to delete scheduled notification",
    );
    throw error;
  }
};

export const deleteSelectedScheduledNotifications = async (
  appId: string,
  ids: string[],
) => {
  const actionLogger = logger("deleteSelectedScheduledNotifications");
  actionLogger.debug(
    { appId, ids, count: ids.length },
    "Deleting selected scheduled notifications",
  );
  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: "delete-scheduled-notifications",
      ids: ids,
    } as RequestAction);
    actionLogger.debug(
      { appId, ids, count: ids.length },
      "Selected scheduled notifications deleted",
    );
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        ids,
        count: ids.length,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to delete selected scheduled notifications",
    );
    throw error;
  }
};

export const getScheduledNotifications = async (
  appId: string,
  query: GetScheduledNotificationsAction["query"],
) => {
  const actionLogger = logger("getScheduledNotifications");
  actionLogger.debug(
    { appId, hasQuery: !!query },
    "Getting scheduled notifications",
  );
  try {
    const result = (await adminApi.apps.processRequest(appId, {
      type: "get-scheduled-notifications",
      query,
    } as RequestAction)) as WithTotal<ScheduledNotification>;
    actionLogger.debug(
      { appId, hasQuery: !!query, total: result.total },
      "Scheduled notifications retrieved",
    );
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        hasQuery: !!query,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get scheduled notifications",
    );
    throw error;
  }
};

export const getScheduledNotification = async (appId: string, id: string) => {
  const actionLogger = logger("getScheduledNotification");
  actionLogger.debug({ appId, id }, "Getting scheduled notification");
  try {
    const result = (await adminApi.apps.processRequest(appId, {
      type: "get-scheduled-notification",
      id,
    } as RequestAction)) as ScheduledNotification;
    actionLogger.debug(
      { appId, id, hasResult: !!result },
      "Scheduled notification retrieved",
    );
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get scheduled notification",
    );
    throw error;
  }
};

export const getScheduledNotificationsAppData = async (appId: string) => {
  const actionLogger = logger("getScheduledNotificationsAppData");
  actionLogger.debug({ appId }, "Getting app data");
  try {
    const result = (await adminApi.apps.processRequest(appId, {
      type: "get-app-data",
    } as RequestAction)) as ScheduledNotificationsAppData;
    actionLogger.debug({ appId, hasData: !!result }, "App data retrieved");
    return result;
  } catch (error) {
    actionLogger.error(
      { appId, error: error instanceof Error ? error.message : String(error) },
      "Failed to get scheduled notifications app data",
    );
    throw error;
  }
};

export const setScheduledNotificationsAppData = async (
  appId: string,
  data: ScheduledNotificationsAppData,
) => {
  const actionLogger = logger("setScheduledNotificationsAppData");
  actionLogger.debug(
    { appId, hasData: !!data },
    "Setting scheduled notifications app data",
  );
  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: "set-app-data",
      data,
    } as RequestAction);
    actionLogger.debug({ appId, hasData: !!data }, "App data set");
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        hasData: !!data,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to set app data",
    );
    throw error;
  }
};

export const checkUniqueName = async (
  appId: string,
  name: string,
  id?: string,
) => {
  const actionLogger = logger("checkUniqueName");
  actionLogger.debug({ appId, name, id }, "Checking unique name");
  try {
    const result = (await adminApi.apps.processRequest(appId, {
      type: "check-unique-name",
      name,
      id,
    } as RequestAction)) as boolean;
    actionLogger.debug(
      { appId, name, id, isUnique: result },
      "Unique name check completed",
    );
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        name,
        id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to check unique name",
    );
    throw error;
  }
};

export const create = async (
  appId: string,
  scheduledNotification: ScheduledNotificationUpdateModel,
) => {
  const actionLogger = logger("create");
  actionLogger.debug(
    { appId, hasScheduledNotification: !!scheduledNotification },
    "Creating scheduled notification",
  );
  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: "create-scheduled-notification",
      scheduledNotification,
    } as RequestAction);
    actionLogger.debug(
      { appId, hasScheduledNotification: !!scheduledNotification },
      "Scheduled notification created",
    );
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        hasScheduledNotification: !!scheduledNotification,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to create scheduled notification",
    );
    throw error;
  }
};

export const update = async (
  appId: string,
  id: string,
  update: ScheduledNotificationUpdateModel,
) => {
  const actionLogger = logger("update");
  actionLogger.debug(
    { appId, id, hasUpdate: !!update },
    "Updating scheduled notification",
  );
  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: "update-scheduled-notification",
      update,
      id,
    } as RequestAction);
    actionLogger.debug(
      { appId, id, hasUpdate: !!update },
      "Scheduled notification updated",
    );
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        id,
        hasUpdate: !!update,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to update scheduled notification",
    );
    throw error;
  }
};

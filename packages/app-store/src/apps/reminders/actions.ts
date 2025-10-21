import { adminApi } from "@vivid/api-sdk";
import { WithTotal } from "@vivid/types";
import {
  GetRemindersAction,
  Reminder,
  RemindersAppData,
  ReminderUpdateModel,
  RequestAction,
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

export const deleteReminder = async (appId: string, reminderId: string) => {
  const actionLogger = logger("deleteReminder");
  actionLogger.debug({ appId, reminderId }, "Deleting reminder");
  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: "delete-reminders",
      ids: [reminderId],
    } as RequestAction);
    actionLogger.debug({ appId, reminderId }, "Reminder deleted");
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        reminderId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to delete reminder",
    );
    throw error;
  }
};

export const deleteSelectedReminders = async (appId: string, ids: string[]) => {
  const actionLogger = logger("deleteSelectedReminders");
  actionLogger.debug(
    { appId, ids, count: ids.length },
    "Deleting selected reminders",
  );
  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: "delete-reminders",
      ids: ids,
    } as RequestAction);
    actionLogger.debug(
      { appId, ids, count: ids.length },
      "Selected reminders deleted",
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
      "Failed to delete selected reminders",
    );
    throw error;
  }
};

export const getReminders = async (
  appId: string,
  query: GetRemindersAction["query"],
) => {
  const actionLogger = logger("getReminders");
  actionLogger.debug({ appId, hasQuery: !!query }, "Getting reminders");
  try {
    const result = (await adminApi.apps.processRequest(appId, {
      type: "get-reminders",
      query,
    } as RequestAction)) as WithTotal<Reminder>;
    actionLogger.debug(
      { appId, hasQuery: !!query, total: result.total },
      "Reminders retrieved",
    );
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        hasQuery: !!query,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get reminders",
    );
    throw error;
  }
};

export const getReminder = async (appId: string, id: string) => {
  const actionLogger = logger("getReminder");
  actionLogger.debug({ appId, id }, "Getting reminder");
  try {
    const result = (await adminApi.apps.processRequest(appId, {
      type: "get-reminder",
      id,
    } as RequestAction)) as Reminder;
    actionLogger.debug(
      { appId, id, hasResult: !!result },
      "Reminder retrieved",
    );
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to get reminder",
    );
    throw error;
  }
};

export const getAppData = async (appId: string) => {
  const actionLogger = logger("getAppData");
  actionLogger.debug({ appId }, "Getting app data");
  try {
    const result = (await adminApi.apps.processRequest(appId, {
      type: "get-app-data",
    } as RequestAction)) as RemindersAppData;
    actionLogger.debug({ appId, hasData: !!result }, "App data retrieved");
    return result;
  } catch (error) {
    actionLogger.error(
      { appId, error: error instanceof Error ? error.message : String(error) },
      "Failed to get app data",
    );
    throw error;
  }
};

export const setAppData = async (appId: string, data: RemindersAppData) => {
  const actionLogger = logger("setAppData");
  actionLogger.debug({ appId, hasData: !!data }, "Setting app data");
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

export const create = async (appId: string, reminder: ReminderUpdateModel) => {
  const actionLogger = logger("create");
  actionLogger.debug({ appId, hasReminder: !!reminder }, "Creating reminder");
  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: "create-reminder",
      reminder,
    } as RequestAction);
    actionLogger.debug({ appId, hasReminder: !!reminder }, "Reminder created");
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        hasReminder: !!reminder,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to create reminder",
    );
    throw error;
  }
};

export const update = async (
  appId: string,
  id: string,
  update: ReminderUpdateModel,
) => {
  const actionLogger = logger("update");
  actionLogger.debug({ appId, id, hasUpdate: !!update }, "Updating reminder");
  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: "update-reminder",
      update,
      id,
    } as RequestAction);
    actionLogger.debug({ appId, id, hasUpdate: !!update }, "Reminder updated");
    return result;
  } catch (error) {
    actionLogger.error(
      {
        appId,
        id,
        hasUpdate: !!update,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to update reminder",
    );
    throw error;
  }
};

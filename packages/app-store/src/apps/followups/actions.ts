import { adminApi } from "@vivid/api-sdk";
import { WithTotal } from "@vivid/types";
import {
  CheckUniqueFollowUpNameActionType,
  CreateNewFollowUpActionType,
  DeleteFollowUpsActionType,
  FollowUp,
  FollowUpUpdateModel,
  GetFollowUpActionType,
  GetFollowUpsAction,
  GetFollowUpsActionType,
  UpdateFollowUpActionType,
} from "./models";

const loggerFactory = (action: string) => ({
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

export async function getFollowUps(
  appId: string,
  query: GetFollowUpsAction["query"],
) {
  const logger = loggerFactory("getFollowUps");
  logger.debug({ appId, query }, "Getting follow-ups");

  try {
    const result = (await adminApi.apps.processRequest(appId, {
      type: GetFollowUpsActionType,
      query,
    })) as WithTotal<FollowUp>;

    logger.info(
      { appId, resultCount: result?.items?.length || 0 },
      "Successfully retrieved follow-ups",
    );
    return result;
  } catch (error: any) {
    logger.error(
      { appId, error: error?.message || error?.toString() },
      "Error getting follow-ups",
    );
    throw error;
  }
}

export async function getFollowUp(appId: string, id: string) {
  const logger = loggerFactory("getFollowUp");
  logger.debug({ appId, followUpId: id }, "Getting follow-up");

  try {
    const result = (await adminApi.apps.processRequest(appId, {
      type: GetFollowUpActionType,
      id,
    })) as FollowUp;

    logger.info(
      { appId, followUpId: id, found: !!result },
      "Successfully retrieved follow-up",
    );
    return result;
  } catch (error: any) {
    logger.error(
      { appId, followUpId: id, error: error?.message || error?.toString() },
      "Error getting follow-up",
    );
    throw error;
  }
}

export async function createFollowUp(
  appId: string,
  followUp: FollowUpUpdateModel,
) {
  const logger = loggerFactory("createFollowUp");
  logger.debug({ appId, followUpName: followUp.name }, "Creating follow-up");

  try {
    const result = (await adminApi.apps.processRequest(appId, {
      type: CreateNewFollowUpActionType,
      followUp,
    })) as FollowUp;

    logger.info(
      { appId, followUpName: followUp.name, followUpId: result?._id },
      "Successfully created follow-up",
    );
    return result;
  } catch (error: any) {
    logger.error(
      {
        appId,
        followUpName: followUp.name,
        error: error?.message || error?.toString(),
      },
      "Error creating follow-up",
    );
    throw error;
  }
}

export async function updateFollowUp(
  appId: string,
  id: string,
  update: FollowUpUpdateModel,
) {
  const logger = loggerFactory("updateFollowUp");
  logger.debug(
    { appId, followUpId: id, followUpName: update.name },
    "Updating follow-up",
  );

  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: UpdateFollowUpActionType,
      id,
      update,
    });

    logger.info(
      { appId, followUpId: id, followUpName: update.name },
      "Successfully updated follow-up",
    );
    return result;
  } catch (error: any) {
    logger.error(
      {
        appId,
        followUpId: id,
        followUpName: update.name,
        error: error?.message || error?.toString(),
      },
      "Error updating follow-up",
    );
    throw error;
  }
}

export async function deleteFollowUps(appId: string, ids: string[]) {
  const logger = loggerFactory("deleteFollowUps");
  logger.debug({ appId, followUpIds: ids }, "Deleting follow-ups");

  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: DeleteFollowUpsActionType,
      ids,
    });

    logger.info({ appId, followUpIds: ids }, "Successfully deleted follow-ups");
    return result;
  } catch (error: any) {
    logger.error(
      { appId, followUpIds: ids, error: error?.message || error?.toString() },
      "Error deleting follow-ups",
    );
    throw error;
  }
}

export async function checkUniqueFollowUpName(
  appId: string,
  name: string,
  id?: string,
) {
  const logger = loggerFactory("checkUniqueFollowUpName");
  logger.debug(
    { appId, name, followUpId: id },
    "Checking unique follow-up name",
  );

  try {
    const result = await adminApi.apps.processRequest(appId, {
      type: CheckUniqueFollowUpNameActionType,
      name,
      id,
    });

    logger.debug(
      { appId, name, followUpId: id, isUnique: result },
      "Successfully checked unique follow-up name",
    );
    return result;
  } catch (error: any) {
    logger.error(
      {
        appId,
        name,
        followUpId: id,
        error: error?.message || error?.toString(),
      },
      "Error checking unique follow-up name",
    );
    throw error;
  }
}

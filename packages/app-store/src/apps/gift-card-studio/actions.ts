import { adminApi } from "@timelish/api-sdk";
import { WithTotal } from "@timelish/types";
import {
  CheckDesignNameUniqueActionType,
  CreateDesignActionType,
  CreatePurchasedGiftCardAction,
  CreatePurchasedGiftCardActionType,
  DeleteDesignActionType,
  DesignListModel,
  DesignModel,
  DesignUpdateModel,
  GetDesignByIdActionType,
  GetDesignsAction,
  GetDesignsActionType,
  GetPreviewActionType,
  GetPurchasedGiftCardByIdActionType,
  GetPurchasedGiftCardsAction,
  GetPurchasedGiftCardsActionType,
  GetSettingsActionType,
  PurchasedGiftCardListModel,
  SetDesignPublicActionType,
  UpdateDesignActionType,
  UpdateSettingsActionType,
} from "./models";
import { GiftCardStudioSettings } from "./models/settings";

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

export async function getDesigns(
  appId: string,
  query: GetDesignsAction["query"],
) {
  const logger = loggerFactory("getDesigns");
  logger.debug({ appId, query }, "Getting designs");

  return (await adminApi.apps.processRequest(appId, {
    type: GetDesignsActionType,
    query,
  })) as WithTotal<DesignListModel>;
}

export async function getDesignById(appId: string, id: string) {
  return (await adminApi.apps.processRequest(appId, {
    type: GetDesignByIdActionType,
    id,
  })) as DesignModel | null;
}

export async function createDesign(appId: string, design: DesignUpdateModel) {
  return (await adminApi.apps.processRequest(appId, {
    type: CreateDesignActionType,
    design,
  })) as DesignModel;
}

export async function updateDesign(
  appId: string,
  id: string,
  design: DesignUpdateModel,
) {
  return (await adminApi.apps.processRequest(appId, {
    type: UpdateDesignActionType,
    id,
    design,
  })) as DesignModel;
}

export async function deleteDesign(appId: string, id: string) {
  return (await adminApi.apps.processRequest(appId, {
    type: DeleteDesignActionType,
    id,
  })) as boolean;
}

export async function setDesignPublic(
  appId: string,
  id: string,
  isPublic: boolean,
) {
  return (await adminApi.apps.processRequest(appId, {
    type: SetDesignPublicActionType,
    id,
    isPublic,
  })) as boolean;
}

export async function checkDesignNameUnique(
  appId: string,
  name: string,
  id?: string,
) {
  return (await adminApi.apps.processRequest(appId, {
    type: CheckDesignNameUniqueActionType,
    name,
    id,
  })) as boolean;
}

export async function getPurchasedGiftCards(
  appId: string,
  query: GetPurchasedGiftCardsAction["query"],
) {
  return (await adminApi.apps.processRequest(appId, {
    type: GetPurchasedGiftCardsActionType,
    query,
  })) as WithTotal<PurchasedGiftCardListModel>;
}

export async function getPurchasedGiftCardById(appId: string, id: string) {
  return (await adminApi.apps.processRequest(appId, {
    type: GetPurchasedGiftCardByIdActionType,
    id,
  })) as PurchasedGiftCardListModel | null;
}

export async function createPurchasedGiftCard(
  appId: string,
  purchase: CreatePurchasedGiftCardAction["purchase"],
) {
  return (await adminApi.apps.processRequest(appId, {
    type: CreatePurchasedGiftCardActionType,
    purchase,
  })) as PurchasedGiftCardListModel;
}

export type GetPreviewPayload = {
  designId: string;
  amount: number;
  name?: string;
  email?: string;
  phone?: string;
  toName?: string;
  toEmail?: string;
  message?: string;
};

export async function getPreviewImage(
  appId: string,
  payload: GetPreviewPayload,
): Promise<{ success: true; imageDataUrl: string }> {
  return (await adminApi.apps.processRequest(appId, {
    type: GetPreviewActionType,
    ...payload,
  })) as { success: true; imageDataUrl: string };
}

export async function getSettings(appId: string) {
  return (await adminApi.apps.processRequest(appId, {
    type: GetSettingsActionType,
  })) as GiftCardStudioSettings;
}

export async function updateSettings(
  appId: string,
  settings: Partial<GiftCardStudioSettings>,
) {
  return (await adminApi.apps.processRequest(appId, {
    type: UpdateSettingsActionType,
    ...settings,
  })) as GiftCardStudioSettings;
}

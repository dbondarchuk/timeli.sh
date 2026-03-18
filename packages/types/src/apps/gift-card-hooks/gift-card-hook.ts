import {
  GiftCardListModel,
  GiftCardStatus,
  GiftCardUpdateModel,
} from "../../booking/gift-card";
import { ConnectedAppData } from "../connected-app.data";

export interface IGiftCardHook {
  onGiftCardCreated?: (
    appData: ConnectedAppData,
    giftCard: GiftCardListModel,
  ) => Promise<void>;
  onGiftCardUpdated?: (
    appData: ConnectedAppData,
    giftCard: GiftCardListModel,
    update: Partial<GiftCardUpdateModel>,
  ) => Promise<void>;
  onGiftCardsDeleted?: (
    appData: ConnectedAppData,
    giftCardsIds: string[],
  ) => Promise<void>;
  onGiftCardsStatusChanged?: (
    appData: ConnectedAppData,
    giftCardsIds: string[],
    status: GiftCardStatus,
  ) => Promise<void>;
}

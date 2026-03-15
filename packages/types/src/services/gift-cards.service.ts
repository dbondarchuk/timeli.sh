import { PaymentSummary } from "../booking";
import {
  GiftCardListModel,
  GiftCardStatus,
  GiftCardUpdateModel,
} from "../booking/gift-card";
import { Query } from "../database/query";
import { WithTotal } from "../database/with-total";
import { DateRange } from "../general/date";

export type IGiftCardsService = {
  createGiftCard(
    giftCard: Omit<GiftCardUpdateModel, "status">,
  ): Promise<GiftCardListModel>;
  updateGiftCard(
    id: string,
    giftCard: GiftCardUpdateModel,
  ): Promise<GiftCardListModel | null>;
  setGiftCardStatus(
    id: string,
    status: GiftCardStatus,
  ): Promise<GiftCardListModel | null>;
  setGiftCardsStatus(ids: string[], status: GiftCardStatus): Promise<void>;
  deleteGiftCard(
    id: string,
    sourceAppId?: string,
  ): Promise<GiftCardListModel | null>;
  deleteGiftCards(ids: string[], sourceAppId?: string): Promise<void>;
  getGiftCard(id: string): Promise<GiftCardListModel | null>;
  getGiftCardByCode(code: string): Promise<GiftCardListModel | null>;
  getGiftCards(
    query: Query & {
      priorityIds?: string[];
      status?: GiftCardStatus[];
      customerId?: string | string[];
      expiresAt?: DateRange;
    },
  ): Promise<WithTotal<GiftCardListModel>>;
  checkGiftCardCodeUnique(code: string, id?: string): Promise<boolean>;
  getGiftCardPayments(id: string): Promise<PaymentSummary[]>;
};

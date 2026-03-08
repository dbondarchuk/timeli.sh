import {
  Customer,
  Prettify,
  WithAppId,
  WithCompanyId,
  WithDatabaseId,
  zEmail,
  zObjectId,
} from "@timelish/types";
import * as z from "zod";

export const PURCHASED_GIFT_CARDS_COLLECTION_NAME =
  "gift-card-studio-purchased-gift-cards";

export const statusEnum = z.enum(["pending", "completed", "failed"]);

export const purchasedGiftCardSchemaBase = z.object({
  designId: zObjectId(),
  giftCardId: zObjectId(),
  amountPurchased: z.coerce.number<number>().positive(),
  customerId: zObjectId(),
  toName: z.string().optional(),
  toEmail: z.union([zEmail, z.literal("")]).optional(),
  message: z.string().optional(),
  cardGenerationStatus: statusEnum.default("pending"),
  invoiceGenerationStatus: statusEnum.default("pending"),
  recipientDeliveryStatus: statusEnum.default("pending"),
  customerDeliveryStatus: statusEnum.default("pending"),
});

export type PurchasedGiftCardUpdateModel = z.infer<
  typeof purchasedGiftCardSchemaBase
>;

export type PurchasedGiftCardModel = Prettify<
  WithCompanyId<
    WithDatabaseId<WithAppId<PurchasedGiftCardUpdateModel>> & {
      createdAt: Date;
      updatedAt: Date;
    }
  >
>;

export type PurchasedGiftCardListModel = PurchasedGiftCardModel & {
  customer: Customer;
  designName: string;
  giftCardCode: string;
};

export const getPurchasedGiftCardsQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number<number>().optional(),
  offset: z.coerce.number<number>().optional(),
  sort: z
    .array(
      z.object({
        id: z.string(),
        desc: z.coerce.boolean<boolean>().optional(),
      }),
    )
    .optional(),
  designId: z.array(zObjectId()).or(zObjectId()).optional(),
  customerId: z.array(zObjectId()).or(zObjectId()).optional(),
});

export type GetPurchasedGiftCardsQuery = z.infer<
  typeof getPurchasedGiftCardsQuerySchema
>;

import { giftCardStudioInvoiceTranslationsEn } from "./en/invoice";
import { knownLocales } from "./index";
import { giftCardStudioInvoiceTranslationsUk } from "./uk/invoice";

type KnownLocales = (typeof knownLocales)[number];
type GiftCardStudioInvoiceTranslations = Record<
  keyof typeof giftCardStudioInvoiceTranslationsEn,
  string
>;

export const giftCardStudioInvoiceTranslations: Record<
  KnownLocales,
  GiftCardStudioInvoiceTranslations
> = {
  en: giftCardStudioInvoiceTranslationsEn,
  uk: giftCardStudioInvoiceTranslationsUk,
} as const;

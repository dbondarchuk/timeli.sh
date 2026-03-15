import { BaseReaderBlockProps } from "@timelish/builder";
import { ALL_STYLES, getStylesSchema } from "@timelish/page-builder-base/style";
import { Prettify, zObjectId } from "@timelish/types";
import * as z from "zod";
import { GiftCardStudioAdminAllKeys } from "../../translations/types";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);

export const GiftCardPurchaseBlockPropsSchema = z.object({
  props: z.object({
    appId: zObjectId(
      "app_gift-card-studio_admin.block.giftCardPurchase.validation.appId.required" satisfies GiftCardStudioAdminAllKeys,
    )
      .optional()
      .nullable(),
  }),
  style: zStyles,
});

export type GiftCardPurchaseBlockProps = Prettify<
  z.infer<typeof GiftCardPurchaseBlockPropsSchema>
>;
export type GiftCardPurchaseBlockReaderProps = BaseReaderBlockProps<any> &
  GiftCardPurchaseBlockProps;

export const GiftCardPurchaseBlockPropsDefaults = {
  props: {
    appId: null,
  },
  style: {},
} as const satisfies GiftCardPurchaseBlockProps;

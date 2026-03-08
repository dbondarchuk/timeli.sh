import { BaseReaderBlockProps } from "@timelish/builder";
import { ALL_STYLES, getStylesSchema } from "@timelish/page-builder-base/style";
import { Prettify } from "@timelish/types";
import * as z from "zod";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);

export const GiftCardPurchaseBlockPropsSchema = z.object({
  props: z.object({}).optional().nullable(),
  style: zStyles,
});

export type GiftCardPurchaseBlockProps = Prettify<
  z.infer<typeof GiftCardPurchaseBlockPropsSchema>
>;
export type GiftCardPurchaseBlockReaderProps = BaseReaderBlockProps<any> &
  GiftCardPurchaseBlockProps;

export const GiftCardPurchaseBlockPropsDefaults = {
  props: {},
  style: {},
} as const satisfies GiftCardPurchaseBlockProps;

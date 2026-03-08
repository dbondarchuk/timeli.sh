"use client";

import { ReplaceOriginalColors } from "@timelish/page-builder-base";
import { useI18n } from "@timelish/i18n";
import {
  GiftCardStudioPublicKeys,
  GiftCardStudioPublicNamespace,
  giftCardStudioPublicNamespace,
} from "../../translations/types";
import { GiftCardPurchaseBlockReaderProps } from "./schema";

export const GiftCardPurchaseBlockEditor = ({
  style,
  props: _props,
  block,
  ..._rest
}: GiftCardPurchaseBlockReaderProps & Record<string, unknown>) => {
  const t = useI18n<
    GiftCardStudioPublicNamespace,
    GiftCardStudioPublicKeys
  >(giftCardStudioPublicNamespace);

  return (
    <>
      <ReplaceOriginalColors />
      <div
        className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center text-sm text-muted-foreground"
        style={style as React.CSSProperties}
      >
        {t("block.title")} — {t("block.description")}
      </div>
    </>
  );
};

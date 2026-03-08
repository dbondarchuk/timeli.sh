"use client";

import { GiftCardPurchaseBlockReader } from "./reader-component";

export const GiftCardPurchaseBlockReaderWrapper = (
  props: import("./schema").GiftCardPurchaseBlockReaderProps & {
    isEditor?: boolean;
  },
) => {
  const metadata = props.block?.metadata as { giftCardStudioAppId?: string };
  const appId = metadata?.giftCardStudioAppId;

  if (typeof window !== "undefined" || !appId) {
    return <GiftCardPurchaseBlockReader {...props} appId={appId ?? ""} />;
  }

  return <GiftCardPurchaseBlockReader {...props} appId={appId ?? ""} />;
};

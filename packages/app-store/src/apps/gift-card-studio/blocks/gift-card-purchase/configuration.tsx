"use client";

import { AppSelectorInput, ConfigurationProps } from "@timelish/builder";
import { useI18n } from "@timelish/i18n";
import { StylesConfigurationPanel } from "@timelish/page-builder-base";
import { deepMemo } from "@timelish/ui";
import { useCallback } from "react";
import { GIFT_CARD_STUDIO_APP_NAME } from "../../const";
import {
  GiftCardStudioAdminKeys,
  GiftCardStudioAdminNamespace,
  giftCardStudioAdminNamespace,
} from "../../translations/types";
import {
  GiftCardPurchaseBlockProps,
  GiftCardPurchaseBlockPropsDefaults,
  styles,
} from "./schema";

export const GiftCardPurchaseBlockConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
    metadata,
    onMetadataChange,
  }: ConfigurationProps<GiftCardPurchaseBlockProps>) => {
    const t = useI18n<
      GiftCardStudioAdminNamespace,
      GiftCardStudioAdminKeys
    >(giftCardStudioAdminNamespace);

    const updateStyle = useCallback(
      (s: unknown) =>
        setData({ ...data, style: s as GiftCardPurchaseBlockProps["style"] }),
      [setData, data],
    );
    const updateMetadata = useCallback(
      (m: Record<string, unknown>) => onMetadataChange(m),
      [onMetadataChange],
    );

    const appId = (metadata?.giftCardStudioAppId as string) ?? "";

    return (
      <StylesConfigurationPanel
        styles={data.style ?? GiftCardPurchaseBlockPropsDefaults.style}
        onStylesChange={updateStyle}
        availableStyles={styles}
        base={base}
        onBaseChange={onBaseChange}
      >
        <AppSelectorInput
          label="Gift Card Studio app"
          helperText="Select the Gift Card Studio app for this block."
          defaultValue={appId}
          appName={GIFT_CARD_STUDIO_APP_NAME}
          onChange={(value) =>
            updateMetadata({ ...metadata, giftCardStudioAppId: value ?? "" })
          }
        />
      </StylesConfigurationPanel>
    );
  },
);

"use client";

import { ConfigurationProps } from "@timelish/builder";
import { SlotOrBlockStylesPanel } from "@timelish/page-builder-base";
import { deepMemo } from "@timelish/ui";
import { useCallback } from "react";
import { MarketingFeatureItemProps } from "./schema";
import { marketingFeatureItemShortcuts } from "./shortcuts";
import { styles } from "./styles";

const SLOT_KEYS = [
  "cardIcon",
  "title",
  "description",
  "detailHeadline",
  "detailBullets",
] as const;

export const MarketingFeatureItemConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
    selectedSlot,
  }: ConfigurationProps<MarketingFeatureItemProps>) => {
    const updateStyle = useCallback(
      (s: unknown) =>
        setData({
          ...data,
          style: s as MarketingFeatureItemProps["style"],
        }),
      [setData, data],
    );

    return (
      <SlotOrBlockStylesPanel
        slotKeys={SLOT_KEYS}
        selectedSlot={selectedSlot}
        availableStyles={styles}
        shortcuts={marketingFeatureItemShortcuts}
        blockStyles={data.style ?? {}}
        onBlockStylesChange={updateStyle}
        base={base}
        onBaseChange={onBaseChange}
      />
    );
  },
);

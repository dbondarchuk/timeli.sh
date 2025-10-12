"use client";

import { ConfigurationProps } from "@vivid/builder";
import { StylesConfigurationPanel } from "@vivid/page-builder-base";
import { deepMemo } from "@vivid/ui";
import { useCallback } from "react";
import { PageHeroProps } from "./schema";
import { pageHeroShortcuts } from "./shortcuts";
import { styles } from "./styles";

export const PageHeroConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<PageHeroProps>) => {
    const updateStyle = useCallback(
      (s: unknown) => setData({ ...data, style: s as PageHeroProps["style"] }),
      [setData, data],
    );

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        shortcuts={pageHeroShortcuts}
        base={base}
        onBaseChange={onBaseChange}
      />
    );
  },
);

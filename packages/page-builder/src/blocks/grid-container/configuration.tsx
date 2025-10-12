"use client";

import { ConfigurationProps } from "@vivid/builder";
import { StylesConfigurationPanel } from "@vivid/page-builder-base";
import { deepMemo } from "@vivid/ui";
import { useCallback } from "react";
import { GridContainerProps, styles } from "./schema";
import { gridContainerShortcuts } from "./shortcuts";

export const GridContainerConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<GridContainerProps>) => {
    const updateStyle = useCallback(
      (s: unknown) =>
        setData({ ...data, style: s as GridContainerProps["style"] }),
      [setData, data],
    );

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        shortcuts={gridContainerShortcuts}
        base={base}
        onBaseChange={onBaseChange}
      />
    );
  },
);

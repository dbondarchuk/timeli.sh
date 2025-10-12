"use client";

import { ConfigurationProps } from "@vivid/builder";
import { StylesConfigurationPanel } from "@vivid/page-builder-base";

import { deepMemo } from "@vivid/ui";
import { useCallback } from "react";
import { TextProps } from "./schema";
import { styles } from "./styles";

export const TextConfiguration = deepMemo(
  ({ data, setData, base, onBaseChange }: ConfigurationProps<TextProps>) => {
    const updateStyle = useCallback(
      (s: unknown) => setData({ ...data, style: s as TextProps["style"] }),
      [setData, data],
    );

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        base={base}
        onBaseChange={onBaseChange}
      />
    );
  },
);

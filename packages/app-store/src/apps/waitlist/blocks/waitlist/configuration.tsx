"use client";

import { ConfigurationProps } from "@vivid/builder";
import { StylesConfigurationPanel } from "@vivid/page-builder-base";
import { deepMemo } from "@vivid/ui";
import { useCallback } from "react";
import { WaitlistProps } from "./schema";
import { waitlistShortcuts } from "./shortcuts";
import { styles } from "./styles";

export const WaitlistConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<WaitlistProps>) => {
    const updateStyle = useCallback(
      (s: unknown) => setData({ ...data, style: s as WaitlistProps["style"] }),
      [setData, data],
    );

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        shortcuts={waitlistShortcuts}
        base={base}
        onBaseChange={onBaseChange}
      ></StylesConfigurationPanel>
    );
  },
);

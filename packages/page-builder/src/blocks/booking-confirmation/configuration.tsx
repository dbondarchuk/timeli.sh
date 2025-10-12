"use client";

import { ConfigurationProps } from "@vivid/builder";
import { StylesConfigurationPanel } from "@vivid/page-builder-base";
import { deepMemo } from "@vivid/ui";
import { useCallback } from "react";
import { BookingConfirmationProps } from "./schema";
import { styles } from "./styles";

export const BookingConfirmationConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<BookingConfirmationProps>) => {
    const updateStyle = useCallback(
      (s: unknown) =>
        setData({ ...data, style: s as BookingConfirmationProps["style"] }),
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

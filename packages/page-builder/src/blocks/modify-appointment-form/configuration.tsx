"use client";

import { ConfigurationProps } from "@vivid/builder";
import { deepMemo } from "@vivid/ui";
import { useCallback } from "react";
import { StylesConfigurationPanel } from "../../configuration-panel/styles-configuration-panel";
import { ModifyAppointmentFormProps } from "./schema";
import { styles } from "./styles";

export const ModifyAppointmentFormConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<ModifyAppointmentFormProps>) => {
    const updateStyle = useCallback(
      (s: unknown) =>
        setData({ ...data, style: s as ModifyAppointmentFormProps["style"] }),
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

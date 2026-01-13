"use client";

import { ConfigurationProps, TextInput } from "@timelish/builder";
import { useI18n } from "@timelish/i18n";
import { StylesConfigurationPanel } from "@timelish/page-builder-base";
import { deepMemo } from "@timelish/ui";
import { useCallback } from "react";
import { containerShortcuts } from "../container/shortcuts";
import { ForeachContainerProps, styles } from "./schema";

export const ForeachContainerConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<ForeachContainerProps>) => {
    const updateProps = useCallback(
      (p: unknown) =>
        setData({ ...data, props: p as ForeachContainerProps["props"] }),
      [setData, data],
    );
    const updateStyle = useCallback(
      (s: unknown) =>
        setData({ ...data, style: s as ForeachContainerProps["style"] }),
      [setData, data],
    );

    const t = useI18n("builder");
    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        shortcuts={containerShortcuts}
        base={base}
        onBaseChange={onBaseChange}
      >
        <TextInput
          label={t("pageBuilder.blocks.foreachContainer.value")}
          defaultValue={data.props?.value ?? ""}
          onChange={(value) => updateProps({ ...data.props, value })}
        />
        <TextInput
          label={t("pageBuilder.blocks.foreachContainer.itemName")}
          helperText={t(
            "pageBuilder.blocks.foreachContainer.itemNameHelperText",
          )}
          defaultValue={data.props?.itemName ?? ""}
          onChange={(itemName) => updateProps({ ...data.props, itemName })}
        />
      </StylesConfigurationPanel>
    );
  },
);

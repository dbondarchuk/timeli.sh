"use client";

import { ConfigurationProps } from "@vivid/builder";
import { useI18n } from "@vivid/i18n";
import { StylesConfigurationPanel } from "@vivid/page-builder-base";
import { deepMemo, Label, Textarea } from "@vivid/ui";
import { useCallback } from "react";
import { CustomHTMLProps } from "./schema";
import { styles } from "./styles";

export const CustomHTMLConfiguration = deepMemo(
  ({
    data,
    setData,
    base,
    onBaseChange,
  }: ConfigurationProps<CustomHTMLProps>) => {
    const t = useI18n("builder");
    const updateProps = useCallback(
      (p: unknown) =>
        setData({ ...data, props: p as CustomHTMLProps["props"] }),
      [setData, data],
    );
    const updateStyle = useCallback(
      (s: unknown) =>
        setData({ ...data, style: s as CustomHTMLProps["style"] }),
      [setData, data],
    );

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        base={base}
        onBaseChange={onBaseChange}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="html">
            {t("pageBuilder.blocks.customHtml.html")}
          </Label>
          <Textarea
            id="html"
            value={data.props?.html ?? ""}
            className="w-full text-xs"
            onChange={(e) =>
              updateProps({ ...data.props, html: e.target.value })
            }
          />
        </div>
      </StylesConfigurationPanel>
    );
  },
);

"use client";

import { ConfigurationProps } from "@vivid/builder";
import { useI18n } from "@vivid/i18n";
import { StylesConfigurationPanel } from "@vivid/page-builder-base";
import { ComboboxAsync, deepMemo, IComboboxItem, Label } from "@vivid/ui";
import { icons } from "lucide-react";
import { createElement, useCallback } from "react";
import { IconProps, IconPropsDefaults } from "./schema";
import { iconShortcuts } from "./shortcuts";
import { styles } from "./styles";

const allIconNames = Object.keys(icons);

export const IconConfiguration = deepMemo(
  ({ data, setData, base, onBaseChange }: ConfigurationProps<IconProps>) => {
    const t = useI18n("builder");
    const updateProps = useCallback(
      (p: unknown) => setData({ ...data, props: p as IconProps["props"] }),
      [setData, data],
    );
    const updateStyle = useCallback(
      (s: unknown) => setData({ ...data, style: s as IconProps["style"] }),
      [setData, data],
    );

    const icon = (data.props as any)?.icon ?? IconPropsDefaults.props.icon;

    const getIcons = useCallback(
      async (page: number, search?: string) => {
        const limit = 20;
        let iconNames = [...allIconNames];
        const valueIndex = iconNames.indexOf(icon);
        if (valueIndex !== -1) {
          const currentIcon = iconNames[valueIndex];
          iconNames.splice(valueIndex, 1);
          iconNames.unshift(currentIcon);
        }

        if (search) {
          iconNames = iconNames.filter((iconName) =>
            iconName.toLowerCase().includes(search.toLowerCase()),
          );
        }

        const items: IComboboxItem[] = iconNames
          .slice((page - 1) * limit, page * limit)
          .map((iconName) => ({
            value: iconName as string,
            label: (
              <div className="flex flex-row gap-2 items-center">
                {createElement(icons[iconName as keyof typeof icons], {
                  size: 16,
                })}
                <span>{iconName}</span>
              </div>
            ),
          }));

        return {
          items: items,
          hasMore: page * limit < iconNames.length,
        };
      },
      [icon],
    );

    return (
      <StylesConfigurationPanel
        styles={data.style ?? {}}
        onStylesChange={updateStyle}
        availableStyles={styles}
        shortcuts={iconShortcuts}
        base={base}
        onBaseChange={onBaseChange}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="icon">{t("pageBuilder.blocks.icon.icon")}</Label>
          <ComboboxAsync
            id="icon"
            fetchItems={getIcons}
            value={icon ?? ""}
            size="sm"
            className="w-full"
            onChange={(value) => updateProps({ ...data.props, icon: value })}
          />
        </div>
      </StylesConfigurationPanel>
    );
  },
);

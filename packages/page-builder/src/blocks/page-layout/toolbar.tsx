import {
  ConfigurationProps,
  ToolbarDropdownMenu,
  ToolbarDropdownPropsValues,
  ToolbarToggle,
} from "@vivid/builder";
import { BuilderKeys, useI18n } from "@vivid/i18n";
import {
  backgroundColorShortcut,
  colorShortcut,
  ColorShortcutToolbar,
  FONT_FAMILIES,
  fontFamilyItems,
} from "@vivid/page-builder-base";
import { FontFamily } from "@vivid/page-builder-base/style";
import { AlignHorizontalSpaceAround } from "lucide-react";
import { PageLayoutDefaultProps, PageLayoutProps } from "./schema";

const LayoutFontFamilyDropdownMenu = (
  props: ToolbarDropdownPropsValues<PageLayoutProps>,
) => {
  const selectedFont = props.data?.fontFamily
    ? FONT_FAMILIES[props.data?.fontFamily]
    : null;

  const t = useI18n("builder");

  return (
    <ToolbarDropdownMenu
      icon={
        <span className="text-xs" style={{ fontFamily: selectedFont?.value }}>
          {selectedFont?.label
            ? t.has(selectedFont?.label as BuilderKeys)
              ? t(selectedFont?.label as BuilderKeys)
              : selectedFont?.label
            : t("pageBuilder.styles.fontFamily.inherit")}
        </span>
      }
      items={fontFamilyItems.map((item) => ({
        ...item,
        style: { fontFamily: item.value as FontFamily },
        label: t.has(item.label as BuilderKeys)
          ? t(item.label as BuilderKeys)
          : item.label,
      }))}
      property="fontFamily"
      tooltip={t("pageBuilder.styles.properties.fontFamily")}
      {...props}
    />
  );
};

export const PageLayoutToolbar = (
  props: ConfigurationProps<PageLayoutProps>,
) => {
  const t = useI18n("builder");
  return (
    <>
      <ToolbarToggle
        tooltip="Full width"
        property="fullWidth"
        {...props}
        icon={<AlignHorizontalSpaceAround />}
      />
      <LayoutFontFamilyDropdownMenu
        defaultValue={PageLayoutDefaultProps.fontFamily}
        {...props}
      />
      <ColorShortcutToolbar
        shortcut={{
          shortcut: colorShortcut,
          currentColorValue: props.data.textColor ?? null,
          onValueChange: (value) =>
            props.setData({ ...props.data, textColor: value }),
          tooltip: "pageBuilder.styles.properties.color",
        }}
      />
      <ColorShortcutToolbar
        shortcut={{
          shortcut: backgroundColorShortcut,
          currentColorValue: props.data.backgroundColor ?? null,
          onValueChange: (value) =>
            props.setData({ ...props.data, backgroundColor: value }),
          tooltip: "pageBuilder.styles.properties.backgroundColor",
        }}
      />
    </>
  );
};

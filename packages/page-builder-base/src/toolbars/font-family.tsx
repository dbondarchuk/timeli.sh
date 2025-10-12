import {
  ToolbarDropdownMenu,
  ToolbarDropdownPropsValues,
} from "@vivid/builder";
import { Leaves } from "@vivid/types";
import {
  FONT_FAMILIES,
  FONT_FAMILIES_LIST,
} from "../style-inputs/helpers/font-family";

export const fontFamilyItems = [
  {
    value: null,
    label: "Inherit",
  },
  ...FONT_FAMILIES_LIST.map((font) => ({
    value: font.key,
    label: font.label,
    style: { fontFamily: font.value },
  })),
];

type PropsType = { style?: { fontFamily?: string | null } | null };

export const FontFamilyDropdownMenu = <T extends PropsType>(
  props: Omit<ToolbarDropdownPropsValues<T>, "defaultValue">,
) => {
  const selectedFont = props.data?.style?.fontFamily
    ? FONT_FAMILIES[props.data?.style?.fontFamily as keyof typeof FONT_FAMILIES]
    : null;

  return (
    <ToolbarDropdownMenu
      icon={
        <span className="text-xs" style={{ fontFamily: selectedFont?.value }}>
          {selectedFont?.label ?? "Inherit"}
        </span>
      }
      defaultValue={null as any as string}
      items={fontFamilyItems}
      property={"style.fontFamily" as Leaves<T>}
      tooltip="Font family"
      {...props}
    />
  );
  return null;
};

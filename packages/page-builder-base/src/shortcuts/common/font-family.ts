import { BuilderKeys } from "@vivid/i18n";
import { Type } from "lucide-react";
import { AllStylesSchemas } from "../../style";
import { FONT_FAMILIES_LIST } from "../../style-inputs/helpers/font-family";
import { ShortcutWithCombobox } from "../types";

export const fontFamilyShortcut: ShortcutWithCombobox<
  Pick<AllStylesSchemas, "fontFamily">
> = {
  label: "pageBuilder.shortcuts.fontFamily",
  icon: Type,
  inputType: "combobox",
  options: FONT_FAMILIES_LIST.map((font) => ({
    label: font.label as BuilderKeys,
    labelStyle: {
      fontFamily: font.value,
    },
    value: font.key,
    targetStyles: {
      fontFamily: font.key,
    },
  })),
};

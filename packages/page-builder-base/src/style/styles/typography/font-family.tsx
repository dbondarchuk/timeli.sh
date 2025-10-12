import { BuilderKeys, useI18n } from "@vivid/i18n";
import { Combobox } from "@vivid/ui";
import { Type } from "lucide-react";
import { z } from "zod";
import {
  FONT_FAMILIES,
  FONT_FAMILIES_LIST,
  FONT_FAMILY_NAMES,
} from "../../../style-inputs/helpers/font-family";
import { StyleDefinition } from "../../types";

const FontFamilySchema = z.enum(FONT_FAMILY_NAMES);

const fontFamilies = FONT_FAMILIES_LIST.map((font) => ({
  value: font.key,
  label: font.label,
}));

export const fontFamilyStyle = {
  name: "fontFamily",
  label: "pageBuilder.styles.properties.fontFamily",
  category: "typography",
  icon: ({ className }) => <Type className={className} />,
  schema: FontFamilySchema,
  defaultValue: "INHERIT",
  renderToCSS: (value) => {
    if (!value) return null;
    return `font-family: ${FONT_FAMILIES[value].value};`;
  },
  component: ({ value, onChange }) => {
    const t = useI18n("builder");
    return (
      <Combobox
        values={fontFamilies.map((font) => ({
          value: font.value,
          label: (
            <span style={{ fontFamily: font.value }}>
              {t.has(font.label as BuilderKeys)
                ? t(font.label as BuilderKeys)
                : font.label}
            </span>
          ),
        }))}
        value={value}
        onItemSelect={(val) =>
          onChange(val as z.infer<typeof FontFamilySchema>)
        }
        className="w-full"
        size="sm"
      />
    );
  },
} as const satisfies StyleDefinition<typeof FontFamilySchema>;

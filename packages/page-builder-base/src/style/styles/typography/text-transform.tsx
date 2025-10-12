import { useI18n } from "@vivid/i18n";
import { Combobox } from "@vivid/ui";
import { Type } from "lucide-react";
import { z } from "zod";
import { StyleDefinition } from "../../types";

const textTransformKeys = [
  "none",
  "capitalize",
  "uppercase",
  "lowercase",
  "full-width",
  "full-size-kana",
] as const;

const TextTransformSchema = z.enum(textTransformKeys);

export const textTransformStyle = {
  name: "textTransform",
  label: "pageBuilder.styles.properties.textTransform",
  category: "typography",
  icon: ({ className }) => <Type className={className} />,
  schema: TextTransformSchema,
  defaultValue: "none",
  renderToCSS: (value) => {
    if (!value) return null;
    return `text-transform: ${value};`;
  },
  component: ({ value, onChange }) => {
    const t = useI18n("builder");
    return (
      <Combobox
        values={textTransformKeys.map((transform) => ({
          value: transform,
          label: t(`pageBuilder.styles.textTransform.${transform}`),
        }))}
        value={value}
        onItemSelect={(val) =>
          onChange(val as z.infer<typeof TextTransformSchema>)
        }
        className="w-full"
        size="sm"
      />
    );
  },
} as const satisfies StyleDefinition<typeof TextTransformSchema>;

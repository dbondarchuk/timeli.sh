import { useI18n } from "@vivid/i18n";
import { Combobox } from "@vivid/ui";
import { Bold } from "lucide-react";
import { z } from "zod";
import { StyleDefinition } from "../../types";

const FontWeightSchema = z.enum([
  "normal",
  "bold",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
]);

const fontWeightKeys = [
  "normal",
  "bold",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;

export const fontWeightStyle = {
  name: "fontWeight",
  label: "pageBuilder.styles.properties.fontWeight",
  category: "typography",
  schema: FontWeightSchema,
  icon: ({ className }) => <Bold className={className} />,
  defaultValue: "normal",
  renderToCSS: (value) => {
    if (!value) return null;
    return `font-weight: ${value};`;
  },
  component: ({ value, onChange }) => {
    const t = useI18n("builder");
    return (
      <Combobox
        values={fontWeightKeys.map((weight) => ({
          value: weight,
          label: (
            <span style={{ fontWeight: weight }}>
              {t(`pageBuilder.styles.fontWeight.${weight}`)}
            </span>
          ),
        }))}
        value={value}
        onItemSelect={(val) =>
          onChange(val as z.infer<typeof FontWeightSchema>)
        }
        className="w-full"
        size="sm"
      />
    );
  },
} as const satisfies StyleDefinition<typeof FontWeightSchema>;

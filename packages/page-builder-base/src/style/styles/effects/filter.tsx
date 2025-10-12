import { useI18n } from "@vivid/i18n";
import { Combobox } from "@vivid/ui";
import { Sparkles } from "lucide-react";
import { z } from "zod";
import { StyleDefinition } from "../../types";

const filterKeys = [
  "none",
  "blur(1px)",
  "blur(2px)",
  "blur(4px)",
  "brightness(0.5)",
  "brightness(0.9)",
  "brightness(1.1)",
  "brightness(1.5)",
  "contrast(0.5)",
  "contrast(1.5)",
  "grayscale(100%)",
  "hue-rotate(90deg)",
  "invert(100%)",
  "saturate(0.5)",
  "saturate(1.5)",
  "sepia(100%)",
] as const;

const filterKeyMap = {
  none: "none",
  "blur(1px)": "blur_1px",
  "blur(2px)": "blur_2px",
  "blur(4px)": "blur_4px",
  "brightness(0.5)": "brightness_0_5",
  "brightness(0.9)": "brightness_0_9",
  "brightness(1.1)": "brightness_1_1",
  "brightness(1.5)": "brightness_1_5",
  "contrast(0.5)": "contrast_0_5",
  "contrast(1.5)": "contrast_1_5",
  "grayscale(100%)": "grayscale_100",
  "hue-rotate(90deg)": "hue_rotate_90deg",
  "invert(100%)": "invert_100",
  "saturate(0.5)": "saturate_0_5",
  "saturate(1.5)": "saturate_1_5",
  "sepia(100%)": "sepia_100",
} as const;

const FilterSchema = z.enum(filterKeys);

export const filterStyle = {
  name: "filter",
  label: "pageBuilder.styles.properties.filter",
  category: "effects",
  schema: FilterSchema,
  icon: ({ className }) => <Sparkles className={className} />,
  defaultValue: "none",
  renderToCSS: (value) => {
    if (!value || value === "none") return null;
    return `filter: ${value};`;
  },
  component: ({ value, onChange }) => {
    const t = useI18n("builder");

    return (
      <Combobox
        values={filterKeys.map((filter) => ({
          value: filter,
          label: t(`pageBuilder.styles.filter.${filterKeyMap[filter]}`),
        }))}
        value={value}
        onItemSelect={(val) => onChange(val as z.infer<typeof FilterSchema>)}
        className="w-full"
        size="sm"
      />
    );
  },
} as const satisfies StyleDefinition<typeof FilterSchema>;

import { Brush } from "lucide-react";
import { ColorExtendedInput } from "../../../style-inputs/base/color-exteneded-input";
import { COLORS, getColorStyle } from "../../helpers/colors";
import { StyleDefinition } from "../../types";
import { zColor } from "../../zod";

const BorderColorSchema = zColor;

export const borderColorStyle = {
  name: "borderColor",
  label: "pageBuilder.styles.properties.borderColor",
  icon: ({ className }) => <Brush className={className} />,
  category: "border",
  schema: BorderColorSchema,
  defaultValue: COLORS.primary.value,
  renderToCSS: (value) => {
    if (!value) return "";
    return `border-color: ${getColorStyle(value)};`;
  },
  component: ({ value, onChange }) => (
    <ColorExtendedInput
      defaultValue={value || COLORS.primary.value}
      onChange={onChange}
      nullable={false}
    />
  ),
} as const satisfies StyleDefinition<typeof BorderColorSchema>;

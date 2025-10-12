import { Square } from "lucide-react";
import { RawNumberInputWithUnit } from "../../../style-inputs/base/raw-number-input-with-units";
import { StyleDefinition } from "../../types";
import { renderRawNumberWithUnitCss } from "../../utils";
import { zNumberValueWithUnit } from "../../zod";

const BorderWidthSchema = zNumberValueWithUnit;

export const borderWidthStyle = {
  name: "borderWidth",
  label: "pageBuilder.styles.properties.borderWidth",
  icon: ({ className }) => <Square className={className} />,
  category: "border",
  schema: BorderWidthSchema,
  defaultValue: { value: 1, unit: "px" },
  renderToCSS: (value) => {
    if (!value) return null;
    return `border-width: ${renderRawNumberWithUnitCss(value)};`;
  },
  component: ({ value, onChange }) => (
    <RawNumberInputWithUnit
      icon={<Square className="size-4" />}
      defaultValue={value}
      onChange={onChange}
    />
  ),
} as const satisfies StyleDefinition<typeof BorderWidthSchema>;

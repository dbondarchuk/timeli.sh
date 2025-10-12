import { SquareRoundCorner } from "lucide-react";
import { RawNumberInputWithUnit } from "../../../style-inputs/base/raw-number-input-with-units";
import { StyleDefinition } from "../../types";
import { renderRawNumberWithUnitCss } from "../../utils";
import { zNumberValueWithUnit } from "../../zod";

const BorderRadiusSchema = zNumberValueWithUnit;

export const borderRadiusStyle = {
  name: "borderRadius",
  label: "pageBuilder.styles.properties.borderRadius",
  icon: ({ className }) => <SquareRoundCorner className={className} />,
  category: "border",
  schema: BorderRadiusSchema,
  defaultValue: { value: 0, unit: "%" },
  renderToCSS: (value) => {
    if (!value) return null;
    return `border-radius: ${renderRawNumberWithUnitCss(value)};`;
  },
  component: ({ value, onChange }) => (
    <RawNumberInputWithUnit
      icon={<SquareRoundCorner className="size-4" />}
      defaultValue={value}
      onChange={onChange}
    />
  ),
} as const satisfies StyleDefinition<typeof BorderRadiusSchema>;

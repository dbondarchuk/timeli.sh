import { TextCursor } from "lucide-react";
import { RawNumberInputWithUnit } from "../../../style-inputs/base/raw-number-input-with-units";
import { StyleDefinition } from "../../types";
import { renderRawNumberWithUnitCss } from "../../utils";
import { zNumberValueWithUnit } from "../../zod";

const LineHeightSchema = zNumberValueWithUnit;

export const lineHeightStyle = {
  name: "lineHeight",
  label: "pageBuilder.styles.properties.lineHeight",
  category: "typography",
  schema: LineHeightSchema,
  icon: ({ className }) => <TextCursor className={className} />,
  defaultValue: { value: 1.125, unit: "rem" },
  renderToCSS: (value) => {
    if (!value) return null;
    return `line-height: ${renderRawNumberWithUnitCss(value)};`;
  },
  component: ({ value, onChange }) => (
    <RawNumberInputWithUnit
      icon={<TextCursor className="size-4" />}
      defaultValue={value}
      onChange={onChange}
      noMax
    />
  ),
} as const satisfies StyleDefinition<typeof LineHeightSchema>;

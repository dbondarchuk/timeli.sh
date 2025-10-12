import { Textarea } from "@vivid/ui";
import { Code } from "lucide-react";
import { z } from "zod";
import { StyleDefinition } from "../../types";

const CustomCSSSchema = z.string().default("");

export const customCssStyle = {
  name: "customCss",
  label: "pageBuilder.styles.properties.customCss",
  category: "misc",
  icon: ({ className }) => <Code className={className} />,
  schema: CustomCSSSchema,
  defaultValue: "",
  renderToCSS: (value) => {
    if (value === null || typeof value === "undefined") return null;
    return value;
  },
  component: ({ value, onChange }) => (
    <Textarea
      placeholder="CSS"
      defaultValue={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      autoResize
      className="w-full text-xs"
    />
  ),
} as const satisfies StyleDefinition<typeof CustomCSSSchema>;

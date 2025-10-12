import { Move } from "lucide-react";
import { StyleDefinition } from "../../../types";
import { TransformConfiguration } from "./configuration";
import { TransformSchema } from "./schema";

export const transformStyle = {
  name: "transform",
  label: "pageBuilder.styles.properties.transform",
  category: "effects",
  schema: TransformSchema,
  icon: ({ className }) => <Move className={className} />,
  defaultValue: "none",
  renderToCSS: (value) => {
    if (!value || value === "none") return null;

    if (typeof value === "string") {
      return `transform: ${value};`;
    }

    if (typeof value === "object" && "functions" in value) {
      if (value.functions.length === 0) return null;

      const transformString = value.functions
        .map((func) => {
          const getFunctionValueCount = (funcName: string) => {
            switch (funcName) {
              case "scale":
              case "scaleX":
              case "scaleY":
                return 1;
              case "rotate":
                return 1;
              case "translateX":
              case "translateY":
                return 1;
              case "translate":
                return 2;
              case "skewX":
              case "skewY":
                return 1;
              case "skew":
                return 2;
              default:
                return 1;
            }
          };

          const getFunctionUnits = (funcName: string) => {
            switch (funcName) {
              case "scale":
              case "scaleX":
              case "scaleY":
                return "";
              case "rotate":
                return "deg";
              case "translateX":
              case "translateY":
              case "translate":
                return "px";
              case "skewX":
              case "skewY":
              case "skew":
                return "deg";
              default:
                return "";
            }
          };

          const valueCount = getFunctionValueCount(func.function);
          const units = getFunctionUnits(func.function);

          if (valueCount === 1) {
            return `${func.function}(${func.values[0]}${units})`;
          } else if (valueCount === 2) {
            return `${func.function}(${func.values[0]}${units}, ${func.values[1]}${units})`;
          }

          return `${func.function}(${func.values.join(", ")})`;
        })
        .join(" ");

      return `transform: ${transformString};`;
    }

    return null;
  },
  component: ({ value, onChange }) => {
    return <TransformConfiguration value={value} onChange={onChange} />;
  },
} as const satisfies StyleDefinition<typeof TransformSchema>;

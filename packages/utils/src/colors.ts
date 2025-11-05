import { StylingConfiguration } from "@timelish/types";
import Color from "color";

export const getColorsCss = (
  colors?: StylingConfiguration["colors"],
  prefix?: string,
  replaceOriginal?: boolean,
) => {
  return (colors || [])
    .filter((color) => !!color.value)
    .map(({ type, value }) => {
      if (value?.startsWith("#")) {
        const color = Color(value).hsl().object();
        return `--${prefix ? `${prefix}-` : ""}${type}-color: ${color.h.toFixed(1)} ${color.s.toFixed(1)}% ${color.l.toFixed(1)}%;`;
      }

      return `--${prefix ? `${prefix}-` : ""}${type}${!replaceOriginal ? "-color" : ""}: ${value};`;
    })
    .join("\n");
};

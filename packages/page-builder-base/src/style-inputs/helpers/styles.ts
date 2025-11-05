import { FontFamily } from "../../style/zod";
import { FONT_FAMILIES } from "./font-family";

export const getFontFamily = (font?: FontFamily) =>
  (font ? FONT_FAMILIES[font]?.value : null) || "inherit";

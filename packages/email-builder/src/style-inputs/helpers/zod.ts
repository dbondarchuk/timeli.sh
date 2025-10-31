import * as z from "zod";

import { FONT_FAMILY_NAMES } from "./font-family";

export const zColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const zColorNullable = zColor.optional().nullable();

export const zFontFamily = z.enum(FONT_FAMILY_NAMES).optional().nullable();
export type FontFamily = z.infer<typeof zFontFamily>;

export const zFontSize = z.coerce
  .number<number>()
  .min(0, "emailBuilder.common.validation.fontSize")
  .int("emailBuilder.common.validation.fontSize")
  .optional()
  .nullable();

export const zFontWeight = z.enum(["bold", "normal"]);
export type FontWeight = z.infer<typeof zFontWeight>;

export const zTextAlign = z.enum(["left", "center", "right"]);
export type TextAlign = z.infer<typeof zTextAlign>;

export const zPadding = z.object({
  top: z.number(),
  bottom: z.number(),
  right: z.number(),
  left: z.number(),
});

export type Padding = z.infer<typeof zPadding>;

export const zStylesBase = z.object({
  color: zColorNullable,
  backgroundColor: zColorNullable,
  fontSize: zFontSize,
  fontFamily: zFontFamily.optional().nullable(),
  fontWeight: zFontWeight.optional().nullable(),
  textAlign: zTextAlign.optional().nullable(),
  padding: zPadding.optional().nullable(),
});

export const zStyles = zStylesBase.optional().nullable();

export type Styles = z.infer<typeof zStyles>;

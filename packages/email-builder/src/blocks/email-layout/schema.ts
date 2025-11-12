import { BaseReaderBlockProps } from "@timelish/builder";
import * as z from "zod";
import {
  zColor,
  zColorNullable,
  zFontFamily,
  zPadding,
} from "../../style-inputs/helpers/zod";

const EmailLayoutPropsSchema = z.object({
  backdropColor: zColor,
  borderColor: zColorNullable,
  borderRadius: z.coerce
    .number<number>()
    .int("emailBuilder.common.validation.borderRadius")
    .optional()
    .nullable(),
  canvasColor: zColor,
  textColor: zColor,
  fontFamily: zFontFamily,
  maxWidth: z.coerce
    .number<number>()
    .int("emailBuilder.common.validation.maxWidth")
    .min(500, "emailBuilder.common.validation.maxWidth")
    .max(1200, "emailBuilder.common.validation.maxWidth")
    .optional()
    .nullable(),
  padding: zPadding,
  previewText: z.string().optional().nullable(),
  children: z.array(z.any()),
});

export default EmailLayoutPropsSchema;

export type EmailLayoutProps = z.infer<typeof EmailLayoutPropsSchema>;
export type EmailLayoutReaderProps = BaseReaderBlockProps<any> &
  EmailLayoutProps;

export const EmailLayoutDefaultProps = {
  backdropColor: "#F5F5F5",
  canvasColor: "#FFFFFF",
  textColor: "#262626",
  fontFamily: "MODERN_SANS",
  maxWidth: 600,
  padding: {
    top: 24,
    bottom: 24,
    left: 16,
    right: 16,
  },
  children: [],
} satisfies EmailLayoutProps;

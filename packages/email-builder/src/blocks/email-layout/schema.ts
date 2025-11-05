import { BaseReaderBlockProps } from "@timelish/builder";
import * as z from "zod";
import {
  zColor,
  zColorNullable,
  zFontFamily,
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
  children: [],
} satisfies EmailLayoutProps;

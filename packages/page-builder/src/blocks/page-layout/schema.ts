import { BaseReaderBlockProps } from "@timelish/builder";
import { zColorNullable, zFontFamily } from "@timelish/page-builder-base/style";
import * as z from "zod";

export const PageLayoutPropsSchema = z.object({
  backgroundColor: zColorNullable,
  textColor: zColorNullable,
  fontFamily: zFontFamily,
  fullWidth: z.coerce.boolean<boolean>(),
  children: z.array(z.any()),
});

export type PageLayoutProps = z.infer<typeof PageLayoutPropsSchema>;
export type PageLayoutReaderProps = BaseReaderBlockProps<any> & PageLayoutProps;

export const PageLayoutDefaultProps = {
  fontFamily: "PRIMARY",
  fullWidth: true,
  children: [],
} satisfies PageLayoutProps;

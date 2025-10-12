import { BaseReaderBlockProps } from "@vivid/builder";
import { zColorNullable, zFontFamily } from "@vivid/page-builder-base/style";
import { z } from "zod";

export const PageLayoutPropsSchema = z.object({
  backgroundColor: zColorNullable,
  textColor: zColorNullable,
  fontFamily: zFontFamily,
  fullWidth: z.coerce.boolean(),
  children: z.array(z.any()),
});

export type PageLayoutProps = z.infer<typeof PageLayoutPropsSchema>;
export type PageLayoutReaderProps = BaseReaderBlockProps<any> & PageLayoutProps;

export const PageLayoutDefaultProps = {
  fontFamily: "PRIMARY",
  fullWidth: true,
  children: [],
} satisfies PageLayoutProps;

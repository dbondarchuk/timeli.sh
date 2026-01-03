import { BaseReaderBlockProps } from "@timelish/builder";
import { ALL_STYLES, getStylesSchema } from "@timelish/page-builder-base/style";
import { Prettify } from "@timelish/types";
import * as z from "zod";

export const styles = ALL_STYLES;
export const zStyles = getStylesSchema(styles);

export const BlogPostContentPropsSchema = z.object({
  props: z
    .object({
      showShort: z.boolean().optional(),
    })
    .optional()
    .nullable(),
  style: zStyles,
});

export type BlogPostContentProps = Prettify<
  z.infer<typeof BlogPostContentPropsSchema>
>;
export type BlogPostContentReaderProps = BaseReaderBlockProps<any> &
  BlogPostContentProps;

export const BlogPostContentPropsDefaults = {
  props: {
    showShort: false,
  },
  style: {},
} as const satisfies BlogPostContentProps;

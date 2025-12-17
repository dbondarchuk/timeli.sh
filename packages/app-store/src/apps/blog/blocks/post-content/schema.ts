import { BaseReaderBlockProps } from "@timelish/builder";
import * as z from "zod";
import { zStyles } from "./styles";

export const BlogPostContentPropsSchema = z.object({
  style: zStyles,
  props: z.object({
    paramKey: z.string().default("postId"),
  }),
});

export type BlogPostContentProps = z.infer<typeof BlogPostContentPropsSchema>;
export type BlogPostContentReaderProps = BaseReaderBlockProps<any> &
  BlogPostContentProps & { appId?: string };

export const BlogPostContentPropsDefaults = {
  style: {},
  props: {
    paramKey: "postId",
  },
} as const satisfies BlogPostContentProps;


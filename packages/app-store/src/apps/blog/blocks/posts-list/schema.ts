import { BaseReaderBlockProps } from "@timelish/builder";
import * as z from "zod";
import { zStyles } from "./styles";

export const BlogPostsListPropsSchema = z.object({
  style: zStyles,
  props: z.object({
    postsPerPage: z.number().min(1).max(100),
  }),
});

export type BlogPostsListProps = z.infer<typeof BlogPostsListPropsSchema>;
export type BlogPostsListReaderProps = BaseReaderBlockProps<any> &
  BlogPostsListProps & { appId?: string };

export const BlogPostsListPropsDefaults = {
  style: {
    gap: [
      {
        value: {
          value: 2,
          unit: "rem",
        },
        state: [
          {
            state: "default",
            target: {
              type: "selector",
              data: {
                stateType: "selector",
                selector: ".post-list",
              },
            },
          },
        ],
      },
    ],
  },
  props: {
    postsPerPage: 10,
  },
} as const satisfies BlogPostsListProps;

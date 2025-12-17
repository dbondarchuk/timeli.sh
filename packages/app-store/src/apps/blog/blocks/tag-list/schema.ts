import { BaseReaderBlockProps } from "@timelish/builder";
import * as z from "zod";
import { zStyles } from "./styles";

export const BlogTagListPropsSchema = z.object({
  style: zStyles,
  props: z.object({
    sortBy: z.enum(["alphabetical", "count"]).default("alphabetical"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export type BlogTagListProps = z.infer<typeof BlogTagListPropsSchema>;
export type BlogTagListReaderProps = BaseReaderBlockProps<any> &
  BlogTagListProps & { appId?: string };

export const BlogTagListPropsDefaults = {
  style: {},
  props: {
    sortBy: "alphabetical",
    sortOrder: "asc",
  },
} as const satisfies BlogTagListProps;


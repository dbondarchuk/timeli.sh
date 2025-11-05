import { BaseReaderBlockProps } from "@timelish/builder";
import * as z from "zod";

export const ForeachContainerPropsSchema = z.object({
  props: z.object({
    value: z.string().min(1),
    children: z.array(z.any()),
  }),
});

export type ForeachContainerProps = z.infer<typeof ForeachContainerPropsSchema>;
export type ForeachContainerReaderProps = BaseReaderBlockProps<any> &
  ForeachContainerProps;

export const ForeachContainerPropsDefaults = {
  props: {
    value: "",
    children: [],
  },
} satisfies ForeachContainerProps;

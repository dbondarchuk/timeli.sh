import { BaseReaderBlockProps } from "@timelish/builder";
import { Prettify } from "@timelish/types";
import * as z from "zod";
import { zStyles } from "./styles";

export const CustomHTMLPropsSchema = z.object({
  props: z
    .object({
      html: z
        .string({
          error: "pageBuilder.blocks.customHtml.errors.required",
        })
        .min(1, {
          message: "pageBuilder.blocks.customHtml.errors.required",
        }),
    })
    .optional()
    .nullable(),
  style: zStyles,
});

export type CustomHTMLProps = Prettify<z.infer<typeof CustomHTMLPropsSchema>>;
export type CustomHTMLReaderProps = BaseReaderBlockProps<any> & CustomHTMLProps;

export const CustomHTMLPropsDefaults = {
  props: {
    html: "",
  },
  style: {},
} as const satisfies CustomHTMLProps;
